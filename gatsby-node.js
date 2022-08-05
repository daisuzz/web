const path = require(`path`)
const axios = require('axios')

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

exports.sourceNodes = async ({
                                 actions,
                                 createContentDigest,
                                 createNodeId,
                                 getNodesByType,
                             }) => {
    const {createNode} = actions;

    const qiitaPosts = () => axios.get(`https://qiita.com/api/v2/items?page=1&per_page=100&query=user:daisuzz`);
    const res = await qiitaPosts();

    res.data.map((post, i) => {
        const postNode = {
            // Required fields
            id: post.id,
            parent: null,
            children: [],
            internal: {
                type: `QiitaPosts`,
                contentDigest: createContentDigest(post),
            },
            id: post.id,
            title: post.title,
            content: post.rendered_body,
            pubDate: post.created_at,
            likesCount: post.likes_count,
            link: post.url,
        }

        // Create node with the gatsby createNode() API
        createNode(postNode);
    });

    return;
}
