# AGENTS.md

## プロジェクト概要

このリポジトリは `edit_management_app` です。

アプリ名は `EditFlow Manager`。SNS運用代行向けに、動画編集案件を管理するためのNext.js製MVPです。

このアプリはGoogle Driveを置き換えるものではありません。Google Driveをファイル保管場所として使い続け、その上に案件管理レイヤーを作ります。

このアプリで管理するもの:

- 案件
- 管理者
- 編集者
- ステータス
- Google Driveリンク
- 提出履歴
- 修正履歴
- Drive同期結果
- ステータス提案

## 利用者画面の方針

ログイン機能はまだ実装しないが、将来的にはログインユーザーごとに表示内容を分ける。

ツール利用者の役割は大きく2種類:

- `運営者`: ツール側で案件進行を管理する人。従来「管理者」と呼びがちだが、案件の管理者と混同しやすいため、このAGENTS.mdでは `運営者` と呼ぶ。
- `編集者`: 実際に編集作業を担当する人。

注意:

- `運営者` はツール側の利用者ロール。
- 既存データ上の `manager` は案件に紐づく進行担当者として扱う。
- UI文言では、必要に応じて「管理者」ではなく「運営者」「進行担当」など混同しにくい名前を使う。

画面設計:

- ログイン実装までは、サイドバーの「表示ユーザー」セレクトで利用者を切り替える。
- 運営者と編集者では画面の目的とナビゲーションを分ける。
- `運営者` は、自分が進行担当または編集担当として紐づく案件を見る。
- `編集者` は、自分が編集担当として紐づく案件だけを見る。
- 編集者は案件の進行担当/管理者にはならない前提にする。
- 運営者は案件の進行担当と編集担当のどちらにもなり得る。
- 編集者には自分が編集担当の案件だけを表示する。
- 編集者には案件作成、設定、担当者別などの運営者向け画面を基本的に見せない。
- 編集者の画面は「マイタスク」「担当案件」「編集タスク詳細」に寄せる。
- 運営者の画面は「ダッシュボード」「案件一覧」「案件作成」「担当者別」「設定」に寄せる。
- 将来的なログイン実装時は、この `currentAppUser` / `visibleProjects` の考え方をSupabase Authのログインユーザーに置き換える。

目標:

> このアプリを見れば、どの案件を誰が担当していて、今どこまで進んでいて、必要なGoogle Driveフォルダやファイルにすぐアクセスできる状態にする。

## 現在の開発段階

現在はローカル開発用のMVP/プロトタイプです。

実装済み:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui風のローカルUIコンポーネント
- ダッシュボード
- 案件一覧
- 案件作成
- 案件詳細
- 担当者別ページ
- 設定ページ
- ステータスバッジ
- ステータス変更
- 履歴追加
- 履歴の最新3件表示/種別フィルター
- UI上のモックDrive同期
- DriveフォルダURLからID抽出
- Driveファイル/フォルダ分類ロジック
- Drive同期結果からのステータス提案ロジック
- 本物のDrive同期APIルートの土台
- Supabase用スキーマSQL

未実装:

- UIからの本物のGoogleログイン
- UIからの本物のSupabase保存
- UIからの本物のGoogle Drive同期
- UIからの本物のDriveアップロード
- 細かい権限管理
- Slack / LINE WORKS通知
- 最終的なVercel本番公開

## 重要なプロダクト方針

### Google Driveは置き換えない

このアプリ内に動画ファイルを保存する設計にはしない。

Google Driveに置くもの:

- 動画素材
- 台本
- 初稿
- 修正版
- 完成動画

このアプリに置くもの:

- 案件情報
- 担当者
- 進捗
- Driveリンク
- Driveメタデータ
- 提出/修正履歴
- ステータス提案

### 現在のDrive連携状態

現時点のUIは、本物のGoogle Driveからデータ取得していません。

画面上の「Drive同期」は `src/lib/project-store.tsx` のローカルモック同期です。

本物のDrive同期APIルートの土台:

- `src/app/api/drive/sync/route.ts`

Drive分類ロジック:

- `src/lib/drive.ts`

案件詳細には以下のDriveリンクボタンがあります。

- 案件フォルダ
- 台本
- 素材
- 初稿
- 修正版
- 完成動画

本物のDrive同期を接続したら、Google Drive APIの `webViewLink` または保存済みURLを各ボタンのリンクに使います。

### Drive分類ルール

Driveのファイル/フォルダは、名前とMIMEタイプで分類します。

分類ルール:

