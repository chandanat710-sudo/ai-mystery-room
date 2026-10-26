# API

Base path: `/api/v1`

- `GET /health` → `{ "status": "ok" }`
- `POST /cases` accepts `{ premise, difficulty, theme }`; returns a spoiler-safe case with status 201.
- `GET /cases/:caseId` returns an active spoiler-safe case.
- `POST /cases/:caseId/accusation` accepts `{ suspectId }`; returns the final verdict. Repeated requests return the same stored result.

Errors use `{ "error": { "code": "...", "message": "..." } }`. Active cases never include the canonical culprit, solution, hidden clue significance, or prompt.
