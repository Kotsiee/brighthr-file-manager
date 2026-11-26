import { Option } from "../contracts/Option";

/** Filter choices: everything, or one of the file types in the data (and in public/icons/). */
export const FILE_TYPE_OPTIONS: Option[] = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "DOC" },
  { value: "csv", label: "CSV" },
  { value: "mov", label: "MOV" },
];

export const isFileTypeOption = (value: unknown): value is string =>
  FILE_TYPE_OPTIONS.some((option) => option.value === value);
