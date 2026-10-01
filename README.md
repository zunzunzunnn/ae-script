# Expression Shelf

A minimal After Effects expression library with glass cards, Add, Copy, read-only Code, and confirmed Delete.

## GitHub storage

The source of truth is scripts.json in zunzunzunnn/ae-script on main. The page reads it directly from the GitHub API on every load, so saved scripts are available across devices. Scripts are public because this repository is public.

Reading and copying require no login. To add or delete:

1. Create a fine-grained token at https://github.com/settings/personal-access-tokens/new.
2. Select only ae-script, set an expiry, and grant Contents: Read and write.
3. Click Hubungkan GitHub on the website and enter the token there. Never commit it or send it in chat.

The token exists only in page memory and is sent only to api.github.com. Reloading or disconnecting clears it. Tokens are never saved in browser storage, URLs, or repository files. Codex's GitHub connection is separate from the website connection.

Save and Delete create commits using the latest file SHA. Conflicts reload and merge fresh data; scripts added on other devices are preserved. Repeating a save does not duplicate an already saved expression. Failed saves keep the form intact. The collection limit is 950 KB.

Old browser-only collections can be published with Salin koleksi browser ke GitHub after confirmation. Their local originals remain untouched.

## Hosting

No build step. GitHub Pages: Deploy from a branch > main > / (root).

## Tests

Run node --test --test-isolation=none github-store.test.mjs for Unicode, anonymous access, concurrent saves, idempotency, deletion, permission failures, invalid data, and disconnect tests.

Reference: https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents

