# 🌌 The Multiverse Courier

### AI-generated breaking news from alternate timelines — powered by a local LLM

> *"What if history changed? Read today's headlines from a universe where it did."*

![The Multiverse Courier](./screenshots/hero.png)

---

## ✦ What Is This?

**The Multiverse Courier** is a full-stack AI newspaper that generates real-feeling news headlines from parallel universes. You pick a historical divergence point — *"The internet was never invented"* or *"Napoleon won at Waterloo"* — and a local LLM running on your machine writes today's front page from that alternate timeline.

Every generation produces 6 fully original headlines with blurbs, fictional outlets, and categories — styled as a genuine broadsheet newspaper.

Built as **Day X of my 100 Days of Vibe Coding** challenge.

---

## 🎬 Demo

> *(insert screen recording or GIF here)*

| Empty State | Generating | Headlines |
|---|---|---|
| ![](./screenshots/empty.png) | ![](./screenshots/loading.png) | ![](./screenshots/headlines.png) |

---

## ⚡ Features

- **Local LLM inference** — runs entirely on your machine via Ollama, zero API costs, zero data leaving your device
- **10 preset divergence points** — from *"No Internet"* to *"Rome Never Fell"*, or type your own
- **God mode JSON repair** — 3-strategy parser + retry logic handles messy LLM output gracefully
- **3 view modes** — Grid, Featured (lead story), and By Category
- **Category filter** — filter headlines by POLITICS / TECH / SCIENCE / WORLD / ECONOMY / CULTURE
- **Timeline Archive** — sidebar persists your last 20 universes in localStorage, click to reload any
- **Live breaking ticker** — scrolling marquee with your divergence point
- **Copy & Bookmark** — copy any headline to clipboard, bookmark for later
- **Stats bar** — shows headline count, outlets, categories, generation time
- **Share button** — native Web Share API on mobile, clipboard fallback on desktop
- **Health check endpoint** — `/health` tells you if Ollama is running and model is loaded
- **Fully responsive** — works on mobile with a collapsible sidebar drawer

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11+ |
| **LLM** | Ollama — `mistral:7b-instruct` |
| **Fonts** | UnifrakturMaguntia, Playfair Display, Inter |
| **Styling** | Custom CSS variables, newspaper theme |

---

## 🏗️ Architecture
```
Browser (React + Vite)
        │
        │  POST /generate { event: "..." }
        ▼
FastAPI Backend (port 8000)
        │
        │  Prompt engineering + retry logic
        ▼
Ollama (port 11434)
        │
        │  mistral:7b-instruct (local inference)
        ▼
JSON headlines → validated → returned to frontend
```

---

## 📁 Project Structure
```
parallel-universe-news/
│
├── backend/
│   ├── main.py              # FastAPI — /generate, /health endpoints
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Local config (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NewspaperHeader.jsx   # Masthead, live clock, breaking ticker
│   │   │   ├── EventSelector.jsx     # Preset chips + custom input
│   │   │   ├── HeadlineCard.jsx      # Article card with expand/copy/bookmark
│   │   │   └── LoadingSpinner.jsx    # Skeleton loader
│   │   ├── App.jsx                   # Main logic — state, API calls, layout
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Newspaper theme, CSS variables
│   ├── index.html                    # OG meta, fonts, loading screen
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Python](https://python.org/) 3.11+
- [Ollama](https://ollama.ai/) installed

### 1. Clone the repo
```bash
git clone https://github.com/Swapnil-bo/Parallel-Universe-News.git
cd Parallel-Universe-News
```

### 2. Pull the model
```bash
ollama pull mistral:7b-instruct
```

### 3. Start the backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open in browser
```
http://localhost:5173
```

> **Tip:** Verify the backend is healthy at `http://localhost:8000/health` before generating.

---

## 🧠 How the LLM Prompt Works

The backend sends a carefully engineered prompt to `mistral:7b-instruct` that:

1. Sets the model's role as a news editor in an alternate universe
2. Specifies today's real date for authentic timestamps
3. Requests exactly 6 headlines in a strict JSON schema
4. Enforces single-word categories to prevent malformed output

If the model returns malformed JSON (common with smaller models), the backend runs up to **3 retry attempts** with progressively stricter prompts, and applies a **4-strategy JSON repair pipeline**:

- Direct parse after stripping markdown
- Regex extraction of first `[...]` block
- Trailing comma repair
- Object-by-object reconstruction

---

## 🎨 Design Philosophy

The UI is built to feel like a **real newspaper** — not a generic AI app:

- `UnifrakturMaguntia` for the gothic masthead
- `Playfair Display` for headlines and editorial text
- Newsprint `#f5f0e8` background with a subtle paper line texture
- Per-category color-coded badges
- Staggered card entrance animations
- Red left-border reveal on card hover
- Fluid typography with `clamp()` for all screen sizes

---

## 📌 Part of 100 Days of Vibe Coding

This project is **Day X** of my public challenge to build 100 AI-powered full-stack projects.

Follow the journey:
- 🐙 GitHub: [@Swapnil-bo](https://github.com/Swapnil-bo)

---

## 📄 License

MIT — build your own multiverse.

---

<p align="center">
  <em>✦ All articles are AI-generated fiction from alternate timelines. ✦</em><br/>
  <em>Any resemblance to actual events is a multiverse coincidence.</em>
</p>
