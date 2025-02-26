import express from "express";
import { redirectToGithub, githubCallback, getAuthenticatedUser } from "../controllers/githubAuth.js";

const router = express.Router();

router.get("/", redirectToGithub);
router.get("/callback", githubCallback);
router.get("/user/:userId", getAuthenticatedUser);

export default router;