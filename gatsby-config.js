require(`dotenv`).config()

module.exports = {
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
                        serialize: ({query: {site, allSitePosts, allQiitaPosts, allHatenaPosts}}) => {
                            const siteUrl = site.siteMetadata.siteUrl.replace(/\/$/, "")

                            const items = [
                                ...allSitePosts.edges.map(({node}) => ({
                                    title: node.title,
                                    date: node.pubDate,
                                    url: `${siteUrl}${node.link}`,
                                    guid: `${siteUrl}${node.link}`,
                                })),
                                ...allQiitaPosts.edges.map(({node}) => ({
                                    title: node.title,
                                    date: node.pubDate,
                                    url: node.link,
                                    guid: node.link,
                                })),
                                ...allHatenaPosts.edges.map(({node}) => ({
                                    title: node.title,
                                    date: node.pubDate,
                                    url: node.link,
                                    guid: node.link,
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
                                        }
                                    }
                                }
                                allQiitaPosts(sort: {pubDate: DESC}) {
                                    edges {
                                        node {
                                            title
                                            link
                                            pubDate
                                        }
                                    }
                                }
                                allHatenaPosts(sort: {pubDate: DESC}) {
                                    edges {
                                        node {
                                            title
                                            link
                                            pubDate
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
