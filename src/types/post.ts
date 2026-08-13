export type PostBlock =
    | { type: "paragraph"; text: string }
    | { type: "heading"; text: string }
    | { type: "code"; lang: string; code: string }

export interface SitePost {
    slug: string
    date: string
    title: string
    blocks: PostBlock[]
}
