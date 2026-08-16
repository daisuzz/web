import * as React from "react"
// @ts-ignore
import * as style from "./Mermaid.module.css"

interface MermaidProps {
    code: string
}

let idCounter = 0

const Mermaid: React.FC<MermaidProps> = ({code}) => {
    const [svg, setSvg] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        let cancelled = false
        idCounter += 1
        const id = `mermaid-diagram-${idCounter}`

        import("mermaid")
            .then(({default: mermaid}) => {
                mermaid.initialize({startOnLoad: false, theme: "dark"})
                return mermaid.render(id, code)
            })
            .then((result) => {
                if (!cancelled) setSvg(result.svg)
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : String(err))
            })

        return () => {
            cancelled = true
        }
    }, [code])

    if (error) {
        return <div className={style.error}>Mermaid図の描画に失敗しました: {error}</div>
    }

    if (!svg) {
        return <div className={style.wrapper} aria-busy="true"/>
    }

    return <div className={style.wrapper} dangerouslySetInnerHTML={{__html: svg}}/>
}

export default Mermaid
