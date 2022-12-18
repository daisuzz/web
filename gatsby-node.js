const path = require(`path`)
const axios = require('axios')
const xml2js = require("xml2js");
require(`dotenv`).config()

exports.sourceNodes = async ({actions, createContentDigest}) => {
    const {createNode} = actions;
    const qiitaPosts = () => axios.get(`https://qiita.com/api/v2/items?page=1&per_page=100&query=user:daisuzz`);
    const qiitaRes = await qiitaPosts();
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
    const fetchHatenaBlogs = async (url) => {
        const hatenaPosts = () => axios.get(url, {
            auth: {
                username: process.env.HATENA_NAME,
                password: process.env.HATENA_API_KEY
            }
        });
        const hatenaRes = await hatenaPosts();
        const parser = new xml2js.Parser({})
        const hatenaResJson = await parser.parseStringPromise(hatenaRes.data)
        hatenaResJson.feed.entry.map((post, i) => {
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
                content: post.content[0],
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
    await fetchHatenaBlogs(`https://blog.hatena.ne.jp/dais39/iikanji.hatenablog.jp/atom/entry`)
}

