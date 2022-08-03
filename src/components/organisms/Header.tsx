import * as React from 'react';
import {AppBar, Box, Container, IconButton, Toolbar, Typography} from "@mui/material";
import MenuButton from "../atoms/MenuButton";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {Link} from "gatsby";

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
                        <MenuButton label="ABOUT" href="/about" icon={<PersonIcon/>}/>
                        <MenuButton label="BLOG" href="/blogs" icon={<TextSnippetIcon/>}/>
                    </Box>
                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}/>
                    <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                        <IconButton
                            component={Link}
                            to={"/"}
                            sx={{color: 'inherit', textDecoration: 'none'}}>
                            <HomeIcon/>
                        </IconButton>
                        <IconButton
                            component={Link}
                            to={"/about"}
                            sx={{color: 'inherit', textDecoration: 'none'}}>
                            <PersonIcon/>
                        </IconButton>
                        <IconButton
                            component={Link}
                            to={"/blogs"}
                            sx={{color: 'inherit', textDecoration: 'none'}}>
                            <TextSnippetIcon/>
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
