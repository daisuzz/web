import * as React from "react"
import {Link, PageProps} from "gatsby"
import Layout from "../components/Layout"
// @ts-ignore
import * as style from "./NoteTagsIndexPage.module.css"

interface TagCount {
    tag: string
    count: number
}

interface NoteTagsIndexPageContext {
    tags: TagCount[]
}

const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 26

function fontSizeFor(count: number, max: number): number {
    if (max <= 1) return MIN_FONT_SIZE
    const ratio = (count - 1) / (max - 1)
    return Math.round(MIN_FONT_SIZE + (MAX_FONT_SIZE - MIN_FONT_SIZE) * ratio)
}

const NoteTagsIndexPage: React.FC<PageProps<object, NoteTagsIndexPageContext>> = ({pageContext, location}) => {
    const {tags} = pageContext
    const max = tags.reduce((m, t) => Math.max(m, t.count), 1)
    const sorted = [...tags].sort((a, b) => a.tag.localeCompare(b.tag))

    return (
        <Layout
            pageTitle="Tags"
            description="daisuzz.devのノートに付けられたタグ一覧。"
            path={location.pathname}
            noindex
        >
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/notes/">~/notes</Link> / tags
                </div>
                <h1 className={style.title}>Tags</h1>

                {sorted.length === 0 ? (
                    <p className={style.empty}>まだタグがありません。</p>
                ) : (
                    <div className={style.cloud}>
                        {sorted.map(({tag, count}) => (
                            <Link
                                key={tag}
                                to={`/notes/tags/${tag}`}
                                className={style.tag}
                                style={{fontSize: `${fontSizeFor(count, max)}px`}}
                            >
                                #{tag}
                                <span className={style.count}>{count}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default NoteTagsIndexPage
