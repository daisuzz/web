import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../components/Layout"
import BlogTable, {ExternalBlog} from "../components/organisms/BlogTable"

// @ts-ignore
const WritingPage: React.FC<PageProps<Queries.WritingPageQuery>> = ({data, location}) => {
    const hatenaBlogEdge = data.allHatenaPosts.edges
    const qiitaEdge = data.allQiitaPosts.edges
    const sitePostEdge = data.allSitePosts.edges

    const sitePosts: ExternalBlog[] = sitePostEdge.map(
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
    const qiitaBlogs: ExternalBlog[] = qiitaEdge.map(
        (e: {
            node: {
                id: string
                title: string
                pubDate: string
                link: string
            }
        }) => ({
            id: e.node.id,
            title: e.node.title,
            link: e.node.link,
            publishedAt: e.node.pubDate,
        })
    )

    return (
        <Layout
            pageTitle="Writing"
            description="Daisaku Suzukiの技術ブログ記事一覧。Blog / Hatena / Qiitaの投稿をまとめて掲載。"
            path={location.pathname}
        >
            <BlogTable qiitaBlogs={qiitaBlogs} hatenaBlogs={hatenaBlogs} sitePosts={sitePosts}/>
        </Layout>
    )
}

export default WritingPage

export const pageQuery = graphql`
    query WritingPage {
        allHatenaPosts(sort: {pubDate: DESC}) {
            edges {
                node {
                    id
                    title
                    link
                    pubDate
                }
            }
        }
        allQiitaPosts(sort: {pubDate: DESC}) {
            edges {
                node {
                    id
                    title
                    pubDate
                    link
                }
            }
        }
        allSitePosts(sort: {pubDate: DESC}) {
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
