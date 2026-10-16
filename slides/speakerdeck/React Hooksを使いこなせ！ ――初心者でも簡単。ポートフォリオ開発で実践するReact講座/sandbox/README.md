# サンプルポートフォリオ（演習用）

スライドを見ながら、コード中の `TODO` コメントを埋めていくとポートフォリオが完成する演習用プロジェクトです。
見た目（デザイン・レイアウト）はすでに実装済みなので、フックのロジック部分だけに集中して実装できます。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:5173` を開くと、Home / Projects / Project詳細 / Contact の4ページが確認できます。

## 構成

- `src/pages/` — 4つのページ（Home, Projects, ProjectDetail, Contact）
- `src/components/` — UI部品（ProjectCard, ThemeToggle, SearchBar, LikeButton など）
- `src/context/ThemeContext.tsx` — createContext / useContext の演習
- `src/hooks/useProjects.ts` — カスタムフック（useState + useEffect）の演習
- `src/data/projects.json` — 表示するプロジェクトのモックデータ

## TODO 一覧（対応するHook）

| ファイル | Hook | やること |
|---|---|---|
| `context/ThemeContext.tsx` | `useState` / `useEffect` | ダークモードの状態管理と `<html>` へのクラス反映 |
| `components/ThemeToggle.tsx` | `useContext` | ThemeContextから現在のテーマを読んで表示を切り替え |
| `hooks/useProjects.ts` | `useState` / `useEffect` | 疑似的な非同期フェッチとローディング状態 |
| `pages/Projects.tsx` | `useState` / `useMemo` | 検索ワードの状態管理と絞り込みのメモ化 |
| `pages/Home.tsx` | `useMemo` | 「いいね」数上位3件の計算をメモ化 |
| `pages/ProjectDetail.tsx` | `useParams` / `useNavigate` | URLパラメータから該当プロジェクトを表示、戻るボタン |
| `components/LikeButton.tsx` | `useReducer`（ボーナス） | いいねの状態をreducerで管理 |
| `pages/Contact.tsx` | `useState` / `useRef` | フォーム入力の状態管理と初期フォーカス |

各TODOコメントの近くに、実装のヒント（書き換えるコード例）を残してあります。
スライド（`../slide.md`）の対応する章を見ながら、上から順に埋めていくのがおすすめです。

## 実装できているか確認する（ユニットテスト）

各TODOに対応するテストを用意しています。今の状態（何も実装していない状態）では
**全て失敗するのが正解**です。1つ実装するたびにテストを実行して、対応するテストが
通るか確認しながら進めてください。

```bash
npm run test        # 1回だけ実行
npm run test:watch  # ファイル変更のたびに自動で再実行（実装しながら使うならこちら）
```

| テストファイル | 何を確認しているか |
|---|---|
| `context/ThemeContext.tsx` + `components/ThemeToggle.test.tsx` | クリックでラベルと`<html>`のdarkクラスが切り替わるか |
| `hooks/useProjects.test.ts` | 最初は`isLoading: true`で、時間経過後にデータが入るか |
| `pages/Projects.test.tsx` | 検索ワードで一覧が絞り込まれるか |
| `pages/ProjectDetail.test.tsx` | URLの`:id`に対応するプロジェクトが表示されるか |
| `components/LikeButton.test.tsx` | クリックでいいね状態とカウントが増減するか |
| `pages/Contact.test.tsx` | 初期フォーカスが当たるか、送信で完了メッセージが出るか |
| `pages/Home.test.tsx` | 上位3件の表示順（このテストは最初から通ります。`useMemo`は表示結果を変えず再計算を減らすだけなので、実装前後で挙動が変わらないのが正しい動きです） |
