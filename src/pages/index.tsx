import * as React from "react"
import Layout from "../components/Layout"

const IndexPage: React.FC = () => {
    return (
        <Layout pageTitle="daisuzz.web">
            <h2>Suzuki Daisaku</h2>
            <p>東京でソフトウェアエンジニアとして働いています。
                アプリケーションの品質を改善したり、開発生産性を向上させるための取り組みや技術が好きです。</p>
        </Layout>
    )
}

export default IndexPage
