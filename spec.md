AI Mystery Room — Product & Engineering Specification

Document type: Single source of truth for Codex / spec-driven development
Version: 1.0
Status: MVP specification
Product name: AI Mystery Room

Implementation rule: Treat this document as the canonical product and engineering contract. If implementation choices are not specified, prefer the simplest secure, maintainable option that meets the requirements below. Do not silently add features outside MVP. Record material deviations in docs/decisions.md.

1. Product overview

AI Mystery Room is a web application where a user submits a short fictional scenario or story premise. The application uses Google Gemini to create a self-contained fictional investigation. The user explores AI-generated evidence—such as chat messages, images, and audio recordings—then selects the culprit and receives a result with an explanation grounded in the evidence.

The experience should feel like an interactive detective case, not a generic chatbot.

Product goals

Turn a short premise into a coherent, solvable mystery.

Present clues in a convincing, readable investigation workspace.

Let users inspect evidence before making a final accusation.

Make the reveal explain how the evidence supports the culprit.

Clearly label all generated content as fictional and AI-generated.

Non-goals for MVP

Real-world investigations or accusations about real people.

User accounts, profiles, social features, leaderboards, or payments.

Live multiplayer or collaborative cases.

Uploading user photos, recordings, or private messages as evidence.

Training or fine-tuning a model.

Unrestricted free-form AI chat with suspects.

Real WhatsApp integration, phone-call access, or actual voice-call recording.

Guaranteed photorealistic image generation through Gemini. Use an image-generation provider only if one is explicitly configured and supported; otherwise provide a designed visual evidence card or a clearly labelled illustrative placeholder.

2. Target users and core user journey

Primary user

A person who enjoys detective stories, escape rooms, puzzle games, and interactive fiction.

Main flow

User opens the landing page.

User enters a short fictional premise and optionally chooses difficulty and theme.

Client validates the input and submits it to the backend.

Backend asks Gemini to create a mystery using a strict structured schema.

Backend validates consistency and solvability, then stores the case.

User enters the case room and browses the case briefing, suspects, and evidence.

User can open evidence items and mark clues as reviewed.

User selects one suspect as the culprit and submits a final accusation.

Backend checks the answer and returns a verdict plus a spoiler-safe explanation.

User can restart / create another mystery.

User stories

As a player, I can turn a short story premise into a mystery case.

As a player, I can understand the objective and rules before investigating.

As a player, I can inspect evidence items one at a time.

As a player, I can compare suspects and their motives/opportunities.

As a player, I can make one final accusation and see whether it is correct.

As a player, I can read an explanation linking evidence to the solution.

As a player, I can recover gracefully when generation fails or takes too long.

3. MVP scope and acceptance criteria

Must-have

Responsive landing page with premise form.

Difficulty selector: Easy, Medium, Hard.

Theme selector: Auto, Crime, Theft, Sabotage, Missing Object, Secret/Deception. These are fictional story genres, not real-world investigative tools.

Case generation through Gemini on the server only.

Case room with case summary, suspects, evidence list, evidence detail viewer, and accusation form.

Evidence types: chat transcript, written document, image/visual clue, and audio transcript. Actual playable audio is optional and must not be faked as a real recording.

Correct/incorrect verdict state and explanation.

Loading, empty, error, and retry states.

Mobile and desktop support.

Persistent case state in MongoDB.

Input validation, output validation, and basic abuse protection.

Automated tests for core validation and verdict logic.

Acceptance criteria

A valid premise between 30 and 800 characters can be submitted.

Invalid or empty premises are rejected with a helpful message.

Gemini API key is never exposed to the browser or committed to source control.

A successful generation returns a case with 3–5 suspects and 5–8 evidence items.

Every case has exactly one canonical culprit ID.

Every suspect and evidence item has a stable unique ID within its case.

The solution must be inferable from the evidence; the explanation must cite at least two evidence IDs.

No evidence item contradicts the canonical solution unless the contradiction is deliberately explained as a red herring.

