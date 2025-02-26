import express from "express";
import dotenv from "dotenv";
import { Octokit } from "octokit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./helpers/db.js";
import githubAuthRoutes from "./routes/githubAuth.js";


connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

const app = express();
app.use(express.json())

app.use("/auth/github", githubAuthRoutes);

app.get("/", (req, res) => {
    res.send("Server is running.......")
})

app.listen(process.env.PORT)