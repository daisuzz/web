import * as React from "react";
import {Link} from "gatsby";
import {IconButton} from "@mui/material";
// @ts-ignore
import * as style from "./MenuIconButton.module.css";

interface MenuIconButtonProps {
    href: string
    icon: React.ReactNode
}

const MenuIconButton: React.FC<MenuIconButtonProps> = (props: MenuIconButtonProps) => {
    return (
        <IconButton
            component={Link}
            to={props.href}
            className={style.iconButton}>
            {props.icon}
        </IconButton>
    );
}

export default MenuIconButton
