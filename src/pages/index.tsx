import * as React from "react"
import Layout from "../components/Layout"
import {Container, Typography} from "@mui/material";

const IndexPage: React.FC = () => {
    return (
        <Layout pageTitle="TOP">
            <Container sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            }}>
                <Typography variant="h1" align="center" sx={{
                    fontFamily: 'Arial Black'
                }}>
                    Daisaku Suzuki
                </Typography>
                <Typography variant="h6" align="center" sx={{
                    fontFamily: 'Arial Black'
                }}>
                    Software Engineer
                </Typography>
            </Container>
        </Layout>
    )
}

export default IndexPage
