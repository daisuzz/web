import * as React from 'react';
import {AppBar, Box, Container, Toolbar, Typography} from "@mui/material";
import MenuButton from "../atoms/MenuButton";
import HomeIcon from '@mui/icons-material/Home';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import MenuIconButton from "../atoms/MenuIconButton";

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
                    <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}/>
                    <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                        <MenuButton label="TOP" href="/" icon={<HomeIcon/>}/>
                        <MenuButton label="BLOG" href="/blogs" icon={<TextSnippetIcon/>}/>
                    </Box>
                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}/>
                    <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                        <MenuIconButton href={"/"} icon={<HomeIcon/>}/>
                        <MenuIconButton href={"/blogs"} icon={<TextSnippetIcon/>}/>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
