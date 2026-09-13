import * as React from "react";
import {Link} from "gatsby";
// @ts-ignore
import * as style from "./Header.module.css";

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className={style.header}>
            <div className={style.inner}>
                <Link to="/" className={style.brand} onClick={closeMenu}>~/daisuzz.dev</Link>
                <button
                    type="button"
                    className={style.menuButton}
                    aria-label="メニューを開閉"
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        {isMenuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </>
                        )}
                    </svg>
                </button>
                <nav className={isMenuOpen ? `${style.nav} ${style.navOpen}` : style.nav}>
                    <Link to="/" onClick={closeMenu}>writing</Link>
                    <Link to="/notes/" onClick={closeMenu}>notes</Link>
                    <Link to="/about" onClick={closeMenu}>about</Link>
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
