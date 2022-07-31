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
            sx={{color: 'inherit', textDecoration: 'none'}}>
            <Typography
                variant="button"
                color="inherit"
                align="center"
                sx={{fontFamily: 'Arial Black'}}
                noWrap>
                {props.label}
            </Typography>
        </Button>
    );
}

export default MenuButton
