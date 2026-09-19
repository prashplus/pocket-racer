# 🏎️ Pocket Racer

> A responsive, high-octane 3D Endless Highway Obstacle Runner SPA built with React 19, Three.js, React Three Fiber, Zustand, and Tailwind CSS. Optimized for desktop, tablet, mobile, and seamless deployment on **Cloudflare Pages**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.186-black.svg?logo=three.js)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite)

---

## ✨ Features

- 🏎️ **Realistic 3D Supercar**:
  - Sculpted aerodynamic widebody monocoque with front carbon splitter, canards, and hood vents.
  - Aerodynamic greenhouse cabin with sloped windshield and side mirrors.
  - GT racing rear wing on twin carbon swan-neck uprights, vertical strafe rear diffuser, and quad titanium exhaust tips.
  - Multi-spoke alloy wheels, low-profile rubber tires, steel brake discs, and red Brembo-style calipers.
  - Dynamic physics: front wheels steer into turns, 4 wheels rotate with speed, chassis banks into turns, and rear squats on Nitro boost.
- ☀️ **Dual Themes (Light Mode & Dark Synthwave)**:
  - **Light Mode**: Sunny daylight highway with clear blue skies, radiant golden sun, and Rosso Corsa Italian racing red supercar.
  - **Dark Mode**: Neon synthwave cyberpunk night, glowing magenta horizon sun, glowing neon barriers, CRT scanline overlay, and Cyber Cyan supercar with neon underglow.
  - Instant theme toggle on Main Menu and in-game cockpit HUD (persisted to `localStorage`).
- ⚡ **High-Frequency Gameplay Loop**:
  - **Stationary Player Architecture**: Player remains stationary along the Z-axis while highway segments, traffic, and items stream toward Z > 0, eliminating floating-point coordinate drift.
  - **Procedural Obstacle Pooling**: Civilian Sedans, heavy Cyber Semi-Trucks, and Roadblock Barriers.
  - **Forgiving AABB Hitboxes**: `THREE.Box3` collision checking with 16% inner padding for arcade gameplay.
  - **Trauma Camera Shake & Particles**: Non-linear camera shake and crash explosion particle scatter.
  - **Floating Collectibles**: Golden energy coins (+250 pts, +8% nitro) and cyan nitro battery canisters (+150 pts, +35% nitro).
- 🔊 **Zero-Asset Procedural Web Audio Engine**:
  - Pure Web Audio API synthesizing real-time engine pitch modulation, turbo nitro whoosh, harmonic coin chimes, and crash impacts without external MP3/WAV files.
- 📱 **Ergonomic Responsive Controls**:
  - **Desktop**: `A` / `D` or `ArrowLeft` / `ArrowRight` to steer; `W`, `ArrowUp`, or `Space` for Nitro Boost.
  - **Mobile / Touch**: Dedicated virtual on-screen steering pads and touch Nitro button with `touch-action: none` to prevent scroll or pull-to-refresh conflicts.
- 🚀 **Cloudflare Pages Ready**:
  - Lightning-fast production build output to `/dist`.

---

## 🎮 Controls Guide

| Action | Desktop Keyboard | Mobile / Touch |
|---|---|---|
| **Steer Left** | `A` or `ArrowLeft` | Left Touch Button |
| **Steer Right** | `D` or `ArrowRight` | Right Touch Button |
| **Nitro Boost** | `W`, `ArrowUp`, or `Space` | Touch "BOOST" Button |
| **Start / Restart** | `Space` or `Enter` | "Start Race" / "Play Again" Button |
| **Toggle Theme** | Sun / Moon Icon Button | Sun / Moon Icon Button |
| **Toggle Audio** | Speaker Icon Button | Speaker Icon Button |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Audio**: Web Audio API (Procedural Synthesizer)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Celebration Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+ or v22+
- `npm` v10+ or v11+

### Installation

```bash
# Clone repository
git clone https://github.com/prashplus/pocket-racer.git
cd pocket-racer

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The static bundle will be built in the `/dist` directory.

### Preview Production Build

```bash
npm run preview
```

---

## ☁️ Deployment to Cloudflare Pages

### Option 1: Git Integration (Recommended)
1. Push your code to GitHub.
2. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository `pocket-racer`.
4. Set the build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

### Option 2: Direct Upload via Wrangler CLI
```bash
npx wrangler pages deploy dist --project-name pocket-racer
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
