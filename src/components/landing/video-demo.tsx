"use client"

import { useRef, useState } from "react"
import { X, Volume2, VolumeX, Play } from "lucide-react"
import { Button } from "../ui/button"

export function VideoDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [revealed, setRevealed] = useState(false)

  const handlePlay = () => {
    setRevealed(true)
    setTimeout(() => {
      videoRef.current?.play()
      setPlaying(true)
    }, 50)
  }

  const handleClose = () => {
    videoRef.current?.pause()
    if (videoRef.current) videoRef.current.currentTime = 0
    setPlaying(false)
    setRevealed(false)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden">

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Demo
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Dimentica il copia-incolla
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Abbiamo unito generazione e gestione in un'unica interfaccia.
            Così ti concentri su quello che conta davvero.
          </p>
        </div>

        {/* Video card */}
        <div className="group relative mx-auto max-w-6xl">
          {/* Violet glow border on hover */}

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Video */}
            <video
              ref={videoRef}
              src="/preview.mp4"
              muted={muted}
              loop
              playsInline
              className={`w-full transition-all duration-700 ${revealed ? "opacity-100 blur-0 scale-100" : "opacity-30 blur-[2px] scale-[1.03]"
                }`}
              style={{ display: "block" }}
            />

            {/* Play overlay */}
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[6px]">
                <Button size="lg" onClick={handlePlay} className="gap-2 rounded-full px-8">
                  <Play size={16} />
                  Guarda la demo
                </Button>
              </div>
            )}

            {/* Playing controls */}
            {playing && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={toggleMute}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-background"
                  aria-label={muted ? "Attiva audio" : "Disattiva audio"}
                >
                  {muted ? <VolumeX className="h-3.5 w-3.5 text-muted-foreground" /> : <Volume2 className="h-3.5 w-3.5 text-foreground" />}
                </button>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-background"
                  aria-label="Chiudi video"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  )
}