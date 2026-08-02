# LT登壇資料 仕様書 - Googleが発表した新Web標準ドラフト――WebMCP。実際どうなの？ IO Extendedで実装・登壇して分かったこと

## 概要
Google I/O Extended Osaka 2026にて、ハンズオンで登壇してきました。
タイトルは「WebMCP を作って AI エージェントから呼び出してみよう！ WebMCP 開発ハンズオン」
実際にこのコードラボ（https://learn.gdgs.jp/webmcp-agent/）を使って、ハンズオンの前半部分の登壇を担当しました。
このLTでは、この登壇資料を作るときに得た知見や作ったextension及びMCPの紹介、そしてぶっちゃけそれを実装して使ってみてどう思ったかなどを紹介します。
connpass: https://gdgkwansai.connpass.com/event/391029/

自作mcp: https://github.com/tanahiro2010/webmcp-bridge-mcp
自作extension: https://github.com/tanahiro2010/webmcp-bridge-extension

## スライド内容（一セクションに一つ書いてますが、別にそれで一ページと言うわけでもなく分量によって分割推奨）
- タイトル
- 自己紹介
  - 名前：田中博悠（tanahiro2010）
  - 所属：株式会社KOMPEITO / GDG Greater Kwansai
  - 趣味：バンジー
  - 最近：強制的にでもバンジー一緒に飛んでくれる人を探してます
  - 画像：img/tanaka.png
- 問いかけ
  - 問いかけ：WebMCPって、知ってますか？
- MCPに関する説明
  - codelab参照
  - 簡単に箇条書きで
- WebMCPに関する説明
  - codelab参照
  - MCPとの違いは次のスライドで説明するので、それ以外を箇条書きで
- WebMCPとMCPの違い
  - MCPとWebMCPは、APIの仕様が限りなく似てたり名前にMCPってついてたりするけど、実は違うんだよと
  - これからメジャーな違いを紹介していくぜと記述
- WebMCPとMCPの違い 1
  - ターゲットの違い
    - MCPはAI Agent全般で使用可能
    - WebMCPは仕様ではブラウザ内蔵Agentでのみ使用可能
      - なお、ハンズオンではこれを覆すためにMCPとextensionを自作し、それっぽいbridgeを開発
        - 一応公式仕様には準拠しており（ハンズオンで学習した仕様と実際の仕様で差があるとそれはハンズオンをする意味がないと僕が思ったため）、機能はある程度サポート中
- WebMCPとMCPの違い 2
  - 初期登録の場所及びセッション期間の違い
    - MCPはAI Agentを起動するとAgentをMCPが起動しAgentに登録され、AgentをexitするまでずっとWebMCPは使用可能
    - WebMCPはブラウザ内蔵Agentを開いてもそのときにWebMCPが登録されるわけではない
      - WebMCPが実装され定義されたページが開かれたときにブラウザ内蔵エージェントへ登録され、ページを閉じたりタブを変えるとそのWebMCPは使えなくなる
        - なお、タブを戻れば再び使えるようになる
        - 簡単に言えば、ページを開いてる時だけWebMCPは使えるということ
- WebMCPとMCPの違い 3
  - 動く場所の違い
    - MCPはローカルサーバーおよびサービスサーバー上で処理が動く
    - WebMCPはそのブラウザのそのページ内で処理が動く
- WebMCPの現状に関して
  - 要検索
  - まだドラフト段階
  - Google Chromeの内蔵Agentで今後サポートされる予定はあるものの、まだ実装されてはいない
  - じゃあ、果たして僕はどうやってハンズオンで対策したのか――？
- 自作したExtensionとMCPに関する解説
  - 参照した公式ドキュメント：https://developer.chrome.com/docs/ai/webmcp?hl=ja
  - Chromeのドキュメントを読み、WebMCPを実装したサイトからWebMCPを抜き出すBrowser Extensionを開発
    - 処理フロー
      - Extension
        - ページが開かれると、jsとページのフォームをスキャン
          - 宣言型 / 命令型 のWebMCPを全てスキャン
        - もし一つでもWebMCPが実装されているのならば、右上にオーバーレイを表示
          - クリックされたら、接続しているMCPにWebMCP toolsを送信
        - WebSocketでMCPからのtool実行シグナルを受信すると、宣言型命令型とわず実行
      - MCP
        - Agentが開かれたときに起動
          - 以下のツールをAgentに起動
            - 以下のtoolをAgentに登録
              - webmcp_get_status
                - Extension の接続状態、既知タブ数、アクティブタブ ID を返す。WebSocket サーバー自体が bind に失敗している場合（他プロセスによるポート占有など）は `wsListenError` にその理由が入る
              - webmcp_list_tabs
                - Extension が把握している WebMCP 対応タブ一覧を返す（Extension への live 問い合わせ）
              - webmcp_discover_tools
                - 指定タブ（省略時はアクティブタブ）の WebMCP tool を検出する。デフォルトはキャッシュを返し、`forceRefresh: true` で再スキャンする
              - webmcp_call_tool
                - 指定タブの WebMCP tool を `toolId` / `args` を指定して実行する。`timeoutMs`（デフォルト30秒）で待ち時間を調整可能
              - webmcp_ping
                - Extension との疎通確認（レイテンシ計測）。ページ操作は行わない
        - WebSocketサーバーを起動
        - Browser Extensionからtoolを受信したらそれをtoolsとして保存（discoverから見つけれるように）
        - agentからcallが呼ばれたら、websocketでextensionに実行シグナルを送信
  - と言うゴリ押して解決

- こんなゴリ押しを通して、私がWebMCPに対して思ったこと
  - 「ぶっちゃけ、いらなくね？」
  - 利点は理解できる
    - ブラウザ内蔵エージェントで利用できる
    - 今、Chromeには内蔵ローカルAIが実装されたため、それからも利用できるかもしれない
    - なんか今あるAgentでブラウザを操作するやつよりも若干軽そう
  - しかし――
    - 実際に使ってみると、別にAgent経由のブラウザ操作とWebMCP経由の操作のトークン使用量にあまり差はない
    - ぶっちゃけClaude CodeとかCodexは多分常時開いてる人が多いと思うので、ブラウザ内蔵Agentを使ってまで使用する魅力を感じない
    - そもそも素人目線だけど、ターゲット選定が間違ってると思う
      - ブラウザ内蔵Agent、どうやらChromeに前からあったらしいけど、僕は存在を知らなかった
        - 多分、同じような人はたくさんいるはず
      - ターゲットがAgentからの使用なら誤動作とかがなくなりそうでいいかも？　とかは思ったものの、ブラウザ内蔵Agent向けってとこに首を傾げざるを得ない
- そんな辛辣なことを言いながら、どうして私はこの登壇（投稿）をしたのか
  - 理由は簡単。せっかくExtensionとMCPを作ったのにハンズオン以外で使われないのは悲しいから
- Thanks for listening