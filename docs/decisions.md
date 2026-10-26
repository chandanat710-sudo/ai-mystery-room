# Implementation decisions

- Use npm workspaces so root commands orchestrate the React/Vite client and Express/TypeScript server.
- Use `@google/genai` and the configurable `GEMINI_MODEL`; current Google model docs list `gemini-3.8-flash` as a stable general-purpose model. No model calls occur in the browser.
- Use Zod for API and generated-output validation. Generation attempts one repair prompt after a schema or reference validation failure.
- Store the complete case in MongoDB. Public serializers explicitly allowlist fields; `clueSignificance` is included only in the stored record and verdict response.
- Repeated valid accusations return the already stored result. This makes retries safe and avoids changing a final answer.
- Enforce the documented 24-hour case lifetime in application queries. No TTL index is used, so expiration behavior does not depend on background deletion timing.
- Use an in-memory IP rate limiter for the MVP; limits reset on server restart and are not shared across multiple server instances.
- Image evidence is rendered as a text-based visual card, and audio evidence as a transcript. No generated binary media is claimed.
- Unsafe-premise screening is a conservative keyword heuristic, not a moderation model; this limitation is documented for the MVP.
