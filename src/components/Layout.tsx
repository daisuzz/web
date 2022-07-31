import * as React from "react"
import PageTitle from "./atoms/PageTitle";
// @ts-ignore
import {container} from "./Layout.module.css"
import Header from "./organisms/Header";
import {CssBaseline} from "@mui/material";

interface Props {
    pageTitle: string
    children: React.ReactNode
}


const Layout: React.FC<Props> = ({pageTitle, children}) => {
    return (
        <CssBaseline>
            <title>{pageTitle} | daisuzz.log</title>
            <Header/>
            <main>
                <PageTitle name={pageTitle}/>
                {children}
            </main>
        </CssBaseline>
    )
}

export default Layout
