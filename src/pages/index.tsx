import * as React from "react"
import Layout from "../components/Layout"
import ProfileImage from "../components/atoms/ProfileImage";
import {IconButton, Typography} from "@mui/material";
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const IndexPage: React.FC = () => {
    return (
        <Layout pageTitle="TOP">
            <ProfileImage/>
            <Typography variant="h4" sx={{
                fontFamily: 'Arial Black',
                fontWeight: 900,
                margin: "10px auto"
            }}>
                Suzuki Daisaku
            </Typography>
            <IconButton onClick={() => window.open("https://x.com/daisuzz")}>
                <XIcon htmlColor='#333333' sx={{fontSize: 30}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://github.com/daisuzz")}>
                <GitHubIcon htmlColor='#333333' sx={{fontSize: 30}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://www.linkedin.com/in/daisuzz/")}>
                <LinkedInIcon htmlColor='#333333' sx={{fontSize: 30}}/>
            </IconButton>
        </Layout>
    )
}

export default IndexPage
