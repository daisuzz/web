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

const PostPage: React.FC<PageProps<object, PostPageContext>> = ({pageContext}) => {
    const {post} = pageContext

    return (
        <Layout pageTitle={post.title}>
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/#writing">~/writing</Link> / {post.slug}
                </div>
                <article className={style.article}>
                    <div className={style.meta}>
                        <time>{post.date}</time>
                        <span className={style.tag}>site</span>
                    </div>
                    <h1 className={style.title}>{post.title}</h1>

                    {post.blocks.map((block, i) => {
                        if (block.type === "paragraph") {
                            return <p key={i} className={style.paragraph}>{block.text}</p>
                        }
                        if (block.type === "heading") {
                            return <h2 key={i} className={style.heading}>{block.text}</h2>
                        }
                        return <CodeBlock key={i} lang={block.lang} code={block.code}/>
                    })}

                    <div className={style.backLink}>
                        <Link to="/#writing">&larr; back to writing</Link>
                    </div>
                </article>
            </div>
        </Layout>
    )
}

export default PostPage
