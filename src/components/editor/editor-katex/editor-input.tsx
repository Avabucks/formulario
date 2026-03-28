"use client";

export function EditorInput({ value, onChange }: Readonly<{ value: string, onChange: (value: string) => void }>) {

    return (
        <div className="h-full overflow-hidden pr-3">
            <textarea
                placeholder="Scrivi qui..."
                className="resize-none w-full h-full bg-background outline-none p-3 font-mono text-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}