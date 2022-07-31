import * as React from "react"
import {Tab} from "@mui/material";
import {Link} from "gatsby";

interface LinkTabProps {
    label?: string
    href?: string
}

const LinkTab: React.FC<LinkTabProps> = (props: LinkTabProps) => {
    return (
        <Tab
            label={props.label}
            component={Link}
            to={props.href}
        />
    );
}

export default LinkTab
