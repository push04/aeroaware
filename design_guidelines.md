# AirSense Design Guidelines - Compact Edition

## Core Design Principles
- **Data clarity over decoration** - Clean presentation, immediate AQI comprehension
- **Progressive disclosure** - Layer detailed information, don't overwhelm
- **Reference inspirations:** Apple Weather (visual hierarchy), Windy.com (map interaction), Linear (typography), IQAir (health communication)

---

## Typography

**Fonts:** Inter (body/UI), Plus Jakarta Sans (headings/display), JetBrains Mono (data values)

**Scale:**
```
Hero AQI: text-8xl font-bold tracking-tight
Page titles: text-4xl font-semibold
Sections: text-2xl font-semibold
Subsections: text-lg font-medium
Body: text-base leading-relaxed
Labels: text-sm font-medium
Timestamps: text-xs
```

---

## Layout & Spacing

**Container:** `max-w-7xl mx-auto px-4 md:px-6 lg:px-8`

**Spacing units:** 2/4 (micro), 6/8 (standard), 12/16/20 (sections), 24 (page gaps)

**Grid:**
- Mobile: Single column
- Tablet (md:): 2-column cards
- Desktop (lg:): 3-column dashboard

**Viewport heights:**
- Hero: 90-100vh
- Map: 70vh minimum
- Charts: Natural content height

---

## Color System

### Theme Implementation
```jsx
// Light theme base
bg-white text-slate-900

// Dark theme base  
bg-slate-900 text-white

// Glassmorphism cards
bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg
border border-white/20
```

### AQI Color Scale
```
0-50 Good: #10b981 (emerald-500)
51-100 Moderate: #fbbf24 (amber-400)
101-150 Unhealthy (SG): #f97316 (orange-500)
151-200 Unhealthy: #ef4444 (red-500)
201-300 Very Unhealthy: #a855f7 (purple-500)
301+ Hazardous: #7f1d1d (red-900)
```

**Gradient backgrounds:** Subtle mesh for hero only, chart area fills from data line to transparent

---

## Components

### Navigation
```jsx
<nav className="sticky top-0 h-16 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80">
  {/* Logo left, nav center, theme toggle + user right */}
  {/* Links: hover:scale-105 transition-transform duration-200 */}
  {/* Mobile: Hamburger → slide-in drawer */}
</nav>
```

### AQI Gauge (Hero)
- Circular gauge 300px (desktop), 240px (mobile)
- Animated arc fill (1.2s ease-out on load)
- Center: Giant number with pulsing glow effect based on severity
- Ring segments for pollutants (PM2.5, PM10, NO₂, O₃)
- Health status label with icon below

### Pollutant Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-lg 
                  hover:scale-105 transition-transform duration-200">
    {/* Icon 48px + Name + Value + 24h sparkline (32h × 80w) */}
  </div>
</div>
```
**Stagger animation:** Cards fade in with 0.3s delay between each

### Map Interface
```jsx
<div className="w-full h-[70vh] rounded-xl relative">
  {/* MapLibre container, edge-to-edge mobile */}
  {/* Layer controls: floating top-right with backdrop-blur */}
  {/* Toggles: Stations / Satellite AOD / Active Fires */}
  {/* Custom markers: Circular with AQI value, size by severity */}
  {/* Legend: collapsible bottom-left drawer */}
</div>
```

### Charts (Apache ECharts)
- Height: 400px desktop, 300px mobile
- Line charts with gradient area fills
- Uncertainty bands: semi-transparent ranges
- Tooltips: custom styled with backdrop-blur
- Time toggles: 24h/48h/72h tabs above chart
- Animate line drawing: 1s ease-in-out
- Historical: Date pills (7/30/90 days), CSV/PNG export

### Health Advisory
```jsx
{/* Breakpoint toggle: WHO ↔ CPCB with smooth transition */}
<div className="space-y-6">
  {/* AQI scale visual with current position indicator */}
  {/* Category card: Icon + Severity bar + AI advice (leading-relaxed) */}
  {/* Activity recommendations: Indoor/Outdoor/Exercise icons + text */}
  {/* "Explain this" → expandable AI summary */}
</div>
```

### Alerts
- Threshold sliders with visual AQI scale background
- Alert cards: stacked list, swipe-to-dismiss (mobile)
- Each: Timestamp + Location + Value + Severity badge
- Notification permission: clear modal prompt

---

## Page Structures

### Dashboard
1. **Hero (90vh):** Large gauge centered, location header above, gradient background with subtle particles, quick actions (Forecast/Alert)
2. **Live Data:** 4-col pollutant grid, 6h mini timeline
3. **Map (70vh):** Full-width with integrated search
4. **Forecast Teaser:** 24h preview chart + CTA

### Forecast
1. Location breadcrumb + time selector (24/48/72h tabs)
2. AI summary card: narrative + bullet insights + confidence
3. Per-pollutant charts with uncertainty bands, compare toggle
4. Weather context sidebar: wind/temp/humidity

### Trends
1. Controls: date range pills + custom picker, pollutant multi-select
2. Main chart: large, zoomable, event annotations
3. Stats cards (3-col): average/peak/trends
4. Export: CSV/PNG buttons

### Health
1. Standards toggle prominent at top
2. Large color-coded AQI scale with position indicator
3. Recommendation grid by activity type
4. AI chat interface: "Ask about air quality" input

---

## Animations (Use Sparingly)

**Essential only:**
- AQI gauge arc: 1.2s ease-out
- Cards: stagger fade-in (0.3s delay)
- Charts: line drawing 1s ease-in-out
- Map marker pulse (current location only)
- Hover: `scale-105 duration-200` on cards/buttons

**No animations:** Page transitions, scroll effects, background (except hero particles)

---

## Accessibility Requirements

- Touch targets: min-height 44px
- Focus rings: 2px with offset on all interactive elements
- Color contrast: WCAG AA (4.5:1 minimum)
- Forms: visible labels always, consistent styling
- Charts: keyboard navigation with arrows
- ARIA labels on all data viz
- Live regions for real-time alerts
- Map controls: Tab navigable

---

## Responsive Behavior

**Mobile (<768px):**
- Single column, simplified charts with swipe
- Bottom sheet for details, hamburger nav
- Collapsible map controls

**Tablet (768-1024px):**
- 2-column grids, side-by-side map + data

**Desktop (>1024px):**
- Full multi-column, larger charts, hover enabled
- Optional persistent sidebar nav

---

## Visual Assets

**Icons:** Heroicons
- Navigation: outline 24px
- Buttons: solid 20px  
- Cards: mini 16px
- Features: outline 48px
- Pollutants: chemical symbols in circular badges

**Images (professional photography, optimized):**
- Hero: Dynamic sky (1920×1080+) - clear blue (good AQI) or hazy (poor AQI), semi-transparent overlay for text readability, `background-size: cover`
- Health page: Activity photos (800×600) - outdoor/indoor based on AQI context, diverse representation
- Info sections: Satellite imagery, monitoring equipment
- **Not needed:** Map (rendered), charts (data viz), dashboard cards

---

## Implementation Notes

**Glassmorphism pattern:**
```jsx
className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg 
           border border-white/20 shadow-xl"
```

**Gradient accents:** Hero background mesh, chart fills, severity indicators, primary CTA buttons only

**Code priority:** Semantic HTML, proper heading hierarchy, keyboard accessibility first, progressive enhancement for animations