- Googleスプレッドシート、または名前に `台本` を含む -> `script`
- 名前に `素材` または `撮影素材` を含む -> `material`
- 名前に `初稿` を含む -> `first_draft`
- 名前に `修正` または `修正版` を含む -> `revision`
- 名前に `完成` または `納品` を含む -> `final`
- それ以外 -> `other`

子ファイルについては、重要フォルダの分類を引き継ぐ設計にする。

例:

```text
案件フォルダ
└── 初稿提出フォルダ
    └── video_v1.mp4
```

この場合、`video_v1.mp4` の名前に `初稿` がなくても、親フォルダが `first_draft` なので初稿提出物として扱う。

### 将来のDriveアップロード方針

動画ファイル本体は、VercelやNext.js API Routeを経由させない。

推奨する構成:

```text
この管理ツールの画面
-> ブラウザからGoogle Drive APIのresumable upload
-> 対象のGoogle Driveフォルダ
```

ユーザー体験としては、この管理ツールからアップロードしているように見える状態にする。

このアプリが担当すること:

- ファイルのドラッグ&ドロップUI
- ファイル名による保存先判定
- 保存先候補の表示
- ユーザーによる保存先確認/変更
- アップロード進捗表示
- アップロード完了後の履歴保存
- ステータス提案作成

避ける構成:

```text
ブラウザ
-> Vercel / Next.js API Route
-> Google Drive
```

理由:

- 動画は1GB近いことがある
- サーバー経由だと転送が二重になる
- Vercel API Routeは大容量/長時間アップロードに向かない
- ブラウザからDriveへの直接resumable uploadの方が安定する

アップロード時の保存先判定:

- ファイル名に `初稿` -> 初稿フォルダ
- ファイル名に `修正` または `修正版` -> 修正版フォルダ
- ファイル名に `完成` または `納品` -> 完成動画フォルダ
- ファイル名に `素材` または `撮影` -> 素材フォルダ
- それ以外 -> ユーザーに保存先を選ばせる

Drive APIアップロード自体に直接のAPI利用料金は基本かからない想定。ただし、Google Drive容量、Google Workspaceプラン、回線速度、1ユーザーあたり1日750GBのアップロード上限には注意する。

## ステータス設計

使うステータス:

```text
未着手
素材確認中
編集中
初稿提出済み
修正依頼あり
修正対応中
再提出済み
完成
```

次に動く人:

- `初稿提出済み` と `再提出済み` -> 管理者
- `完成` -> なし
- それ以外 -> 編集者

Drive検出結果でステータスを勝手に変更しない。  
ステータスは自動変更ではなく、自動提案にしてユーザーが確定する。

## 画面ごとの責務

### ダッシュボード

ダッシュボードは最小限にする。

目的:

> 管理者が今日見るべき案件をすぐ見つける。

残すべき機能:

- 確認待ち件数
- 修正対応中件数
- 納期3日以内件数
- 優先対応リスト

入れすぎないもの:

- 詳細編集
- 長い履歴
- 全ファイル一覧
- 検索/絞り込み
- Drive分類修正
- アップロードUI

これらは案件一覧または案件詳細に置く。

### 案件一覧

目的:

> 全案件を検索・絞り込み・比較して、目的の案件を開く。

機能:

- 案件名/担当者/最新ファイル名で検索
- ステータスで絞り込み
- 管理者で絞り込み
- 編集者で絞り込み
- 最終更新順/納期順で並び替え
- 案件詳細を開く
- Driveフォルダを開く
- Drive同期アクション

### 案件作成

目的:

> 最小限の入力で新しい編集案件を登録する。

入力項目:

- 案件名
- クライアント名
- 管理者
- 編集者
- ステータス
- 納期
- Google Drive案件フォルダURL
- メモ

将来の動作:

- DriveフォルダURLからフォルダIDを抽出
- Driveフォルダをスキャン
- 台本/素材/初稿/修正版/完成動画フォルダを自動分類
- ユーザーが分類結果を確認/修正

### 案件詳細

目的:

> 1つの案件の現在地、Driveリンク、検出ファイル、履歴、ステータス提案を管理する。

機能:

- 現在のステータス表示
- 次に動く人の表示
- 次の行動の表示
- ステータス変更
- Driveリンク表示
- Drive同期結果表示
- 検出ファイル表示
- ステータス提案表示
- 履歴追加
- 履歴表示

履歴表示方針:

- 初期表示は重要履歴のみ
- `Drive同期` と `ステータス変更` は初期表示から外す
- 初期表示は最新3件
- 種別フィルターを用意する
- 残り履歴を展開/折りたためるようにする

