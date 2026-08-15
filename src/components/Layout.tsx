import * as React from "react"
import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import {theme} from "../assets/theme";
import Header from "./organisms/Header";
import Footer from "./organisms/Footer";
// @ts-ignore
import * as style from "./Layout.module.css";

const SITE_URL = "https://daisuzz.dev"
const SITE_NAME = "daisuzz.dev"
const DEFAULT_DESCRIPTION = "Daisaku Suzukiの個人サイト。Kotlin/Java/TypeScriptを中心とした技術ブログとプロフィールを掲載。"
const DEFAULT_IMAGE = "/avatar/profile.jpg"

interface Props {
    pageTitle: string
    description?: string
    path?: string
    image?: string
    type?: "website" | "article"
    structuredData?: object
    children: React.ReactNode
}

const Layout: React.FC<Props> = ({
    pageTitle,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    image = DEFAULT_IMAGE,
    type = "website",
    structuredData,
    children,
}) => {
    const title = pageTitle + ' | daisuzz.dev'
    const url = `${SITE_URL}${path}`
    const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <title>{title}</title>
            <meta name="description" content={description}/>
            <link rel="canonical" href={url}/>
            <link rel="icon" href="/favicon.ico" sizes="any"/>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
            <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
            <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} RSS Feed`} href={`${SITE_URL}/rss.xml`}/>
            <meta property="og:site_name" content={SITE_NAME}/>
            <meta property="og:type" content={type}/>
            <meta property="og:title" content={title}/>
            <meta property="og:description" content={description}/>
            <meta property="og:url" content={url}/>
            <meta property="og:image" content={imageUrl}/>
            <meta name="twitter:card" content="summary"/>
            <meta name="twitter:title" content={title}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:image" content={imageUrl}/>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
            <link
                href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap"
                rel="stylesheet"
            />
            {structuredData && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}}/>
            )}
            <Box id="top" className={style.layout}>
                <Header/>
                <main className={style.main}>
                    {children}
                </main>
                <Footer/>
            </Box>
        </ThemeProvider>
    )
}

export default Layout
