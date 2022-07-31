import * as React from "react"
import Layout from "../components/Layout"

const IndexPage: React.FC = () => {
    return (
        <Layout pageTitle="トップ">
            <h1>Welcome to my homepage!</h1>
            <p> I'm making this by learning Gatsby.</p>
        </Layout>
    )
}

export default IndexPage
