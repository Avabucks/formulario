import { pool } from "@/src/lib/db";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const subscriptionEvents = new Set<string>([
  EventName.SubscriptionActivated,
  EventName.SubscriptionCanceled,
  EventName.SubscriptionCreated,
  EventName.SubscriptionPastDue,
  EventName.SubscriptionPaused,
  EventName.SubscriptionResumed,
  EventName.SubscriptionTrialing,
  EventName.SubscriptionUpdated,
]);

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const signature = request.headers.get("paddle-signature");
  const requestBody = await request.text();

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Webhook Paddle non configurato" },
      { status: 400 },
    );
  }

  const paddle = new Paddle(process.env.PADDLE_API_KEY ?? "", {
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
        ? Environment.production
        : Environment.sandbox,
  });

  let event;
  try {
    event = await paddle.webhooks.unmarshal(
      requestBody,
      webhookSecret,
      signature,
    );
  } catch {
    return NextResponse.json({ error: "Firma Paddle non valida" }, { status: 400 });
  }

  if (event.eventType === EventName.TransactionCompleted) {
    const transaction = toTransactionPayload(event.data);
    const userId = getCustomDataValue(transaction?.customData ?? null, "userId");

    if (transaction?.subscriptionId && userId) {
      await upsertSubscription(userId, {
        id: transaction.subscriptionId,
        status: "active",
        customerId: transaction.customerId,
        customData: transaction.customData,
        priceId: transaction.priceId,
        currentBillingPeriod: transaction.billingPeriod,
        canceledAt: null,
      });
    }

    return NextResponse.json({ received: true });
  }

  if (!subscriptionEvents.has(event.eventType)) {
    return NextResponse.json({ received: true });
  }

  const subscription = toSubscriptionPayload(event.data);
  if (!subscription?.id) {
    return NextResponse.json({ received: true });
  }

  const userId = getCustomDataValue(subscription.customData, "userId");
  if (!userId) {
    await updateExistingSubscription(subscription);
    return NextResponse.json({ received: true });
  }

  await upsertSubscription(userId, subscription);

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  userId: string,
  subscription: SubscriptionPayload,
) {
  await pool.query(
    `INSERT INTO subscriptions (
        user_uid,
        paddle_subscription_id,
        paddle_customer_id,
        paddle_price_id,
        status,
        plan,
        current_period_starts_at,
        current_period_ends_at,
        canceled_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pro', $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (paddle_subscription_id)
      DO UPDATE SET
        user_uid = EXCLUDED.user_uid,
        paddle_customer_id = EXCLUDED.paddle_customer_id,
        paddle_price_id = EXCLUDED.paddle_price_id,
        status = EXCLUDED.status,
        current_period_starts_at = EXCLUDED.current_period_starts_at,
        current_period_ends_at = EXCLUDED.current_period_ends_at,
        canceled_at = EXCLUDED.canceled_at,
        updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      subscription.id,
      subscription.customerId,
      subscription.priceId,
      subscription.status,
      subscription.currentBillingPeriod?.startsAt ?? null,
      subscription.currentBillingPeriod?.endsAt ?? null,
      subscription.canceledAt,
    ],
  );
}

async function updateExistingSubscription(subscription: SubscriptionPayload) {
  await pool.query(
    `UPDATE subscriptions
      SET
        paddle_customer_id = $2,
        paddle_price_id = COALESCE($3, paddle_price_id),
        status = $4,
        current_period_starts_at = $5,
        current_period_ends_at = $6,
        canceled_at = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE paddle_subscription_id = $1`,
    [
      subscription.id,
      subscription.customerId,
      subscription.priceId,
      subscription.status,
      subscription.currentBillingPeriod?.startsAt ?? null,
      subscription.currentBillingPeriod?.endsAt ?? null,
      subscription.canceledAt,
    ],
  );
}

function toSubscriptionPayload(data: object): SubscriptionPayload | null {
  if (!isRecord(data)) return null;

  return {
    id: getString(data.id),
    status: getString(data.status) ?? "unknown",
    customerId: getString(data.customerId),
    customData: isRecord(data.customData) ? data.customData : null,
    priceId: getPriceId(data.items),
    currentBillingPeriod: getBillingPeriod(data.currentBillingPeriod),
    canceledAt: getString(data.canceledAt),
  };
}

function toTransactionPayload(data: object): TransactionPayload | null {
  if (!isRecord(data)) return null;

  return {
    subscriptionId: getString(data.subscriptionId),
    customerId: getString(data.customerId),
    customData: isRecord(data.customData) ? data.customData : null,
    priceId: getPriceId(data.items),
    billingPeriod: getBillingPeriod(data.billingPeriod),
  };
}

function getPriceId(items: unknown) {
  if (!Array.isArray(items)) return null;

  const firstItem = items.find(isRecord);
  if (!firstItem || !isRecord(firstItem.price)) return null;

  return getString(firstItem.price.id);
}

function getBillingPeriod(value: unknown) {
  if (!isRecord(value)) return null;

  return {
    startsAt: getString(value.startsAt),
    endsAt: getString(value.endsAt),
  };
}

function getCustomDataValue(
  customData: Record<string, unknown> | null,
  key: string,
) {
  if (!customData) return null;
  return getString(customData[key]);
}

function getString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type SubscriptionPayload = {
  id: string | null;
  status: string;
  customerId: string | null;
  customData: Record<string, unknown> | null;
  priceId: string | null;
  currentBillingPeriod: {
    startsAt: string | null;
    endsAt: string | null;
  } | null;
  canceledAt: string | null;
};

type TransactionPayload = {
  subscriptionId: string | null;
  customerId: string | null;
  customData: Record<string, unknown> | null;
  priceId: string | null;
  billingPeriod: {
    startsAt: string | null;
    endsAt: string | null;
  } | null;
};
