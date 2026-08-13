import * as React from "react";
import {Link} from "gatsby";
// @ts-ignore
import * as style from "./Header.module.css";

const Header: React.FC = () => {
    return (
        <header className={style.header}>
            <div className={style.inner}>
                <Link to="/" className={style.brand}>~/daisuzz.dev</Link>
                <nav className={style.nav}>
                    <Link to="/#writing">writing</Link>
                    <Link to="/#about">about</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
