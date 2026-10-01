# Firebase storage setup

The website stays on GitHub Pages. Firestore stores scripts; Firebase Authentication controls the single administrator. GitHub tokens and a separate Worker are not required.

1. Create/select a Firebase project and register a Web app.
2. Create the default Cloud Firestore database in production mode. Choose its location deliberately; it cannot be changed later.
3. Enable Authentication > Email/Password. Create the administrator user in the console and choose its password there, not in chat or source files.
4. Publish the rules in `firestore.rules`. These allow public script reads and admin-only create/delete by the configured synthetic email. Existing scripts cannot be edited, even by the admin through the website.
5. Copy the Web app's public configuration into `firebase-config.json`, following `firebase-config.example.json`. Set `adminEmail` to the Authentication user's email. The email and Firebase web configuration are public; the password and any service-account private keys must never be placed here.
6. Add `zunzunzunnn.github.io` to Authentication > Settings > Authorized domains.
7. After configuration and rules are verified, switch the website to the Firebase UI and publish it. Preserve `scripts.json` as a backup; import its existing scripts into Firestore once as admin.

The admin UI asks only for the password. Firebase manages the session within the browser tab/session. Access is enforced by Firestore rules, not by hiding buttons.

The Firebase adapter is staged and is not active until the project and admin setup are complete. Existing GitHub storage remains live meanwhile.

