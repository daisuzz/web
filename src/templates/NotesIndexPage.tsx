import * as React from "react"
import {Link, PageProps} from "gatsby"
import Layout from "../components/Layout"
import {SiteNote} from "../types/note"
// @ts-ignore
import * as style from "./NotesIndexPage.module.css"

interface NotesIndexPageContext {
    notes: SiteNote[]
}

const NotesIndexPage: React.FC<PageProps<object, NotesIndexPageContext>> = ({pageContext, location}) => {
    const {notes} = pageContext

    return (
        <Layout
            pageTitle="Notes"
            description="Daisaku Suzukiの個人ノート一覧。相互リンクとタグで整理された走り書き集。"
            path={location.pathname}
        >
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/">~/</Link> / notes
                </div>
                <h1 className={style.title}>Notes</h1>
                <div className={style.tagsLink}>
                    <Link to="/notes/tags/">タグ一覧を見る &rarr;</Link>
                </div>

                {notes.length === 0 ? (
                    <p className={style.empty}>まだノートがありません。</p>
                ) : (
                    <ul className={style.list}>
                        {notes.map((note) => (
                            <li key={note.slug} className={style.item}>
                                <Link to={`/notes/${note.slug}`} className={style.itemTitle}>
                                    {note.title}
                                </Link>
                                <div className={style.itemMeta}>
                                    <time>{note.created}</time>
                                    {note.tags.map((tag) => (
                                        <Link key={tag} to={`/notes/tags/${tag}`} className={style.tag}>
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Layout>
    )
}

export default NotesIndexPage
