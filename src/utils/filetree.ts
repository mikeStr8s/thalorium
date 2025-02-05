export type FileTree = Map<string, FileTree | null>; // null represents a file, while a Map represents a folder

export function buildFileTree(filePaths: string[]): FileTree {
  const root: FileTree = new Map();

  for (const filePath of filePaths) {
    // Split the file path into parts (folders and file)
    const parts = filePath.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // If this is the last part, it's a file
      if (i === parts.length - 1) {
        currentLevel.set(part, null); // Mark as file
      } else {
        // If the folder doesn't exist, create it
        if (!currentLevel.has(part)) {
          currentLevel.set(part, new Map());
        }
        // Move into the folder
        currentLevel = currentLevel.get(part) as FileTree;
      }
    }
  }

  return root;
}
