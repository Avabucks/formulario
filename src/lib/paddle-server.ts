import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { pool } from "./db";

const cancellableStatuses = ["active", "trialing", "past_due", "paused"];

export function getPaddleServerClient() {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey) {
    throw new Error("Manca la variabile d'ambiente PADDLE_API_KEY");
  }

  return new Paddle(apiKey, {
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
        ? Environment.production
        : Environment.sandbox,
  });
}

export async function cancelUserSubscriptions(userId: string) {
  const { rows: subscriptions } = await pool.query(
    `SELECT paddle_subscription_id AS "subscriptionId"
      FROM subscriptions
      WHERE user_uid = $1
        AND status = ANY($2)
        AND paddle_subscription_id IS NOT NULL`,
    [userId, cancellableStatuses],
  );

  if (subscriptions.length === 0) return 0;

  const paddle = getPaddleServerClient();

  for (const subscription of subscriptions) {
    await paddle.subscriptions.cancel(subscription.subscriptionId, {
      effectiveFrom: "immediately",
    });

    await pool.query(
      `UPDATE subscriptions
        SET status = 'canceled',
            canceled_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE paddle_subscription_id = $1`,
      [subscription.subscriptionId],
    );
  }

  return subscriptions.length;
}
