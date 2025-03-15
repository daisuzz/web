import * as React from "react"
import Layout from "../components/Layout"
import ProfileImage from "../components/atoms/ProfileImage";
import {IconButton, Typography} from "@mui/material";
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';

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
            <Typography variant="body1" sx={{
                color: '#555555',
                margin: "0 auto 10px"
            }}>
                千葉県育ち。<br/>
                ソフトウェアエンジニアとして働いています。<br/>
                設計/アーキテクチャ/テスト/開発プロセスに関する技術や取り組みが好きです。
            </Typography>
            <IconButton onClick={() => window.open("https://x.com/daisuzz")}>
                <XIcon htmlColor='#333333' sx={{fontSize: 50}}/>
            </IconButton>
            <IconButton onClick={() => window.open("https://github.com/daisuzz")}>
                <GitHubIcon htmlColor='#333333' sx={{fontSize: 50}}/>
            </IconButton>
        </Layout>
    )
}

export default IndexPage
