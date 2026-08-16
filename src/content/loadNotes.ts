import fs from "fs"
import path from "path"
import matter from "gray-matter"
import {marked, Token} from "marked"
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

function normalizeDate(value: unknown): string | undefined {
    if (value instanceof Date) return value.toISOString().slice(0, 10)
    if (typeof value === "string") return value
    return undefined
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

function parseNoteFile(filePath: string, slugIndex: Map<string, string>): SiteNote {
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

    const created = normalizeDate(data.created) ?? ""
    const updated = normalizeDate(data.updated) ?? created

    if (!created) {
        console.warn(`[loadNotes] ${slug}: frontmatterに created がありません`)
    }

    return {
        slug,
        title,
        created,
        updated,
        tags: [...tags],
        blocks,
        links: [...links],
        backlinks: [],
    }
}

export function loadNotes(): { notes: SiteNote[]; tagIndex: Map<string, SiteNote[]> } {
    const files = readAllFiles()
    const slugIndex = buildSlugIndex(files)
    const notes = files.map((filePath) => parseNoteFile(filePath, slugIndex))

    const notesBySlug = new Map(notes.map((note) => [note.slug, note]))
    notes.forEach((note) => {
        note.links.forEach((targetSlug) => {
            const target = notesBySlug.get(targetSlug)
            if (target) {
                target.backlinks.push({slug: note.slug, title: note.title})
            }
        })
    })

    notes.sort((a, b) => (a.updated < b.updated ? 1 : -1))

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
