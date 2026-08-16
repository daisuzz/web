export interface MarkdownSegment {
    code: boolean
    text: string
}

const CODE_REGION_RE = /```[\s\S]*?```|`[^`\n]+`/g

export function splitCodeRegions(markdown: string): MarkdownSegment[] {
    const segments: MarkdownSegment[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    CODE_REGION_RE.lastIndex = 0
    while ((match = CODE_REGION_RE.exec(markdown)) !== null) {
        if (match.index > lastIndex) {
            segments.push({code: false, text: markdown.slice(lastIndex, match.index)})
        }
        segments.push({code: true, text: match[0]})
        lastIndex = match.index + match[0].length
    }
    if (lastIndex < markdown.length) {
        segments.push({code: false, text: markdown.slice(lastIndex)})
    }
    return segments
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

const WIKILINK_RE = /\[\[([^[\]]+)]]/g

export function resolveWikilinks(
    text: string,
    slugIndex: Map<string, string>,
    onMissing: (target: string) => void,
    onLink: (slug: string) => void
): string {
    return text.replace(WIKILINK_RE, (_all, rawTarget: string) => {
        const target = rawTarget.trim()
        const title = slugIndex.get(target)
        if (title === undefined) {
            onMissing(target)
            return `<span class="wikilink-missing" title="ノートが見つかりません">${escapeHtml(target)}</span>`
        }
        onLink(target)
        return `[${title}](/notes/${target})`
    })
}

// 直前が行頭・空白・開き括弧類のときだけ #tag とみなし、URLの#fragmentや複合語中の#を誤検出しない
const TAG_RE = /(^|[\s　([{"'「『])#([\p{L}\p{N}_-]+)/gu

export function extractAndLinkTags(text: string, onTag: (tag: string) => void): string {
    return text.replace(TAG_RE, (_all, boundary: string, rawTag: string) => {
        const isAsciiTag = /^[A-Za-z0-9_-]+$/.test(rawTag)
        const tagKey = isAsciiTag ? rawTag.toLowerCase() : rawTag
        onTag(tagKey)
        return `${boundary}[#${rawTag}](/notes/tags/${tagKey})`
    })
}

export interface PreprocessNoteMarkdownOptions {
    slugIndex: Map<string, string>
    onMissingLink: (target: string) => void
    onLink: (slug: string) => void
    onTag: (tag: string) => void
}

export function preprocessNoteMarkdown(markdown: string, options: PreprocessNoteMarkdownOptions): string {
    const {slugIndex, onMissingLink, onLink, onTag} = options
    return splitCodeRegions(markdown)
        .map((segment) => {
            if (segment.code) return segment.text
            const withLinks = resolveWikilinks(segment.text, slugIndex, onMissingLink, onLink)
            return extractAndLinkTags(withLinks, onTag)
        })
        .join("")
}
