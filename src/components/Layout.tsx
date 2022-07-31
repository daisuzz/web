import * as React from "react"
import PageTitle from "./atoms/PageTitle";
// @ts-ignore
import {container} from "./Layout.module.css"
import Header from "./organisms/Header";

interface Props {
    pageTitle: string
    children: React.ReactNode
}


const Layout: React.FC<Props> = ({pageTitle, children}) => {
    return (
        <>
            <title>{pageTitle} | daisuzz.log</title>
            <main>
                <Header/>
                <PageTitle name={pageTitle}/>
                {children}
            </main>
        </>
    )
}

export default Layout
