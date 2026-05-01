# SpaceAI – AI Rental Search App

SpaceAI is a conversational rental discovery app that converts natural-language prompts like:

"bright Austin loft under 2000 with good natural light"

into structured filters and curated property results.

## Problem

Rental search platforms require rigid filters and manual browsing, making it hard to express subjective preferences like vibe, aesthetic, or lighting.

## Solution

SpaceAI introduces a natural language interface that:

- Understands user intent
- Extracts structured filters
- Returns curated listings
- Adds AI-generated summaries for each property

## Features

- Natural language → structured filter parsing
- Support for vibe-based filters (light, aesthetic, neighborhood feel)
- Custom ranking of listings
- AI-generated listing summaries

## Tech stack

- React Native (frontend)
- FastAPI (backend – planned/expanding)
- OpenAI / LLM parsing layer

## Architecture

```text
User Prompt
   ↓
LLM Prompt Parser
   ↓
Structured Filters
   ↓
Listing Dataset / API
   ↓
Ranking + AI Summaries
   ↓
Frontend Display
```

## Why this project stands out

- Combines AI with a real-world product use case
- Moves beyond keyword search to intent-based discovery
- Shows product thinking + backend logic design

## Future improvements

- Add real API integrations (Zillow / Rent APIs)
- Improve ranking using user preferences
- Add map-based UI
- Add saved searches and personalization

## Status

Early-stage product. Focus is on building backend parsing + full frontend experience.