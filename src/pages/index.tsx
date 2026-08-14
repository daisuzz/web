import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../components/Layout"
import BlogTable, {ExternalBlog} from "../components/organisms/BlogTable";
// @ts-ignore
import * as style from "./index.module.css"

const PERSON_STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Daisaku Suzuki",
    url: "https://daisuzz.dev",
    image: "https://daisuzz.dev/avatar/profile.jpg",
    sameAs: [
        "https://github.com/daisuzz",
        "https://www.linkedin.com/in/daisuzz/",
        "https://x.com/daisuzz",
    ],
}

// @ts-ignore
const IndexPage: React.FC<PageProps<Queries.IndexPageQuery>> = ({data, location}) => {
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
        <Layout
            pageTitle="TOP"
            description="Daisaku Suzukiの個人サイト。Kotlin/Java/TypeScriptを中心とした技術ブログ記事とプロフィールを掲載。"
            path={location.pathname}
            structuredData={PERSON_STRUCTURED_DATA}
        >
            <section className={style.hero}>
                <p className={style.heroLabel}>$ whoami</p>
                <h1 className={style.heroTitle}>Daisaku Suzuki</h1>
                <div className={style.heroLinks}>
                    <a href="https://github.com/daisuzz">&rarr; github</a>
                    <a href="https://www.linkedin.com/in/daisuzz/">&rarr; linkedin</a>
                    <a href="https://x.com/daisuzz">&rarr; x</a>
                </div>
            </section>

            <BlogTable qiitaBlogs={qiitaBlogs} hatenaBlogs={hatenaBlogs} sitePosts={sitePosts}/>

            <section id="about" className={style.about}>
                <p className={style.aboutLabel}># about</p>
                <div className={style.aboutGrid}>
                    <div>
                        <span className={style.aboutFieldLabel}>stack</span>
                        <br/>
                        Kotlin, Java, Spring Boot
                    </div>
                    <div>
                        <span className={style.aboutFieldLabel}>role</span>
                        <br/>
                        Dev team lead (30+), Scrum Master
                    </div>
                    <div>
                        <span className={style.aboutFieldLabel}>interests</span>
                        <br/>
                        DDD, DevEx, Software Design
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default IndexPage

export const pageQuery = graphql`
    query IndexPage {
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
