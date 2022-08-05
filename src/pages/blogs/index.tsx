import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../../components/Layout"
import {Box} from "@mui/material";
import BlogTable, {Blog, ExternalBlog} from "../../components/BlogTable";

// @ts-ignore
const BlogIndex: React.FC<PageProps<Queries.BlogIndexPageQuery>> = ({data}) => {
    const blogEdges = data.allMicrocmsBlogs.edges
    const qiitaEdge = data.allFeedQiita.edges
    const hatenaBlogEdge = data.allFeedHatenaBlog.edges

    if (blogEdges.length === 0 && qiitaEdge.length === 0 && hatenaBlogEdge.length === 0) {
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
    const qiitaBlogs: ExternalBlog[] = qiitaEdge.map(
        (e: {
            node: {
                id: string
                title: string
                link: string
                pubDate: string
            }
        }) => ({
            id: e.node.id,
            title: e.node.title,
            link: e.node.link,
            publishedAt: e.node.pubDate,
        })
    )
    const hatenaBlogs: ExternalBlog[] = hatenaBlogEdge.map(
        (e: {
            node: {
                id: string
                title: string
                link: string
                pubDate: string
            }
        }) => ({
            id: e.node.id,
            title: e.node.title,
            link: e.node.link,
            publishedAt: e.node.pubDate,
        })
    )

    return (
        <Layout pageTitle="BLOG">
            <Box style={{margin: `10px 10px 20px 10px`}}>
                <BlogTable blogs={blogs} qiitaBlogs={qiitaBlogs} hatenaBlogs={hatenaBlogs}/>
            </Box>
        </Layout>
    )
}

export default BlogIndex

export const pageQuery = graphql`
    query BlogIndexPage {
        allMicrocmsBlogs(sort: {order: DESC, fields: publishedAt}) {
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
        allFeedQiita(sort: {fields: pubDate, order: DESC}) {
            edges {
                node {
                    id
                    title
                    link
                    pubDate
                }
            }
        }
        allFeedHatenaBlog(sort: {fields: isoDate, order: DESC}) {
            edges {
                node {
                    id
                    title
                    link
                    pubDate
                }
            }
        }
    }
`
