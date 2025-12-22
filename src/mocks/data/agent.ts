/**
 * Agent チャット関連のモックデータ
 * 開発環境でテストに使用する AI エージェントレスポンス
 */

import type { OptionProposalProps } from "@/components/organisms/AgentChat/OptionProposalCard";

/**
 * マークダウン形式のモックレスポンス
 * AIエージェントからの返答テンプレート
 */
export const mockAgentResponses = {
  /**
   * オプション提案時のレスポンス
   */
  optionProposal: `## おすすめのオプション

こちらのオプションがおすすめです。導入することで**開発効率**が向上します！

### 特徴:
- GitHub連携でスプリント管理
- PRレビュー状況の可視化
- マイルストーン進捗トラッキング`,

  /**
   * デフォルトのレスポンス
   */
  defaultResponse: `承知いたしました！

他にお手伝いできることはありますか？以下のようなことができます：

1. **オプションの提案** - カレンダーに追加できる機能を紹介
2. **スケジュール最適化** - 予定の調整をサポート
3. **リマインダー設定** - 重要な予定の通知設定

> お気軽にお声がけください 🙌`,

  /**
   * GitHub連携についての詳細情報
   */
  githubInfo: `## GitHub連携について

GitHub連携オプションでは、以下の機能が利用できます：

### 📋 PRレビュー管理
- **レビュー待ち**のPRを一覧表示
- チームメンバーのレビュー負荷を可視化
- レビュアーの自動割り当て提案

### 📊 マイルストーン進捗
マイルストーンの進捗率をカレンダー上で確認できます。

\`\`\`
進捗率: ████████░░ 80%
\`\`\`

詳しくは[GitHub Apps](https://github.com/apps)から設定できます。`,
} as const;

/**
 * オプション提案のモックデータ
 */
export const mockOptionProposals: OptionProposalProps[] = [
  {
    id: 1,
    name: "GitHub Integration",
    description: "開発スプリントと連携します",
  },
];
