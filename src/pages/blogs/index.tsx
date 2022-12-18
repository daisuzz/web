import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../../components/Layout"
import {Box} from "@mui/material";
import BlogTable, {ExternalBlog} from "../../components/BlogTable";

// @ts-ignore
const BlogIndex: React.FC<PageProps<Queries.BlogIndexPageQuery>> = ({data}) => {
    const hatenaBlogEdge = data.allHatenaPosts.edges
    const qiitaEdge = data.allQiitaPosts.edges

    if (qiitaEdge.length === 0 && hatenaBlogEdge.length === 0) {
        return (
            <Layout pageTitle="BLOG">
                <p>
                    ブログ記事がありません。
                </p>
            </Layout>
        )
    }
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

    return (
        <Layout pageTitle="BLOG">
            <Box style={{margin: `10px 10px 20px 10px`}}>
                <BlogTable qiitaBlogs={qiitaBlogs} hatenaBlogs={hatenaBlogs}/>
            </Box>
        </Layout>
    )
}

export default BlogIndex

export const pageQuery = graphql`
    query BlogIndexPage {
        allHatenaPosts(sort: {fields: pubDate, order: DESC}) {
            edges {
                node {
                    id
                    title
                    link
                    pubDate
                }
            }
        }
        allQiitaPosts(sort: {fields: pubDate, order: DESC}) {
            edges {
                node {
                    id
                    title
                    pubDate
                    link
                }
            }
        }
    }
`
