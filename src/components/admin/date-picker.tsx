// components/DatePicker.tsx  ← Client Component
"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { cn } from "@/src/lib/utils"

export function DatePicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")
  const selected = dateParam ? new Date(dateParam) : new Date()

  const handleSelect = (day: Date | undefined) => {
    if (!day) return
    const formatted = format(day, "yyyy-MM-dd")
    router.push(`?date=${formatted}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-50 justify-start text-left font-normal")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(selected, "d MMMM yyyy", { locale: it })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          locale={it}
          disabled={(date: any) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}