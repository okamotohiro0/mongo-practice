const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const User = require("./models/User");
const mongoose = require("mongoose");
const PORT = 3000;
const Thread = require("./models/Thread");

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(
    "mongodb+srv://okamon:abc@cluster0.bbadopi.mongodb.net/?retryWrites=true&w=majority"
    ).then(()=>console.log("db connected"))
    .catch((err)=>console.log(err));

// JWTトークン検証ミドルウェア
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
};

app.get("/api/v1/threads", verifyToken, async (req, res) => {
    jwt.verify(req.token, "your_jwt_secret", async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            try {
                // 認証されたユーザー自身を取得
                const user = await User.findById(authData.id).populate('following');
                
                // フォローしているユーザーのusernameリストを取得
                const followingUsernames = user.following.map(followedUser => followedUser.username);
                
                // 自分自身のusernameもリストに追加
                followingUsernames.push(user.username);

                // 自身とフォローしているユーザーの投稿を取得
                const threads = await Thread.find({
                    username: { $in: followingUsernames }
                });

                res.json(threads);
            } catch (error) {
                console.error(error);
                res.status(500).send("Server error");
            }
        }
    });
});


// スレッドのpostメソッド
app.post("/api/v1/thread", verifyToken, async (req, res) => {
    jwt.verify(req.token, "your_jwt_secret", async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            try {
                const { title, content } = req.body;
                const username = authData.username; // トークンからusernameを取得
                const createThread = await Thread.create({ title, content, username });
                res.status(200).json(createThread);
            } catch (err) {
                console.log(err);
                res.status(500).json({ message: "Error creating new thread." });
            }
        }
    });
});


// ユーザー登録
app.post("/api/v1/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error registering new user." });
    }
});

// ユーザーログイン
app.post("/api/v1/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // JWTトークンを生成
        const token = jwt.sign({ id: user._id, username: user.username }, "your_jwt_secret", { expiresIn: "1h" });
        res.status(200).json({ token, username: user.username });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error logging in user." });
    }
});

app.listen(PORT,console.log("server running"))


// ユーザー検索エンドポイント
app.get("/api/v1/users/search", verifyToken, async (req, res) => {
    const searchString = req.query.username;
    jwt.verify(req.token, "your_jwt_secret", async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            try {
                const users = await User.find({ 
                    username: { $regex: searchString, $options: 'i' } 
                }).lean(); // `.lean()`を追加して、mongooseドキュメントを普通のJSオブジェクトに変換

                // 認証されたユーザーのデータを取得
                const authUser = await User.findById(authData.id).lean();

                // フォロー済みかどうかのフラグを各ユーザーに追加
                const usersWithFollowingInfo = users.map(user => {
                    const isFollowing = authUser.following.some(followedId => 
                        followedId.toString() === user._id.toString());
                    return { ...user, isFollowing }; // isFollowingフラグを追加
                });
                res.json(usersWithFollowingInfo);
            } catch (error) {
                console.error(error);
                res.status(500).send("Server error");
            }
        }
    });
});


// ユーザーをフォロー
app.post("/api/v1/users/follow", verifyToken, async (req, res) => {
    const userIdToFollow = req.body.userId;
    jwt.verify(req.token, "your_jwt_secret", async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            try {
                const user = await User.findById(authData.id);
                user.following.push(userIdToFollow);
                await user.save();
                res.status(200).send("Followed successfully");
            } catch (error) {
                console.error(error);
                res.status(500).send("Server error");
            }
        }
    });
});