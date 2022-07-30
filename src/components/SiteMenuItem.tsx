import * as React from "react"
import {Link} from "gatsby"
import {IconButton, MenuItem} from "@mui/material";

export interface SiteMenuItemProps {
    text: string
    icon: React.ReactNode
    path: string
    label: string
}

const SiteMenuItem: React.FC<SiteMenuItemProps> = props => {
    const {text, icon, path, label} = props
    return (
        <MenuItem component={Link} to={path}>
            <IconButton aria-label={label} color="inherit">
                {icon}
            </IconButton>
            <p>{text}</p>
        </MenuItem>
    )
}

export default SiteMenuItem
