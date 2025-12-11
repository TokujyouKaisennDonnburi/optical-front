import { apiPost } from "../api-client";

export type GithubInstallRequest = {
  code: string;
  installationId: string;
};

export const postGithubInstall = async (request: GithubInstallRequest) => {
  apiPost("/auth/github/install", request);
};
