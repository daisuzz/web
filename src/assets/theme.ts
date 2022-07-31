import {createTheme} from "@mui/material";

export const theme = createTheme({
    typography: {
        fontFamily: [
            'monospace',
            'Copperplate',
            'Arial Black',
        ].join(',')
    },
    palette: {
        primary: {
            main: '#FFFFFF',
            dark: '#053e85',
        },
    },
});
