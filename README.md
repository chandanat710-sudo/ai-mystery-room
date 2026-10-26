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

Set `GEMINI_API_KEY`, `MONGODB_URI`, and `GEMINI_MODEL` in `.env`. Choose a model available to your Google AI account. `GEMINI_TIMEOUT_MS` controls the per-attempt request timeout (default 120000). Never put the key in a `VITE_*` variable. If your system DNS resolver refuses MongoDB Atlas SRV lookups, set the optional `MONGODB_DNS_SERVERS` to a comma-separated DNS resolver IP (for example `8.8.8.8`) that your network permits. This sends DNS queries to that resolver instead of the system default.

```powershell
npm run dev
npm run lint
npm test
npm run build
```

The client runs at <http://localhost:5173> and the API at <http://localhost:5000>. MongoDB must be reachable before the server starts. There is no mock generation mode.

## Deploy to Render

This repository includes a `render.yaml` Blueprint. It deploys the Express API and serves the built React app from the same Render web service. The browser uses the same origin for the API, so no separate client deployment or production API URL is needed.

### 1. Push the project to GitHub

Commit and push the project to a GitHub repository that Render can access. Keep `.env` out of Git; it contains local credentials and is ignored by `.gitignore`.

### 2. Prepare MongoDB Atlas

Create an Atlas cluster and a database user for this app. Copy the cluster connection string, replace its password placeholder, and include the database name (for example, `mystery_room`). Use a separate database user with only the permissions this app needs.

Atlas only accepts connections from addresses in the project's IP access list. After the Render web service is created, find its outbound IP ranges under **Connect → Outbound** and add those ranges to Atlas. If you use a temporary broad access entry while setting up, replace it with the Render ranges once you have them. Atlas documents its [IP access list](https://www.mongodb.com/docs/atlas/security/ip-access-list/); Render documents [outbound IP ranges](https://render.com/docs/outbound-ip-addresses).

### 3. Create the Render service

In Render, choose **New → Blueprint**, connect the GitHub repository, and select the branch to deploy. Render reads `render.yaml`; accept the `ai-mystery-room` web service and set the requested secret values when prompted. The Blueprint builds with `npm ci && npm run build`, starts with `npm start`, and checks `/api/v1/health`.

Set these environment variables in Render:

- `MONGODB_URI`: the Atlas connection string.
- `GEMINI_API_KEY`: a server-side Gemini API key.
- `GEMINI_MODEL`: a model name available to that key.
- `NODE_ENV`: set by the Blueprint to `production`.

Never add API keys to a `VITE_*` variable or commit them to `render.yaml`, GitHub, or `.env.example`.

### 4. Deploy and check the app

Wait for the deployment to complete. Open the service's `onrender.com` URL; the landing page should load. Check `<your-service-url>/api/v1/health` and confirm it returns `{"status":"ok"}`. Then generate a short fictional case to verify MongoDB and Gemini access together. If startup fails, review the Render service logs for a missing environment variable, MongoDB authentication error, or Atlas IP access-list rejection.

Render's free web services spin down after inactivity and can take about a minute to wake up. Free plans are intended for hobby projects and previews, and have resource and usage limits; check [Render's current free plan details](https://render.com/docs/free) before relying on this for production traffic.

### 5. Publish updates

Push changes to the connected branch. Render automatically rebuilds and deploys the service. You can also add a custom domain from the service's **Settings** page.

## Architecture

- `client/`: React + TypeScript + Vite investigation UI.
- `server/`: Express API, Zod validation, Gemini generation, Mongoose persistence, verdict logic.
- `docs/api.md`: API routes and response contract.
- `docs/decisions.md`: implementation choices and MVP limitations.

Cases expire 24 hours after creation. Generation and accusation have process-local rate limits. Premise safety screening uses a conservative keyword heuristic; it is not a complete moderation system. Images and audio are accessible descriptive cards/transcripts, not generated media.
