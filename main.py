import os
import sys

ARTIFACTS = {
    "file": [
        {"name": "article.md"},
        {"name": "slide.md", "content": "---\ntitle: {name}\"\"\ndescription: \"\"\nauthor: \"\"\ndate: \"\"\nmarp: true\n---\n\n# Slide Title\n\n- Point 1\n- Point 2\n"},
        {"name": "README.md", "content": "# {name}"},
        {"name": "codelab/claat.md"}
    ],
    "directory": [
        "outputs",
        "sandbox",
        "codelab"
    ]
}

def create_project_structure():
    current_directory = os.getcwd()
    print(f"Current working directory: {current_directory}")

    proj_name = input("Enter the project name: ")
    proj_path = os.path.join(current_directory, proj_name)

    if not os.path.exists(proj_path):
        os.makedirs(proj_path)
        print(f"Project directory '{proj_name}' created at: {proj_path}")
        for directory in ARTIFACTS["directory"]:
            dir_path = os.path.join(proj_path, directory)
            os.makedirs(dir_path)
            print(f"Directory '{directory}' created at: {dir_path}")

        for file in ARTIFACTS["file"]:
            file_path = os.path.join(proj_path, file["name"])
            with open(file_path, 'w', encoding='utf-8') as f:
                if "content" in file:
                    f.write(file["content"].format(name=proj_name))
                else:
                    f.write("")

            print(f"File '{file['name']}' created at: {file_path}")
    else:
        print(f"Project directory '{proj_name}' already exists at: {proj_path}")

    return 0

def export_marp():
    projects = [d for d in os.listdir('.') if os.path.isdir(d)]
    if not projects:
        print("No projects found in the current directory.")
        return 1
    
    for project in projects:
        project_path = os.path.join(os.getcwd(), project)
        slide_file = os.path.join(project_path, "slide.md")
        if os.path.exists(slide_file):
            output_dir = os.path.join(project_path, "outputs")
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            output_file = os.path.join(output_dir, f"{project}.pdf")
            command = f'marp "{slide_file}" -o "{output_file}"'
            print(f"Exporting '{slide_file}' to '{output_file}'...")
            result = os.system(command)
            if result == 0:
                print(f"Export successful: {output_file}")
            else:
                print(f"Export failed for project '{project}'.")
        else:
            print(f"No 'slide.md' found in project '{project}'. Skipping export.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py [create|export]")
        sys.exit(1)

    command = sys.argv[1].lower()
    result = 0
    if command == "--create":
        result = create_project_structure()
    elif command == "--export":
        result = export_marp()
    
    sys.exit(result)