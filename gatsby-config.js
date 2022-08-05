require(`dotenv`).config()

module.exports = {
    // gatsby-plugin-sitemapの設定
    siteMetadata: {
        siteUrl: `https://daisuzz.dev/`,
    },
    plugins: [
        // QiitaのRSSフィードから記事情報を取得するための設定
        {
            resolve: `gatsby-source-rss-feed`,
            options: {
                url: `https://qiita.com/daisuzz/feed`,
                name: `Qiita`,
            }
        },
        // はてなブログのRSSフィードから記事情報を取得するための設定
        {
            resolve: `gatsby-source-rss-feed`,
            options: {
                url: `https://iikanji.hatenablog.jp/rss`,
                name: `HatenaBlog`,
            }
        },
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
        `gatsby-plugin-image`,
        `gatsby-plugin-sharp`,
        `gatsby-transformer-sharp`
    ].filter(Boolean),

    // GraphQL Typegenを有効にする
    graphqlTypegen: true,
}