The player cannot submit a suspect ID that does not belong to the case.

A verdict is calculated by the backend, never trusted from client-side state.

The canonical culprit is not returned by the public case endpoint before an accusation is submitted.

API failures show a useful message and do not lose the user's entered premise.

Layout remains usable at 360 px wide and at desktop widths.

All generated content is visibly marked “Fictional AI-generated content.”

The MVP can run locally using documented environment variables and commands.

4. Product rules

The application is entertainment only. Cases and evidence are fictional.

Do not accept premises that request real-world allegations, doxxing, targeting, or the portrayal of a real identifiable person as a criminal. Return a safe validation message and ask for a fictionalized premise.

Do not generate explicit sexual content, graphic violence, instructions for committing crimes, or actionable wrongdoing. Mysteries may involve non-graphic fictional theft, deception, sabotage, or a missing object.

Use fictional names, places, phone numbers, email addresses, organizations, and chat handles. Do not imitate a real person's identity.

Chat evidence should be a fictional transcript rendered in the application's own interface. Do not use WhatsApp logos or claim the messages came from real WhatsApp accounts.

Audio evidence in MVP is a transcript and metadata card. If a real audio file is later supported, it must be generated or licensed, safely stored, and clearly labelled as synthetic.

Generated images, when supported, must be clearly labelled synthetic and must not depict a real person without appropriate authorization.

No user premise or generated case may be rendered as raw HTML. Escape user and model-generated text.

Never reveal the solution or internal generation prompt in the case payload before accusation.

5. Experience and UI requirements

Visual direction

Create a polished, atmospheric detective workbench. Dark charcoal/navy surfaces, warm paper-like evidence panels, restrained amber accents, clear typography, subtle borders, and purposeful status colours. Avoid excessive neon, clutter, or a generic admin-dashboard look. The design should feel mysterious but remain legible and accessible.

Suggested design tokens (may be adjusted consistently):

App background: #10131A

Main surface: #191E28

Raised surface: #222936

Primary text: #F4F1E8

Secondary text: #A8B0BF

Accent amber: #E5B45B

Success: #59B889

Error: #E16F6A

Border: #343C4B

Radius: 10–16 px

Body font: system sans-serif; display headings may use a tasteful serif if bundled locally or available without blocking app functionality.

Use accessible contrast, visible keyboard focus, semantic HTML, meaningful button labels, and reduced-motion support.

Page A: Landing / Create Case

Components:

Brand mark and “AI Mystery Room” title.

Short headline such as “Every clue tells a story. Find the truth.”

Short explanation of how it works.

Premise textarea with example prompt.

Character counter and validation feedback.

Difficulty selector (Easy / Medium / Hard), default Medium.

Theme selector, default Auto.

“Generate Mystery” primary action.

Privacy/fiction disclaimer.

Sample case preview or decorative evidence cards, clearly marked as examples.

Behaviour:

Disable duplicate submits while generating.

Show progress state with rotating neutral stages, e.g. “Building the case”, “Preparing evidence”, “Checking the clues”. Do not claim the model is doing a stage unless that stage is actually implemented.

On success navigate to /case/:caseId.

On error preserve the input and offer retry.

Page B: Case Room

Desktop layout:

Header: logo, case number/title, status, restart/new-case action.

Main column: case briefing, incident timeline, investigation notes/instructions.

Side column or tabbed panel: suspects and evidence.

Evidence list with type icon, title, short preview, and reviewed/unreviewed status.

Evidence detail drawer/modal or dedicated panel.

Bottom/sticky accusation area that remains accessible without hiding evidence.

Mobile layout:

Stack briefing, suspects, evidence, and accusation area.

Use tabs or accordions to reduce scrolling.

No horizontal overflow.

Modals/drawers must fit small screens and be keyboard accessible.

Case room content:

Case title and fictional case ID.

Incident summary and known timeline.

3–5 suspect cards, each showing name, role, motive, alibi, and relevant relationship to the incident.

5–8 evidence items with type, title, source label, content, and clue significance.

