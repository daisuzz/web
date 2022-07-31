import * as React from "react"
import {Typography} from "@mui/material";

export interface PageTitleProps {
    name: string
}

const PageTitle: React.FC<PageTitleProps> = ({name}) => {
    return (
        <Typography
            style={{fontSize: `2.5rem`, fontWeight: "bold", margin: `2px`}}
            color="textPrimary"
        >
            {name}
        </Typography>
    )
}

export default PageTitle
