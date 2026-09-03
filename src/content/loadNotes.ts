import fs from "fs"
import path from "path"
import matter from "gray-matter"
import {marked, Token, Tokens} from "marked"
import {NoteBlock, SiteNote} from "../types/note"
import {preprocessNoteMarkdown} from "./noteMarkdown"

const NOTES_DIR = path.join(__dirname, "notes")

function extractTitleAndBody(content: string): { title: string | null; body: string } {
    const lines = content.split("\n")
    let i = 0
    while (i < lines.length && lines[i].trim() === "") i++
    if (i < lines.length && /^#\s+.+/.test(lines[i].trim())) {
        const title = lines[i].trim().replace(/^#\s+/, "").trim()
        const body = [...lines.slice(0, i), ...lines.slice(i + 1)].join("\n")
        return {title, body}
    }
    return {title: null, body: content}
}

// frontmatterのcreated/updatedは日付("2026-08-17")または日時("2026-08-17T14:30:00+09:00")の
// どちらでも受け付ける。ソートは常にこの生の値(日時があれば日時)で行い、画面表示用には
// toDisplayDate() で日付部分だけに切り詰める。
function normalizeDateTime(value: unknown): string | undefined {
    if (value instanceof Date) return value.toISOString()
    if (typeof value === "string") return value.trim()
    return undefined
}

function toDisplayDate(value: string | undefined): string {
    return value ? value.slice(0, 10) : ""
}

function renderListItems(items: { text: string }[]): string[] {
    return items.map((item) => marked.parseInline(item.text) as string)
}

function tokenToBlock(token: Token): NoteBlock | null {
    switch (token.type) {
        case "heading":
            return {type: "heading", depth: token.depth, html: marked.parseInline(token.text) as string}
        case "code":
            if ((token.lang || "").trim().toLowerCase() === "mermaid") {
                return {type: "mermaid", code: token.text}
            }
            return {type: "code", lang: token.lang || "", code: token.text}
        case "blockquote":
            return {type: "blockquote", html: marked.parseInline(token.text) as string}
        case "list":
            return {type: "list", ordered: token.ordered, items: renderListItems(token.items)}
        case "table":
            return {
                type: "table",
                align: token.align,
                header: token.header.map((cell: Tokens.TableCell) => marked.parseInline(cell.text) as string),
                rows: token.rows.map((row: Tokens.TableCell[]) => row.map((cell) => marked.parseInline(cell.text) as string)),
            }
        case "paragraph":
            return {type: "paragraph", html: marked.parseInline(token.text) as string}
        default:
            return null
    }
}

function readAllFiles(): string[] {
    if (!fs.existsSync(NOTES_DIR)) return []
    return fs.readdirSync(NOTES_DIR)
        .filter((file) => file.endsWith(".md"))
        .map((file) => path.join(NOTES_DIR, file))
}

function slugOf(filePath: string, data: { slug?: string }): string {
    return data.slug || path.basename(filePath, path.extname(filePath))
}

function buildSlugIndex(files: string[]): Map<string, string> {
    const index = new Map<string, string>()
    files.forEach((filePath) => {
        const raw = fs.readFileSync(filePath, "utf-8")
        const {data, content} = matter(raw)
        const slug = slugOf(filePath, data)
        const {title} = extractTitleAndBody(content)
        index.set(slug, title || slug)
    })
    return index
}

interface ParsedNote {
    note: SiteNote
    updatedAtMs: number
}

function parseNoteFile(filePath: string, slugIndex: Map<string, string>): ParsedNote {
    const raw = fs.readFileSync(filePath, "utf-8")
    const {data, content} = matter(raw)
    const slug = slugOf(filePath, data)
    const {title: extractedTitle, body} = extractTitleAndBody(content)
    const title = extractedTitle || slug

    const links = new Set<string>()
    const tags = new Set<string>()
    const preprocessed = preprocessNoteMarkdown(body, {
        slugIndex,
        onMissingLink: (target) => {
            console.warn(`[loadNotes] ${slug}: 未解決のリンク "[[${target}]]"`)
        },
        onLink: (targetSlug) => links.add(targetSlug),
        onTag: (tag) => tags.add(tag),
    })

    const blocks = marked.lexer(preprocessed)
        .map(tokenToBlock)
        .filter((block): block is NoteBlock => block !== null)

    const createdRaw = normalizeDateTime(data.created) ?? ""
    const updatedRaw = normalizeDateTime(data.updated) ?? createdRaw

    if (!createdRaw) {
        console.warn(`[loadNotes] ${slug}: frontmatterに created がありません`)
    }

    // 日付のみ("2026-08-17")の場合はUTC 0時、日時が指定されていればそのオフセットを
    // 踏まえた絶対時刻としてパースする。Dateとして不正な値はNaNとなり、常に末尾に回る。
    const updatedAtMs = updatedRaw ? Date.parse(updatedRaw) : NaN

    return {
        note: {
            slug,
            title,
            created: toDisplayDate(createdRaw),
            updated: toDisplayDate(updatedRaw),
            tags: [...tags],
            blocks,
            links: [...links],
            backlinks: [],
        },
        updatedAtMs,
    }
}

export function loadNotes(): { notes: SiteNote[]; tagIndex: Map<string, SiteNote[]> } {
    const files = readAllFiles()
    const slugIndex = buildSlugIndex(files)
    const parsed = files.map((filePath) => parseNoteFile(filePath, slugIndex))
    const notes = parsed.map((p) => p.note)
    const updatedAtMsBySlug = new Map(parsed.map((p) => [p.note.slug, p.updatedAtMs]))

    const notesBySlug = new Map(notes.map((note) => [note.slug, note]))
    notes.forEach((note) => {
        note.links.forEach((targetSlug) => {
            const target = notesBySlug.get(targetSlug)
            if (target) {
                target.backlinks.push({slug: note.slug, title: note.title})
            }
        })
    })

    // 表示上のupdatedは日付に切り詰めているが、並び順は切り詰め前の日時(updatedAtMsBySlug)で
    // 判定する。updatedが未設定の場合はcreatedにフォールバックした値で並ぶ。同日中に複数ノートを
    // 更新した場合でもfrontmatterに時刻まで書けば厳密な更新順になる。
    // created/updatedともに未設定(NaN)のノートは常に末尾に回す。
    notes.sort((a, b) => {
        const aAt = updatedAtMsBySlug.get(a.slug) ?? NaN
        const bAt = updatedAtMsBySlug.get(b.slug) ?? NaN
        if (Number.isNaN(aAt) && Number.isNaN(bAt)) return 0
        if (Number.isNaN(aAt)) return 1
        if (Number.isNaN(bAt)) return -1
        return bAt - aAt
    })

    const tagIndex = new Map<string, SiteNote[]>()
    notes.forEach((note) => {
        note.tags.forEach((tag) => {
            const list = tagIndex.get(tag) ?? []
            list.push(note)
            tagIndex.set(tag, list)
        })
    })

    return {notes, tagIndex}
}
