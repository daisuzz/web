import * as React from "react"
import {Link, PageProps} from "gatsby"

import Layout from "../components/Layout"

const NotFoundPage: React.FC<PageProps> = ({location}) => {
    return (
        <Layout pageTitle="404" description="お探しのページは見つかりませんでした。" path={location.pathname} noindex>
            <h1>404 Not Found</h1>
            <p>The page can’t be found.</p>
            <p><Link to="/">&larr; back to top</Link></p>
        </Layout>
    )
}

export default NotFoundPage
