import type {GatsbyConfig} from "gatsby"

import "dotenv/config"

const DESCRIPTION_MAX_LENGTH = 200

function stripHtml(html: string): string {
    return (html || ``).replace(/<[^>]*>/g, ``).trim()
}

function buildDescription(html: string): string {
    const text = stripHtml(html)
    return text.length > DESCRIPTION_MAX_LENGTH ? `${text.slice(0, DESCRIPTION_MAX_LENGTH)}…` : text
}

interface FeedPostNode {
    title: string
    link: string
    pubDate: string
    content: string
}

interface FeedQueryResult {
    site: {
        siteMetadata: {
            title: string
            description: string
            siteUrl: string
        }
    }
    allSitePosts: { edges: { node: FeedPostNode }[] }
    allQiitaPosts: { edges: { node: FeedPostNode }[] }
    allHatenaPosts: { edges: { node: FeedPostNode }[] }
}

const config: GatsbyConfig = {
    // gatsby-plugin-sitemap, gatsby-plugin-feedの設定
    siteMetadata: {
        title: `daisuzz.dev`,
        description: `Daisaku Suzukiの個人サイト。Kotlin/Java/TypeScriptを中心とした技術ブログ記事とプロフィールを掲載。`,
        siteUrl: `https://daisuzz.dev/`,
    },
    plugins: [
        // Google Analytics
        {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
                trackingIds: [process.env.GATSBY_TRACKING_ID],
            },
        },
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                excludes: [`/404.html`, `/404/`, `/dev-404-page/`],
            },
        },
        // RSSフィードの生成(自サイト・Qiita・はてなブログの記事をまとめて配信)
        {
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
                    {
                        site {
                            siteMetadata {
                                title
                                description
                                siteUrl
                            }
                        }
                    }
                `,
                feeds: [
                    {
                        serialize: ({query: {site, allSitePosts, allQiitaPosts, allHatenaPosts}}: {query: FeedQueryResult}) => {
                            const siteUrl = site.siteMetadata.siteUrl.replace(/\/$/, "")

                            const items = [
                                ...allSitePosts.edges.map(({node}) => ({
                                    title: node.title,
                                    date: node.pubDate,
                                    url: `${siteUrl}${node.link}`,
                                    guid: `${siteUrl}${node.link}`,
                                    description: buildDescription(node.content),
                                    custom_elements: [{"content:encoded": node.content}],
                                })),
                                ...allQiitaPosts.edges.map(({node}) => ({
                                    title: node.title,
                                    date: node.pubDate,
                                    url: node.link,
                                    guid: node.link,
                                    description: buildDescription(node.content),
                                    custom_elements: [{"content:encoded": node.content}],
                                })),
                                ...allHatenaPosts.edges.map(({node}) => ({
                                    title: node.title,
                                    date: node.pubDate,
                                    url: node.link,
                                    guid: node.link,
                                    description: buildDescription(node.content),
                                    custom_elements: [{"content:encoded": node.content}],
                                })),
                            ]

                            return items.sort(
                                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                            )
                        },
                        query: `
                            {
                                allSitePosts(sort: {pubDate: DESC}) {
                                    edges {
                                        node {
                                            title
                                            link
                                            pubDate
                                            content
                                        }
                                    }
                                }
                                allQiitaPosts(sort: {pubDate: DESC}) {
                                    edges {
                                        node {
                                            title
                                            link
                                            pubDate
                                            content
                                        }
                                    }
                                }
                                allHatenaPosts(sort: {pubDate: DESC}) {
                                    edges {
                                        node {
                                            title
                                            link
                                            pubDate
                                            content
                                        }
                                    }
                                }
                            }
                        `,
                        output: `/rss.xml`,
                        title: `daisuzz.dev RSS Feed`,
                    },
                ],
            },
        },
    ].filter(Boolean),

    // GraphQL Typegenを有効にする
    graphqlTypegen: true,
}

export default config
