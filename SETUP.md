# 🚀 LLM Council Web App - Setup Guide

This app is optimized for **extremely low-end hardware** (i3 5th Gen) and uses **free cloud AI**.

## 1. Prerequisites
- **Node.js** installed on your computer.
- A **Free Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

## 2. Local Setup
1. Open the project folder.
2. Rename `.env.local` to `.env` and paste your Gemini API Key.
3. Open your terminal (Command Prompt or PowerShell) and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open your browser to `http://localhost:3000`.

## 3. Deployment (Free Hosting)
The easiest way to use this is via **Vercel** (Free):
1. Create a free account on [Vercel.com](https://vercel.com).
2. Connect your GitHub repository (upload this code first).
3. Add your `GEMINI_API_KEY` in the Vercel **Environment Variables** settings.
4. Deploy! Your app will be live on a `vercel.app` URL.

## 🧠 How the Council Works
When you ask a question:
1. **Analyst**: Breaks down the logic.
2. **Researcher**: Pulls in facts.
3. **Critic**: Finds flaws/biases.
4. **Optimizer**: Cleans up the reasoning.
5. **Judge**: Gives you the final answer.

*Note: There is a built-in 2-second delay between agents to ensure stability on the Gemini free tier.*
