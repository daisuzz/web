require(`dotenv`).config()

module.exports = {
    // gatsby-plugin-sitemapの設定
    siteMetadata: {
        siteUrl: `https://www.daisuzz.dev/`,
    },
    plugins: [
        // microCMSの設定
        {
            resolve: 'gatsby-source-microcms',
            options: {
                apiKey: process.env.MICROCMS_API_KEY,
                serviceId: process.env.MICROCMS_SERVICE_ID,
                // Gatsbyから叩くエンドポイントを指定
                apis: [
                    {
                        endpoint: 'blogs',
                    },
                    {
                        endpoint: 'categories',
                    },
                ],
            },
        },
        `gatsby-plugin-sitemap`,
    ].filter(Boolean),

    // GraphQL Typegenを有効にする
    graphqlTypegen: true,
}
