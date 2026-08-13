import * as React from "react"
import {Box, CssBaseline, ThemeProvider} from "@mui/material";
import {theme} from "../assets/theme";
import Header from "./organisms/Header";
import Footer from "./organisms/Footer";
// @ts-ignore
import * as style from "./Layout.module.css";

interface Props {
    pageTitle: string
    children: React.ReactNode
}

const Layout: React.FC<Props> = ({pageTitle, children}) => {
    const title = pageTitle + ' | daisuzz.dev'
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <title>{title}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
            <link
                href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap"
                rel="stylesheet"
            />
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
