import os

ARTIFACTS = {
    "file": [
        "article.md",
        "slide.md",
        "README.md",
        "codelab/claat.md"
    ],
    "directory": [
        "outputs",
        "sandbox",
        "codelab"
    ]
}

def main():
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
            file_path = os.path.join(proj_path, file)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("")

            print(f"File '{file}' created at: {file_path}")
    else:
        print(f"Project directory '{proj_name}' already exists at: {proj_path}")

    return 0

if __name__ == "__main__":
    exit(main())