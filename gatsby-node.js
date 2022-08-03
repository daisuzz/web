const path = require(`path`)
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
