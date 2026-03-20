import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkBreaks from "remark-breaks"
import "katex/dist/katex.min.css"

export const LogButtonWrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {

    return (<>{children}</>)
    return (
        <button
            onClick={() => console.log(children)}
            className="relative cursor-pointer hover:opacity-100 group"
        >
            {children}
            <span className="absolute -inset-1 bg-muted z-[-1] opacity-0 group-hover:opacity-100 duration-300 pointer-events-none rounded-lg"></span>
        </button>
    )
}

export const CustomH1: React.FC<React.PropsWithChildren> = ({ children }) => (
    <LogButtonWrapper>
        <h1 className="text-2xl font-bold leading-10">{children}</h1>
    </LogButtonWrapper>
)

export const CustomH2: React.FC<React.PropsWithChildren> = ({ children }) => (
    <LogButtonWrapper>
        <h2 className="text-xl font-bold leading-9">{children}</h2>
    </LogButtonWrapper>
)

export const CustomH3: React.FC<React.PropsWithChildren> = ({ children }) => (
    <LogButtonWrapper>
        <h3 className="text-lg font-bold leading-8">{children}</h3>
    </LogButtonWrapper>
)

export const CustomP: React.FC<React.PropsWithChildren> = ({ children }) => (
    <p className="leading-7">{children}</p>
)

export const CustomStrong: React.FC<React.PropsWithChildren> = ({ children }) => (
    <LogButtonWrapper>
        <strong className="font-bold">{children}</strong>
    </LogButtonWrapper>
)

export const CustomEm: React.FC<React.PropsWithChildren> = ({ children }) => (
    <LogButtonWrapper>
        <em className="italic">{children}</em>
    </LogButtonWrapper>
)

export const CustomUl: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ul className="list-disc pl-6 leading-8 text-left">{children}</ul>
)

export const CustomOl: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ul className="list-disc pl-6 leading-8 text-left">{children}</ul>
)

export const CustomLi: React.FC<React.PropsWithChildren> = ({ children }) => (
    <li>
        <LogButtonWrapper>
            {children}
        </LogButtonWrapper>
    </li>
)

type CustomLatexProps = React.PropsWithChildren<{ className?: string, style?: React.CSSProperties }>

export const CustomLatex: React.FC<CustomLatexProps> = ({ children, className, style }) => {
    if (className === "katex") {
        return (
            <LogButtonWrapper>
                <span className={className}>{children}</span>
            </LogButtonWrapper>
        )
    }

    return <span className={className} style={style}>{children}</span>
}

export default function EditorPreview({ content }: Readonly<{ content: string }>) {

    return (
        <div
            className="w-full border-0 resize-none outline-0 p-4 rounded-xl bg-muted/50"
        >
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: CustomH1,
                    h2: CustomH2,
                    h3: CustomH3,
                    strong: CustomStrong,
                    p: CustomP,
                    em: CustomEm,
                    ul: CustomUl,
                    ol: CustomOl,
                    li: CustomLi,
                    span: CustomLatex,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}