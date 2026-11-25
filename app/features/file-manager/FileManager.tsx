"use client";

import { FMFile } from "@/app/shared/contracts/FMFile";
import useFiles from "@/app/shared/hooks/useFiles";
import { Breadcrumb } from "@/app/shared/utils/directory";

export default function FileManager({ rawJson }: { rawJson: string }) {
  const {
    files,
    breadcrumbs,
    isAtRoot,
    openFolder,
    navigateToBreadcrumb,
    goUp,
  } = useFiles(rawJson);

  return <div></div>;
}
