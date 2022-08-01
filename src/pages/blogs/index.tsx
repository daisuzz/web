import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../../components/Layout"
import {Box} from "@mui/material";
import BlogTable, {Blog} from "../../components/BlogTable";

// @ts-ignore
const BlogIndex: React.FC<PageProps<Queries.BlogIndexPageQuery>> = ({data}) => {
    const blogEdges = data.allMicrocmsBlogs.edges
    const categories = data.allMicrocmsCategories.edges

    if (blogEdges.length === 0) {
        return (
            <Layout pageTitle="BLOG">
                <p>
                    ブログ記事がありません。
                </p>
            </Layout>
        )
    }
    const blogs: Blog[] = blogEdges.map(
        (e: {
            node: {
                blogsId: string
                title: string
                publishedAt: string
            }
        }) => ({
            blogsId: e.node.blogsId,
            title: e.node.title,
            publishedAt: e.node.publishedAt,
        })
    )

    return (
        <Layout pageTitle="BLOG">
            <Box style={{margin: `10px 10px 20px 10px`}}>
                <BlogTable blogs={blogs}/>
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
