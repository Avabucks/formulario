
export function CtaCommunity() {
    return (
        <section className="relative overflow-hidden bg-accent-foreground/1">
            <div className="absolute inset-0 dark:bg-card/10 bg-foreground/2" />
            <svg className="absolute inset-0 h-full w-full opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="cross" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M16 0v40M0 16h40" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cross)" />
            </svg>

            <div className="relative mx-auto flex min-h-[40vh] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center">

                {/* Title */}
                <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    <span className="text-balance">
                        Scopri le formule della{" "}
                        <span className="relative">
                            Community
                            <svg
                                className="absolute -bottom-2 left-0 w-full"
                                viewBox="0 0 200 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M1 5.5C47.6667 2.16667 141.4 -2.3 199 5.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="text-muted-foreground/40"
                                />
                            </svg>
                        </span>
                    </span>
                </h1>

                {/* Description */}
                <p className="mb-8 max-w-xl text-lg text-muted-foreground md:text-xl">
                    Esplora migliaia di formulari creati da studenti e professionisti.
                    Trova, salva e condividi le tue formule preferite.
                </p>

            </div>
        </section>
    )
}