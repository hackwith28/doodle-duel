Drop your audio files here:

- one.mp3 — background music for the Game page
- two.mp3 — background music for Home and Lobby pages

Example filenames:

- one.mp3
- two.mp3

Note: The client expects these paths at runtime: `/assets/one.mp3` and `/assets/two.mp3`.

If you still hear the *old* music after replacing the files, try the following:
- Hard-refresh the browser (Ctrl+Shift+R or Ctrl+F5) to clear cached assets.
- Verify the uploaded files are named exactly `one.mp3` and `two.mp3` and placed in `client/public/assets/`.
- Check the browser console (DevTools) for logs:
  - Game page logs: `[client] loaded audio for Game:` and `[client] background music playing — source:`
  - Home/Lobby logs: `[client] loaded audio for Home:` / `[client] loaded audio for Lobby:` and their corresponding `...playing — source:` logs.

If the console shows the old file URL, clear browser cache and reload — I can also add a versioned query string to force-refresh clients automatically if you'd like.
