import * as React from "react"
// @ts-ignore
import * as style from "./CodeBlock.module.css"

interface Token {
    text: string
    className: string
}

const KEYWORDS = /\b(?:fun|val|var|class|import|return|if|else|for|private|public|override|companion|object|interface|package|suspend|null|true|false|is|as|when)\b/
const TOKEN_RE = new RegExp('(".*?")|(//.*)|(' + KEYWORDS.source + ')', "g")

function tokenizeLine(line: string): Token[] {
    const tokens: Token[] = []
    let last = 0
    let match: RegExpExecArray | null
    TOKEN_RE.lastIndex = 0
    while ((match = TOKEN_RE.exec(line))) {
        if (match.index > last) tokens.push({text: line.slice(last, match.index), className: style.plain})
        if (match[1]) tokens.push({text: match[1], className: style.string})
        else if (match[2]) tokens.push({text: match[2], className: style.comment})
        else if (match[3]) tokens.push({text: match[3], className: style.keyword})
        last = TOKEN_RE.lastIndex
    }
    if (last < line.length) tokens.push({text: line.slice(last), className: style.plain})
    if (tokens.length === 0) tokens.push({text: " ", className: style.plain})
    return tokens
}

interface CodeBlockProps {
    lang: string
    code: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({lang, code}) => {
    const lines = code.split("\n")
    return (
        <div className={style.wrapper}>
            <div className={style.langLabel}>{lang}</div>
            <pre className={style.pre}>
                {lines.map((line, i) => (
                    <div key={i}>
                        {tokenizeLine(line).map((token, j) => (
                            <span key={j} className={token.className}>{token.text}</span>
                        ))}
                    </div>
                ))}
            </pre>
        </div>
    )
}

export default CodeBlock
