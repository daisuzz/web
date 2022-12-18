require(`dotenv`).config()

module.exports = {
    // gatsby-plugin-sitemapの設定
    siteMetadata: {
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
        // はてなブログのRSSフィードから記事情報を取得するための設定
        {
            resolve: `gatsby-source-rss-feed`,
            options: {
                url: `https://iikanji.hatenablog.jp/rss`,
                name: `HatenaBlog`,
            }
        },
        `gatsby-plugin-sitemap`,
        `gatsby-plugin-image`,
        `gatsby-plugin-sharp`,
        `gatsby-transformer-sharp`
    ].filter(Boolean),

    // GraphQL Typegenを有効にする
    graphqlTypegen: true,
}
