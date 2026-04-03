"use client";

import { useEffect } from "react";

export default function ViewTracker({ formularioId }: Readonly<{ formularioId: string }>) {
  useEffect(() => {
    fetch("/api/formulari/view", {
      method: "POST",
      body: JSON.stringify({ formularioId }),
    });
  }, []);

  return null;
}