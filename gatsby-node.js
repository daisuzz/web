const path = require(`path`)
const axios = require('axios')
const xml2js = require("xml2js");
require(`dotenv`).config()

exports.createPages = async ({graphql, actions}) => {
    const {createPage} = actions;

    const result = await graphql(
        `
      {
        allMicrocmsBlogs(sort: {order: DESC, fields: publishedAt}) {
            edges {
                node {
                    content
                    blogsId
                    title
                    publishedAt
                }
            }
        }
      }
    `
    );

    if (result.errors) {
        throw result.errors;
    }

    result.data.allMicrocmsBlogs.edges.forEach((edge, index) => {
        createPage({
            path: '/blogs/' + edge.node.blogsId,
            component: path.resolve('./src/template/Blog.tsx'),
            context: {
                blogsId: edge.node.blogsId,
            },
        });
    });
};

exports.sourceNodes = async ({actions, createContentDigest}) => {
    const fetchHatenaBlogs = async (url) => {
        const hatenaPosts = () => axios.get(url, {
            auth: {
                username: process.env.HATENA_NAME,
                password: process.env.HATENA_API_KEY
            }
        });
        const hatenaRes = await hatenaPosts();
        const hatenaResJson = await xml2js.parseStringPromise(hatenaRes.data, {})

        hatenaResJson.feed.entry.map((post, i) => {
            console.log(post.link[1].$.href)
            const postNode = {
                // Required fields
                id: post.id[0],
                parent: null,
                children: [],
                internal: {
                    type: `HatenaPosts`,
                    contentDigest: createContentDigest(post),
                },
                title: post.title[0],
                content: post.content[0],
                pubDate: post.published[0],
                link: post.link[1].$.href,
            }

            // Create node with the gatsby createNode() API
            createNode(postNode);
        });

        const nextUrl = hatenaResJson.feed.link[1].$.href
        if (nextUrl) {
            await fetchHatenaBlogs(nextUrl)
        }
    }
    const {createNode} = actions;
    const qiitaPosts = () => axios.get(`https://qiita.com/api/v2/items?page=1&per_page=100&query=user:daisuzz`);
    const qiitaRes = await qiitaPosts();
    qiitaRes.data.map((post, i) => {
        const postNode = {
            // Required fields
            id: post.id,
            parent: null,
            children: [],
            internal: {
                type: `QiitaPosts`,
                contentDigest: createContentDigest(post),
            },
            title: post.title,
            content: post.rendered_body,
            pubDate: post.created_at,
            likesCount: post.likes_count,
            link: post.url,
        }

        // Create node with the gatsby createNode() API
        createNode(postNode);
    });

    await fetchHatenaBlogs(`https://blog.hatena.ne.jp/dais39/iikanji.hatenablog.jp/atom/entry`)

    return;
}

