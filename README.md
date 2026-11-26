# BrightHR File Manager

A single page application for viewing documents that an administrator has previously uploaded. It shows a list of folders and files: each file shows its type, name and date added, and each folder is clearly marked as a clickable container rather than a file.

Built with Next.js, React, TypeScript and CSS, using local mock data instead of an API.

## Getting started

### Prerequisites

- Node.js 20 or later
- npm

### Run the application

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Run the tests

```bash
npm test
```

<!-- TODO: confirm once the test runner is set up -->

### Other scripts

| Command         | Purpose                         |
| --------------- | ------------------------------- |
| `npm run build` | Production build                |
| `npm start`     | Serve the production build      |
| `npm run lint`  | Lint the codebase with ESLint   |

## Features

From the brief's optional features, this solution covers all three:

- **Open a folder** to see its contents
- **Sort** by name or date
- **Filter** by filename

Plus:

- **Search bar** that searches the current folder and all of its subfolders
- **File type filter** dropdown (PDF, CSV, DOC, MOV, folder)
- **Sort type** dropdown with a button to flip the sort direction
- **Grid and list views**, switched from the toolbar
- **Item selection**, single and multi-select
- **File tree** side panel for moving between folders
- **Mobile first**, responsive layout

## Design

### Visual style

The look and feel follows BrightHR's own colour scheme and styling, taken from its website and other public material:

| Element              | Style                                            |
| -------------------- | ------------------------------------------------ |
| Primary colour       | Blue                                             |
| Secondary colour     | Pink                                             |
| Background           | White                                            |
| Panels and cards     | Very subtle corner radius and a subtle drop shadow |
| Buttons              | Slightly larger corner radius than panels        |
| Primary action       | Solid fill with white text                       |
| Secondary action     | Outline only, with text in the same colour       |

Because this is a file manager, the layout also draws on Windows File Explorer and similar file manager designs found on Dribbble and Awwwards.

### Layout

The aim is simplicity, staying close to the brief. As a single page app with no other pages or tools to reach, the whole screen is given to the file manager:

- **Header:** a fixed toolbar holding the search bar, filter tools, sort tools and the grid/list view switcher.
- **Side panel:** a file tree of the folder structure.
- **Main body:** the files and folders in the current folder, shown as a grid of cards or as a list.

### Figma designs

The layout was designed in Figma before it was built.

#### Desktop

![Desktop design](images/Desktop%20Design.png)

#### Mobile

| Grid view | List view |
| --------- | --------- |
| ![Mobile design, grid view](images/Mobile%20Design%20Grid.png) | ![Mobile design, list view](images/Mobile%20Design%20List.png) |

## Assumptions

- The data is read-only: files and folders cannot be renamed, added or deleted.
- The only file types are PDF, CSV, DOC and MOV.
- Folders always have the type `folder`.
- Files cannot actually be opened, viewed or downloaded.
- The time a file was added is always 00:00:00, so only the date is shown.
- Search covers the current folder and all of its subfolders, but not its parent folders.
- Folders are searchable as well as files: the folder tree is flattened before searching.

## Out of scope

Left out to keep the task focused on the brief:

- A preview page or modal for each file
- Kebab and context menus (download, delete, upload, create folder, open)
- A properties panel
- Role based access control
- Password protection
- Uploading files and folders
- Zooming the view in and out
- Searching within the file tree
- Coloured folders, custom illustrations and custom icons

### How I would approach these given more time

- **File preview:** add a route or modal that takes a file's id, and render the preview by type (an embedded PDF viewer, a `<video>` element for MOV, a table for CSV).
- **Context menus and file actions:** one shared menu component, opened from a kebab button or a right-click, with actions that call an API. Destructive actions would ask for confirmation first.
- **Properties panel:** a collapsible side panel showing metadata for the selected item, driven by the selection state that already exists.
- **Uploading:** a drop zone plus a file input, with client-side checks on type and size, posting to an upload endpoint and showing progress for each file.
- **Role based access control and password protection:** enforce permissions on the server, and have the API return only the items a user may see, along with the actions they may take. The UI would then hide or disable actions based on that, but never be the only check.
- **File tree search:** reuse the same filter logic as the main search, and expand the tree to show the matching branches.
- **Zoom:** a size control that changes the card size in grid view, stored as a user preference.

## Use of AI

AI tools did not decide the style or functionality of this solution. I used them as a productivity tool, to write the logic I described faster than I could type it. I wrote the documentation myself, then used AI to refine it for clarity.
