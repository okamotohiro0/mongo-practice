const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
});

// パスワードをハッシュ化する前に実行する
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model("User", UserSchema);