Do not show the culprit badge or canonical culprit status before accusation.

Evidence may be marked reviewed locally; this is not required to persist across browser reloads in MVP.

Optional notes field can be deferred unless it is easy to implement without scope expansion.

Page C: Verdict

Correct/incorrect result with clear text, not colour alone.

Culprit's fictional name and explanation.

Reveal summary explaining motive, method at a high level, and timeline.

“Key evidence” section with at least two cited evidence cards.

If incorrect, explain why the selected suspect is less supported without revealing unsafe real-world methods.

“Play another mystery” button.

Do not allow changing the accusation after final submission in MVP. If the user wants another attempt, create a new case.

Shared states

Loading skeletons / progress state.

Empty evidence fallback.

Friendly generation failure and retry.

Case not found / expired / malformed ID page.

API unavailable message.

Accessible focus and keyboard interaction.

6. Mystery generation contract

Inputs to generation

premise: string, trimmed, 30–800 characters.

difficulty: easy | medium | hard.

theme: auto | crime | theft | sabotage | missing_object | secret_deception.

Difficulty definitions

Easy: 3 suspects, 5 evidence items, direct clues, one obvious but fair inference.

Medium: 4 suspects, 6–7 evidence items, multiple clues need to be cross-referenced, one or two fair red herrings.

Hard: 5 suspects, 8 evidence items, more nuanced timeline and indirect clues, still logically solvable without guessing.

Canonical story constraints

Preserve the user's premise as the story seed, but safely fictionalize it.

Choose one incident, one culprit, one motive, and one coherent timeline.

All suspects must have a plausible relationship to the incident.

Every suspect must have a plausible motive, opportunity, or suspicious detail; not every suspect needs all three.

At least two independent evidence items must support the culprit.

At least one clue should help eliminate an innocent suspect.

Red herrings must be explainable and must not make the solution ambiguous.

No supernatural answer unless the premise explicitly requests a fantasy theme; even then, the rules must be clear.

Evidence must be internally consistent with timestamps, locations, and character relationships.

The culprit must be identifiable using evidence provided in the case.

The explanation must cite evidence IDs, not invent new clues.

The user-facing response must not expose culpritId or solution before accusation.

Required generated data shape

Use Zod (or equivalent runtime schema validation) on all model output. Generate strict JSON only, no Markdown fences.

{
  "title": "The Missing Observatory Key",
  "theme": "missing_object",
  "difficulty": "medium",
  "premise": "The user-provided story seed, safely adapted.",
  "briefing": {
    "incident": "A concise description of what happened.",
    "location": "A fictional location.",
    "occurredAt": "2026-10-24T20:15:00",
    "discoveredAt": "2026-10-24T20:40:00",
    "objective": "Identify who took the key and support your conclusion with clues.",
    "timeline": [
      {
        "time": "20:00",
        "event": "A fictional event.",
        "relatedSuspectIds": ["suspect_1"]
      }
    ]
  },
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Mira Vale",
      "role": "Night assistant",
      "description": "Brief fictional profile.",
      "motive": "A plausible motive.",
      "alibi": "What the suspect claims they were doing.",
      "opportunity": "Their possible access to the incident.",
      "initialSuspicion": "Why they may appear suspicious."
    }
  ],
  "evidence": [
    {
      "id": "evidence_1",
      "type": "chat_transcript",
      "title": "Messages at 8:12 PM",
      "sourceLabel": "Fictional message transcript",
      "createdAt": "2026-10-24T20:12:00",
      "summary": "Short teaser that does not reveal the solution.",
      "content": {
        "format": "messages",
        "messages": [
          {
            "time": "20:12",
            "sender": "Mira",
            "text": "I left the east corridor before the lights went out."
          }
        ]
      },
      "clueSignificance": "How this evidence should be interpreted. Keep hidden until verdict.",
      "relatedSuspectIds": ["suspect_1"],
      "isRedHerring": false
    }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "motive": "The culprit's fictional motive.",
    "methodSummary": "A high-level, non-instructional explanation of what happened.",
    "timelineSummary": "How the incident unfolded.",
    "reasoning": "A coherent evidence-based explanation.",
    "keyEvidenceIds": ["evidence_1", "evidence_2"],
    "suspectEliminations": [
      {
        "suspectId": "suspect_2",
        "reason": "Why evidence weakens this suspect's case."
      }
    ]
  }
}

