/**
 * GitHub API 関連の共通型定義
 * バックエンドとフロントエンドで「データの形」を共有するための契約書
 *
 * バックエンドから返される GitHub データの型を定義します。
 * PullRequestReviewOption と TeamReviewLoadOption の両方で使用される共通型です。
 */

/**
 * GitHub ユーザー情報
 */
export type GitHubUser = {
  /** GitHub ユーザー名（例: "yamada"） */
  username: string;
  /** 表示名（例: "Yamada Taro"）- 未設定の場合は username を使用 */
  displayName?: string;
  /** アバター画像 URL */
  avatarUrl?: string;
};

/**
 * GitHub リポジトリ情報
 */
export type GitHubRepository = {
  /** リポジトリオーナー（例: "TokujyouKaisennDonnburi"） */
  owner: string;
  /** リポジトリ名（例: "calendar-front"） */
  name: string;
};

export type GitHubAssignedUser = {
  id: number;
  name: string;
  url: string;
  assigned: number;
};

/**
 * GitHub Pull Request 情報
 *
 * バックエンドから返される PR データの共通構造です。
 * 両オプションコンポーネントで使用されます。
 */
export type GitHubPullRequest = {
  /** PR の一意識別子（GitHub 内部 ID） */
  id: number;
  /** PR 番号（例: 123） */
  number: number;
  /** PR のタイトル（例: "fix: ログインバグの修正"） */
  title: string;
  /** PR への GitHub URL */
  url: string;
  assignees: GitHubAssignedUser[];
  /** リポジトリ情報 */
  // repository: GitHubRepository;
  /** PR 作成者 */
  // author: GitHubUser;
  /** 現在のレビュアー一覧 */
  // reviewers: GitHubUser[];
  /** 緊急対応が必要かどうか（ラベルや優先度から判定） */
  // isUrgent?: boolean;
  /** PR の状態 */
  // state: "open" | "closed" | "merged";
  /** 作成日時（ISO 8601 形式） */
  // createdAt: string;
  /** 更新日時（ISO 8601 形式） */
  // updatedAt: string;
};

/**
 * レビュー負荷レベル
 *
 * バックエンド側で算出される負荷レベルです。
 * 計算ロジックはバックエンドに委譲します。
 */
export type ReviewLoadLevel = "high" | "medium" | "low";

/**
 * チームメンバーのレビュー負荷情報
 *
 * バックエンドから返されるメンバーごとの負荷データです。
 */
export type TeamMemberReviewLoad = {
  /** メンバー情報 */
  member: GitHubUser;
  /** レビュー待ち件数 */
  reviewCount: number;
  /** 負荷レベル（バックエンドで算出） */
  loadLevel: ReviewLoadLevel;
  /** 負荷レベルの表示ラベル（バックエンドで算出、例: "高負荷"） */
  loadLevelLabel?: string;
  /** 負荷バーの割合（0.0 〜 1.0、バックエンドで算出） */
  loadBarRate: number;
  /** レビュー待ち PR 一覧 */
  pendingPullRequests: GitHubPullRequest[];
  /** このメンバーにアサイン可能なレビュアー候補 */
  availableReviewers: GitHubUser[];
};

/**
 * レビュアー変更リクエストのペイロード
 *
 * フロントエンドからバックエンドへ送信するリクエスト形式です。
 */
export type ChangeReviewerRequest = {
  /** 対象 PR の ID */
  pullRequestId: number;
  /** 対象 PR の番号 */
  pullRequestNumber: number;
  /** リポジトリ情報 */
  repository: GitHubRepository;
  /** 新しいレビュアーのユーザー名 */
  newReviewerUsername: string;
  /** 削除するレビュアーのユーザー名（任意） */
  removeReviewerUsername?: string;
};

/**
 * GitHub オプション API レスポンス
 *
 * /api/github/review-options エンドポイントから返されるデータ構造です。
 */
export type GitHubReviewOptionsResponse = {
  /** 現在のユーザーがレビュー待ちの PR 一覧 */
  myPendingReviews: GitHubPullRequest[];
  /** チームメンバーのレビュー負荷一覧 */
  teamReviewLoads: TeamMemberReviewLoad[];
  /** 全 PR を見る GitHub URL */
  allPullRequestsUrl: string;
};

export type GitHubReviewer = {
  githubId: number;
  githubName: string;
  githubUrl: string;
  assigned: number;
};

export type GitHubReviewRequestResponseUser = {
  githubId: number;
  githubName: string;
  githubUrl: string;
  assigned: number;
};

export type GitHubReviewRequestResponse = {
  id: number;
  url: string;
  title: string;
  number: number;
  assignees: GitHubReviewRequestResponseUser[];
};

export type GitHubReviewLoadResponseReviewer = {
  githubId: number;
  githubName: string;
  githubUrl: string;
  assigned: number;
};

export type GitHubReviewLoadResponse = {
  repositoryId: number;
  repositoryName: string;
  total: number;
  reviewers: GitHubReviewLoadResponseReviewer[];
};

/**
 * PullRequestReviewOption コンポーネントの Props
 */
export type PullRequestReviewOptionProps = {
  calendarId: string;
  /** GitHub リポジトリの PR 一覧へのリンク（フッター用） */
  allPrsUrl?: string;
  /** カスタム className */
  className?: string;
};

/**
 * TeamReviewLoadOption コンポーネントの Props
 */
export type TeamReviewLoadOptionProps = {
  /** チームメンバーのレビュー負荷一覧 */
  calendarId: string;
  /** レビュアー変更時のコールバック */
  onReviewerChange?: (payload: ChangeReviewerRequest) => void;
};

/** GitHub OAuth コールバックリクエスト */
export type GithubOauthRequest = {
  code: string | null;
  state: string;
};

/** GitHub App インストールリクエスト */
export type GithubAppInstallRequest = {
  code: string | null;
  state: string;
  installationId: string;
};

/**
 * 単一のマイルストーン情報
 * バックエンドの GithubMilestonesResponse に対応
 */
export type Milestone = {
  title: string;
  progress: number;
  open: number;
  close: number;
};

/**
 * /api/github/milestone-progress のレスポンス
 * バックエンドは配列を直接返す
 */
export type MilestoneProgressResponse = Milestone[];

// ==================== GitHub連携ステータス ====================

/**
 * GitHubアカウント連携状態レスポンス
 * GET /github/oauth/status
 */
export type GitHubAccountLinkedStatus = {
  /** 連携しているかどうか */
  isLinked: boolean;
  /** GitHubユーザーID */
  githubId?: string;
  /** GitHubユーザー名 */
  githubName?: string;
  /** GitHubメールアドレス */
  githubEmail?: string;
  /** SSOログインかどうか */
  isSsoLogin?: boolean;
  /** 連携日時（ISO 8601） */
  linkedAt?: string;
};

/**
 * GitHub組織連携状態（インストール状態）レスポンス
 * GET /github/calendars/{calendarId}/installation-status
 */
export type GitHubAppInstallationStatus = {
  /** インストールされているかどうか */
  isInstalled: boolean;
  /** GitHub組織/ユーザーID */
  githubId?: string;
  /** GitHub組織/ユーザー名 */
  githubName?: string;
  /** GitHub App インストールID */
  installationId?: string;
  /** インストール日時（ISO 8601） */
  installedAt?: string;
};
