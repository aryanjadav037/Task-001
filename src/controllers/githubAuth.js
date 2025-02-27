import axios from "axios";
import GithubUser from "../models/githubUser.js";
import dotenv from "dotenv";
dotenv.config();

// GitHub OAuth URLs
const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user,read:org`;
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

/**
 * Redirect user to GitHub OAuth page
 */
export const redirectToGithub = (req, res) => {
  res.redirect(GITHUB_AUTH_URL);
};

/**
 * GitHub OAuth callback - Exchange code for access token and fetch user data
 */
export const githubCallback = async (req, res) => {
  let { code } = req.query;

  console.log("GitHub OAuth Code Received:", code);

  if (!code) {
    console.error("Authorization code is missing!");
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    // 1️⃣ Exchange code for access token
    const tokenResponse = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    console.log("GitHub Token Response:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error("Failed to obtain access token! Full response:", tokenResponse.data);
      return res.status(400).json({ error: "Failed to obtain access token", response: tokenResponse.data });
    }

    console.log("GitHub Access Token:", accessToken);

    // 2️⃣ Fetch GitHub user data
    const userResponse = await axios.get(GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("GitHub User Data:", userResponse.data);

    const { id, login, avatar_url, name, email, bio } = userResponse.data;

    // 3️⃣ Store user details in the database and update last sync time
    let user = await GithubUser.findOne({ github_id: id });

    const lastSynced = new Date().toISOString(); // Current timestamp

    if (!user) {
      user = new GithubUser({
        github_id: id,
        username: login,
        avatar_url,
        name,
        email,
        bio,
        access_token: accessToken,
        last_synced: lastSynced,
      });

      await user.save();
    } else {
      user.access_token = accessToken;
      user.last_synced = lastSynced; // Update last sync time
      await user.save();
    }

    // ✅ Send access token, user data, and last sync time to frontend
    res.redirect(
      `http://localhost:5173/?access_token=${accessToken}&username=${login}&avatar_url=${avatar_url}&last_synced=${lastSynced}`
    );
  } catch (error) {
    console.error("GitHub OAuth Error:", error.response?.data || error);
    res.status(500).json({ error: "Internal server error", details: error.response?.data || error });
  }
};

/**
 * Fetch authenticated user details along with last sync time
 */
export const getAuthenticatedUser = async (req, res) => {
  try {
    const accessToken = req.cookies.github_token;
    if (!accessToken) return res.status(401).json({ error: "Access token is required" });

    // Fetch user data from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id, login, avatar_url } = userResponse.data;

    // Fetch last sync time from database
    const user = await GithubUser.findOne({ github_id: id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      username: login,
      avatar_url,
      last_synced: user.last_synced,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};