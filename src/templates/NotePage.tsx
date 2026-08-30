import * as React from "react"
import {Link, PageProps} from "gatsby"
import Layout from "../components/Layout"
import CodeBlock from "../components/organisms/CodeBlock"
import Mermaid from "../components/organisms/Mermaid"
import {SiteNote} from "../types/note"
// @ts-ignore
import * as style from "./NotePage.module.css"

interface NotePageContext {
    note: SiteNote
}

const SITE_URL = "https://daisuzz.dev"
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "")
}

function buildDescription(note: SiteNote): string {
    const firstParagraph = note.blocks.find((block) => block.type === "paragraph")
    if (!firstParagraph || firstParagraph.type !== "paragraph") return note.title
    const text = stripHtml(firstParagraph.html)
    return text.length > 120 ? `${text.slice(0, 120)}…` : text
}

const NotePage: React.FC<PageProps<object, NotePageContext>> = ({pageContext, location}) => {
    const {note} = pageContext
    const description = buildDescription(note)
    const url = `${SITE_URL}${location.pathname}`
    const structuredData = [
        {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: note.title,
            datePublished: note.created,
            dateModified: note.updated,
            url,
            image: DEFAULT_IMAGE,
            mainEntityOfPage: {
                "@type": "WebPage",
                "@id": url,
            },
            author: {
                "@type": "Person",
                name: "Daisaku Suzuki",
                url: SITE_URL,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {"@type": "ListItem", position: 1, name: "daisuzz.dev", item: SITE_URL},
                {"@type": "ListItem", position: 2, name: "notes", item: `${SITE_URL}/notes/`},
                {"@type": "ListItem", position: 3, name: note.title, item: url},
            ],
        },
    ]

    return (
        <Layout
            pageTitle={note.title}
            description={description}
            path={location.pathname}
            type="article"
            structuredData={structuredData}
            noindex
        >
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/notes/">~/notes</Link> / {note.slug}
                </div>
                <article className={style.article}>
                    <div className={style.meta}>
                        <time>{note.created}</time>
                        {note.tags.map((tag) => (
                            <Link key={tag} to={`/notes/tags/${tag}`} className={style.tag}>
                                #{tag}
                            </Link>
                        ))}
                    </div>
                    <h1 className={style.title}>{note.title}</h1>

                    {note.blocks.map((block, i) => {
                        if (block.type === "paragraph") {
                            return <p key={i} className={style.paragraph} dangerouslySetInnerHTML={{__html: block.html}}/>
                        }
                        if (block.type === "heading") {
                            const level = Math.min(Math.max(block.depth, 2), 6)
                            const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
                            const headingStyle = level <= 2 ? style.heading2 : level === 3 ? style.heading3 : style.heading4
                            return <HeadingTag key={i} className={headingStyle} dangerouslySetInnerHTML={{__html: block.html}}/>
                        }
                        if (block.type === "blockquote") {
                            return <blockquote key={i} className={style.blockquote} dangerouslySetInnerHTML={{__html: block.html}}/>
                        }
                        if (block.type === "list") {
                            const ListTag = block.ordered ? "ol" : "ul"
                            return (
                                <ListTag key={i} className={style.list}>
                                    {block.items.map((item, j) => (
                                        <li key={j} dangerouslySetInnerHTML={{__html: item}}/>
                                    ))}
                                </ListTag>
                            )
                        }
                        if (block.type === "table") {
                            return (
                                <div key={i} className={style.tableWrap}>
                                    <table className={style.table}>
                                        <thead>
                                            <tr>
                                                {block.header.map((cell, j) => (
                                                    <th key={j} style={{textAlign: block.align[j] || undefined}} dangerouslySetInnerHTML={{__html: cell}}/>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {block.rows.map((row, r) => (
                                                <tr key={r}>
                                                    {row.map((cell, c) => (
                                                        <td key={c} style={{textAlign: block.align[c] || undefined}} dangerouslySetInnerHTML={{__html: cell}}/>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        }
                        if (block.type === "mermaid") {
                            return <Mermaid key={i} code={block.code}/>
                        }
                        return <CodeBlock key={i} lang={block.lang} code={block.code}/>
                    })}

                    <p className={style.disclaimer}>
                        この記事はAIを使った調査ノートです。内容が不正確な場合があります。
                    </p>

                    {note.backlinks.length > 0 && (
                        <div className={style.backlinks}>
                            <h2 className={style.backlinksTitle}>🔗 リンクされているノート</h2>
                            <ul className={style.backlinksList}>
                                {note.backlinks.map((b) => (
                                    <li key={b.slug}>
                                        <Link to={`/notes/${b.slug}`}>{b.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className={style.backLink}>
                        <Link to="/notes/">&larr; back to notes</Link>
                    </div>
                </article>
            </div>
        </Layout>
    )
}

export default NotePage
