import axios from "axios";
import GithubUser from "../models/githubUser.js";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user,read:org`;
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

export const redirectToGithub = (req, res) => {
    res.redirect(GITHUB_AUTH_URL);
};

export const githubCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ error: "Authorization code missing" });

        const tokenResponse = await axios.post(
            GITHUB_TOKEN_URL,
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: "application/json" },
            }
        );

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) return res.status(400).json({ error: "Failed to obtain access token" });

        const userResponse = await axios.get(GITHUB_USER_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const { id, login, email, avatar_url } = userResponse.data;

        let user = await GithubUser.findOne({ github_id: id });

        if (user) {
            user.access_token = accessToken;
            user.last_used_at = new Date();
        } else {
            user = new GithubUser({
                github_id: id,
                username: login,
                email,
                avatar_url,
                access_token: accessToken,
            });
        }

        await user.save();

        res.json({ message: "Authentication successful", user });
    } catch (error) {
        console.error("GitHub OAuth error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAuthenticatedUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await GithubUser.findOne({ github_id: userId });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};