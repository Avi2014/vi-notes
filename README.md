# Vi-Notes 📝

**Vi-Notes** is an authenticity verification platform designed to distinguish genuine human-written content from AI-generated or AI-assisted text. The system focuses on analyzing **writing behavior** alongside **statistical and linguistic characteristics** of the text to establish reliable authorship verification.

**Current Status**: 🚀 Feature #1 (Basic Writing Editor) - COMPLETE & READY FOR TESTING

---

## Quick Start

```bash
# Frontend (Terminal 1)
cd frontend
npm install
npm run dev

# Backend (Terminal 2)
cd backend
npm install
npm run dev

# Open http://localhost:3000 in your browser
```

→ **Full Setup Guide**: [docs/SETUP.md](./docs/SETUP.md)

---

## Features Progress

| # | Feature | Status | Docs | Timeline |
|---|---------|--------|------|----------|
| 1 | Basic Writing Editor | ✅ Complete | [FEATURE_1_EDITOR.md](./docs/FEATURE_1_EDITOR.md) | 2-3 days |
| 2 | User Login & Registration | ⏳ Planned | TBD | 2-3 days |
| 3 | Keystroke Timing Capture | ⏳ Planned | TBD | 3-4 days |
| 4 | Paste Detection | ⏳ Planned | TBD | 2 days |
| 5 | Session Persistence | ⏳ Planned | TBD | 3-4 days |

→ **Detailed Feature Status**: [FEATURES.md](./FEATURES.md)

---

## Feature #1: Basic Writing Editor ✅

A clean, distraction-free text editor for writing content.

### Features
- ✨ **Distraction-Free UI**: Minimal interface focused on writing
- 📊 **Real-time Statistics**: Word count and character count
- 💾 **Save Functionality**: Ready for backend integration
- 🧹 **Clear Control**: Reset content with confirmation
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- ♿ **Accessible**: Keyboard navigation and screen reader support

### Quick Test
1. Open http://localhost:3000
2. Type some text in the editor
3. Watch word/character counts update
4. Click Save (logs to console in Feature #1)
5. Click Clear to reset (with confirmation)

### Documentation
- [Feature Documentation](./docs/FEATURE_1_EDITOR.md) - Component architecture, styling, usage
- [Setup Guide](./docs/SETUP.md) - Installation and configuration
- [API Reference](./docs/API.md) - Current endpoints (health check)

---

## Motivation

With the widespread availability of AI writing tools, verifying true human authorship has become increasingly challenging. Most existing detection methods rely primarily on textual analysis, which can be inconsistent and easy to bypass.

Vi-Notes approaches this problem by combining:
- Behavioral signals from the writing process
- Statistical analysis of the written content
- Correlation between how content is written and what is written

---

## Core Idea

Human writing naturally includes:
- Variable typing speeds
- Pauses during thinking
- Revisions during idea formation
- Irregular sentence structures
- A relationship between content complexity and editing frequency

AI-generated or pasted text often lacks these behavioral signatures.

Vi-Notes is designed to capture and analyze these characteristics to assess authorship authenticity.

---

## Key Features

### Writing Session Monitoring
- Capture keystroke timing metadata (not raw key content)
- Track pauses, deletions, edits, and writing flow
- Detect pasted or externally inserted text blocks

### Behavioral Pattern Analysis
- Pause distribution before sentences and paragraphs
- Typing speed variance
- Revision frequency relative to text complexity
- Micro-pauses around punctuation and structural boundaries

### Textual Statistical Analysis
- Sentence length variation
- Vocabulary diversity metrics
- Stylistic consistency analysis
- Linguistic irregularities typical of human writing

### Cross-Verification Engine
- Correlate keyboard behavior with text evolution
- Identify mismatches between behavioral data and content
- Flag suspicious uniformity patterns

### Authenticity Reports
- Confidence score for human authorship
- Highlighted suspicious segments
- Supporting behavioral and textual indicators
- Shareable verification summaries

---

## Tech Stack (MERN Architecture)

### Frontend
- React
- TypeScript
- Electron for desktop-level keyboard event access

### Backend
- Node.js
- Express.js
- RESTful APIs for session handling and analysis

### Database
- MongoDB
- Encrypted storage for writing sessions, keystroke metadata, and reports

### Machine Learning
- TensorFlow / PyTorch
- Supervised learning for human vs AI-assisted writing
- Unsupervised anomaly detection
- NLP-based statistical signature analysis

---

## Privacy & Ethics

Vi-Notes is designed with privacy-first principles:

- No storage of raw keystroke content
- Only timing, frequency, and structural metadata is collected
- Encrypted data storage
- User-controlled session tracking
- Monitoring limited strictly to active writing sessions

---

## Project Goals

- Restore trust in written content authenticity
- Differentiate between human-written, AI-assisted, and AI-generated text
- Adapt detection methods as AI writing tools evolve
- Maintain ethical, transparent, and privacy-conscious verification

---

## Repository Scope

This repository currently serves as:
- A design reference
- A research and experimentation space
- A foundation for future MERN-based implementation

---

## Contributing

Contributions are welcome, especially for **feature requests and their implementation**.  
If you are interested in working on an existing feature request or proposing a new one, please open or comment on an issue to start the discussion.

---

## License

This project is licensed under the MIT License.
