import * as React from "react"
import {Link, PageProps} from "gatsby"
import Layout from "../components/Layout"
import {SiteNote} from "../types/note"
// @ts-ignore
import * as style from "./NoteTagPage.module.css"

interface NoteTagPageContext {
    tag: string
    notes: SiteNote[]
}

const NoteTagPage: React.FC<PageProps<object, NoteTagPageContext>> = ({pageContext, location}) => {
    const {tag, notes} = pageContext

    return (
        <Layout
            pageTitle={`#${tag}`}
            description={`「#${tag}」タグが付いたノート一覧。`}
            path={location.pathname}
            noindex
        >
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/notes/">~/notes</Link> / <Link to="/notes/tags/">tags</Link> / {tag}
                </div>
                <h1 className={style.title}>#{tag}</h1>

                <ul className={style.list}>
                    {notes.map((note) => (
                        <li key={note.slug} className={style.item}>
                            <Link to={`/notes/${note.slug}`} className={style.itemTitle}>
                                {note.title}
                            </Link>
                            <time className={style.itemDate}>{note.created}</time>
                        </li>
                    ))}
                </ul>

                <div className={style.backLink}>
                    <Link to="/notes/tags/">&larr; back to tags</Link>
                </div>
            </div>
        </Layout>
    )
}

export default NoteTagPage
