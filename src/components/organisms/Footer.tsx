import * as React from 'react';
// @ts-ignore
import * as style from "./Footer.module.css"

const Footer: React.FC = () => {
    return (
        <footer className={style.footer}>
            <div className={style.inner}>
                <span>© {new Date().getFullYear()} daisuzz.dev</span>
                <a href="#top">↑ top</a>
            </div>
        </footer>
    )
}

export default Footer;
