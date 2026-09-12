import {createTheme} from "@mui/material";

const accent = "oklch(0.52 0.15 55)";
const green = "oklch(0.5 0.13 145)";
const bg = "oklch(0.965 0.006 250)";

export const theme = createTheme({
    typography: {
        fontFamily: ['"IBM Plex Mono"', "monospace"].join(","),
    },
    palette: {
        mode: "light",
        background: {
            default: "oklch(0.965 0.006 250)",
            paper: "oklch(0.965 0.006 250)",
        },
        text: {
            primary: "oklch(0.32 0.008 250)",
            secondary: "oklch(0.5 0.01 250)",
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                ":root": {
                    colorScheme: "light",
                    "--color-bg": bg,
                    "--color-header-bg": "oklch(0.965 0.006 250 / 0.85)",
                    "--color-row-hover": "oklch(0.93 0.008 250)",
                    "--color-border": "oklch(0.88 0.006 250)",
                    "--color-border-strong": "oklch(0.82 0.007 250)",
                    "--color-heading": "oklch(0.22 0.01 250)",
                    "--color-text": "oklch(0.32 0.008 250)",
                    "--color-title": "oklch(0.28 0.008 250)",
                    "--color-body": "oklch(0.38 0.008 250)",
                    "--color-muted": "oklch(0.5 0.01 250)",
                    "--color-label": "oklch(0.48 0.01 250)",
                    "--color-dim": "oklch(0.58 0.01 250)",
                    "--color-date": "oklch(0.55 0.01 250)",
                    "--color-accent": accent,
                    "--color-green": green,
                    "--color-qiita": "oklch(0.48 0.1 200)",
                    "--color-site": green,
                    "--color-site-border": "oklch(0.5 0.13 145 / 0.35)",
                    "--color-comment": "oklch(0.55 0.01 250)",
                    "--color-code-text": "oklch(0.3 0.008 250)",
                    "--color-code-header-bg": "oklch(0.93 0.006 250)",
                    "--color-code-bg": "oklch(0.95 0.006 250)",
                    "--color-selection": "oklch(0.52 0.15 55 / 0.18)",
                },
                body: {
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text)",
                    WebkitFontSmoothing: "antialiased",
                },
                a: {
                    color: "inherit",
                    textDecoration: "none",
                },
                "a:hover": {
                    color: "var(--color-accent)",
                },
                "::selection": {
                    backgroundColor: "var(--color-selection)",
                },
            },
        },
    },
});
