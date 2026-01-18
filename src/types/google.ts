export type GoogleCreateUserRequest = {
  code: string;
  state: string;
};

export type GoogleCreateUserReponse = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

export type GoogleCreateOauthStateResponse = {
  url: string;
};
