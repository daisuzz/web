import * as React from "react"
import {DateUtils} from "../../DateUtils"
// @ts-ignore
import * as style from "./BlogTable.module.css"

export interface ExternalBlog {
    id: string
    link: string
    title: string
    publishedAt: string
}

interface BlogArticleTableProps {
    qiitaBlogs: ExternalBlog[]
    hatenaBlogs: ExternalBlog[]
}

type Source = "hatena" | "qiita"
type Filter = "all" | Source

interface Post extends ExternalBlog {
    source: Source
}

const VISIBLE_COUNT = 10
const FILTERS: Filter[] = ["all", "hatena", "qiita"]
const SOURCE_LABEL: Record<Source, string> = {hatena: "Hatena", qiita: "Qiita"}

const BlogTable: React.FC<BlogArticleTableProps> = ({qiitaBlogs, hatenaBlogs}) => {
    const [filter, setFilter] = React.useState<Filter>("all")
    const [expanded, setExpanded] = React.useState(false)

    const posts: Post[] = React.useMemo(() => {
        const combined: Post[] = [
            ...hatenaBlogs.map((b) => ({...b, source: "hatena" as const})),
            ...qiitaBlogs.map((b) => ({...b, source: "qiita" as const})),
        ]
        return combined.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    }, [hatenaBlogs, qiitaBlogs])

    const filtered = filter === "all" ? posts : posts.filter((p) => p.source === filter)
    const shown = expanded ? filtered : filtered.slice(0, VISIBLE_COUNT)

    const selectFilter = (next: Filter) => {
        setFilter(next)
        setExpanded(false)
    }

    return (
        <section id="writing" className={style.section}>
            <div className={style.sectionHeader}>
                <h2 className={style.heading}># writing ({posts.length})</h2>
                <div className={style.filters}>
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => selectFilter(f)}
                            className={f === filter ? `${style.chip} ${style.chipActive}` : style.chip}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <ol className={style.list}>
                {shown.map((post) => (
                    <li key={post.id}>
                        <a
                            href={post.link}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={style.row}
                        >
                            <time className={style.date}>
                                {DateUtils.formatDate(new Date(post.publishedAt), "YYYY-MM-DD")}
                            </time>
                            <span className={post.source === "qiita" ? style.tagQiita : style.tagHatena}>
                                {SOURCE_LABEL[post.source]}
                            </span>
                            <span className={style.title}>{post.title || post.id}</span>
                        </a>
                    </li>
                ))}
            </ol>

            <div className={style.toggleWrap}>
                <button type="button" className={style.toggle} onClick={() => setExpanded((v) => !v)}>
                    {expanded ? "collapse" : `show all (${filtered.length})`}
                </button>
            </div>
        </section>
    )
}

export default BlogTable
