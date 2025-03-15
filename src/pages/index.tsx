import * as React from "react"
import {graphql, PageProps} from "gatsby"
import Layout from "../components/Layout"
import ProfileImage from "../components/atoms/ProfileImage";
import {Box, IconButton, Typography} from "@mui/material";
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BlogTable, {ExternalBlog} from "../components/organisms/BlogTable";

// @ts-ignore
const IndexPage: React.FC<PageProps<Queries.IndexPageQuery>> = ({data}) => {
    const hatenaBlogEdge = data.allHatenaPosts.edges
    const qiitaEdge = data.allQiitaPosts.edges

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
        <Layout pageTitle="TOP">
            <ProfileImage/>
            <Typography variant="h4" sx={{
                fontFamily: 'Arial Black',
                fontWeight: 900,
                margin: "20px 0 20px 16px"
            }}>
                Suzuki Daisaku
            </Typography>
            <IconButton onClick={() => window.open("https://x.com/daisuzz")}>
                <XIcon htmlColor='#333333' sx={{fontSize: 30, marginLeft: "8px"}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://github.com/daisuzz")}>
                <GitHubIcon htmlColor='#333333' sx={{fontSize: 30}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://www.linkedin.com/in/daisuzz/")}>
                <LinkedInIcon htmlColor='#333333' sx={{fontSize: 30}}/>
            </IconButton>
            <Box style={{marginTop: "16px"}}>
                <BlogTable qiitaBlogs={qiitaBlogs} hatenaBlogs={hatenaBlogs}/>
            </Box>
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
    }
`
