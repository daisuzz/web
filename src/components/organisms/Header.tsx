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
                    <Link to="/">about</Link>
                    <Link to="/writing">writing</Link>
                    <a
                        href="/rss.xml"
                        target="_blank"
                        rel="noreferrer noopener"
                        className={style.rssButton}
                        aria-label="Subscribe via RSS"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 11a9 9 0 0 1 9 9"/>
                            <path d="M4 4a16 16 0 0 1 16 16"/>
                            <circle cx="5" cy="19" r="1"/>
                        </svg>
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
