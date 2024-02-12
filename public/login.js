document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('/api/v1/login', { username, password });
        const { token, username: loggedInUsername } = response.data; // レスポンスからユーザー名を取得
        if (token) {
            // ログイン成功時にトークンとユーザー名をlocalStorageに保存
            localStorage.setItem('token', token);
            localStorage.setItem('username', loggedInUsername); // ユーザー名も保存
            // スレッドページへリダイレクト
            window.location.href = 'thread.html';
        }
    } catch (error) {
        alert('ログインに失敗しました。');
        console.error(error);
    }
});
