import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { LandingFooterV2 } from "@/components/landing-v2/LandingFooterV2";
import { LandingHeaderV2 } from "@/components/landing-v2/LandingHeaderV2";

export default function TermsPage() {
  return (
    <div
      className="light min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col"
      data-theme="light"
    >
      <LandingHeaderV2 />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          利用規約
        </h1>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <p>
              この利用規約（以下「本規約」）は、OptiCal（以下「本サービス」）の利用条件を定めるものです。
              本サービスをご利用になる前に、本規約をよくお読みください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              1. 免責事項（重要）
            </h2>
            <div className="bg-muted/30 p-6 rounded-lg border border-border/50">
              <p className="mb-4 font-medium text-foreground">
                本サービスは、学生による開発プロジェクトであり、現状有姿（As-Is）で提供されます。
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  運営者は、本サービスの完全性、正確性、有用性、特定目的への適合性について、一切の保証を行いません。
                </li>
                <li>
                  本サービスの利用により発生したデータの消失、スケジュールの不整合、その他いかなる損害についても、運営者は一切の責任を負わないものとします。
                </li>
                <li>
                  重要な予定の管理については、必ずご自身でバックアップ等の対策を講じてください。
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              2. サービスの変更・終了
            </h2>
            <p>
              運営者は、ユーザーへの事前の通知なく、本サービスの内容を変更したり、提供を一時的に中断または終了したりすることができるものとします。
              これによってユーザーに生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              3. アカウント管理
            </h2>
            <p>
              ユーザーは、自己の責任においてアカウント情報（ID、パスワード等）を適切に管理するものとします。
              アカウント情報の管理不十分による損害の責任はユーザーが負うものとし、運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              4. 禁止事項
            </h2>
            <p>以下の行為を禁止します。</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>
                本サービスのサーバーやネットワークに過度な負荷をかける行為
              </li>
              <li>
                AIエージェント機能に対して、不適切な入力や攻撃的なプロンプトを送信する行為
              </li>
              <li>他のユーザーへの迷惑行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              5. 準拠法
            </h2>
            <p>本規約の解釈にあたっては、日本法を準拠法とします。</p>
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
