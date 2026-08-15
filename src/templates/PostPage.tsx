import * as React from "react"
import {Link, PageProps} from "gatsby"
import Layout from "../components/Layout"
import CodeBlock from "../components/organisms/CodeBlock"
import {SitePost} from "../types/post"
// @ts-ignore
import * as style from "./PostPage.module.css"

interface PostPageContext {
    post: SitePost
}

const SITE_URL = "https://daisuzz.dev"
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "")
}

function buildDescription(post: SitePost): string {
    const firstParagraph = post.blocks.find((block) => block.type === "paragraph")
    if (!firstParagraph || firstParagraph.type !== "paragraph") return post.title
    const text = stripHtml(firstParagraph.html)
    return text.length > 120 ? `${text.slice(0, 120)}…` : text
}

const PostPage: React.FC<PageProps<object, PostPageContext>> = ({pageContext, location}) => {
    const {post} = pageContext
    const description = buildDescription(post)
    const url = `${SITE_URL}${location.pathname}`
    const structuredData = [
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.date,
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
                {"@type": "ListItem", position: 2, name: "Writing", item: `${SITE_URL}/writing`},
                {"@type": "ListItem", position: 3, name: post.title, item: url},
            ],
        },
    ]

    return (
        <Layout
            pageTitle={post.title}
            description={description}
            path={location.pathname}
            type="article"
            structuredData={structuredData}
        >
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/writing">~/writing</Link> / {post.slug}
                </div>
                <article className={style.article}>
                    <div className={style.meta}>
                        <time>{post.date}</time>
                        <span className={style.tag}>site</span>
                    </div>
                    <h1 className={style.title}>{post.title}</h1>

                    {post.blocks.map((block, i) => {
                        if (block.type === "paragraph") {
                            return <p key={i} className={style.paragraph} dangerouslySetInnerHTML={{__html: block.html}}/>
                        }
                        if (block.type === "heading") {
                            return <h2 key={i} className={style.heading} dangerouslySetInnerHTML={{__html: block.html}}/>
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
                        return <CodeBlock key={i} lang={block.lang} code={block.code}/>
                    })}

                    <div className={style.backLink}>
                        <Link to="/writing">&larr; back to writing</Link>
                    </div>
                </article>
            </div>
        </Layout>
    )
}

export default PostPage
