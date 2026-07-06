import projectsData from "../data/projects.json";
import type { Project } from "../types";

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
}

// TODO: [カスタムフック] この関数を「フェッチっぽい」非同期処理に作り替えるのが今回の課題。
// 手順:
//  1. useState で projects: Project[]（初期値は空配列）と isLoading: boolean（初期値 true）を用意する
//  2. useEffect の中で setTimeout(() => { ...setProjects(projectsData); setIsLoading(false) }, 600) のように
//     「本物のfetch」を疑似的に再現する（依存配列は [] でOK）
//  3. useEffect の中で作ったタイマーは、クリーンアップ関数で clearTimeout して片付ける
//  4. { projects, isLoading } を return する
//
// 今はまだ何もしていないので、常に「読み込み中でない全件」が返る。
export function useProjects(): UseProjectsResult {
  return {
    projects: projectsData as Project[],
    isLoading: false,
  };
}
