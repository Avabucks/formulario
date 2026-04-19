"use client";

import { Button } from "@/src/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function GeminiButton({ prompt }: Readonly<{ prompt: string }>) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const { text } = await res.json();
            console.log(text);
        } catch (error) {
            console.error("Errore:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            variant="outline"
        >
            <Sparkles size={16} />
            {loading ? "Generazione..." : "Genera con AI"}
        </Button>
    );
}