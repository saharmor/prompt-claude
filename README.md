<div align="center">

<h1>
  <img src="public/claude-logo.svg" alt="Claude logo" width="24" />
  Prompt Claude
</h1>

An interactive web app to sharpen your Claude prompt engineering skills, with guided lessons, hands-on exercises, and instant AI-graded feedback.

**Bring your own Anthropic API key. No app accounts.**

<p>
<a href="https://www.linkedin.com/in/sahar-mor/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-Connect-blue" alt="LinkedIn"></a>
<a href="https://x.com/theaievangelist" target="_blank"><img src="https://img.shields.io/twitter/follow/theaievangelist" alt="X"></a>
<a href="http://aitidbits.ai/" target="_blank"><img src="https://img.shields.io/badge/AI%20Tidbits-Stay%20updated%20on%20AI-yellow" alt="Stay updated on AI"></a>
</p>

<br/>

<img width="761" src="public/preview.png" alt="Prompt Claude preview" style="border-radius: 12px;" />

</div>

## What It Is

[Prompt Claude](https://promptclaude.dev) is a self-paced prompt engineering course inspired by Anthropic's own popular tutorial material, rebuilt as a proper web app. Work through 24 exercises across 12 chapters — from basic message structure to advanced hallucination prevention and multi-technique prompts. Each submission is graded live by Claude Sonnet using your own API key, with specific feedback on what worked and what to improve.

## What You Get

- 24 exercises across 12 chapters
- guided lessons, hints, model answers, and progress tracking
- AI grading with concise feedback and simulated Claude output
- shareable completion card and Vercel Analytics support

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000` (or the port shown in the terminal), click the gear icon, and paste your [Anthropic API key](https://console.anthropic.com).

## Notes

- Your prompt submissions are sent server-side to Anthropic for grading using your API key.
- Your API key is never stored on our servers. If you choose to save it, it stays in browser storage on your device.
- For deployment, set `NEXT_PUBLIC_SITE_URL` for clean canonical/share URLs.
- If you deploy on Vercel, enable Web Analytics in the Vercel dashboard to collect analytics from the built-in integration.
