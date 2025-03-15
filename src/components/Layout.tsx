import * as React from "react"
import {Box, CssBaseline, Paper, ThemeProvider} from "@mui/material";
import {theme} from "../assets/theme";
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
            <Box className={style.layout}>
                <main>
                    <Paper elevation={0} className={style.paper}>
                        {children}
                    </Paper>
                </main>
                <Footer/>
            </Box>
        </ThemeProvider>
    )
}

export default Layout
