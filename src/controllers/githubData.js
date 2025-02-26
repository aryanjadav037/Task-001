import { getOctokitInstance } from "../helpers/githubClient.js";

const getAccessToken = (req) => {
    return req.headers.authorization?.split(" ")[1];
};

export const getOrganizations = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const octokit = getOctokitInstance(accessToken);
        const { data } = await octokit.rest.orgs.listForAuthenticatedUser();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getOrganizationRepos = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const { org } = req.params;
        const octokit = getOctokitInstance(accessToken);
        const { data } = await octokit.rest.repos.listForOrg({ org, per_page: 100 });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCommits = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const { org, repo } = req.params;
        const octokit = getOctokitInstance(accessToken);
        const { data } = await octokit.rest.repos.listCommits({ owner: org, repo, per_page: 100 });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPullRequests = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const { org, repo } = req.params;
        const octokit = getOctokitInstance(accessToken);
        const { data } = await octokit.rest.pulls.list({ owner: org, repo, per_page: 100 });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getIssues = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const { org, repo } = req.params;
        const octokit = getOctokitInstance(accessToken);
        const { data } = await octokit.rest.issues.listForRepo({ owner: org, repo, per_page: 100 });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getChangelogs = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const { org, repo } = req.params;
        const octokit = getOctokitInstance(accessToken);
        const commits = await octokit.rest.repos.listCommits({ owner: org, repo, per_page: 50 });
        const pulls = await octokit.rest.pulls.list({ owner: org, repo, per_page: 50 });

        res.json({ commits: commits.data, pullRequests: pulls.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAuthenticatedUser = async (req, res) => {
    try {
        const accessToken = getAccessToken(req);
        if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

        const octokit = getOctokitInstance(accessToken);
        const { data } = await octokit.rest.users.getAuthenticated();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};