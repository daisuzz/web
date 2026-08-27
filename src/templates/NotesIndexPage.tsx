import * as React from "react"
import {Link, PageProps} from "gatsby"
import Layout from "../components/Layout"
import {NoteSearchEntry, SiteNote} from "../types/note"
// @ts-ignore
import * as style from "./NotesIndexPage.module.css"

interface NotesIndexPageContext {
    notes: SiteNote[]
    currentPage: number
    numPages: number
    searchIndex: NoteSearchEntry[]
}

function pagePath(page: number): string {
    return page === 1 ? "/notes/" : `/notes/${page}/`
}

function matches(entry: NoteSearchEntry, query: string): boolean {
    const q = query.toLowerCase()
    if (entry.title.toLowerCase().includes(q)) return true
    return entry.tags.some((tag) => tag.toLowerCase().includes(q))
}

interface NoteListItemProps {
    slug: string
    title: string
    created: string
    tags: string[]
}

const NoteListItem: React.FC<NoteListItemProps> = ({slug, title, created, tags}) => (
    <li className={style.item}>
        <Link to={`/notes/${slug}`} className={style.itemTitle}>
            {title}
        </Link>
        <div className={style.itemMeta}>
            <time>{created}</time>
            {tags.map((tag) => (
                <Link key={tag} to={`/notes/tags/${tag}`} className={style.tag}>
                    #{tag}
                </Link>
            ))}
        </div>
    </li>
)

const NotesIndexPage: React.FC<PageProps<object, NotesIndexPageContext>> = ({pageContext, location}) => {
    const {notes, currentPage, numPages, searchIndex} = pageContext
    const [query, setQuery] = React.useState("")

    const trimmedQuery = query.trim()
    const searchResults = trimmedQuery === "" ? null : searchIndex.filter((entry) => matches(entry, trimmedQuery))

    return (
        <Layout
            pageTitle="Notes"
            description="Daisaku Suzukiの個人ノート一覧。相互リンクとタグで整理された走り書き集。"
            path={location.pathname}
            noindex
        >
            <div className={style.wrap}>
                <div className={style.breadcrumb}>
                    <Link to="/">~/</Link> / notes
                </div>
                <h1 className={style.title}>Notes</h1>
                <div className={style.tagsLink}>
                    <Link to="/notes/tags/">タグ一覧を見る &rarr;</Link>
                </div>

                <input
                    type="search"
                    className={style.search}
                    placeholder="タイトル・タグで検索"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {searchResults !== null ? (
                    searchResults.length === 0 ? (
                        <p className={style.empty}>「{trimmedQuery}」に一致するノートはありません。</p>
                    ) : (
                        <ul className={style.list}>
                            {searchResults.map((note) => (
                                <NoteListItem key={note.slug} {...note} />
                            ))}
                        </ul>
                    )
                ) : notes.length === 0 ? (
                    <p className={style.empty}>まだノートがありません。</p>
                ) : (
                    <>
                        <ul className={style.list}>
                            {notes.map((note) => (
                                <NoteListItem key={note.slug} {...note} />
                            ))}
                        </ul>

                        {numPages > 1 && (
                            <nav className={style.pagination} aria-label="pagination">
                                <Link
                                    to={pagePath(currentPage - 1)}
                                    className={style.pageLink}
                                    style={currentPage <= 1 ? {visibility: "hidden"} : undefined}
                                >
                                    &larr; prev
                                </Link>
                                <span className={style.pageStatus}>{currentPage} / {numPages}</span>
                                <Link
                                    to={pagePath(currentPage + 1)}
                                    className={style.pageLink}
                                    style={currentPage >= numPages ? {visibility: "hidden"} : undefined}
                                >
                                    next &rarr;
                                </Link>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </Layout>
    )
}

export default NotesIndexPage
