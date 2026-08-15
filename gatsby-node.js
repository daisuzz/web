const path = require(`path`)
const axios = require('axios')
const xml2js = require("xml2js");
const {loadPosts} = require("./src/content/loadPosts");
require(`dotenv`).config()

exports.createPages = async ({actions}) => {
    const {createPage} = actions;
    const sitePosts = loadPosts();
    sitePosts.forEach((post) => {
        createPage({
            path: `/posts/${post.slug}`,
            component: path.resolve("./src/templates/PostPage.tsx"),
            context: {post},
        });
    });
}

exports.sourceNodes = async ({actions, createContentDigest}) => {
    const {createNode} = actions;
    const sitePosts = loadPosts();
    sitePosts.forEach((post) => {
        const postNode = {
            id: post.slug,
            parent: null,
            children: [],
            internal: {
                type: `SitePosts`,
                contentDigest: createContentDigest(post),
            },
            title: post.title,
            link: `/posts/${post.slug}`,
            pubDate: post.date,
            content: post.content,
        }

        createNode(postNode);
    });

    const EXTERNAL_API_TIMEOUT_MS = 10000

    try {
        const qiitaRes = await axios.get(
            `https://qiita.com/api/v2/items?page=1&per_page=100&query=user:daisuzz`,
            {timeout: EXTERNAL_API_TIMEOUT_MS}
        );
        qiitaRes.data.map((post, i) => {
            const postNode = {
                // Required fields
                id: post.id,
                parent: null,
                children: [],
                internal: {
                    type: `QiitaPosts`,
                    contentDigest: createContentDigest(post),
                },
                title: post.title,
                content: post.rendered_body,
                pubDate: post.created_at,
                likesCount: post.likes_count,
                link: post.url,
            }

            // Create node with the gatsby createNode() API
            createNode(postNode);
        });
    } catch (error) {
        // Qiita APIが落ちていてもビルド全体を失敗させない
        console.warn(`[gatsby-node] Qiitaの記事取得に失敗しました: ${error.message}`);
    }

    const fetchHatenaBlogs = async (url) => {
        const hatenaRes = await axios.get(url, {
            auth: {
                username: process.env.HATENA_NAME,
                password: process.env.HATENA_API_KEY
            },
            timeout: EXTERNAL_API_TIMEOUT_MS,
        });
        const parser = new xml2js.Parser({})
        const hatenaResJson = await parser.parseStringPromise(hatenaRes.data)
        hatenaResJson.feed.entry.map((post, i) => {
            // 下書きは除外
            if (post[`app:control`][0][`app:draft`][0] === 'yes') return
            const postNode = {
                // Required fields
                id: post.id[0],
                parent: null,
                children: [],
                internal: {
                    type: `HatenaPosts`,
                    contentDigest: createContentDigest(post),
                },
                title: post.title[0],
                // xml2js は { _: text, $: attrs } を返すため、文字列だけを入れて GraphQL の `_` 衝突を防ぐ
                content: post.content?.[0]?._ ?? post.content?.[0] ?? null,
                pubDate: post.published[0],
                link: post.link[1].$.href,
            }

            // Create node with the gatsby createNode() API
            createNode(postNode);
        });

        // はてなブログの記事取得APIはデフォルトで7件までしか一括で取得できない。
        // 次の7件はrel属性がnextになっているlinkタグの中に含まれているURLを叩くことで取得できる
        // ここでは全件取得したいので、rel属性がnextになっているlinkタグの中に含まれているURLが取れなくなるまで再帰的にAPIをcallする
        const nextLink = hatenaResJson.feed.link.find(e => e.$.rel === 'next')
        if (nextLink) {
            await fetchHatenaBlogs(nextLink.$.href)
        }
    }

    try {
        await fetchHatenaBlogs(`https://blog.hatena.ne.jp/dais39/iikanji.hatenablog.jp/atom/entry`)
    } catch (error) {
        // はてなブログAPIが落ちていてもビルド全体を失敗させない
        console.warn(`[gatsby-node] はてなブログの記事取得に失敗しました: ${error.message}`);
    }
}
