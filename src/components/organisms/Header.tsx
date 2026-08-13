import * as React from "react";
// @ts-ignore
import * as style from "./Header.module.css";

const Header: React.FC = () => {
    return (
        <header className={style.header}>
            <div className={style.inner}>
                <a href="#top" className={style.brand}>~/daisuzz.dev</a>
                <nav className={style.nav}>
                    <a href="#writing">writing</a>
                    <a href="#about">about</a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
