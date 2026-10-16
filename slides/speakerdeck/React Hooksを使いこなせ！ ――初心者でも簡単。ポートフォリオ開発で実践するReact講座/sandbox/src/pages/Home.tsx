import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "../components/ProjectCard";

export function Home() {
  const { projects } = useProjects();

  // TODO: [useMemo] projects が変わったときだけ再計算されるようにしたい。
  // useMemo(() => [...projects].sort((a, b) => b.likes - a.likes).slice(0, 3), [projects])
  // に差し替えよう。今は毎レンダー計算されている（件数が少ないので体感はしないが、
  // 「本来ならメモ化すべき処理」の例として扱う）。
  const featured = [...projects].sort((a, b) => b.likes - a.likes).slice(0, 3);

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm font-medium text-indigo-500">
          Frontend Engineer / 高専生
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          太郎のポートフォリオ
        </h1>
        <p className="max-w-lg text-slate-500 dark:text-slate-400">
          個人開発が好きなフロントエンドエンジニアです。日々の暮らしを少し便利にする
          小さなWebアプリを作っています。
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            to="/projects"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            作品を見る
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
          >
            お問い合わせ
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">注目の作品</h2>
          <Link
            to="/projects"
            className="text-sm font-medium text-indigo-500 hover:underline"
          >
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
