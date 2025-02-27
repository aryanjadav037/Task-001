import express from "express";
import dotenv from "dotenv";
import { Octokit } from "octokit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./helpers/db.js";
import githubAuthRoutes from "./routes/githubAuth.js";
import githubRoutes from "./routes/githubRoutes.js";
import cors from "cors";
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

const app = express();
app.use(express.json())

app.use(
    cors({
      origin: "http://localhost:5173", // Allow frontend to access API
      methods: "GET,POST,PUT,DELETE", // Allow specific HTTP methods
      credentials: true // Allow cookies and authentication headers
    })
  );

app.use("/auth/github", githubAuthRoutes);
app.use("/organizations", githubRoutes);


app.get("/", (req, res) => {
    res.send("server on!!!")
})

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})