### 担当者別ページ

目的:

> 管理者/編集者ごとの担当状況を見る。

機能:

- 編集者ごとの担当案件
- 管理者ごとの担当案件
- 担当件数
- 確認待ち件数
- 修正対応中件数

### 設定

目的:

> 連携状態、分類ルール、担当者を管理する。

機能:

- Google Drive連携状態表示
- 自動分類ルール表示
- 担当者追加
- ユーザー一覧

## データ設計

Supabaseスキーマ:

- `supabase/schema.sql`

主要テーブル:

- `users`
- `projects`
- `project_histories`
- `drive_files`
- `status_suggestions`

現時点のUIはSupabaseに保存していません。

現在のUIは以下のローカルストア/localStorageで動いています。

- `src/lib/project-store.tsx`

## Git / GitHub運用方針

GitHubリポジトリ:

- `Reon0416/edit_management_app`

正しいremote:

- `https://github.com/Reon0416/edit_management_app.git`

ブランチ方針:

- `main` は本番候補
- `develop` は開発作業用
- 明示的な依頼がない限り、`main` に直接pushしない
- 通常開発中は本番デプロイしない

ユーザーの現在方針:

- Vercelへの本番デプロイは最後にだけ行う
- 明示的に依頼されるまで `vercel --prod` は実行しない
- 実装変更を行った後は、基本的に `develop` ブランチへコミットしてGitHubへpushする
- 実装変更を行った後は、開発サーバーを起動してローカルURLを伝える

## Vercel運用方針

ユーザーは、まだ本番公開したくないためVercelプロジェクトを削除済み。

明示的に依頼されるまで、Vercelプロジェクトを再作成しない。  
明示的に依頼されるまで、Vercelへデプロイしない。

最後に本番公開するときの想定手順:

```bash
git switch main
git merge develop
git push origin main
vercel --prod
```

それまではローカル開発のみ。

`.vercel` がローカルに存在する場合は、Vercelリンク情報なのでコミットしない。不要なら削除してよい。

## ローカルコマンド

依存関係インストール:

```bash
npm install
```

開発サーバー起動:

```bash
npm run dev
```

ポート指定:

```bash
npm run dev -- --port 3000
```

ビルド:

```bash
npm run build
```

ローカルURL:

```text
http://localhost:3000
```

`npm run dev` が動く理由は、`package.json` に以下があるため。

```json
"dev": "next dev"
```

## 環境変数

環境変数サンプル:

- `.env.example`

既知の変数:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_ACCESS_TOKEN=
```

`.env` や `.env*.local` はコミットしない。

## ローカル環境の注意点

このプロジェクトはOneDrive配下の日本語パスにある。

```text
C:\Users\re16m\OneDrive\デスクトップ\codex dev\edit_management_app
```

Next.js dev serverは、このパスで `.next` のキャッシュ/readlink問題を起こすことがある。

開発サーバーの挙動がおかしい場合:

1. ポート3000を使っているNodeプロセスを止める
2. `.next` を削除する
3. 開発サーバーを再起動する

PowerShell例:

```powershell
netstat -ano | Select-String ':3000'
Stop-Process -Id <PID> -Force
Remove-Item -LiteralPath .next -Recurse -Force
npm run dev -- --port 3000
```

## コーディング方針

- UIは実務向け、管理画面向けにする
- ランディングページ風にしない
- 情報密度は高めだが、読みにくくしない
- 既存の `src/components/ui` のUI部品を優先して使う
- アイコンは `lucide-react` を使う
- 意味の薄い大きな抽象化を追加しない
- Drive検出によるステータス変更は、必ずユーザー確認を挟む
- 関係ない大規模リファクタは避ける
- 日本語UIラベルは基本維持する

## 重要ファイル

- `src/app/page.tsx` - ダッシュボード
- `src/app/projects/page.tsx` - 案件一覧
- `src/app/projects/new/page.tsx` - 案件作成
- `src/app/projects/[id]/page.tsx` - 案件詳細
- `src/app/people/page.tsx` - 担当者別
- `src/app/settings/page.tsx` - 設定
- `src/components/app-shell.tsx` - ナビゲーション/共通レイアウト
- `src/lib/project-store.tsx` - 現在のローカル/モック状態管理
- `src/lib/drive.ts` - Drive URL抽出、分類、ステータス提案ロジック
- `src/app/api/drive/sync/route.ts` - 本物のDrive同期API土台
- `supabase/schema.sql` - DBスキーマ
