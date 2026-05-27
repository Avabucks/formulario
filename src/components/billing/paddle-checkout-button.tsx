"use client";

import { Button } from "@/src/components/ui/button";
import { Environments, initializePaddle, Paddle } from "@paddle/paddle-js";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PaddleCheckoutButtonProps = Readonly<{
  email?: string;
  userId?: string;
  className?: string;
  children?: React.ReactNode;
}>;

export function PaddleCheckoutButton({
  email,
  userId,
  className,
  children = "Passa a Pro",
}: PaddleCheckoutButtonProps) {
  const [paddle, setPaddle] = useState<Paddle>();
  const [isOpening, setIsOpening] = useState(false);

  const config = useMemo(
    () => ({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
          ? "production"
          : "sandbox",
    }),
    [],
  );

  useEffect(() => {
    if (!config.token) return;

    initializePaddle({
      token: config.token,
      environment: config.environment as Environments,
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, [config.environment, config.token]);

  function openCheckout() {
    const configError = getPaddleConfigError(config);

    if (configError) {
      toast.error("Paddle non e configurato correttamente.", {
        description: configError,
        position: "bottom-center",
      });
      return;
    }

    if (!paddle) {
      toast.error("Checkout Paddle non ancora pronto. Riprova tra poco.");
      return;
    }

    setIsOpening(true);
    paddle.Checkout.open({
      items: [{ priceId: config.priceId!, quantity: 1 }],
      customer: email ? { email } : undefined,
      customData: userId ? { userId } : undefined,
      settings: {
        displayMode: "overlay",
        locale: "it",
        successUrl: `${window.location.origin}/settings/billing`,
      },
    });
    setIsOpening(false);
  }

  return (
    <Button
      type="button"
      onClick={openCheckout}
      disabled={isOpening}
      className={className}
    >
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </Button>
  );
}

function getPaddleConfigError(config: {
  token?: string;
  priceId?: string;
  environment: string;
}) {
  if (!config.token || !config.priceId) {
    return "Aggiungi NEXT_PUBLIC_PADDLE_CLIENT_TOKEN e NEXT_PUBLIC_PADDLE_PRO_PRICE_ID.";
  }

  if (!config.priceId.startsWith("pri_")) {
    return "NEXT_PUBLIC_PADDLE_PRO_PRICE_ID deve essere un price id Paddle che inizia con pri_, non un product id pro_.";
  }

  if (config.environment === "sandbox" && config.token.startsWith("live_")) {
    return "Il token live_ richiede NEXT_PUBLIC_PADDLE_ENVIRONMENT=production. Per sandbox usa un token sandbox.";
  }

  if (config.environment === "production" && config.token.startsWith("test_")) {
    return "Il token sandbox/test richiede NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox.";
  }

  return null;
}
