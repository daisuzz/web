import * as React from "react"
import Layout from "../../components/Layout"
import ProfileImage from "../../components/atoms/ProfileImage";
import {IconButton, Typography} from "@mui/material";
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

const IndexPage: React.FC = () => {
    return (
        <Layout pageTitle="ABOUT">
            <ProfileImage/>
            <Typography variant="h3" sx={{
                fontFamily: 'Arial Black',
                margin: "10px auto"
            }}>
                Suzuki Daisaku
            </Typography>
            <Typography variant="body1" sx={{
                color: '#555555',
                margin: "0 auto 10px"
            }}>
                1993年生まれ。千葉県育ち。<br/>
                東京でソフトウェアエンジニアとして働いています。<br/>
                アプリケーションの品質を改善したり、開発生産性を向上させるための取り組みや技術が好きです。
            </Typography>
            <IconButton onClick={() => window.open("https://twitter.com/daisuzz")}>
                <TwitterIcon htmlColor='#1DA1F2' sx={{fontSize: 50}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://www.linkedin.com/in/daisuzz")}>
                <LinkedInIcon htmlColor='#0A66C2' sx={{fontSize: 50}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://github.com/daisuzz")}>
                <GitHubIcon htmlColor='#333333' sx={{fontSize: 50}}/>
            </IconButton>
        </Layout>
    )
}

export default IndexPage