The example is illustrative, not a fixed story. Runtime validation must enforce the schema and cross-reference rules. Define explicit TypeScript types for the full object; content should be a discriminated union by evidence type.

Evidence types and content formats

chat_transcript: content.format = "messages" with 3–10 message entries.

document: content.format = "text" with a fictional report, note, letter, receipt, or log.

image_clue: content.format = "image_description" with description, visualDetails, and optional configured imageUrl. If image generation is unavailable, render a designed evidence illustration/card based on the description; do not invent a real image URL.

audio_transcript: content.format = "transcript" with transcript, recordedAt, and optional durationSeconds. This is text evidence, not a playable recording unless real synthetic audio is implemented.

Optional timeline_log: content.format = "log" with structured entries.

Server-side validation and repair

After Gemini returns output:

Parse JSON safely.

Validate with the runtime schema.

Validate cross-references: all IDs unique; all related suspect IDs exist; solution culprit exists; all key evidence IDs exist.

Validate counts against difficulty.

Validate evidence and explanation are present and within configured text limits.

Validate at least two key evidence IDs exist and support the solution.

If invalid, retry generation once with a repair prompt containing only validation errors and the invalid structured output (subject to size limits).

If still invalid, return a controlled generation error and log diagnostic metadata without logging API secrets or unnecessary sensitive user content.

Never store or return invalid case data.

Important: LLM self-assessment is not proof of logical solvability. Implement deterministic structural checks and a model-based consistency review if feasible. The review must not silently rewrite the canonical answer without revalidation.

7. API contract

Base prefix: /api/v1

GET /health

Purpose: health check.
Response:

{ "status": "ok" }

Must not expose secrets, database credentials, stack traces, or environment values.

POST /cases

Purpose: generate a new case.
Request:

{
  "premise": "A fictional scenario of at least 30 characters...",
  "difficulty": "medium",
  "theme": "auto"
}

Success: 201 Created

{
  "case": {
    "id": "case_id",
    "title": "The Missing Observatory Key",
    "theme": "missing_object",
    "difficulty": "medium",
    "premise": "Fictionalized premise.",
    "briefing": {},
    "suspects": [],
    "evidence": [],
    "status": "active",
    "createdAt": "ISO-8601"
  }
}

Never include solution, culpritId, clueSignificance, hidden reasoning, or internal prompt in this response. clueSignificance must be stripped from evidence objects returned to the player until verdict.

Errors:

400 VALIDATION_ERROR: invalid fields or premise.

422 UNSAFE_PREMISE: premise requests disallowed real-world targeting or harmful content.

429 RATE_LIMITED: too many generation requests.

502 GENERATION_FAILED: Gemini failed or output remained invalid.

503 SERVICE_UNAVAILABLE: required backend dependency unavailable.

GET /cases/:caseId

Purpose: retrieve active case for the room.
Success: 200 OK, same spoiler-safe shape as creation response.
Errors: 400 INVALID_CASE_ID, 404 CASE_NOT_FOUND, 410 CASE_EXPIRED if expiration is implemented.

POST /cases/:caseId/accusation

Purpose: submit final accusation.
Request:

{ "suspectId": "suspect_2" }

Success: 200 OK

{
  "result": {
    "correct": false,
    "selectedSuspectId": "suspect_2",
    "culprit": {
      "id": "suspect_1",
      "name": "Mira Vale"
    },
    "reveal": {
      "motive": "...",
      "methodSummary": "...",
      "timelineSummary": "...",
      "reasoning": "...",
      "keyEvidenceIds": ["evidence_1", "evidence_2"],
      "suspectEliminations": []
    }
  }
}

