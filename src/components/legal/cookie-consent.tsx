"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Cookie, X, Shield, BarChart3, Settings2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { UmamiTracker } from "../analytics/umami-tracker";
import AnalyticsLoader from "../analytics/google-analytics";

const COOKIE_CONSENT_KEY = "formulabase-cookie-consent";

interface CookiePreferences {
  accepted: boolean;
  analytics: boolean;
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    accepted: false,
    analytics: false,
  });
  const [tempAnalytics, setTempAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        if (!parsed.accepted) {
          setShowBanner(true);
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPrefs = { accepted: true, analytics: true };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    setShowBanner(false);
  };

  const handleDeclineAll = () => {
    const newPrefs = { accepted: true, analytics: false };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const newPrefs = { accepted: true, analytics: tempAnalytics };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    setShowBanner(false);
    setShowCustomize(false);
  };

  const openCustomize = () => {
    setTempAnalytics(preferences.analytics);
    setShowCustomize(true);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Conditionally load tracking components if consent is given */}
      {preferences.accepted && preferences.analytics && (
        <>
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_APP_ID}
            strategy="afterInteractive"
          />
          <UmamiTracker />
          <AnalyticsLoader />
        </>
      )}

      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md p-5 shadow-2xl flex flex-col gap-4 text-sm"
          >
            {!showCustomize ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                      <Cookie className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-base">
                      Informativa sui cookie
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full cursor-pointer"
                    onClick={handleDeclineAll}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  Utilizziamo cookie tecnici e analitici per ottimizzare la tua
                  esperienza sul sito. Puoi accettarli tutti, rifiutarli o
                  personalizzarli. Leggi la nostra{" "}
                  <Link
                    href="/privacy"
                    className="underline hover:text-foreground font-medium transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-center cursor-pointer font-medium"
                      onClick={handleDeclineAll}
                    >
                      Rifiuta
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 justify-center cursor-pointer font-medium"
                      onClick={handleAcceptAll}
                    >
                      Accetta tutti
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full font-medium justify-center flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={openCustomize}
                  >
                    <Settings2 className="h-4 w-4" />
                    Personalizza cookie
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-base">
                      Personalizza cookie
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full cursor-pointer"
                    onClick={() => setShowCustomize(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-3 my-2">
                  <div className="flex items-start justify-between gap-4 p-3 rounded-xl border bg-accent/30">
                    <div className="flex gap-2.5">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          Cookie Essenziali
                        </span>
                        <span className="text-xs text-muted-foreground leading-normal">
                          Necessari per l'autenticazione, la sicurezza e il
                          funzionamento di base del sito. Non possono essere
                          disattivati.
                        </span>
                      </div>
                    </div>
                    <Switch checked disabled size="sm" />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-3 rounded-xl border hover:bg-accent/20 transition-colors">
                    <div className="flex gap-2.5">
                      <BarChart3 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          Cookie Analitici
                        </span>
                        <span className="text-xs text-muted-foreground leading-normal">
                          Ci aiutano a misurare in forma anonima e aggregata le
                          visualizzazioni del sito e le interazioni degli
                          utenti.
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={tempAnalytics}
                      onCheckedChange={setTempAnalytics}
                      size="sm"
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center cursor-pointer font-medium"
                    onClick={() => setShowCustomize(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 justify-center cursor-pointer font-medium"
                    onClick={handleSavePreferences}
                  >
                    Salva preferenze
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
