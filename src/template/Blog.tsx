import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../components/Layout"
import PageTitle from "../components/PageTitle"
import {Typography} from "@mui/material";

// @ts-ignore
const BlogPostTemplate: React.FC<PageProps<GatsbyTypes.MicrocmsBlogsQuery>> = ({data}) => {
    return (
        <Layout>
            <article className="memo-content" itemScope>
                <header>
                    <PageTitle name={data.microcmsBlogs.title}/>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {data.microcmsBlogs.publishedAt}
                    </Typography>
                </header>
                <Typography variant="body1">
                    <section
                        dangerouslySetInnerHTML={{__html: data.microcmsBlogs.content}}
                        itemProp="articleBody"
                    />
                    <hr/>
                </Typography>
                <footer></footer>
            </article>
            <nav className="blog-post-nav">
                <ul
                    style={{
                        display: `flex`,
                        flexWrap: `wrap`,
                        justifyContent: `space-between`,
                        listStyle: `none`,
                        padding: 0,
                    }}
                >
                </ul>
            </nav>
        </Layout>
    )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query MicrocmsBlogs($blogsId: String!) {
    microcmsBlogs(blogsId: { eq: $blogsId }) {
        publishedAt
        content
        title
    }
  }
`
