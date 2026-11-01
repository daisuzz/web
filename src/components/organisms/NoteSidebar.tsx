import * as React from "react"
import {Link} from "gatsby"
import {NoteNav, NoteSearchEntry, NoteTreeNode} from "../../types/note"
// @ts-ignore
import * as style from "./NoteSidebar.module.css"

interface Props {
    nav: NoteNav
    currentSlug?: string
}

// ノート間の遷移ではテンプレートごと再マウントされるため、フォルダの開閉状態とスクロール位置は
// モジュールスコープに保持して引き継ぐ。初回描画(SSR・ハイドレーション)ではどちらも未設定で、
// 現在のノートを含むフォルダだけが開いた状態から始まる。
let expandedMemory: Set<string> | null = null
let scrollTopMemory = 0

function ancestorsOf(tree: NoteTreeNode[], slug: string | undefined): Set<string> {
    const result = new Set<string>()
    if (!slug) return result
    const walk = (nodes: NoteTreeNode[], path: string[]) => {
        nodes.forEach((node) => {
            if (node.slug === slug) {
                path.forEach((p) => result.add(p))
                if (node.children) result.add(node.slug)
            }
            if (node.children) walk(node.children, [...path, node.slug])
        })
    }
    walk(tree, [])
    return result
}

// 現在のノートに至るフォルダの道筋(最初に見つかったもの)。モバイルの上部バーに現在地として表示する。
function pathTo(tree: NoteTreeNode[], slug: string | undefined): string[] {
    if (!slug) return []
    for (const node of tree) {
        if (node.slug === slug) return [node.slug]
        if (node.children) {
            const rest = pathTo(node.children, slug)
            if (rest.length > 0) return [node.slug, ...rest]
        }
    }
    return []
}

function matches(entry: NoteSearchEntry, query: string): boolean {
    const q = query.toLowerCase()
    if (entry.title.toLowerCase().includes(q)) return true
    if (entry.slug.toLowerCase().includes(q)) return true
    return entry.tags.some((tag) => tag.toLowerCase().includes(q))
}

const NoteSidebar: React.FC<Props> = ({nav, currentSlug}) => {
    const entriesBySlug = React.useMemo(() => new Map(nav.entries.map((e) => [e.slug, e])), [nav])
    const [expanded, setExpanded] = React.useState<Set<string>>(() => {
        const initial = new Set(expandedMemory ?? [])
        ancestorsOf(nav.tree, currentSlug).forEach((slug) => initial.add(slug))
        return initial
    })
    const [query, setQuery] = React.useState("")
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        expandedMemory = expanded
    }, [expanded])

    // モバイルのドロワーを開いている間は背面の本文をスクロールさせず、Escで閉じられるようにする
    React.useEffect(() => {
        if (!mobileOpen) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => {
            document.body.style.overflow = prevOverflow
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [mobileOpen])

    React.useLayoutEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTop = scrollTopMemory
        const active = el.querySelector<HTMLElement>("[aria-current='page']")
        if (!active) return
        const top = active.offsetTop
        if (top < el.scrollTop || top + active.offsetHeight > el.scrollTop + el.clientHeight) {
            el.scrollTop = top - el.clientHeight / 3
        }
    }, [])

    const toggle = (slug: string) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(slug)) next.delete(slug)
            else next.add(slug)
            return next
        })
    }

    const renderNode = (node: NoteTreeNode, depth: number): React.ReactNode => {
        const entry = entriesBySlug.get(node.slug)
        if (!entry) return null
        const isFolder = node.children !== undefined
        const isOpen = isFolder && expanded.has(node.slug)
        const isActive = node.slug === currentSlug
        return (
            <li key={node.slug}>
                <div
                    className={`${style.row} ${isActive ? style.active : ""}`}
                    style={{paddingLeft: `${depth * 14}px`}}
                >
                    {isFolder ? (
                        <button
                            type="button"
                            className={style.toggle}
                            aria-expanded={isOpen}
                            aria-label={`${entry.title}を${isOpen ? "閉じる" : "開く"}`}
                            onClick={() => toggle(node.slug)}
                        >
                            {isOpen ? "▾" : "▸"}
                        </button>
                    ) : (
                        <span className={style.spacer}/>
                    )}
                    <Link
                        to={`/notes/${node.slug}`}
                        className={`${style.link} ${isFolder ? style.folder : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        title={entry.title}
                    >
                        {entry.title}
                    </Link>
                    {isFolder && <span className={style.count}>{node.children!.length}</span>}
                </div>
                {isOpen && (
                    <ul className={style.tree}>
                        {node.children!.map((child) => renderNode(child, depth + 1))}
                    </ul>
                )}
            </li>
        )
    }

    const trimmedQuery = query.trim()
    const results = trimmedQuery === "" ? null : nav.entries.filter((entry) => matches(entry, trimmedQuery))
    const location = pathTo(nav.tree, currentSlug).map((slug) => entriesBySlug.get(slug)?.title ?? slug)

    return (
        <aside className={style.sidebar}>
            <div className={style.mobileBar}>
                <button
                    type="button"
                    className={style.mobileToggle}
                    aria-expanded={mobileOpen}
                    aria-controls="note-sidebar-panel"
                    onClick={() => setMobileOpen(true)}
                >
                    ☰ ノート
                </button>
                <span className={style.mobileLocation}>
                    {location.length > 0 ? location.join(" / ") : `${nav.entries.length} notes`}
                </span>
            </div>
            {mobileOpen && <div className={style.backdrop} onClick={() => setMobileOpen(false)}/>}
            <div
                id="note-sidebar-panel"
                className={`${style.panel} ${mobileOpen ? style.panelOpen : ""}`}
                onClick={(e) => {
                    // ドロワー内のリンクをタップしたら閉じる(同じページへのリンクで遷移が起きない場合も含む)
                    if ((e.target as HTMLElement).closest("a")) setMobileOpen(false)
                }}
            >
                <div className={style.head}>
                    <Link to="/notes/" className={style.headLink}>~/notes</Link>
                    <Link to="/notes/tags/" className={style.headSub}>#tags</Link>
                    <button
                        type="button"
                        className={style.close}
                        aria-label="ノート一覧を閉じる"
                        onClick={() => setMobileOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                <input
                    type="search"
                    className={style.search}
                    placeholder="タイトル・タグで絞り込み"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div
                    ref={scrollRef}
                    className={style.scroll}
                    onScroll={(e) => {
                        scrollTopMemory = e.currentTarget.scrollTop
                    }}
                >
                    {results !== null ? (
                        results.length === 0 ? (
                            <p className={style.empty}>一致するノートはありません。</p>
                        ) : (
                            <ul className={style.tree}>
                                {results.map((entry) => (
                                    <li key={entry.slug}>
                                        <div className={`${style.row} ${entry.slug === currentSlug ? style.active : ""}`}>
                                            <Link
                                                to={`/notes/${entry.slug}`}
                                                className={style.link}
                                                aria-current={entry.slug === currentSlug ? "page" : undefined}
                                                title={entry.title}
                                            >
                                                {entry.title}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : (
                        <ul className={style.tree}>
                            {nav.tree.map((node) => renderNode(node, 0))}
                        </ul>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default NoteSidebar
