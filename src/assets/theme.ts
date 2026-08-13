import {createTheme} from "@mui/material";

const accent = "oklch(0.68 0.14 55)";
const green = "oklch(0.7 0.13 145)";

export const theme = createTheme({
    typography: {
        fontFamily: ['"IBM Plex Mono"', "monospace"].join(","),
    },
    palette: {
        mode: "dark",
        background: {
            default: "#2B2A28",
            paper: "#2B2A28",
        },
        text: {
            primary: "oklch(0.88 0.008 70)",
            secondary: "oklch(0.72 0.008 60)",
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                ":root": {
                    "--color-bg": "#2B2A28",
                    "--color-row-hover": "oklch(0.32 0.01 60)",
                    "--color-border": "oklch(0.38 0.01 60)",
                    "--color-border-strong": "oklch(0.42 0.01 60)",
                    "--color-heading": "#F5F1EA",
                    "--color-text": "oklch(0.88 0.008 70)",
                    "--color-title": "oklch(0.86 0.008 60)",
                    "--color-body": "oklch(0.72 0.008 60)",
                    "--color-muted": "oklch(0.68 0.01 60)",
                    "--color-label": "oklch(0.6 0.008 60)",
                    "--color-dim": "oklch(0.56 0.008 60)",
                    "--color-date": "oklch(0.56 0.01 60)",
                    "--color-accent": accent,
                    "--color-green": green,
                    "--color-qiita": "oklch(0.62 0.1 200)",
                    "--color-selection": "oklch(0.68 0.14 55 / 0.25)",
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
