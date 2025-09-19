<?xml version="1.0" encoding="UTF-8"?>
<ProjectDocument>
  <Specification>
    <Overview>
      <Item>カレンダーアプリのフロントエンドリポジトリ</Item>
      <Item>Next.js を採用し App Router を前提に構築</Item>
    </Overview>
    <UIComponents>
      <Item>Shadcn/ui を利用して UI を構築</Item>
      <Item>コンポーネント階層はアトミックデザインに従い、page 階層は App Router の page で代替</Item>
    </UIComponents>
    <DevTools>
      <Item>Storybook でコンポーネントのカタログ化と検証を実施</Item>
      <Item>Biome によってインデントおよびコード整形を統一</Item>
    </DevTools>
  </Specification>
  <ImplementationPolicy>
    <Item>コンポーネント開発時は src/components 配下に既存ファイルを活用し、同階層へ追加実装する</Item>
    <Item>src/components/ui 配下のファイルは Shadcn/ui コンポーネントをラップする用途に限定し、独自ロジックを持たせない</Item>
    <DataFetchAndUpdate title="実装方針 — データフェッチ &amp; 更新 (Server Actions／フェッチ)">
      <Purpose>
        <Item>フロントエンドとバックエンド間の通信を安全かつ効率的に設計する</Item>
        <Item>データ取得と更新操作を明確に分け、キャッシュ・認証・パフォーマンスを考慮する</Item>
      </Purpose>
      <Terminology>
        <Term>
          <Name>Server Component</Name>
        </Term>
        <Term>
          <Name>Client Component</Name>
        </Term>
        <Term>
          <Name>Server Action</Name>
          <Description>'use server' を使って定義されるミューテーション処理</Description>
        </Term>
        <Term>
          <Name>Fetch (GET)</Name>
          <Description>データ取得・読み込み操作</Description>
        </Term>
      </Terminology>
      <FetchPolicy>
        <Item>Server Component 内でデータを取得する</Item>
        <Item>fetch でバックエンド API (Go) を GET リクエストとして呼び出す</Item>
        <Item>取得データの型を TypeScript で定義し、入力と出力の契約を明確にする</Item>
        <Item>並列取得を優先し、Waterfall を避ける</Item>
        <Item>キャッシュオプション (cache, React cache, server-only) を活用した設計を行う</Item>
        <Item>認証が必要なデータはサーバー側でトークン検証などのセキュリティ対策を行う</Item>
      </FetchPolicy>
      <MutationPolicy>
        <Item>更新・追加・削除などの操作は Server Actions を利用する</Item>
        <Item>Client Component からフォームまたはイベントで Server Action を呼び出す</Item>
        <Item>処理後は revalidatePath や revalidateTag で対象ページやパスを再検証する</Item>
        <Item>成功・失敗時の UI フィードバックを実装する</Item>
      </MutationPolicy>
      <CacheStrategy>
        <Rule>
          <Type>長めのキャッシュ</Type>
          <Option>force-cache / 指定時間のキャッシュ</Option>
          <Target>頻繁に変わらないデータ (例: 分類一覧、メニュー)</Target>
        </Rule>
        <Rule>
          <Type>短め / no-store</Type>
          <Option>最新性が重要なデータ向け</Option>
          <Target>ユーザーダッシュボード、通知など</Target>
        </Rule>
        <Rule>
          <Type>共通フェッチユーティリティ</Type>
          <Option>React cache, server-only</Option>
          <Target>複数箇所からの重複呼び出しを防ぐ</Target>
        </Rule>
      </CacheStrategy>
      <ParallelVsSequential>
        <Item>非依存データは並列取得を基本とする</Item>
        <Item>ネスト構造や依存関係がある場合のみ逐次フェッチとする</Item>
        <Item>Suspense や loading UI を用い部分表示を可能にする</Item>
      </ParallelVsSequential>
      <Security>
        <Item>クライアントには必要最低限のデータのみ渡す</Item>
        <Item>API キーやトークンはサーバー側で保管・検証する</Item>
        <Item>Go API 側で入力バリデーションを徹底する</Item>
        <Item>CORS を明示的に設定する</Item>
      </Security>
      <Contract>
        <Item>Go バックエンドと共通のデータモデルを維持する</Item>
        <Item>OpenAPI / Swagger / GraphQL などで API 定義を作成し契約を文書化する</Item>
        <Item>TypeScript で入力・出力の型定義を使用する</Item>
      </Contract>
      <ServerActionConstraints>
        <Item>読み込み用途には基本的に Server Actions を使わない</Item>
        <Item>Server Actions は POST 相当の呼び出しになる点を前提とする</Item>
        <Item>複数の Server Action を順に呼ぶと待ち時間が発生するためパフォーマンスに注意する</Item>
        <Item>UI とロジックを分離し、Server Action はデータ操作や API 呼び出しに専念させる</Item>
      </ServerActionConstraints>
    </DataFetchAndUpdate>
  </ImplementationPolicy>
  <Architecture>
    <DependencyRules>
      <Rule>
        <Description>atoms ← molecules ← organisms ← templates ← pages の流れで依存がある（下位が上位を知らない）</Description>
      </Rule>
      <Rule>
        <Description>UI 層（components, templates, pages）は domain / services / adapters 層に依存可能だが、その逆は不可</Description>
      </Rule>
      <Rule>
        <Description>domain 層は外部ライブラリ／UI フレームワークの直接依存を持たない</Description>
      </Rule>
      <Rule>
        <Description>hooks は UI 層または services 層を呼べるが、domain の純粋ロジックを侵さないようにする</Description>
      </Rule>
    </DependencyRules>
    <Layers>
      <Layer name="atoms">
        <Responsibility>
          <Item>最小の UI 部品。スタイルと表示が中心。</Item>
          <Item>ロジックは基本的に持たない。</Item>
          <Item>Shadcn/ui をラップする UI のみ。</Item>
        </Responsibility>
      </Layer>
      <Layer name="molecules">
        <Responsibility>
          <Item>複数の atoms を組み合わせて機能を持つ UI。</Item>
          <Item>例：入力 + ラベル + アイコンなど。</Item>
          <Item>props を受け取るが副作用や大きな状態を持たない。</Item>
        </Responsibility>
      </Layer>
      <Layer name="organisms">
        <Responsibility>
          <Item>複数の molecules / atoms を使ってページの一部分を構成する UI。</Item>
          <Item>例：カレンダーグリッド、イベントカード一覧など。</Item>
        </Responsibility>
      </Layer>
      <Layer name="templates">
        <Responsibility>
          <Item>ページの骨格を構成するレイアウト要素。</Item>
          <Item>共通 UI（Header / Sidebar / Footer 等）を配置。</Item>
          <Item>organisms を置いてページの基本構造を定義。</Item>
        </Responsibility>
      </Layer>
      <Layer name="pages">
        <Responsibility>
          <Item>Next.js の App Router の page。</Item>
          <Item>テンプレートをラップし、データ取得（Server Component や fetch）、Server Action／更新操作、ルーティングなどの入口。</Item>
        </Responsibility>
      </Layer>
      <Layer name="hooks">
        <Responsibility>
          <Item>UI／ページから呼ばれるデータフェッチ／状態管理／共通処理。</Item>
          <Item>副作用を含むロジックもこちらでまとめる。</Item>
        </Responsibility>
      </Layer>
      <Layer name="services_adapters">
        <Responsibility>
          <Item>外部 API 呼び出しや HTTP クライアント。</Item>
          <Item>認証・ヘッダー設定などのインフラ依存コードを分離。</Item>
        </Responsibility>
      </Layer>
      <Layer name="domain_usecases">
        <Responsibility>
          <Item>ビジネスルール・モデル・ユースケース。</Item>
          <Item>表示ロジックとはほぼ無関係。</Item>
          <Item>例：イベントの日付ロジック、通知の計算など。</Item>
        </Responsibility>
      </Layer>
      <Layer name="utils_constants_styles">
        <Responsibility>
          <Item>共通ユーティリティ／定数／日付フォーマット等を一元管理。</Item>
          <Item>スタイルトークン・テーマ設定を含む。</Item>
        </Responsibility>
      </Layer>
    </Layers>
  </Architecture>
  <Rules>
    <AI運用5原則>
      <Principle number="1">AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。</Principle>
      <Principle number="2">AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。</Principle>
      <Principle number="3">AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。</Principle>
      <Principle number="4">AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。</Principle>
      <Principle number="5">AIは全てのチャットの冒頭にこの5原則を逐語的に必ず画面出力してから対応する。</Principle>
    </AI運用5原則>
  </Rules>
</ProjectDocument>
