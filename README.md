# VELOX.AI — Supersonic Neural Intelligence

A high-performance, dark cyber-glass AI interface powered by Groq LPUs™ for ultra-low latency, real-time token streaming.

![Velox AI](https://img.shields.io/badge/VELOX-AI-00f0ff?style=for-the-badge&logo=speedtest&logoColor=black)
![Engine](https://img.shields.io/badge/Engine-Groq%20LPU-8b5cf6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-10b981?style=for-the-badge)

---

## ⚡ Features

- **Supersonic Real-Time Streaming**: Stream tokens with sub-second time-to-first-token (TTFT) and live cursor animations.
- **Interactive Telemetry HUD**:
  - **Throughput (Tokens/s)**: Live calculation of generation speed (often 400–800+ T/s).
  - **TTFT (Time to First Token)**: Latency from query dispatch to first received byte in milliseconds.
  - **Total Latency**: Full cycle generation duration.
  - **Token Counts**: Real-time token tracking.
- **Preset Persona Modes**:
  - 🌟 **Omni**: General high-clarity conversation.
  - 💻 **Code Matrix**: Principal software engineering & architecture.
  - 🧠 **Deep Logic**: First-principles mathematical reasoning (powered by DeepSeek R1 Distill 70B).
  - ✨ **Creative**: Narrative storytelling & expressive prose.
- **Groq LPU Engine Support**:
  - `llama-3.3-70b-versatile` (Default recommended flagship)
  - `llama-3.1-8b-instant` (Mach speed ~800 T/s)
  - `deepseek-r1-distill-llama-70b` (Advanced reasoning)
  - `mixtral-8x7b-32768` (Mixture of Experts, 32k context)
  - `gemma2-9b-it` (Google Gemma 2)
  - `llama-3.2-3b-preview` & `llama-3.2-1b-preview`
- **Developer Tools**:
  - **Execution Blueprint Modal**: Export the active session as `cURL`, `Python (Groq SDK)`, or `TypeScript / Node.js`.
  - **Encrypted Local Storage**: API keys are stored in client-side `localStorage` and sent strictly to Groq's official API.
  - **One-Click Ping Gateway**: Verify your API key before chatting.

---

## 🚀 Quick Start

### 1. Launch with Start Script (macOS)
Inside the repository folder, simply double-click:
```bash
./start.command
```
Or run directly in terminal:
```bash
python3 -m http.server 8000
```
Then navigate to: **[http://localhost:8000](http://localhost:8000)**

### 2. Connect Your API Key
1. Click **"Connect Key"** in the top navigation bar.
2. Enter your Groq API key (`gsk_...`).
3. Click **"Ping Gateway"** to confirm connection.
4. Click **"Activate & Save"**.

### 3. Ask Anything
Select your mode (Omni, Code Matrix, Deep Logic, Creative) or click any starter prompt to experience supersonic AI inference!
