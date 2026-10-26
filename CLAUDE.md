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

## Product constraints (intentional; keep them)

These are the spec, not missing features:
- No authentication or user management.
- Requests are immutable: no edit or delete. Stored objects are `Object.freeze`d, and there are no PUT, PATCH or DELETE routes.
- The list has no search, filters or status tracking.

## Activity log (project memory)

`project-memory/index.html` is the project's activity log, written in Hebrew. After every task that changes something, add a new `<li class="entry">` at the top of `ol.log`, following the template comment in the file. Each entry has a title, a type tag (`feature`/`setup`/`infra`/`docs`), the date and the commit hash when known, plus a few short factual bullets. Update the overview card when project facts change. Read it at the start of a session to see what has happened so far.

A local Stop hook (`.claude/settings.local.json` → `.claude/hooks/auto-sync.sh`) commits every change and pushes it to `origin` at the end of each turn, so you don't need to commit by hand.
