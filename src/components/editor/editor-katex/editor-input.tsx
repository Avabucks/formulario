"use client";

export function EditorInput({ value, onChange }: Readonly<{ value: string, onChange: (value: string) => void }>) {
    
    return (
        <div className="flex-1">
            <textarea
                placeholder="Scrivi qui..."
                className="w-full h-full resize-none bg-background outline-none p-3"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}