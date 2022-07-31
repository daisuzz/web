import * as React from "react"
import Layout from "../../components/Layout"
import ProfileImage from "../../components/atoms/ProfileImage";
import {Typography} from "@mui/material";

const IndexPage: React.FC = () => {
    return (
        <Layout pageTitle="ABOUT">
            <ProfileImage/>
            <Typography variant="h2" sx={{
                fontFamily: 'Arial Black',
            }}>
                Suzuki Daisaku
            </Typography>
            <p>東京でソフトウェアエンジニアとして働いています。
                アプリケーションの品質を改善したり、開発生産性を向上させるための取り組みや技術が好きです。</p>
        </Layout>
    )
}

export default IndexPage
