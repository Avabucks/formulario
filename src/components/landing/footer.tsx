import packageJson from '@/package.json'

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="flex flex-col items-center justify-center gap-4 border-t py-10 border-border md:flex-row px-2 md:px-6">
        <p className="text-xs text-muted-foreground">
          © 2026 {packageJson.displayName}. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  )
}
