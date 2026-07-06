import type { FormEvent } from "react";

export function Contact() {
  // TODO: [useState] name / email / message をそれぞれ state にする
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [message, setMessage] = useState("");
  const name = "";
  const email = "";
  const message = "";

  // TODO: [useState] 送信が完了したかどうかを state で持つ
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const isSubmitted = false;

  // TODO: [useRef] ページを開いたら name の input に自動でフォーカスを当てたい
  // const nameInputRef = useRef<HTMLInputElement>(null);
  // useEffect(() => {
  //   nameInputRef.current?.focus();
  // }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: setIsSubmitted(true) を呼んで、下の完了画面に切り替える
    console.log("TODO: フォームの送信処理を実装しよう");
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-2 text-2xl font-bold">送信ありがとうございます！</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {name} 様、ご連絡ありがとうございます。追ってご返信します。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Contact</h1>
        <p className="text-slate-500 dark:text-slate-400">
          お仕事のご相談・ご感想などお気軽にどうぞ。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          お名前
          <input
            type="text"
            name="name"
            value={name}
            onChange={() => {
              // TODO: setName(e.target.value) に差し替える
            }}
            placeholder="山田 太郎"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-indigo-900"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          メールアドレス
          <input
            type="email"
            name="email"
            value={email}
            onChange={() => {
              // TODO: setEmail(e.target.value) に差し替える
            }}
            placeholder="you@example.com"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-indigo-900"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          メッセージ
          <textarea
            name="message"
            rows={5}
            value={message}
            onChange={() => {
              // TODO: setMessage(e.target.value) に差し替える
            }}
            placeholder="お問い合わせ内容をご記入ください"
            className="resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-indigo-900"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          送信する
        </button>
      </form>
    </div>
  );
}
