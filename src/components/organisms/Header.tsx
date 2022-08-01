import * as React from 'react';
import {AppBar, Box, Container, Toolbar, Typography} from "@mui/material";
import MenuButton from "../atoms/MenuButton";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

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
                    <div style={{flexGrow: 1}}></div>
                    <Box sx={{display: {md: 'flex'}}}>
                        <MenuButton label="TOP" href="/" icon={<HomeIcon/>}/>
                        <MenuButton label="ABOUT" href="/about" icon={<PersonIcon/>}/>
                        <MenuButton label="BLOG" href="/blogs" icon={<TextSnippetIcon/>}/>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
