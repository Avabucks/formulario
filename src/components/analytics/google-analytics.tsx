"use client";

import { useEffect } from "react";
import { loadAnalytics } from "@/src/lib/firebase";

export default function AnalyticsLoader() {
  useEffect(() => {
    loadAnalytics();
  }, []);

  return null;
}
