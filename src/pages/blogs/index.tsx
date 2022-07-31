import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../../components/Layout"
import {Box} from "@mui/material";
import BlogTable, {Blog} from "../../components/BlogTable";

// @ts-ignore
const BlogIndex: React.FC<PageProps<Queries.BlogIndexPageQuery>> = ({data}) => {
    const nodes = data.allMicrocmsBlogs.edges
    const categories = data.allMicrocmsCategories.edges

    if (nodes.length === 0) {
        return (
            <Layout pageTitle="ブログ一覧">
                <p>
                    ブログ記事がありません。
                </p>
            </Layout>
        )
    }

    const blogNodes: Blog[] = nodes.map(
        (node: {
            blogIds: any
            title: any
            publishedAt: any
        }) => ({
            blogIds: node.blogIds,
            title: node.title,
            publishedAt: node.publishedAt,
        })
    )

    return (
        <Layout pageTitle="ブログ一覧">
            <Box style={{margin: `10px 10px 20px 10px`}}>
                <BlogTable nodes={blogNodes}/>
            </Box>
        </Layout>
    )
}

export default BlogIndex

export const pageQuery = graphql`
  query BlogIndexPage {
    allMicrocmsBlogs(sort: {order: DESC, fields: publishedAt}, limit: 10) {
        edges {
            node {
                blogsId
                title
                publishedAt
            }
        }
    }
    allMicrocmsCategories {
        edges {
            node {
                categoriesId
                name
            }
        }
    }
  }
`
