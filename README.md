# Groq Inference Playground

A high-performance, dark-themed AI Playground interface replicating the official Groq Playground experience, designed for ultra-fast model inference on Groq LPUs™.

![Groq Playground](https://img.shields.io/badge/Groq-Inference-orange?style=flat-square&logo=speedtest)
![Status](https://img.shields.io/badge/Status-Ready-brightgreen?style=flat-square)

---

## ⚡ Features

- **Blazing Real-Time Streaming**: Stream tokens directly from Groq's official API (`https://api.groq.com/openai/v1/chat/completions`) with live cursor animation.
- **Real-Time Telemetry & Speedometer**:
  - **Tokens per Second (TPS)**: Live calculation of generation speed (often 300–800+ T/s).
  - **Time to First Token (TTFT)**: Precise latency measurement from request start to the first received token.
  - **Total Latency**: Full request duration in milliseconds.
  - **Token Counts**: Prompt and completion token statistics.
- **Top Groq Models Supported**:
  - `llama-3.3-70b-versatile` (Default recommended flagbearer)
  - `llama-3.1-8b-instant` (Fastest, ~800 T/s)
  - `deepseek-r1-distill-llama-70b` (Advanced reasoning)
  - `mixtral-8x7b-32768` (Mixture of Experts, 32k context)
  - `gemma2-9b-it` (Google Gemma 2)
  - `llama-3.2-1b-preview` & `llama-3.2-3b-preview`
- **Full Hyperparameter Control**:
  - System Instructions editor
  - Temperature (0.0 to 2.0)
  - Max Completion Tokens (up to 8,192)
  - Top P (0.05 to 1.0)
  - Stream toggle
  - JSON mode toggle
- **Developer Tools**:
  - **"View Code" Modal**: Export your session configuration instantly as `cURL`, `Python` (`groq` package), or `JavaScript` (`groq-sdk` / `fetch`).
  - **API Key Manager**: Built-in connection tester and secure client-side storage (`localStorage`).
  - **Syntax-Highlighted Markdown**: Render markdown tables, lists, and code blocks with syntax highlighting and one-click copy.
  - **Starter Prompts**: One-click quick questions to test inference speed immediately.

---

## 🚀 Quick Start

### 1. Launch with Python

Run inside the project directory:

```bash
cd /Users/pulkitrathee/.gemini/antigravity/scratch/groq-playground
python3 -m http.server 8000
```

Open your browser to:
**[http://localhost:8000](http://localhost:8000)**

### 2. Connect your Groq API Key

1. Click **"Set API Key"** in the top navigation bar (or the button in the welcome hero).
2. Paste your Groq API key (starts with `gsk_...`).
3. Click **"Test Connection"** to verify it against Groq's servers.
4. Click **"Save & Connect"**.

### 3. Ask Questions & Experience Groq Speed

Type any query or click any of the prompt starter cards to see real-time streaming at hundreds of tokens per second!
