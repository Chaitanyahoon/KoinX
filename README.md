# KoinX Tax Loss Harvesting Dashboard

An interactive, responsive React + TypeScript + Tailwind CSS web dashboard that simulates cryptocurrency Tax Loss Harvesting (TLH) to help investors legally optimize and reduce their capital gains tax liability.

This project replicates the **KoinX Figma design mockup** (supporting both **Light and Dark mode**) and implements the **exact functional specifications & JSON dummy datasets** outlined in the KoinX Frontend Intern Assignment.

---

## 🚀 Key Highlights & Interactive Features

Reviewers can toggle the following sandbox widgets in the sticky header toolbar:

1. **🌗 KoinX Dual-Theme (Light & Dark Mode)**:
   - **Light Mode**: Replicates the clean standard design (light-blue backgrounds, dark slate headers, and slate outlines).
   - **Dark Mode**: Replicates the Figma dark mode screenshots (deep slate `#0A0D14` body, `#161B26` cards/tables, `#10141F` inputs, and `#1F293D` table row dividers).
2. **🪙 KoinX Dual-Currency & Dynamic Datasets**:
   - **USD ($) Mode**:
     - Formats numbers with spaces matching Figma typography (e.g. `$ 1,540` and `- $ 743`).
     - Matches the exact 6 popular holdings and starting capital gains shown in the Figma screenshots.
     - When **Ethereum (ETH)** is selected, the card updates to match the figma visual numbers exactly (`-$987` Net ST, `-$2,450` Net LT, `-$2,353` Effective Gains, and `$862` savings).
   - **INR (₹) Mode**:
     - Fully integrates the **exact 25 holdings** and starting capital gains (`70,200.88` STCG, `5,020.00` LTCG) parsed straight from the assignment JSON.
     - Selecting rows applies the exact PDF functional math: positive gains add to profits, and negative gains add to losses.
3. **📋 Sliced Holdings Table & "View All" (Bonus Point)**:
   - Since INR mode lists 25 assets, the table slices the rendering to display only the top **6 holdings** initially.
   - A blue link trigger (**`View all (19 more)`** or **`Show less`**) allows users to smoothly expand and collapse the full portfolio list.
4. **📂 Collapsible Important Notes Accordion**:
   - Integrates a collapsible status accordion featuring all 5 notes from the Figma screenshots, rendered in dynamic theme-matching color cards.
5. **🛡️ Sandbox Simulator Panel (Header)**:
   - **Simulate Error**: Simulates simulated API network failures to test linter-safe async error-boundary fallbacks.
   - **Simulate Empty**: Returns an empty array to test portfolio blank slate UI layouts.
   - **Reset Sim**: Instantly clear selections and return to pre-harvesting states.

---

## 📂 Folder Structure

```
src/
├── components/          # Interactive visual widgets
│   ├── HoldingRow.tsx   # Row rendering, USD/INR detail switches, inputs, & dark classes
│   ├── HoldingsTable.tsx# Table wrapper. Handles select-all, searches, & view-all slices
│   └── SummaryCard.tsx  # Stat card showing pre/post profits, losses, and savings banners
├── data/                # Seed database
│   └── mockData.ts      # Seeding capital gains and portfolio assets for both USD and INR modes
├── services/            # Simulated backend
│   └── api.ts           # Asynchronous Promise calls mimicking network load times (800ms)
├── types/               # TypeScript schemas
│   └── index.ts         # Unified definitions matching the KoinX holdings schema
├── utils/               # Math core
│   └── calculations.ts  # Isolated pure math formatters, offset accumulators, & savings rules
├── App.tsx              # Main state container managing themes, selections, & collapsible hooks
├── index.css            # Stylesheet loading Tailwind CSS v4 and custom scrollbars
└── main.tsx             # React mounting root
```

---

## ⚙️ Setup and Installation

### Prerequisites
Make sure you have Node.js installed.

### 1. Clone the project and navigate to the folder:
```bash
cd c:/Users/admin/Desktop/project
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Run Local Dev Server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the dashboard.

### 4. Build Production Bundle:
```bash
npm run build
```
Optimized, bundle-split production files are written to the `dist/` directory.

### 5. Run Linter:
```bash
npm run lint
```
Performs code-style static analysis. Both `npm run build` and `npm run lint` compile cleanly with **0 errors and warnings**.

---

## 🧮 Live Offsets & Tax Savings Logic

Business calculations are fully isolated from presentation layers in `src/utils/calculations.ts`:
- **Net Gains**: `Profits - Losses` per category.
- **Realised Gains**: `Net STCG + Net LTCG`
- **Offset Harvesting Projections**: When an asset is simulated to sell, its gains and losses scale proportionally based on simulated quantity:
  $$\text{Harvested Gain} = \text{Original Gain} \times \frac{\text{Quantity to Sell}}{\text{Total Holdings}}$$
- **Taxes Saved Banner**: Displayed **only** if simulated post-harvesting capital gains are lower than pre-harvesting capital gains, showing exact tax liability reductions.
