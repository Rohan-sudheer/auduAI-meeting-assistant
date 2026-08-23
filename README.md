# Meeting Summariser

An AI meeting assistant that turns a raw audio recording into a transcript, a structured
multi-view summary, extracted action items, topic segmentation, speaker analytics — and lets you
**ask the meeting questions directly**.

Built for the **Unthinkables** campus recruitment hackathon round.

**Demo video:** _link to be added_

## Highlights

Two features go beyond the base brief and are the intended standouts:

- **Ask Your Meeting** — a RAG chatbot over the transcript. Ask "What did we decide about the
  payment gateway?" or "Who was assigned the database migration?" and get an answer grounded in
  the transcript, with inline citations back to the exact speaker and timestamp it came from.
- **Multi-agent critique pipeline** — the meeting summary isn't produced by a single LLM call. A
  **Drafter** agent writes the initial summary, a **Critic** agent reviews it against the
  transcript for missing decisions, inaccuracies, or vague points, and a **Finalizer** agent
  incorporates the critique into the final version. The UI surfaces this with an "AI-verified"
  badge you can expand to see exactly what the Critic flagged.

### Everything else

- Upload an MP3 or record straight from the browser (`MediaRecorder`)
- Timestamped, speaker-diarized transcript (Speaker 1 / 2 / 3…, renameable)
- Low-confidence segments highlighted; long pauses shown as dividers
- Structured summary: executive summary, meeting purpose, key discussion points, decisions
  (with stated reasons), outcomes
- Action Item Intelligence: task / owner / deadline / priority / status extracted from natural
  phrasing (e.g. "Rahul, can you finish the API integration by Friday?")
- Topic segmentation ("01. Product Strategy", "02. Backend Architecture", …)
- Per-speaker speaking-time statistics

## Architecture

```
Upload (MP3) or Browser Recording (MediaRecorder)
        │
        ▼
FastAPI backend, background pipeline
  1. Deepgram /listen (diarize + punctuate + utterances)  → timestamped, speaker-labeled segments + confidence
  2. map raw speaker index → Speaker 1/2/3 (first-appearance order)
  3. gemini-3.6-flash  × topic segmentation
  4. gemini-3.6-flash  × action item extraction
  5. gemini-3.6-flash  × Drafter → Critic → Finalizer     → verified multi-view summary
  6. chunk transcript, embed (gemini-embedding-001), upsert to chromadb
        │
        ▼
SQLite (meetings, speakers, segments, topics, action_items, summaries, chat_messages)
        │
        ▼
React (Vite + Tailwind): Upload/Record → polling Processing view →
  Transcript / Summary / Action Items / Topics / Speaking Stats / Ask tabs
```

## Tech stack

| Layer | Choice |
|---|---|
| ASR + diarization | Deepgram `/listen` (`nova-2`, `diarize=true`, `utterances=true`) |
| LLM | Google `gemini-3.6-flash` (summary, critique, action items, topics, RAG answers) |
| Embeddings | Google `gemini-embedding-001` |
| Vector store | `chromadb` (local persistent client, one collection per meeting) |
| Backend | FastAPI + SQLAlchemy + SQLite |
| Frontend | React + Vite + TypeScript + Tailwind CSS |

## Setup

**Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GEMINI_API_KEY and DEEPGRAM_API_KEY
uvicorn app.main:app --reload
```
API docs (Swagger) at `http://localhost:8000/docs`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
App at `http://localhost:5173`.

## Data model

SQLite tables: `meetings`, `speakers`, `segments`, `topics`, `action_items`, `summaries`,
`chat_messages`. See `backend/app/models.py` for the full schema.

## Design decisions

- **Deepgram over Whisper + a separate diarization model.** Diarization (telling speakers apart)
  and transcription are naturally coupled — you need to know *when* someone spoke to know *who*
  was speaking. Deepgram's `/listen` endpoint returns both in one call (`diarize=true` +
  `utterances=true`), each utterance already tagged with a speaker index, start/end time, and
  confidence. The alternative (Whisper for text + a locally-run diarization model, stitched
  together by matching timestamps) adds a whole extra model, a gated model-access step, and a
  hand-written alignment algorithm — complexity that buys nothing extra for this use case.
- **`chromadb` over a hand-rolled cosine-similarity search.** At the scale of one meeting's
  transcript, a plain in-memory list would perform identically. `chromadb` was chosen anyway
  because it removes an entire class of fiddly bugs (top-k sorting, id management, persistence)
  for near-zero extra setup cost, and reads as more deliberate engineering.
  A meeting is embedded once, and every RAG question against it is a Read.
- **`gemini-3.6-flash` everywhere.** No task here (structured extraction, short summarization,
  RAG answering) needs a larger reasoning model, and staying on a fast, cheap flash-tier model
  kept the entire day's development and demo well within budget.
- **Critique pipeline scoped to the summary only.** Applying Drafter→Critic→Finalizer to action
  items and topics too would be straightforward to add, but the summary is the highest-value,
  most subjective output — the one most worth an extra review pass — so that's where the budget
  and complexity went first.

## Cost

ASR cost is on Deepgram's free trial credit. LLM + embedding calls run on the Gemini API
(`gemini-3.6-flash` + `gemini-embedding-001`), kept cheap by using a flash-tier model for every
task rather than a larger reasoning model.

## Known limitations / future work

- Diarization accuracy degrades with heavy cross-talk or very similar-sounding voices.
- `deadline_normalized` is only as good as the LLM's date reasoning from relative phrases
  ("next Friday") — not independently verified.
- Meetings much longer than ~1 hour would benefit from a map-reduce summarization strategy
  instead of stuffing the full transcript into a single prompt.
- The critique pipeline currently covers the summary; extending it to action items and topics
  is a natural next step.

---
Built by Rohan Sudheer.
