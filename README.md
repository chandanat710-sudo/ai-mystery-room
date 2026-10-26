# AI Mystery Room

AI Mystery Room turns a fictional premise into an interactive detective case. All cases and evidence are fictional and AI-generated. Gemini is called only by the server.

## Requirements

- Node.js 20 or newer and npm
- MongoDB, running locally or available through a hosted connection string
- A Gemini API key for live generation

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Set `GEMINI_API_KEY`, `MONGODB_URI`, and `GEMINI_MODEL` in `.env`. The default model is `gemini-3.8-flash`; model availability depends on the Google AI account. `GEMINI_TIMEOUT_MS` controls the per-attempt request timeout (default 120000). Never put the key in a `VITE_*` variable. If your system DNS resolver refuses MongoDB Atlas SRV lookups, set the optional `MONGODB_DNS_SERVERS` to a comma-separated DNS resolver IP (for example `8.8.8.8`) that your network permits. This sends DNS queries to that resolver instead of the system default.

```powershell
npm run dev
npm run lint
npm test
npm run build
```

The client runs at <http://localhost:5173> and the API at <http://localhost:5000>. MongoDB must be reachable before the server starts. There is no mock generation mode.

## Architecture

- `client/`: React + TypeScript + Vite investigation UI.
- `server/`: Express API, Zod validation, Gemini generation, Mongoose persistence, verdict logic.
- `docs/api.md`: API routes and response contract.
- `docs/decisions.md`: implementation choices and MVP limitations.

Cases expire 24 hours after creation. Generation and accusation have process-local rate limits. Premise safety screening uses a conservative keyword heuristic; it is not a complete moderation system. Images and audio are accessible descriptive cards/transcripts, not generated media.
