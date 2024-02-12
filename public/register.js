// 新規登録処理
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    try {
        const response = await axios.post('/api/v1/register', { username, password });
        alert('登録が完了しました。ログインページへ移動します。');
        window.location.href = 'index.html'; // 登録後にログインページへリダイレクト
    } catch (error) {
        alert('登録に失敗しました。');
        console.error(error);
    }
});