The culprit and solution may only be returned after a valid accusation. Store the submitted accusation and result; subsequent requests must return the same final result, or return 409 CASE_ALREADY_SOLVED with the existing result if that is the chosen API convention. Document and test the chosen behaviour.
Errors: 400 INVALID_SUSPECT, 404 CASE_NOT_FOUND, 409 CASE_ALREADY_SOLVED (if used), 429 RATE_LIMITED.

Error response format

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please enter a fictional premise between 30 and 800 characters."
  }
}

Never send stack traces to the browser.

8. Data model (MongoDB)

Use Mongoose schemas and TypeScript types. Keep model definitions in server/src/models.

Case document

_id: MongoDB ObjectId.

title: string.

theme: enum.

difficulty: enum.

premise: string.

briefing: structured object.

suspects: array of structured suspect objects.

evidence: array of evidence objects; keep hidden solution fields server-side.

solution: private server-side object.

status: active | solved.

selectedSuspectId: optional string.

isCorrect: optional boolean.

createdAt, updatedAt: timestamps.

Optional TTL expiry after 24 hours only if it is implemented and documented. Do not rely on TTL for correctness.

Requirements:

Do not expose the raw MongoDB document directly.

Use a serializer/DTO allowlist for all public responses.

Add indexes for creation date and any fields used for expiry/status queries.

Ensure a case's solution is not sent in active-case responses.

Validate IDs and enums before database queries.

9. Technology and architecture

Required stack

Frontend: React + TypeScript + Vite.

Styling: plain CSS or CSS Modules. Avoid introducing a large UI framework unless needed.

Backend: Node.js + Express + TypeScript.

Database: MongoDB + Mongoose.

AI: Google Gemini API through the official supported server-side SDK, using a configurable model name.

Validation: Zod (or equivalent).

HTTP client: native fetch or Axios; choose one and use consistently.

Testing: Vitest for shared/frontend logic; Supertest for Express API tests; React Testing Library for key UI interactions if time permits.

Lint/format: ESLint + Prettier.

Package manager: npm.

Monorepo: root scripts orchestrate client and server.

Architecture boundaries

client never calls Gemini directly. All model requests pass through the Express backend.

React UI → Express REST API → validation/service layer → Gemini + MongoDB.

Keep Gemini prompt construction separate from routes.

Keep validation, generation, storage, and public serialization in separate modules.

Do not place secrets in Vite variables. VITE_* variables are public.

Do not build the app as a single giant React component or one giant server file.

Suggested repository structure

ai-mystery-room/
├── README.md
├── SPEC.md
├── .gitignore
├── .env.example
├── package.json
├── docs/
│   ├── decisions.md
│   └── api.md
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── cases.ts
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── PremiseForm.tsx
│       │   ├── DifficultySelector.tsx
│       │   ├── SuspectCard.tsx
│       │   ├── EvidenceCard.tsx
│       │   ├── EvidenceViewer.tsx
│       │   ├── Timeline.tsx
│       │   ├── AccusationPanel.tsx
│       │   ├── VerdictPanel.tsx
│       │   ├── LoadingState.tsx
│       │   └── ErrorState.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── CasePage.tsx
│       │   └── NotFoundPage.tsx
│       ├── hooks/
│       ├── types/
│       ├── styles/
│       └── test/
└── server/
    ├── package.json
    └── src/
        ├── app.ts
        ├── server.ts
        ├── config/
        │   └── env.ts
        ├── routes/
        │   ├── health.routes.ts
        │   └── cases.routes.ts
        ├── controllers/
        ├── services/
        │   ├── gemini.service.ts
        │   ├── mystery-generation.service.ts
        │   ├── case.service.ts
        │   └── verdict.service.ts
        ├── prompts/
        │   └── mystery.prompt.ts
        ├── validators/
        │   ├── request.schemas.ts
        │   └── generated-case.schema.ts
        ├── models/
        │   └── Case.ts
        ├── middleware/
        │   ├── error-handler.ts
        │   ├── rate-limit.ts
        │   └── not-found.ts
        ├── utils/
        └── test/

