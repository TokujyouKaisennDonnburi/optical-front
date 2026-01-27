import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { LandingFooterV2 } from "@/components/landing-v2/LandingFooterV2";
import { LandingHeaderV2 } from "@/components/landing-v2/LandingHeaderV2";

export default function PrivacyPolicyPage() {
  return (
    <div
      className="light min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col"
      data-theme="light"
    >
      <LandingHeaderV2 />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          プライバシーポリシー
        </h1>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              1. はじめに
            </h2>
            <p>
              OptiCal（以下「本サービス」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に最大限の注意を払っています。
              本サービスは学生による開発プロジェクトであり、取得した情報はサービスの提供・維持・改善のためにのみ利用します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              2. 取得する情報
            </h2>
            <p className="mb-4">本サービスは、以下の情報を取得・利用します。</p>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              ユーザー基本情報
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>アカウント情報（氏名、メールアドレス、プロフィール画像）</li>
              <li>認証情報（パスワード等）</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              外部サービス連携情報
            </h3>
            <div className="pl-4 border-l-2 border-border mb-4">
              <p className="mb-2">
                <span className="font-semibold text-foreground">
                  Google連携:
                </span>
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Googleアカウント情報（ID、メールアドレス）</li>
                <li>Googleカレンダー情報（予定の参照、作成、編集、削除）</li>
              </ul>

              <p className="mb-2">
                <span className="font-semibold text-foreground">
                  GitHub連携:
                </span>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>GitHubアカウント情報（ID、ユーザー名、メールアドレス）</li>
                <li>
                  リポジトリ情報（Pull
                  Request、マイルストーン、チーム開発におけるレビュー状況など）
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              3. 利用目的
            </h2>
            <p className="mb-4">取得した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>本サービスの提供、維持、および改善のため</li>
              <li>AIエージェントによるスケジュールの最適化提案のため</li>
              <li>チーム開発における業務負荷状況の可視化と改善提案のため</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              4. データの委託・保管先
            </h2>
            <p className="mb-4">
              本サービスは、システムの安定稼働のために以下のクラウドサービスを利用しています。
              ユーザーのデータはこれらのサービスのサーバー上に安全に保管・処理されます。
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cloudflare</strong>:
                フロントエンドおよび静的コンテンツの配信
              </li>
              <li>
                <strong>Render</strong>:
                バックエンドサーバーおよびデータベースのホスティング
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              5. AI機能とデータ利用
            </h2>
            <p>
              本サービスの一部機能において、OpenAI社等のAPIを利用しています。
              入力データはAI処理のために当該プロバイダーに送信される場合がありますが、
              <strong>
                これらのデータがAIモデルの学習に使用されることはありません。
              </strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              6. Googleユーザーデータの取り扱い
            </h2>
            <p>
              本サービスがGoogle
              APIから受け取った情報の使用および他のアプリへの転送は、限定的利用（Limited
              Use）要件を含む
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mx-1"
              >
                Google API Services User Data Policy
              </a>
              に準拠します。取得したGoogleカレンダー情報の利用は、本サービスの機能提供（カレンダー表示・予定管理）に限定されます。
            </p>
          </section>

          {/* 
            Google Search Consoleはサイト管理目的であり個人のトラッキングではないため、
            最低限の記載としては省略可能ですが、サーバーログ等のセキュリティ目的の収集として
            包括的に記載することも可能です。今回は「最低限」という要望に基づき、
            積極的なトラッキングを行っていないことを重視し、特定のツール名は挙げません。
           */}

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              7. お問い合わせ
            </h2>
            <p>
              本プライバシーポリシーに関するお問い合わせは、サービス内のフィードバックフォーム等よりお願いいたします。
            </p>
          </section>

          <div className="pt-10 flex justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                トップページに戻る
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <LandingFooterV2 />
    </div>
  );
}
