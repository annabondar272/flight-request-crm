# Flight Request CRM

A simple educational CRM for airline ticket booking requests. Agents can create flight requests and see them in a list.

## Features
- **Create Flight Request:** customer name, phone, origin, destination, departure date, number of passengers (1–9).
- **View Requests List:** every request, newest first (no search, filters or status).
- **In-memory storage:** data lives in a server-side array and is lost when the server restarts.
- **Open access:** no login or user management.
- **View-only:** requests can't be edited or deleted. The API has no update or delete routes.

## Project structure
```
crm/
├── package.json
├── server.js          # Express server + in-memory store + REST API
├── public/
│   ├── index.html     # UI (Tailwind CSS via CDN)
│   └── app.js         # Vanilla JS: submit form, render list
└── README.md
```

## Run locally
Prerequisite: [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install
npm start
```

Then open http://localhost:3000. To use a different port, set the `PORT` environment variable.

## API
| Method | Path            | Description                 |
|--------|-----------------|-----------------------------|
| GET    | `/api/requests` | List all requests           |
| POST   | `/api/requests` | Create a request (JSON body) |

Example:
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Jane Doe","phone":"+1 555 0100","origin":"JFK","destination":"LHR","departureDate":"2026-12-01","passengers":2}'
```
