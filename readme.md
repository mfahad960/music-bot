# Music Bot

Basic Discord music bot made with Node.js (in development)  
Built with `discord.js` and a modular command structure.  

---

## Table of Contents

- [About](#about)  
- [Features](#features)  
- [Requirements](#requirements)  
- [Installation](#installation)  
- [Commands](#commands)  
- [Roadmap](#roadmap)  
---

## About

This is a simple Discord music bot. It can join voice channels, play audio (via URLs / searches), manage a queue, and includes a modular command architecture. It’s a work in progress.  

---

## Features

- Join / leave a voice channel  
- Play a track by URL or search term  
- Queue management (add songs, skip, stop)  
- Pause / resume playback  
- Volume control  

---

## Requirements

- Node.js and npm Duh 
- A Discord Bot Token (from the Discord Developer Portal)  
- Permissions for the bot in a server:  
  - Send Messages  
  - Connect to Voice Channels  
  - Speak in Voice Channels  
  - (Maybe Manage Messages / Embed Links etc., depending on commands)  
  - FFmpeg (GOAT)
---

## Installation

```bash
git clone https://github.com/mfahad960/music-bot.git
cd music-bot
npm install
```

---

## Commands

- /play --> Search songs on YouTube via url or normal search and add it to queue
- /volume --> Get current volume or set volume to the specified value
- /pause --> Pause the currently playing track
- /resume --> Resume a paused track

---

## Roadmap

- I was working on adding buttons for ease of use and additional commands like removing tracks from queue or modifying the looping method (rn it loops full queue by default).
- I also wanted to add spotify search but the module I used to extract results from YouTube keeps breaking.
- I've been trying alternatives but none have worked as of October 2025.