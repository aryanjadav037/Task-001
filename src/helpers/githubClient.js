import { Octokit } from "@octokit/rest";

/**
 * Create an Octokit instance with a dynamic token.
 * @param {string} accessToken - GitHub OAuth Access Token
 * @returns {Octokit} - Authenticated Octokit instance
 */
export const getOctokitInstance = (accessToken) => {
  return new Octokit({ auth: accessToken });
};