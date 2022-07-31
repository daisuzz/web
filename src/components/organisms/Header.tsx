import * as React from 'react';
import {AppBar, Box, Container, Toolbar, Typography} from "@mui/material";
import AdbIcon from '@mui/icons-material/Adb';
import MenuButton from "../atoms/MenuButton";
import HomeIcon from '@mui/icons-material/Home';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

const ResponsiveAppBar = () => {
    return (
        <AppBar position="static" enableColorOnDark>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{mr: 1}}/>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        daisuzz.web
                    </Typography>
                    <div style={{flexGrow: 1}}></div>
                    <Box sx={{display: {md: 'flex'}}}>
                        <MenuButton label="トップ" href="/" icon={<HomeIcon/>}/>
                        <MenuButton label="ブログ" href="/blogs" icon={<TextSnippetIcon/>}/>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