Codex may adjust file names to fit actual implementation, but must preserve the architecture boundaries and responsibilities.

10. Environment configuration

Root .env.example (never commit a real .env):

NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=replace_me
GEMINI_MODEL=replace_with_supported_model_name
CASE_TTL_HOURS=24
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10

Rules:

Load environment variables only on the server.

Validate required environment variables at startup with actionable errors.

Never print GEMINI_API_KEY or MONGODB_URI to logs.

Keep .env, .env.* (except .env.example), build output, node_modules, logs, and local databases out of Git.

Configure CORS for CLIENT_ORIGIN, not wildcard in production.

Document how to create a Gemini API key and MongoDB connection without committing either secret.

If GEMINI_MODEL is missing or unsupported, fail clearly at startup or on generation; do not silently use an arbitrary model name.

11. Security, reliability, and privacy

Validate and trim all client inputs on the server.

Set reasonable request body size limits.

Add rate limiting to case generation and accusation endpoints.

Add request timeouts for Gemini and database operations where appropriate.

Treat Gemini output as untrusted input.

Escape content in the frontend; never render raw HTML from model output.

Limit the number and length of model-generated strings and arrays.

Do not log API keys, full environment objects, or stack traces to clients.

Do not store unnecessary personal information. No user account is required.

Use a CORS allowlist.

Use Helmet or equivalent secure Express headers.

Apply consistent error handling.

Prevent repeated generation clicks from causing duplicate requests.

Avoid exposing database _id internals if a public id is sufficient.

Use cryptographically random or MongoDB-generated case IDs; validate route IDs.

The verdict service must compare the selected suspect ID against the server-side solution.

The system should not claim that generated evidence is authentic.

Add a modest timeout and one repair retry to control cost and latency.

Do not use user-provided premise text as a system instruction. Explicitly treat it as untrusted story material in prompts.

12. AI integration requirements

Use the official supported Google Gemini server SDK and current API patterns at implementation time.

Keep model name configurable through GEMINI_MODEL.

Request JSON/structured output where supported; still validate returned output independently.

Use a strong system instruction: fictional mystery author, adhere to schema, one solution, fair evidence, no real-person accusations, no unsafe details, no text outside JSON.

Pass the user's premise as quoted/untrusted data, not as instructions.

Keep the private solution server-side.

Do not send hidden clueSignificance to the frontend before verdict.

Make generation deterministic where supported/configurable, but do not promise identical output.

Log duration, validation outcome, retry count, and safe error codes; avoid logging secrets.

Do not hard-code a deprecated model name. Confirm current SDK and model availability before implementation.

Do not generate fake binary image/audio URLs. If image/audio generation providers are not configured, use accessible text/visual cards and transcripts.

13. Frontend data types / spoiler-safe DTOs

Define distinct server and client types:

GeneratedCase — full internal model including solution.

PublicCaseDTO — case without solution and without clueSignificance.

VerdictDTO — includes reveal only after accusation.

ApiErrorDTO — stable error code and human-readable message.

Never use a TypeScript type assertion as a substitute for server validation. The server must serialize through an explicit allowlist, not delete fields on a shared mutable object.

14. Test plan

Unit tests

Premise length and trimming.

Difficulty/theme enum validation.

Generated-case schema.

Duplicate suspect/evidence ID rejection.

Unknown suspect reference rejection.

Missing culprit rejection.

Missing or invalid key evidence IDs rejection.

Count validation per difficulty.

Verdict correct/incorrect comparison.

Public serializer removes solution and hidden clue significance.

Error mapping hides internal details.

API tests

GET /health returns {status:"ok"}.

Invalid POST /cases returns 400.

Unsafe premise returns 422.

Successful generation returns 201 and spoiler-safe case.

Gemini failure returns controlled 502.

Missing case returns 404.

Invalid accusation suspect returns 400.

Correct and incorrect accusation return expected result.

Duplicate accusation follows documented convention.

