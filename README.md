# 🧠 Fin AI Copilot - Customer Support Assistant

**🔗 Live Demo:** [https://fin-ai-copilot.vercel.app]

This is a full-featured AI-powered customer service copilot interface inspired by modern helpdesk platforms like Intercom and Zendesk. It is designed to improve agent efficiency by providing:
- Context-aware AI suggestions (using OpenAI or fallback logic)
- Saved response templates
- A rich text editor with formatting tools
- Conversation analysis (sources, metrics, sentiment)
- Dynamic customer and company context

---

## 🚀 Features

### ✅ AI Copilot (`CopilotPanel.js`)
- Streams responses from OpenAI GPT-3.5 Turbo or local fallback logic.
- Context-aware suggested questions (e.g. refund, shipping, account).
- Actionable AI responses with templates, sources, and performance metrics.
- "Add to composer", copy, save response buttons.
- Saved responses stored in localStorage (with categories like "Refunds", "Shipping").

### 💬 Chat Window (`ChatWindow.js`)
- Dual-mode input: `chat` or `note`.
- Fully featured rich-text editor with:
  - Formatting (bold, italic, underline, code)
  - Font size, highlight, color pickers
  - Link, heading, clear formatting
  - Emoji picker integration
- Typing indicator, time formatting, shortcut support (Cmd+B, Cmd+K etc).

### 📂 Sidebar (`Sidebar.js`)
- Switch between different user conversations.
- Supports grid and list views with unread, waiting, or indicator states.

### 🧾 Details Panel (`DetailsPanel.js`)
- Collapsible panels for user data, tickets, company info, Stripe, Salesforce etc.
- Icons from `lucide-react` for clean layout.
- Dynamic expansion toggles per section.

### 🧠 Global Command Menu (Cmd+K)
- Modal with fast-access actions like:
  - Write note, Use macro, Summarize conversation
  - Upload attachment, Create back-office ticket

---

## 🛠️ Tech Stack

- React 18 (with hooks + refs)
- TailwindCSS (utility-first responsive design)
- OpenAI GPT-3.5 API (optional; fallback local AI logic supported)
- Emoji Picker via `emoji-picker-react`
- Icons via Lucide & custom SVGs
- Fully responsive layout (mobile + desktop)

---

## 🧪 Development Setup

```bash
git clone https://github.com/your-repo/ai-copilot.git
cd ai-copilot

# Install dependencies
npm install

# Set environment variable
echo "REACT_APP_OPENAI_API_KEY=sk-..." >> .env

# Run the app
npm start
```

---

## 📝 Folder Structure

```
.
├── components/
│   ├── Sidebar.js
│   ├── ChatWindow.js
│   ├── CopilotPanel.js
│   ├── DetailsPanel.js
├── App.js
├── index.css
├── .env
└── README.md
```

---

## 🔐 Environment Variables

| Variable                  | Required | Description                        |
|--------------------------|----------|------------------------------------|
| `REACT_APP_OPENAI_API_KEY` | No       | API key to enable OpenAI support  |

---

## 🧠 Future Ideas
- Integrate with actual ticketing APIs (Zendesk, Salesforce).
- Add socket support for real-time chat.
- Share saved responses across sessions via backend.
- Summarize full conversation history using GPT.
