interface LikeState {
  count: number;
  liked: boolean;
}

type LikeAction = { type: "toggle" };

// TODO: [useReducer] 「いいね」ボタンをuseReducerで作るのが今回の課題（ボーナス枠）。
// 1. この reducer 関数の中身を書く:
//    - action.type が "toggle" のとき、liked を反転させ、
//      liked → !liked に合わせて count を +1 / -1 する
// 2. LikeButton コンポーネント内で
//    const [state, dispatch] = useReducer(likeReducer, { count: initialCount, liked: false })
//    を呼び出し、下のダミー実装と差し替える
// 3. ボタンの onClick で dispatch({ type: "toggle" }) を呼ぶ
function likeReducer(state: LikeState, action: LikeAction): LikeState {
  switch (action.type) {
    case "toggle":
      // TODO: ここを実装する（今は何もせず現在の state を返している）
      return state;
    default:
      return state;
  }
}
void likeReducer; // TODO: 実装したら useReducer から使うのでこの行は削除してOK

export function LikeButton({ initialCount }: { initialCount: number }) {
  // TODO: useReducer(likeReducer, { count: initialCount, liked: false }) に差し替える
  const state: LikeState = { count: initialCount, liked: false };

  return (
    <button
      type="button"
      onClick={() => console.log("TODO: dispatch({ type: 'toggle' }) を呼ぼう")}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        state.liked
          ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
          : "border-slate-300 text-slate-500 hover:border-rose-300 hover:text-rose-500 dark:border-slate-600 dark:text-slate-400"
      }`}
    >
      <span>{state.liked ? "❤️" : "🤍"}</span>
      <span>{state.count}</span>
    </button>
  );
}
