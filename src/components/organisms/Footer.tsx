import * as React from 'react';
import {Typography} from "@mui/material";
// @ts-ignore
import * as footerStyle from "./Footer.module.css"

const Footer: React.FC = () => {
    return (
        <Typography variant="body2" color="textSecondary" align="center" className={footerStyle.footer}>
            {'Copyright © '}
            {new Date().getFullYear()}
            {' '}
            daisuzz.dev
        </Typography>
    )
}

export default Footer;
