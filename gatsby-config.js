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
        `gatsby-plugin-sitemap`,
    ].filter(Boolean),

    // GraphQL Typegenを有効にする
    graphqlTypegen: true,
}
