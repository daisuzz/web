import {createTheme} from "@mui/material";

export const theme = createTheme({
    typography: {
        fontFamily: [
            'sans-serif',
        ].join(',')
    },
    palette: {
        primary: {
            main: '#FFFFFF',
            dark: '#053e85',
        },
    },
});
