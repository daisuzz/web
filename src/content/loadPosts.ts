import fs from "fs"
import path from "path"
import matter from "gray-matter"
import {marked, Token} from "marked"
import {PostBlock, SitePost} from "../types/post"

const POSTS_DIR = path.join(__dirname, "posts")

function renderListItems(items: {text: string}[]): string[] {
    return items.map((item) => marked.parseInline(item.text) as string)
}

function tokenToBlock(token: Token): PostBlock | null {
    switch (token.type) {
        case "heading":
            return {type: "heading", depth: token.depth, html: marked.parseInline(token.text) as string}
        case "code":
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

function parsePost(filePath: string): SitePost {
    const raw = fs.readFileSync(filePath, "utf-8")
    const {data, content} = matter(raw)
    const slug = data.slug || path.basename(filePath, path.extname(filePath))
    const blocks = marked.lexer(content)
        .map(tokenToBlock)
        .filter((block): block is PostBlock => block !== null)

    return {
        slug,
        title: data.title || slug,
        date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date),
        blocks,
        content: marked.parse(content) as string,
    }
}

export function loadPosts(): SitePost[] {
    if (!fs.existsSync(POSTS_DIR)) return []

    return fs.readdirSync(POSTS_DIR)
        .filter((file) => file.endsWith(".md"))
        .map((file) => parsePost(path.join(POSTS_DIR, file)))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
}
