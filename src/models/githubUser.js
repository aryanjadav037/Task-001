import mongoose from "mongoose";

const GithubUserSchema = new mongoose.Schema({
    github_id: { type: Number, unique: true, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String },
    avatar_url: { type: String },
    access_token: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    last_used_at: { type: Date, default: Date.now },
});

const GithubUser = mongoose.model("GithubUser", GithubUserSchema);
export default GithubUser;