require(`dotenv`).config()

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

module.exports = {
    siteMetadata: {
        title: `daisuzz.web`,
        author: {
            name: `DAISAKU SUZUKI`,
            summary: `daisuzz.web`,
        },
        description: `個人用Webサイト`,
        siteUrl: `https://www.daisuzz.dev/`,
        image: `/images/favicon.png`,
        social: {
            mail: `daisuzz@daisuzz.dev`,
            twitter: `daisuzz`,
            github: `daisuzz`,
        },
    },
    plugins: [
        {
            resolve: `gatsby-omni-font-loader`,
            options: {
                enableListener: true,
                preconnect: [`https://fonts.gstatic.com`],
                // If you plan on changing the font you'll also need to adjust the Theme UI config to edit the CSS
                // See: https://github.com/LekoArts/gatsby-themes/tree/main/examples/minimal-blog#changing-your-fonts
                web: [
                    {
                        name: `IBM Plex Sans`,
                        file: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`,
                    },
                ],
            },
        },
        shouldAnalyseBundle && {
            resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
            options: {
                analyzerMode: `static`,
                reportFilename: `_bundle.html`,
                openAnalyzer: false,
            },
        },
        {
            resolve: 'gatsby-source-microcms',
            options: {
                // apiKey: process.env.MICROCMS_API_KEY,
                // serviceId: process.env.MICROCMS_SERVICE_ID,
                apiKey: process.env.MICROCMS_API_KEY,
                serviceId: process.env.MICROCMS_SERVICE_ID,
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
    graphqlTypegen: true,
}
