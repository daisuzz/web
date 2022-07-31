import * as React from "react"
// @ts-ignore
import {container} from "./Layout.module.css"
import Header from "./organisms/Header";
import {CssBaseline, Paper, ThemeProvider} from "@mui/material";
import {theme} from "../assets/theme";

interface Props {
    pageTitle: string
    children: React.ReactNode
}


const Layout: React.FC<Props> = ({pageTitle, children}) => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <title>{pageTitle} | daisuzz.log</title>
            <Header/>
            <main>
                <Paper elevation={0} sx={{background: '#FFFFFF', margin: 5}}>
                    {children}
                </Paper>
            </main>
        </ThemeProvider>
    )
}

export default Layout
