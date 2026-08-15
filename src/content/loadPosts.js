const fs = require("fs")
const path = require("path")
const matter = require("gray-matter")
const {marked} = require("marked")

const POSTS_DIR = path.join(__dirname, "posts")

function renderListItems(items) {
    return items.map((item) => marked.parseInline(item.text))
}

function tokenToBlock(token) {
    switch (token.type) {
        case "heading":
            return {type: "heading", depth: token.depth, html: marked.parseInline(token.text)}
        case "code":
            return {type: "code", lang: token.lang || "", code: token.text}
        case "blockquote":
            return {type: "blockquote", html: marked.parseInline(token.text)}
        case "list":
            return {type: "list", ordered: token.ordered, items: renderListItems(token.items)}
        case "paragraph":
            return {type: "paragraph", html: marked.parseInline(token.text)}
        default:
            return null
    }
}

function parsePost(filePath) {
    const raw = fs.readFileSync(filePath, "utf-8")
    const {data, content} = matter(raw)
    const slug = data.slug || path.basename(filePath, path.extname(filePath))
    const blocks = marked.lexer(content)
        .map(tokenToBlock)
        .filter((block) => block !== null)

    return {
        slug,
        title: data.title || slug,
        date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date),
        blocks,
        content: marked.parse(content),
    }
}

function loadPosts() {
    if (!fs.existsSync(POSTS_DIR)) return []

    return fs.readdirSync(POSTS_DIR)
        .filter((file) => file.endsWith(".md"))
        .map((file) => parsePost(path.join(POSTS_DIR, file)))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
}

module.exports = {loadPosts}
