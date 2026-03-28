"use client";

export function EditorInput({ value, onChange }: Readonly<{ value: string, onChange: (value: string) => void }>) {
    
    return (
        <div className="flex-1 h-full">
            <textarea
                placeholder="Scrivi qui..."
                className="w-full h-full resize-none bg-background outline-none p-3 font-mono text-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}