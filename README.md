# 🌌 SIMU-VERSE

**Interactive Physics Simulation Platform**  
*Learn physics through AI‑guided lessons, real‑time simulations, and interactive visualisations.*


---

## ✨ Overview

SIMU‑VERSE is a web‑based educational platform that makes physics tangible.  
It combines **AI‑generated lessons**, **interactive simulations**, **YouTube video support**, and a **book‑style reference slideshow** – all wrapped in a futuristic, responsive UI.

> **Live Demo:** [https://simuverse-team.netlify.app](https://simuverse-team.netlify.app)

---

## 📚 Table of Contents

- [Features](#-features)
- [Physics Topics Covered](#-physics-topics-covered)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Video-links](links-of-khan-academy-videos-non-copyright-used)

---

## 🎯 Features

| Feature | Description |
|---------|-------------|

| **📖 AI Lesson Slides** | Dynamic slide decks generated via **Anthropic Claude** (fallback to built‑in content). |
| **🎮 Interactive Simulations** | Real‑time canvas‑based simulations for Wave Optics, Projectile Motion, and Electrostatics. |
| **🤖 AI Chatbot** | Context‑aware physics tutor (NOVA) using **Gemini API** with conversation memory and throttling. |
| **📺 YouTube Video Block** | Inline YouTube player – no redirects, fully themed. |
| **📚 Book References Modal** | Separate slideshow for high‑resolution PDF‑extracted images (per topic). |
| **🎨 Dual Theme** | Login screen retains original neon colours; main app uses a softer, high‑contrast theme. |
| **📱 Responsive** | Works on desktop, tablet, and mobile. |

---

## 🧪 Physics Topics Covered

### 1. 🌊 Wave Interference & Diffraction
- Young’s Double Slit Experiment  
- Single Slit Diffraction  
- Path difference, fringe width, intensity distribution  
- Interactive wave simulation with adjustable λ, d, D

### 2. 🚀 Projectile Motion & Energy Conservation
- Oblique projection (2D motion)  
- Kinematic equations & trajectory parabola  
- Real‑time energy graph (KE / PE / TE)  
- Adjustable velocity, angle, mass, gravity

### 3. ⚡ Electric Field & Potential
- Single and multiple point charges  
- Electric field lines & equipotential surfaces  
- Coulomb’s law and superposition  
- Drag‑and‑drop charges, test charge force vector

---

## 🛠️ Tech Stack

| Area | Technologies |
|------|--------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |

| **AI Lesson Generation** | Google Gemini API (`gemini-1.5-flash`) |
| **AI Chatbot** | Google Gemini API (`gemini-1.5-flash`) |
| **Hosting** | Netlify (recommended) / GitHub Pages |
| **Icons & Fonts** | Google Fonts (Inter, JetBrains Mono, Rajdhani, Orbitron) |
| **Vector Graphics** | Inline SVG (diagrams) & Canvas API (simulations) |

## 🔐 Environment Variables
Configure these values in the Netlify dashboard and local `.env` files for development:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY` — Google Gemini API key for server-side chat requests


Use `functions/chat.js` as the secure Gemini proxy endpoint.

