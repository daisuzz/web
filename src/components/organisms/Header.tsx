import * as React from 'react';
import {AppBar, Container, Toolbar, Typography} from "@mui/material";

const ResponsiveAppBar = () => {
    return (
        <AppBar position="static" elevation={0}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            fontWeight: 900,
                            fontFamily: 'Arial Black',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        daisuzz.dev
                    </Typography>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
