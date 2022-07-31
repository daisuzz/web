import * as React from "react"
import {theme} from "../assets/theme"
import {Tabs, ThemeProvider} from "@mui/material";
import PageTitle from "./atoms/PageTitle";
// @ts-ignore
import {container} from "./Layout.module.css"
import LinkTab from "./atoms/LinkTab";

interface Props {
    pageTitle: string
    children: React.ReactNode
}


const Layout: React.FC<Props> = ({pageTitle, children}) => {
    return (
        <ThemeProvider theme={theme}>
            <title>{pageTitle}</title>
            <main style={{padding: `80px 10px 20px 10px`,}}>
                <Tabs>
                    <LinkTab label="トップ" href="/"/>
                    <LinkTab label="ブログ" href="/blogs"/>
                </Tabs>
                <PageTitle name={pageTitle}/>
                {children}
            </main>
        </ThemeProvider>
    )
}

export default Layout
