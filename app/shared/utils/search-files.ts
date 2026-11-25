import { FMFile } from "../contracts/FMFile";

export default function searchFiles(
  currentDirectory: FMFile[],
  query: string,
): FMFile[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return currentDirectory;
  }

  return flattenAndSearch(currentDirectory, normalizedQuery);
}

function flattenAndSearch(nodes: FMFile[], normalizedQuery: string): FMFile[] {
  const results: FMFile[] = [];

  for (const node of nodes) {
    const isMatch = node.name.toLowerCase().includes(normalizedQuery);

    if (node.type === "folder") {
      if (isMatch) {
        results.push(node);
      }

      if (Array.isArray(node.files)) {
        results.push(...flattenAndSearch(node.files, normalizedQuery));
      }
    } else if (isMatch) {
      results.push(node);
    }
  }

  return results;
}
