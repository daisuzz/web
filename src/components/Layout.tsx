import * as React from "react"
import {theme} from "../assets/theme"
import {ThemeProvider} from "@mui/material";

interface Props {
    children: React.ReactNode
}

const Layout: React.FC<Props> = ({children}) => {
    return (
        <ThemeProvider theme={theme}>
            <main
                style={{
                    padding: `80px 10px 20px 10px`,
                }}
            >
                {children}
            </main>
        </ThemeProvider>
    )
}

export default Layout
