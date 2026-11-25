import FileManager from "./features/file-manager/FileManager";
import files from "./shared/data/files.json";

export default function Home() {
  return <FileManager rawJson={JSON.stringify(files)} />;
}
