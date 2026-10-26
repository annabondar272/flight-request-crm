# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`: install dependencies (Express is the only one).
- `npm start`: run the server at http://localhost:3000. Set `PORT` to change the port.

There is no build step, linter or test suite. To verify a change, start the server and exercise the API with `curl` (an example POST body is in `README.md`), then load the page in a browser. On this Windows machine, a shell opened before Node was installed may need its PATH refreshed before `node`/`npm` resolve.

## Architecture

An educational CRM for airline booking requests. `server.js` is the whole backend; `public/` is served statically and talks to the backend only through the JSON API.

- **Storage**: a module-level `requests` array plus a `nextId` counter in `server.js`. Data is lost on restart by design. Don't add a database or file persistence.
- **API**: only `GET /api/requests` (newest first) and `POST /api/requests`. Validation happens server-side in the POST handler: all six fields are required, `passengers` is an integer from 1 to 9, `departureDate` is `YYYY-MM-DD`, and origin ≠ destination (case-insensitive). Errors return `400` with `{ error }`, which the frontend shows as-is.
- **Frontend**: `public/index.html` (Tailwind via the Play CDN, so there's no Tailwind build or config) and `public/app.js` (vanilla JS). Form input `name` attributes must match the API field names (`customerName`, `phone`, `origin`, `destination`, `departureDate`, `passengers`), because the form is serialized with `Object.fromEntries(new FormData(form))`.
- **Rendering**: list items are built with `document.createElement` and `textContent` (the `el()` helper) to avoid XSS. Don't switch to `innerHTML` with user data.

## Required workflow

1. **Check outputs after every execution.** After running a command, script or server change, read the actual output before moving on: the exit code, the response bodies and status codes, the files written. Don't report success from the command alone. If the output differs from what was expected, fix the problem or report it as it is.
2. **Security-review new or changed code.** After writing or modifying code, run the `security-review` skill (`/security-review`) on the changes before finishing the task. Fix real findings, and note in the activity log what was checked and what was found. The auto-sync hook commits at the end of the turn and `security-review` reviews pending changes, so run it **before** the turn ends.

## Product constraints (intentional; keep them)

These are the spec, not missing features:
- No authentication or user management.
- Requests are immutable: no edit or delete. Stored objects are `Object.freeze`d, and there are no PUT, PATCH or DELETE routes.
- The list has no search, filters or status tracking.

## Activity log (project memory)

`project-memory/index.html` is the project's activity log, written in Hebrew. After every task that changes something, add a new `<li class="entry">` at the top of `ol.log`, following the template comment in the file. Each entry has a title, a type tag (`feature`/`setup`/`infra`/`docs`), the date and the commit hash when known, plus a few short factual bullets. Update the overview card when project facts change. Read it at the start of a session to see what has happened so far.

## Branches

- `dev` is the development branch. Do all work there.
- `main` is the stable branch. It changes only when the user asks to merge `dev` into it.
- Before starting work, confirm with `git branch --show-current` that `dev` is checked out.

## Auto-sync to GitHub

A Stop hook in `.claude/settings.local.json` runs `.claude/hooks/auto-sync.sh` at the end of every turn. If the tree is dirty, the script runs `git add -A`, makes a commit named `Auto-sync: <date time>`, and runs `git push origin HEAD`, which pushes the current branch (normally `dev`).
- Don't commit by hand unless a meaningful commit message is wanted.
- The hook commits after the turn ends, so the current log entry can't include its own hash. On the next turn, fill in the previous entry's hash from `git log`.
- `git add -A` stages everything and the repo is **public**. Keep secrets and local data out of the tree, or add them to `.gitignore` first.
- `settings.local.json` is gitignored, so a fresh clone has the script but not the hook. To enable it there, recreate the file.
