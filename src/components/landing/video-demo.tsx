"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FileVideo } from "lucide-react"
import slides from "@/src/data/slides.json"

function SlideRow({ slide, index }: Readonly<{ slide: typeof slides[number]; index: number }>) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const isEven = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={`flex flex-col items-center gap-10 md:flex-row md:gap-16 ${
        isEven ? "" : "md:flex-row-reverse"
      }`}
    >
      {/* Video */}
      <div className="w-full md:w-3/5">
        <div className="overflow-hidden rounded-2xl border border-border bg-card aspect-video flex items-center justify-center">
          {slide.video ? (
            <video
              src={slide.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileVideo className="h-8 w-8 opacity-30" />
              <span className="text-xs opacity-40">video in arrivo</span>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <motion.div
        className="w-full md:w-2/5"
        initial={{ opacity: 0, x: isEven ? -24 : 24 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      >
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {slide.label}
        </p>
        <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">
          {slide.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {slide.description}
        </p>
      </motion.div>
    </motion.div>
  )
}

export function VideoDemo() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" })

  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6">

        {/* Heading */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 32 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-20 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Demo
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tutto quello che ti serve
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Abbiamo unito creazione, organizzazione e condivisione in un'unica interfaccia.
          </p>
        </motion.div>

        {/* Slides */}
        <div className="flex flex-col gap-32">
          {slides.map((slide, i) => (
            <SlideRow key={slide.id} slide={slide} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}