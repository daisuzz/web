import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../../components/Layout"
import PageTitle from "../../components/PageTitle";
import {Box} from "@mui/material";
import BlogTable, {Blog} from "../../components/BlogTable";

// @ts-ignore
const BlogIndex: React.FC<PageProps<GatsbyTypes.BlogIndexPageQuery>> = ({data,}) => {
    const posts = data.allMicrocmsBlogs.edges
    const categories = data.allMicrocmsCategories.edges

    if (posts.length === 0) {
        return (
            <Layout>
                <p>
                    ブログ記事がありません。
                </p>
            </Layout>
        )
    }

    const blogPosts: Blog[] = posts.map(
        (post: {
            blogIds: any
            title: any
            publishedAt: any
        }) => ({
            blogIds: post.blogIds,
            title: post.title,
            publishedAt: post.publishedAt,
        })
    )

    return (
        <Layout>
            <PageTitle name="ブログ一覧"/>
            <Box style={{margin: `10px 10px 20px 10px`}}>
                <BlogTable posts={blogPosts}/>
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
