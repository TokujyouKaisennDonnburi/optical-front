/**
 * GitHub 関連のモックデータ
 * 開発環境でテストに使用する GitHub PR・レビュー情報
 */

import type {
  GitHubPullRequest,
  GitHubRepository,
  TeamMemberReviewLoad,
} from "@/types/github";

/**
 * 共通リポジトリ情報
 */
export const mockRepository: GitHubRepository = {
  owner: "TokujyouKaisennDonnburi",
  name: "calendar-front",
};

/**
 * モック Pull Request データ
 * PullRequestReviewOption コンポーネントで使用
 */
export const mockPullRequests: GitHubPullRequest[] = [
  {
    id: 1001,
    number: 123,
    title:
      "fix: ログインバグの修正を行うことで素晴らしいユーザー体験を提供する",
    url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/123",
    assignees: [
      { id: 1, name: "yamada", url: "https://github.com/yamada", assigned: 1 },
    ],
  },
  {
    id: 1002,
    number: 125,
    title: "feat: カレンダーAPI連携",
    url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/125",
    assignees: [
      { id: 2, name: "tanaka", url: "https://github.com/tanaka", assigned: 1 },
    ],
  },
  {
    id: 1003,
    number: 127,
    title: "docs: READMEの更新",
    url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/127",
    assignees: [],
  },
];

/**
 * モックチームメンバーレビュー負荷データ
 * TeamReviewLoadOption コンポーネントで使用
 */
export const mockTeamMembers: TeamMemberReviewLoad[] = [
  {
    member: { username: "yamada", displayName: "Yamada Taro" },
    reviewCount: 5,
    loadLevel: "high",
    loadLevelLabel: "高負荷",
    loadBarRate: 1,
    availableReviewers: [
      { username: "tanaka", displayName: "Tanaka Hanako" },
      { username: "suzuki", displayName: "Suzuki Jiro" },
    ],
    pendingPullRequests: [
      {
        id: 2001,
        number: 201,
        title: "fix: ログインバグの修正",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/201",
        assignees: [
          {
            id: 1,
            name: "yamada",
            url: "https://github.com/yamada",
            assigned: 1,
          },
        ],
      },
      {
        id: 2002,
        number: 202,
        title: "feat: 新しいダッシュボード",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/202",
        assignees: [
          {
            id: 1,
            name: "yamada",
            url: "https://github.com/yamada",
            assigned: 1,
          },
        ],
      },
      {
        id: 2003,
        number: 203,
        title: "refactor: ユーティリティ関数",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/203",
        assignees: [
          {
            id: 1,
            name: "yamada",
            url: "https://github.com/yamada",
            assigned: 1,
          },
        ],
      },
      {
        id: 2004,
        number: 204,
        title: "docs: API ドキュメント更新",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/204",
        assignees: [
          {
            id: 1,
            name: "yamada",
            url: "https://github.com/yamada",
            assigned: 1,
          },
        ],
      },
      {
        id: 2005,
        number: 205,
        title: "chore: 依存パッケージ更新",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/205",
        assignees: [
          {
            id: 1,
            name: "yamada",
            url: "https://github.com/yamada",
            assigned: 1,
          },
        ],
      },
    ],
  },
  {
    member: { username: "tanaka", displayName: "Tanaka Hanako" },
    reviewCount: 3,
    loadLevel: "medium",
    loadBarRate: 0.6,
    availableReviewers: [
      { username: "yamada", displayName: "Yamada Taro" },
      { username: "suzuki", displayName: "Suzuki Jiro" },
    ],
    pendingPullRequests: [
      {
        id: 3001,
        number: 301,
        title: "fix: タイムゾーン対応",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/301",
        assignees: [
          {
            id: 2,
            name: "tanaka",
            url: "https://github.com/tanaka",
            assigned: 1,
          },
        ],
      },
      {
        id: 3002,
        number: 302,
        title: "feat: 通知設定オプション",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/302",
        assignees: [
          {
            id: 2,
            name: "tanaka",
            url: "https://github.com/tanaka",
            assigned: 1,
          },
        ],
      },
      {
        id: 3003,
        number: 303,
        title: "test: ユニットテスト追加",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/303",
        assignees: [
          {
            id: 2,
            name: "tanaka",
            url: "https://github.com/tanaka",
            assigned: 1,
          },
        ],
      },
    ],
  },
  {
    member: { username: "suzuki", displayName: "Suzuki Jiro" },
    reviewCount: 1,
    loadLevel: "low",
    loadLevelLabel: "空きあり",
    loadBarRate: 0.2,
    availableReviewers: [
      { username: "yamada", displayName: "Yamada Taro" },
      { username: "tanaka", displayName: "Tanaka Hanako" },
    ],
    pendingPullRequests: [
      {
        id: 4001,
        number: 401,
        title: "docs: README 更新",
        url: "https://github.com/TokujyouKaisennDonnburi/calendar-front/pull/401",
        assignees: [
          {
            id: 3,
            name: "suzuki",
            url: "https://github.com/suzuki",
            assigned: 1,
          },
        ],
      },
    ],
  },
];

/**
 * 全 PR を見る GitHub URL
 */
export const mockAllPrsUrl = "https://github.com/pulls/review-requested";
