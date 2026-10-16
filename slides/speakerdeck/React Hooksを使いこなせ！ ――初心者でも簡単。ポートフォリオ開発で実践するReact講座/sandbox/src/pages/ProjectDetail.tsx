import { Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { LikeButton } from "../components/LikeButton";

export function ProjectDetail() {
  const { projects } = useProjects();

  // TODO: [useParams] URL の :id を受け取って、該当プロジェクトを表示したい。
  // import { useParams } from "react-router-dom";
  // const { id } = useParams();
  // const project = projects.find((p) => p.id === id);
  // 今は常に先頭のプロジェクトが表示される。
  const project = projects[0];

  // TODO: [useNavigate] 「一覧に戻る」ボタンを実装しよう。
  // import { useNavigate } from "react-router-dom";
  // const navigate = useNavigate();
  // onClick={() => navigate(-1)} （ひとつ前の画面に戻る）

  if (!project) {
    return <p className="text-slate-500">プロジェクトが見つかりませんでした。</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <button
        type="button"
        onClick={() => console.log("TODO: navigate(-1) を呼ぼう")}
        className="w-fit text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white"
      >
        ← 一覧に戻る
      </button>

      <div
        className={`h-48 w-full rounded-2xl bg-gradient-to-br ${project.color}`}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {project.summary}
          </p>
        </div>
        <LikeButton initialCount={project.likes} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
        {project.description}
      </p>

      <div className="flex gap-3">
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          デモを見る
        </a>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
        >
          リポジトリ
        </a>
      </div>

      <Link
        to="/projects"
        className="text-sm text-indigo-500 hover:underline"
      >
        他の作品も見る →
      </Link>
    </div>
  );
}
