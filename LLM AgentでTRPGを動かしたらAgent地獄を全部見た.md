---
<!-- @var name: 田中博悠 -->
<!-- @var handlename: tanahiro2010 -->

marp: true
theme: default
paginate: true
backgroundColor: "#0f0f0f"
color: "#f0f0f0"
style: |
  section {
    font-family: 'Noto Sans JP', sans-serif;
    padding: 48px 64px;
  }
  h1 {
    color: #e8c96a;
    font-size: 2em;
    border-bottom: 2px solid #e8c96a;
    padding-bottom: 8px;
  }
  h2 {
    color: #e8c96a;
    font-size: 1.5em;
  }
  code {
    background: #1e1e1e;
    color: #7ec8a0;
    padding: 2px 6px;
    border-radius: 4px;
  }
  pre {
    background: #1e1e1e;
    border-left: 4px solid #e8c96a;
    padding: 16px;
  }
  .small {
    font-size: 0.75em;
    color: #aaa;
  }
  strong {
    color: #e8c96a;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th {
    background: #e8c96a;
    color: #0f0f0f;
    padding: 8px 16px;
  }
  td {
    border: 1px solid #555;
    padding: 8px 16px;
    color: #f0f0f0;
    background: #1a1a1a;
  }
  tr:nth-child(even) td {
    background: #252525;
  }
---
 

# LLM AgentでTRPGを動かしたら、Agentの地獄を全部見た
 
GDGoC Osaka — LLM Agent Build with AI
 
**{{name}}** / 2026


---
 
# 自己紹介
 
- **{{name}}** / **{{handlename}}**
- 三田学園高等学校 1年生
- 兵庫の辺境に住んでる
- TypeScript / Python / Rubyをメインに開発
- 興味が赴くがままに他の言語フレームワークも使用中

---

# 突然ですが質問です

## 「趣味と技術、合体させたくなったことありますか？」

---

# なぜこれを作ったか

LTネタを探す → TRPGが好き × LLM Agent触りたい → 合体させよう（）

## 気づいたら一から実装していました

---
 
# 作ろうとしたもの
 
**複数のLLM AgentがTRPGを自律進行するシステム**
 
```
GM Agent   : シナリオを読んで描写・進行
PL Agent   : キャラクターとして行動宣言
Rule Engine: ダイス判定・状態管理（TypeScript）
```
 
設計思想：**「AI = 演技」「TypeScript = 世界」**
 
> LLMには喋らせるだけ、ロジックは絶対コードで持つ
 
---
 
# システム構成
 
```
┌─────────────────────────────────────┐
│           TypeScript Engine          │
│  ターン管理 / 状態 / ダイス / ログ    │
└────────────┬────────────┬────────────┘
             │            │
       ┌─────▼─────┐ ┌───▼──────┐
       │  GM Agent  │ │ PL Agent │
       │  (Cohere)  │ │ (Cohere) │
       └────────────┘ └──────────┘
```
 
PLは `[action]...[/action]` タグで構造化出力
→ zodでバリデーション
 
---
 
# 実際に動かしたら
 
シナリオ（1ページ目）：
 
> 「あなたがいつも通りの日常を送っていると、唐突に目の前に**どこ○もドアっぽい物**が現れる」
> → 入る？ 入らない？
 
---
 
# 実際に動かしたら
 
GMの出力：
 
> 「**夜の街を歩く探索者たちの前に**、突然、どこか異次元を思わせる扉が現れた。その扉は、無機質な白と黒の幾何学模様が織りなす不思議な光景を映し出している。」
 
🤔
 
**夜の街、どこから来た？**
**探索者たち（複数）、誰？**
 
---
 
# 4ターン後の状態
 
| 項目 | 期待 | 実際 |
|------|------|------|
| フェーズ | 分岐・戦闘へ | `dialog` のまま |
| ダイス | 複数回 | **0回** |
| アクション | skill_check / move | `speak` のみ |
| シナリオ進行 | 3〜4ページへ | **1ページから動かず** |
 
PLが4ターン連続で少女に話しかけ続けた
 
---
 
# 何がなぜ壊れたか
 
**① GMがシナリオを「文脈」として使った**
 
テキストで渡すと、LLMは雰囲気だけ吸って創作する
分岐を「制御すべき構造」とは認識しない
 
**② PLがspeakしか選ばない**
 
「キャラクターらしく行動せよ」だけでは
安全策として会話を選び続ける
 
**③ Scenario Parserが未実装**
 
現在のページ・選択肢・次ページをエンジンが把握できていない
 
---
 
# 学んだこと
 
> **LLMに構造を守らせたいなら、構造化した入力を渡せ**
 
テキスト渡し → LLMは文脈として解釈 → 脱線
構造体渡し → LLMは制約として認識 → 制御できる
 
```json
{
  "currentPage": 2,
  "choices": ["入る → 3ページ", "入らない → 4ページ"],
  "instruction": "必ずどちらかの選択肢に誘導すること"
}
```
 
「AIに任せる部分」と「コードで縛る部分」の境界設計が全て
 
---
 
# まとめ・今後
 
**動いたこと**
- Agent間の会話ループ
- 構造化出力 + zodバリデーション
- セッションログ（JSONL）

**これからやること**
- Scenario Parser実装
- ページ状態をエンジンで管理
- 複数PL対応
- Gemini混在構成

**リポジトリ：** `github.com/tanahiro2010/ai_agent_trpg`
 
---
 
# ご清聴ありがとうございました
 
> 「AI = 演技、TypeScript = 世界」
> 　　　　　　　…のはずだった
 
失敗ログも全部コミット済みです（）
 
`github.com/tanahiro2010/ai_agent_trpg`
 
