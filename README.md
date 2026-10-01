# Expression Shelf

A minimal After Effects expression library with glass cards, Add, Copy, read-only Code, and confirmed Delete.

## Firebase storage

Scripts are stored in Cloud Firestore, so the collection is available across devices. Reading and copying are public. Adding and deleting require the single Firebase admin account configured in `firebase-config.json` and the Firestore rules.

The website asks only for the admin password and keeps the login for the current browser tab. The password is handled by Firebase Authentication and is never stored in this repository. Firestore rules enforce public reads, admin-only creates/deletes, and no edits.

After the first admin login, use **Salin koleksi lama ke Firebase** once to copy the bundled examples from `scripts.json` and any older browser-only collection. Existing IDs are not duplicated.

## Hosting

No build step. GitHub Pages: Deploy from a branch > main > / (root).

## Firebase setup

See `FIREBASE_SETUP.md` for Authentication, Firestore rules, and admin setup.

