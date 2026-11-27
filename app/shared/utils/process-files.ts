import { FMFile } from "../contracts/FMFile";

export default function processFiles(rawJson: string): FMFile[] {
  const parsed = JSON.parse(rawJson);
  return mapNodes(parsed);
}

function mapNodes(nodes: any[]): FMFile[] {
  return nodes.map((file) => {
    if (Array.isArray(file.files)) {
      return {
        ...file,
        added: file.added ? new Date(file.added) : undefined,
        files: mapNodes(file.files),
      };
    }
    return file;
  });
}
