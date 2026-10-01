# Expression Shelf

A minimal glassmorphism library for Adobe After Effects expressions, in an After Effects inspired purple palette.

## Features

- Cards with a fixed decorative code thumbnail, title, Copy, Code, and Delete actions.
- Add dialog with title and expression fields, Save and Cancel.
- Read-only code dialog; existing scripts cannot be edited.
- Delete confirmation with cancellation focused by default.
- Exact clipboard copying, responsive layout, keyboard-accessible dialogs, reduced-motion support.
- Three starter expressions: wiggle position, loop, and rotation.

## Storage

The current implementation uses browser-local storage under `expression-shelf.v1`. Collections are specific to the browser and website origin; they are not synchronized between devices or committed to GitHub. Clearing browser data removes saved scripts. Storage failures keep form contents intact and show an error.

## Hosting

No build step or dependencies are required. Publish this directory as the root of a GitHub Pages repository. In Settings > Pages, choose Deploy from a branch, main, and / (root).

For local preview, run a static HTTP server in this directory. HTTPS or localhost is needed for Clipboard API access.

## Checks performed

Verified add, reload persistence, exact clipboard content, read-only code view, cancel deletion, confirm deletion, and responsive layout at 390px in a browser.

