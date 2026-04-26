"use client"

import Link from "next/link";
import { Button } from "../ui/button";

export function LandingMenu() {
    return (
        <div className="hidden md:flex items-center gap-2">
            <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            >
                Demo
            </Button>
            <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
                Funzionalità
            </Button>
            <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            >
                FAQ
            </Button>
        </div>
    )
}