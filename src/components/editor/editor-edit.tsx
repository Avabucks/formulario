type Props = {
    content: string
    setContent: React.Dispatch<React.SetStateAction<string>>
}

export default function EditorEdit({ content, setContent }: Readonly<Props>) {

    return (
        <div
            className="w-full h-full flex-1 rounded-xl border-2 border-dashed border-muted overflow-hidden"
        >
            <textarea
                className="w-full h-full resize-none outline-0 p-4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Scrivi qui il tuo testo"
            />
        </div>
    )
}