Rate limiting returns 429.

CORS/security configuration behaves as expected.

Mock Gemini in tests. Tests must not consume paid API calls or require a live Gemini key.

UI tests / manual checks

User can enter a premise and select options.

Submit button shows loading and prevents duplicates.

Case room displays suspects and evidence.

Evidence viewer opens and closes accessibly.

Accusation requires a suspect selection.

Verdict screen clearly explains outcome.

Error/retry keeps the premise intact.

Keyboard-only navigation and focus visibility.

Layout checked at 360 px, tablet, and desktop widths.

No solution leak in network payloads before accusation.

15. Definition of done

The MVP is done when:

All three primary screens work: create, investigate, verdict.

The frontend and backend use TypeScript.

Gemini calls happen only on the server.

MongoDB persists valid cases.

The model output is runtime-validated and cross-reference-checked.

Public DTOs do not leak the culprit or hidden clues before accusation.

Accusation logic is server-authoritative.

Error/loading/empty states are implemented.

Core tests pass without live AI credentials.

.env.example, .gitignore, and README are complete.

npm run dev, npm run build, and npm test (or clearly documented equivalents) work.

No real API key or secret is committed.

Responsive and accessibility basics are checked.

All generated cases are marked fictional and AI-generated.

16. Codex execution protocol

Codex must follow this sequence rather than generating the whole application in one unverified step.

Phase 1 — Inspect and plan

Inspect the existing repository before changing files.

Read SPEC.md fully.

If the repository is empty, scaffold the monorepo as specified.

Create or update docs/decisions.md for choices not explicitly settled here.

Produce a concise implementation plan and map each requirement to files.

Phase 2 — Foundation

Set up root scripts, client, and server.

Add TypeScript, linting, formatting, and environment validation.

Implement shared domain types and runtime schemas.

Implement health endpoint, centralized errors, security middleware, and CORS.

Run build/tests and fix errors before continuing.

Phase 3 — Core backend

Implement Gemini integration and prompt.

Implement output parsing, validation, cross-reference checks, one repair retry, and safe errors.

Implement MongoDB model and case service.

Implement public DTO serializer.

Implement generation, retrieval, and accusation endpoints.

Test with mocked Gemini and verify spoiler protection.

Phase 4 — Frontend

Build landing/create screen.

Build case room, suspects, evidence list and evidence viewer.

Build accusation flow and verdict screen.

Add responsive styling, loading/error states, and accessible interactions.

Connect frontend to API and verify payloads.

Phase 5 — Verify and document

Run tests, lint, and production builds.

Fix all errors; do not hide failing checks.

Manually verify create → investigate → accuse → verdict.

Check that solution fields are absent from active case responses.

Update README with setup, environment variables, scripts, architecture, API endpoints, and known limitations.

Report what works, commands run, test results, and any remaining gaps honestly.

Working rules

Implement in small, testable increments.

Do not replace the spec with assumptions; ask only when a blocking ambiguity cannot be resolved from this document.

Do not install unnecessary dependencies.

Do not commit secrets.

Do not claim tests/builds passed unless they were run.

If a requested feature cannot be implemented safely or reliably, document the limitation and provide the simplest compliant fallback.

Keep this SPEC.md updated if the product requirements change, so it remains the single source of truth.

17. Suggested README commands

The implementation should provide equivalents of:

npm install
cp .env.example .env
# Fill in GEMINI_API_KEY and MONGODB_URI in .env
npm run dev
npm run lint
npm test
npm run build

On Windows PowerShell, users may copy .env.example to .env with:

Copy-Item .env.example .env

The README must state whether MongoDB must be installed locally or can be hosted, and explain that the Gemini API key is required for live case generation. Provide a clearly labelled demo/mock mode only if implemented; never imply mock output came from Gemini.

Final implementation principle

Build a coherent, fair, spoiler-safe mystery experience before adding extra features. A smaller case with consistent clues and a trustworthy reveal is better than a visually impressive case whose evidence does not logically support its answer.