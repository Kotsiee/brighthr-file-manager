"use client";

import { FMFile } from "@/app/shared/contracts/FMFile";
import useFiles from "@/app/shared/hooks/useFiles";
import { Breadcrumb } from "@/app/shared/utils/directory";

// Fixed locale and time zone so server and client render the same string.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function FileManager({ rawJson }: { rawJson: string }) {
  const { files, breadcrumbs, isAtRoot, openFolder, navigateToBreadcrumb, goUp } =
    useFiles(rawJson);

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={goUp}
          disabled={isAtRoot}
          className="rounded border px-2 py-1 text-sm disabled:opacity-40"
          aria-label="Go up one folder"
        >
          ↑ Up
        </button>
        <Breadcrumbs crumbs={breadcrumbs} onNavigate={navigateToBreadcrumb} />
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-zinc-500">This folder is empty.</p>
      ) : (
        <ul className="divide-y rounded border">
          {files.map((file) => (
            <FileRow
              key={`${file.type}:${file.name}`}
              file={file}
              onOpen={() => openFolder(file.name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Breadcrumbs({
  crumbs,
  onNavigate,
}: {
  crumbs: Breadcrumb[];
  onNavigate: (index: number) => void;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => {
          const isCurrent = i === crumbs.length - 1;
          return (
            <li key={crumb.index} className="flex items-center gap-1">
              {i > 0 && <span className="text-zinc-400">/</span>}
              {isCurrent ? (
                <span aria-current="page" className="font-semibold">
                  {crumb.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(crumb.index)}
                  className="text-blue-600 hover:underline"
                >
                  {crumb.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function FileRow({ file, onOpen }: { file: FMFile; onOpen: () => void }) {
  const isFolder = file.type === "folder";

  return (
    <li className="flex items-center justify-between px-4 py-2">
      {isFolder ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 font-medium hover:underline"
        >
          <span aria-hidden>📁</span>
          {file.name}
        </button>
      ) : (
        <span className="flex items-center gap-2">
          <span aria-hidden>📄</span>
          {file.name}
          <span className="rounded bg-zinc-100 px-1.5 text-xs uppercase text-zinc-600">
            {file.type}
          </span>
        </span>
      )}
      {file.added && (
        <time className="text-sm text-zinc-500" dateTime={String(file.added)}>
          {dateFormat.format(new Date(file.added))}
        </time>
      )}
    </li>
  );
}
