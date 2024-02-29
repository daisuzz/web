import * as React from "react"

import Layout from "../components/Layout"

const NotFoundPage: React.FC = () => {
    return (
        <Layout pageTitle="404">
            <h1>404 Not Found</h1>
            <p>The page can’t be found.</p>
        </Layout>
    )
}

export default NotFoundPage
