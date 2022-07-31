import * as React from "react"
import {Button, Typography} from "@mui/material";
import {Link} from "gatsby";

interface MenuButtonProps {
    label: string
    href: string
    icon: React.ReactNode
}

const MenuButton: React.FC<MenuButtonProps> = (props: MenuButtonProps) => {
    return (
        <Button
            startIcon={props.icon}
            component={Link}
            to={props.href}
            sx={{color: 'white', textDecoration: 'none', fontFamily: 'monospace',}}>
            <Typography
                variant="button"
                color="inherit"
                align="center"
                noWrap>
                {props.label}
            </Typography>
        </Button>
    );
}

export default MenuButton
