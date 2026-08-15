export type PostBlock =
    | { type: "paragraph"; html: string }
    | { type: "heading"; depth: number; html: string }
    | { type: "code"; lang: string; code: string }
    | { type: "blockquote"; html: string }
    | { type: "list"; ordered: boolean; items: string[] }

export interface SitePost {
    slug: string
    date: string
    title: string
    blocks: PostBlock[]
    content: string
}
