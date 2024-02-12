const threadSectionDOM = document.querySelector(".thread-section");
const inputTitleDOM = document.getElementById("inputTitle");
const inputContentDOM = document.getElementById("inputContent");
const formDOM = document.querySelector(".form-section");

// 最初はThreadの全てを読み込む
const getAllThreads = async () => {
    const token = localStorage.getItem('token');
    console.log(token)
    try {
        let response = await axios.get("/api/v1/threads", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let { data } = response;
        let allThreads = data.map((thread) => {
            // 投稿者のusernameを表示
            const { title, content, username } = thread;
            // usernameがオブジェクトであればusername.username、文字列であればusernameをそのまま使用
            const displayName = username.username || username;
            return `
            <div class="single-thread">
                <h3>${title}</h3>
                <p>${content}</p>
                <p>投稿者: ${displayName}</p>
            </div>
            `;
        }).join("");
        threadSectionDOM.innerHTML = allThreads;
    } catch (err) {
        console.log(err);
    }
};


getAllThreads();

// POSTメソッド
formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = inputTitleDOM.value;
    const content = inputContentDOM.value;
    const token = localStorage.getItem('token'); // トークンを取得

    if (title && content) {
        try {
            await axios.post("/api/v1/thread", {
                title,
                content,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            getAllThreads(); // スレッドを再読み込み
            inputTitleDOM.value = ''; // タイトル入力フィールドをクリア
            inputContentDOM.value = ''; // 内容入力フィールドをクリア
            } catch (err) {
            console.log(err);
            }
            }
            });


document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username'); // ニックネームをlocalStorageから取得
    document.getElementById('welcomeMessage').innerText = `${username}さん、ようこそ！`;
    getAllThreads(); // スレッドの読み込み関数を呼び出し
});

document.getElementById('searchButton').addEventListener('click', async () => {
    const username = document.getElementById('searchUsername').value;
    const token = localStorage.getItem('token'); // トークンを取得
    try {
        const response = await axios.get(`/api/v1/users/search?username=${username}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = response.data;
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = users.map(user => {
            const buttonHTML = user.isFollowing
                ? `<button disabled>フォロー中</button>`
                : `<button onclick="followUser('${user._id}')">フォローする</button>`;
            return `<div class="user-result"><span>${user.username}</span>${buttonHTML}</div>`;
        }).join('');
    } catch (err) {
        console.error(err);
    }
});


async function followUser(userId) {
    const token = localStorage.getItem('token');
    try {
        await axios.post('/api/v1/users/follow', { userId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        alert('フォローしました');
        document.getElementById('searchButton').click(); // 検索結果を再読み込みして更新
    } catch (err) {
        console.error(err);
    }
}
            