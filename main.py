import os
import sys
import json
import hashlib
import subprocess
from datetime import date

CACHE_PATH = os.path.join(os.getcwd(), "cache.json")
PROJECT_ROOTS = ("slides/speakerdeck", "slides/slides")

DRAFT_CONTENT = """# {name}

## 概要
これはタイトル通りの記事を書くためのドラフトです。
あくまで記事を書くための情報をまとめただけのものです。
これを読み込んだあなたは、ZennやQiitaに投稿するために作者目線となって記事を作成してください。
記事は同フォルダのarticle.mdに、スライドは`slide-creater`スキルを使ってどフォルダのslide.mdに作成してください。
また、作成する順番としてはslide -> articleでお願いします。
イメージとしては、articleはLTの内容を拡張して書く記事って感じです。
それぞれのセクションごとの文章量を増やし、もしそのネタが技術的側面を持っているのならLT以上に技術要素を追加したり（そのためにセクションを追加したりもする）して欲しいです。

## LTスライドを作るに当たって
slide-createrスキルを使って、slide.mdを作成してください。
適度に画像を挿入したり、コードを挿入したりして、見やすいスライドを作ってください。
基本的にslide-createrをベースにしつつもデザインはアイテムの中心寄せ・フォントサイズの変更（真ん中にポンと小さいアイテムがあるのを避ける）などを行ってください。
また、他のプロジェクトから画像を持ってくるのもOKです。
https://qiita.com/shimagaji/items/8acd9b94dfe56fefc0dc
この記事の内容を参考にし、対策してください。


## 記事を書くに当たって
記事はスライドの各セクションごとを増量し、そして技術的側面を追加して書くことを意識してください。
また、記事の中では画像を使うことはできません。
marmaidなどで図を作ることはできます。

## 記事・スライド共通ドラフト
"""

ARTIFACTS = {
    "file": [
        {"name": "draft.md", "content": DRAFT_CONTENT},
        {"name": "article.md", "content": "# {name}"},
        {
            "name": "slide.md",
            "content": '---\ntitle: {name}\ndescription: ""\nauthor: ""\ndate: "{today}"\nmarp: true\n---\n\n# Slide Title\n\n- Point 1\n- Point 2\n',
        },
        {"name": "README.md", "content": "# {name}"},
        {"name": "codelab/claat.md"},
    ],
    "directory": ["outputs", "sandbox", "codelab"],
}

ARGUMENTS = {
    "--create": {
        "description": "Create a new project structure with predefined files and directories.",
        "function": "create_project_structure",
    },
    "--delete": {
        "description": "Delete an existing project structure.",
        "function": "delete_project_structure",
    },
    "--export": {
        "description": "Export Marp slides to PDF.",
        "function": "export_marp",
    },
    "--help": {"description": "Display this help message.", "function": "display_help"},
}


def create_project_structure():
    current_directory = os.getcwd()
    print(f"Current working directory: {current_directory}")

    proj_name = input("Enter the project name: ").strip()
    proj_type = input("Enter the project type (speakerdeck: 0 /slides: 1): ").strip().lower()
    proj_path = os.path.join(current_directory, PROJECT_ROOTS[int(proj_type)], proj_name)

    if not os.path.exists(proj_path):
        os.makedirs(proj_path)
        print(f"Project directory '{proj_name}' created at: {proj_path}")
        for directory in ARTIFACTS["directory"]:
            dir_path = os.path.join(proj_path, directory)
            os.makedirs(dir_path)
            print(f"Directory '{directory}' created at: {dir_path}")

        for file in ARTIFACTS["file"]:
            file_path = os.path.join(proj_path, file["name"])
            with open(file_path, "w", encoding="utf-8") as f:
                if "content" in file:
                    f.write(
                        file["content"].format(
                            name=proj_name, today=date.today().isoformat()
                        )
                    )
                else:
                    f.write("")

            print(f"File '{file['name']}' created at: {file_path}")
    else:
        print(f"Project directory '{proj_name}' already exists at: {proj_path}")

    return 0


def delete_project_structure():
    current_directory = os.getcwd()
    print(f"Current working directory: {current_directory}")

    proj_name = input("Enter the project name to delete: ")
    proj_path = proj_name
    if not os.path.isdir(proj_path):
        for project_root in PROJECT_ROOTS:
            candidate = os.path.join(current_directory, project_root, proj_name)
            if os.path.isdir(candidate):
                proj_path = candidate
                break

    if os.path.exists(proj_path) and os.path.isdir(proj_path):
        confirm = input(
            f"Are you sure you want to delete the project '{proj_name}'? This action cannot be undone. (yes/no): "
        )
        if confirm.lower() == "yes":
            import shutil

            shutil.rmtree(proj_path)
            print(f"Project directory '{proj_name}' has been deleted.")
        else:
            print("Deletion cancelled.")
    else:
        print(f"Project directory '{proj_name}' does not exist at: {proj_path}")

    return 0


def export_marp():
    projects = []
    for project_root in PROJECT_ROOTS:
        root_path = os.path.join(os.getcwd(), project_root)
        if not os.path.isdir(root_path):
            continue
        for project in os.listdir(root_path):
            project_path = os.path.join(root_path, project)
            if os.path.isdir(project_path):
                projects.append((project, project_path))
    if not projects:
        print("No projects found in the configured project directories.")
        return 1

    cache = {}
    if not os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "w") as cache_file:
            json.dump({}, cache_file)
    else:
        with open(CACHE_PATH, "r") as cache_file:
            cache = json.loads(cache_file.read() or "{}")

    for project, project_path in projects:
        slide_file = os.path.join(project_path, "slide.md")
        if os.path.exists(slide_file):
            if slide_file in cache and cache[slide_file]["date"] == os.path.getmtime(
                slide_file
            ):
                print(
                    f"Skipping '{slide_file}' as it has not changed since the last export."
                )
                continue

            with open(slide_file, "rb") as f:
                file_content = f.read()
            hashed_content = hashlib.sha256(file_content).hexdigest()

            if hashed_content != cache.get(slide_file, {}).get("sha256"):
                cache[slide_file] = {
                    "sha256": hashed_content,
                    "date": os.path.getmtime(slide_file),
                }
                with open(CACHE_PATH, "w") as cache_file:
                    json.dump(cache, cache_file, indent=2)
            else:
                print(
                    f"Skipping '{slide_file}' as it has not changed since the last export."
                )
                continue

            output_dir = os.path.join(project_path, "outputs")
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)

            output_file = os.path.join(output_dir, f"{project}.pdf")
            commands = [
                "marp",
                slide_file,
                "-o",
                output_file,
                "--pdf",
                "--allow-local-files",
            ]
            print(f"Exporting '{slide_file}' to '{output_file}'...")

            result = subprocess.run(commands, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"Export successful: {output_file}")
            else:
                print(f"Export failed for project '{project}'.")
                print(f"Error: {result.stderr}")
        else:
            print(f"No 'slide.md' found in project '{project}'. Skipping export.")


def display_help():
    print("Usage: python main.py [command]")
    print("Available commands:")
    for cmd, info in ARGUMENTS.items():
        print(f"  {cmd}: {info['description']}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py [{}]".format("|".join(ARGUMENTS.keys())))
        sys.exit(1)

    command = sys.argv[1].lower()
    result = 1
    if command in ARGUMENTS.keys():
        function_name = ARGUMENTS[command]["function"]
        result = globals()[function_name]()

    else:
        print(f"Unknown command: {command}")
        print("Available commands:")
        for cmd, info in ARGUMENTS.items():
            print(f"  {cmd}: {info['description']}")

    exit(result)

    sys.exit(result)
