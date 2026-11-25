import { FMFile } from "../contracts/FMFile";

export function filterFilesByType(files: FMFile[], type: string): FMFile[] {
  return files.filter((file) => file.type === type);
}
