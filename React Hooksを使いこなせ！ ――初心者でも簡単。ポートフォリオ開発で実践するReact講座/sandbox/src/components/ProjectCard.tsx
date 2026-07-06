import { Link } from "react-router-dom";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700"
    >
      <div
        className={`h-32 w-full bg-gradient-to-br ${project.color} flex items-center justify-center text-3xl font-bold text-white/90`}
      >
        {project.title.slice(0, 1)}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {project.title}
        </h3>
        <p className="flex-1 text-sm text-slate-500 dark:text-slate-400">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
