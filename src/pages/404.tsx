import * as React from "react"

import Layout from "../components/Layout"

const NotFoundPage: React.FC = () => {
    return (
        <Layout pageTitle="404">
            <h1>404: Not Found</h1>
            <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
        </Layout>
    )
}

export default NotFoundPage
