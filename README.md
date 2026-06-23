# CAR DRIVE RACING 2.5D

A modern, responsive, and performance-optimized 2.5D parallax car racing game built entirely using **HTML5 Canvas, Vanilla CSS, and modular Javascript**.

---

## Game Features

- **2.5D Parallax Scrolled Road**: Smooth, high-performance pseudo-3D road rendering without lag or glitches.
- **Detailed Vector Graphics**: Realistic sports cars drawn dynamically using canvas vectors (rear perspective, brake lights, spoilers, side-mirrors).
- **Glassmorphic UI Panels**: Premium developer info card and setting menus styling using modern backdrop-filter blur effects.
- **Sound Control Engine**: Live synthesized cranking engine rumble pitch that responds to the player's acceleration, with a clickable mute (`🔊`/`🔇`) switch.
- **Resolution Scaler**: Supports switching the screen output from retro pixelated **144p** up to super crisp **1080p** dynamically.
- **Level Scaling Stages**: Stage 1 (Sunset Highway) transitions to Stage 2 (Neon City Space) with increased vehicle speeds.

---

## Controls Guide

| Control | Action | Keyboard Key | Mouse / Touch Click |
| :--- | :--- | :--- | :--- |
| **Move Left** | Steer Left | `ArrowLeft` / `A` | Left Arrow Overlay Button |
| **Move Right** | Steer Right | `ArrowRight` / `D` | Right Arrow Overlay Button |
| **Start / Retry** | Start Gameplay | `Click` | Click Start/Retry Buttons |

---

##File Structure

The project has been separated into clean, modular components:
├── index.html          # Core HTML layout, HUD, overlays, and modal popups.
├── profile.jpg         # Profile avatar for the Info card.
├── glowing_car.png     # Start screen background poster image.
├── car_handling.js     # Canvas rendering loop, vector car calculations, and physics boundaries.
├── todays.js           # Audio engine oscillators, HUD bindings, popup selectors, and state transitions.
├── car_handling.css    # Layout rules for game container, canvas viewport, and steering panels.
└── todays.css          # Rules for landing screen, bottom nav tabs, glassmorphic cards, and rating panels.
```

---

## ⚡ How to Run the Game

1. **Direct Browser Execution**:
   - Double-click `index.html` or open it in any modern browser (Chrome, Firefox, Safari, Edge).

2. **Using a Local Server (Recommended for Web Audio)**:
   - Open your terminal in the game folder and run:
     ```bash
     npx http-server -p 8000
     ```
   - Open your browser and navigate to `http://localhost:8000`.

---

## ℹ️ Developer Information

- **Developer**: Shoubhik Bhattacharya
- **Institution**: VIT Bhopal
- **Specialization**: CSE with Gaming Tech
- **Core Role**: Game Designer & Game Artist
