import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "../components/ProjectCard";
import { SearchBar } from "../components/SearchBar";
import { Loading } from "../components/Loading";

export function Projects() {
  const { projects, isLoading } = useProjects();

  // TODO: [useState] 検索ワードを状態にする
  // const [searchText, setSearchText] = useState("");
  const searchText = "";

  // TODO: [useMemo] searchText か projects が変わったときだけ絞り込みを計算し直す
  // useMemo(
  //   () =>
  //     projects.filter(
  //       (p) =>
  //         p.title.includes(searchText) ||
  //         p.tags.some((tag) => tag.includes(searchText))
  //     ),
  //   [projects, searchText]
  // );
  const filteredProjects = projects.filter(
    (p) =>
      p.title.includes(searchText) ||
      p.tags.some((tag) => tag.includes(searchText)),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Projects</h1>
        <p className="text-slate-500 dark:text-slate-400">
          これまでに作った個人開発アプリ一覧です。
        </p>
      </div>

      <SearchBar
        value={searchText}
        onChange={() => {
          // TODO: setSearchText(value) に差し替える（今は入力しても反映されない）
          console.log("TODO: setSearchText を実装しよう");
        }}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
