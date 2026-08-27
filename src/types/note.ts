export type NoteBlock =
    | { type: "paragraph"; html: string }
    | { type: "heading"; depth: number; html: string }
    | { type: "code"; lang: string; code: string }
    | { type: "mermaid"; code: string }
    | { type: "blockquote"; html: string }
    | { type: "list"; ordered: boolean; items: string[] }
    | { type: "table"; align: Array<"center" | "left" | "right" | null>; header: string[]; rows: string[][] }

export interface NoteBacklink {
    slug: string
    title: string
}

export interface SiteNote {
    slug: string
    title: string
    created: string
    updated: string
    tags: string[]
    blocks: NoteBlock[]
    links: string[]
    backlinks: NoteBacklink[]
}

export interface NoteSearchEntry {
    slug: string
    title: string
    created: string
    tags: string[]
}
