// ═══════════════════════════════════════════════════════════
//  PARK DESTROYER — full session widget for Scriptable (iOS)
//
//  Setup:
//    1. Scriptable → + → paste this in → name it "Park Destroyer".
//    2. Home screen → long press → + → Scriptable → LARGE size.
//    3. Long press the placed widget → Edit Widget → Script → pick it.
//
//  iOS widgets cannot scroll, so everything is sized to fit at once.
//  Run it inside the Scriptable app to preview the large layout.
// ═══════════════════════════════════════════════════════════

// ── Tweakables ────────────────────────────────────────────
// ►► PASTE YOUR LIVE SITE URL HERE ◄◄
// Tapping the widget opens this. Until it's filled in, the widget stays
// tappable-but-inert rather than launching a broken page.
const SITE_URL = "https://YOUR-SITE.netlify.app";

// Form cues roughly double the line count. Off by default so the
// exercise names stay legible; flip to true if you want them.
const SHOW_NOTES = false;

// Base type sizes at the reference device (iPhone 15). Everything below is
// multiplied by a fit factor, so a bigger widget gets bigger text rather than
// empty space, and a smaller one shrinks instead of clipping.
const F = { title: 13, meta: 6.5, phase: 8.5, time: 6, tag: 6, name: 8, sets: 8, reps: 5.5, note: 6 };

// Nudge everything up or down if you want it denser or roomier.
const TUNE = 1.0;

// Override only if the auto-fit guesses your device wrong.
let COL_WIDTH = null;

const COL_GAP = 8, PAD = 8;

// Large-widget [width, height] in points, keyed by device screen width.
const LARGE = {
  320: [292, 311], 360: [329, 345], 375: [329, 345], 390: [338, 354],
  393: [338, 354], 402: [360, 379], 414: [360, 376], 428: [364, 382],
  430: [364, 382], 440: [370, 390],
  744: [512, 512], 768: [512, 512], 810: [540, 540], 820: [540, 540],
  834: [560, 560], 1024: [620, 620]
};

// Height the base sizes above actually need, measured off the reference
// layout. Used to work out how much room this device has spare.
const REF_CONTENT_H = 326;
const REF_W = 338;

// ── Palette (matches the web app) ─────────────────────────
const C = {
  bg:     new Color("#0D0D0D"),
  card:   new Color("#181818"),
  red:    new Color("#E8232A"),
  yellow: new Color("#FFD000"),
  text:   new Color("#F0EDE4"),
  muted:  new Color("#8A8A8A"),
  dim:    new Color("#5F5F5F")
};

// ── The session ───────────────────────────────────────────
const COL_LEFT = [
  { num: "PHASE 01", title: "IGNITION", time: "0–7 MIN", blocks: [
      { tag: "Circuit · 1 Round · No Rest", ex: [
        { n: "Arm Circles + Shoulder Rolls", s: ":30", r: "each way", note: "Big circles, both directions" },
        { n: "Dead Hang", s: ":45", r: "hold", note: "Full hang — decompress spine, activate grip" },
        { n: "Scapular Pull-ups", s: "2×10", r: "slow", note: "Retract and depress — activate lats before loading" },
        { n: "Leg Swings + Hip Circles", s: ":30", r: "each direction", note: "Front/back then lateral" },
        { n: "Band Pull-Aparts", s: "20 reps", r: "slow eccentric", note: "Squeeze hard at end range — warm rear delts" }
      ] }
    ] },
  { num: "PHASE 02", title: "PULL ANNIHILATION", time: "7–22 MIN", blocks: [
      { tag: "Superset A · 4 Rounds · 45s rest", ex: [
        { n: "Wide-Grip Pull-ups", s: "4×8", r: "controlled", note: "Dead hang to chin over bar — full ROM every rep" },
        { n: "Band Bent-Over Row", s: "4×15", r: "explosive pull", note: "Stand on band — elbows flared, hard squeeze at top" }
      ] },
      { tag: "Superset B · 3 Rounds · 30s rest", ex: [
        { n: "Commando Pull-ups", s: "3×6", r: "each side", note: "Alternate which side of bar the head goes to" },
        { n: "Band Face Pull", s: "3×20", r: "slow squeeze", note: "Anchor band high — pull to forehead, elbows high and wide" }
      ] }
    ] },
  { num: "PHASE 03", title: "PUSH DESTRUCTION", time: "22–37 MIN", blocks: [
      { tag: "Superset C · 4 Rounds · 45s rest", ex: [
        { n: "Archer Push-ups", s: "4×8", r: "each side", note: "Hands wide — shift full weight side to side, outside arm nearly straight" },
        { n: "Band Chest Press", s: "4×15", r: "explosive", note: "Wrap band around bar behind — explosive press forward" }
      ] },
      { tag: "Superset D · 4 Rounds · 30s rest", ex: [
        { n: "Bar Dips", s: "4×12", r: "controlled", note: "Lean forward for chest — 3s slow down, explode up" },
        { n: "Diamond Push-ups to Failure", s: "4×MAX", r: "failure every time", note: "Go until you literally can't. That's the set." }
      ] }
    ] }
];

const COL_RIGHT = [
  { num: "PHASE 04", title: "LEG + CORE OBLITERATION", time: "37–52 MIN", blocks: [
      { tag: "Superset E · 4 Rounds · 30s rest", ex: [
        { n: "Bulgarian Split Squat", s: "4×10", r: "each leg", note: "Rear foot on bench/bar — band over shoulders for load" },
        { n: "Explosive Jump Lunge", s: "4×20", r: "total alternating", note: "Alternate legs — land soft, drive hard" },
        { n: "Toes-to-Bar", s: "4×12", r: "slow eccentric", note: "Hang from pull-up bar — no swing, full control, slow down" }
      ] },
      { tag: "Superset F · 3 Rounds · No rest between exercises", ex: [
        { n: "Band Glute Bridge Pulse", s: "3×20", r: "pulsing at top", note: "Band above knees — 3-second squeeze hold at top" }
      ] }
    ] },
  { num: "PHASE 05", title: "THE GRAVE", time: "52–60 MIN", blocks: [
      { tag: "Death Circuit · 2 Rounds · No rest until done", ex: [
        { n: "Pull-ups to Failure", s: "×MAX", r: "failure", note: "Whatever you've got left" },
        { n: "Push-ups to Failure", s: "×MAX", r: "failure", note: "Standard — full depth, no half reps" },
        { n: "Squat Jumps", s: "20", r: "explosive", note: "Max height, land deep in squat" },
        { n: "Band Curl + Press", s: "×15", r: "no pause", note: "Stand on band — curl to shoulder press, one fluid motion" },
        { n: "Dead Hang Hold", s: "×MAX", r: "to failure", note: "Hold until your grip fails. Literally." }
      ] }
    ] }
];

// ── Render ────────────────────────────────────────────────
function widgetBox() {
  const sw = Math.round(Device.screenSize().width);
  if (LARGE[sw]) return LARGE[sw];
  // Nearest known screen width rather than a blind default.
  let best = LARGE[393], bestDiff = Infinity;
  for (const k of Object.keys(LARGE)) {
    const d = Math.abs(Number(k) - sw);
    if (d < bestDiff) { bestDiff = d; best = LARGE[k]; }
  }
  return best;
}

const BOX = widgetBox();

// How much this widget can grow (or must shrink) versus the reference layout.
// SAFETY keeps a margin: real text metrics vary by font and iOS version, and a
// widget that overshoots clips silently rather than scrolling.
const SAFETY = 0.92;
const FIT = Math.max(0.72, Math.min(1.75,
  ((BOX[1] - PAD * 2) / REF_CONTENT_H) * SAFETY)) * TUNE;

// Scale every size and gap through these two helpers.
const fs = k => Math.max(4.5, F[k] * FIT);
const sp = n => n * FIT;

function colWidth() {
  if (COL_WIDTH) return COL_WIDTH;
  return (BOX[0] - PAD * 2 - COL_GAP) / 2;
}

function txt(stack, s, size, color, bold) {
  const t = stack.addText(s);
  t.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size);
  t.textColor = color;
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.6;   // shrink a long name rather than wrap or clip
  return t;
}

function renderPhase(col, p, w) {
  // Phase header: number + time on one line, title under it.
  const h = col.addStack();
  h.layoutHorizontally();
  h.size = new Size(w, 0);
  txt(h, p.num, fs('time'), C.red, true);
  h.addSpacer();
  txt(h, p.time, fs('time'), C.dim, false);
  col.addSpacer(sp(1));
  txt(col, p.title, fs('phase'), C.text, true);
  col.addSpacer(sp(3));

  for (const b of p.blocks) {
    txt(col, b.tag, fs('tag'), C.yellow, false);
    col.addSpacer(sp(2));

    for (const e of b.ex) {
      const row = col.addStack();
      row.layoutHorizontally();
      row.size = new Size(w, 0);
      row.centerAlignContent();

      const nameCell = row.addStack();
      nameCell.layoutVertically();
      nameCell.size = new Size(w * 0.58, 0);
      txt(nameCell, e.n, fs('name'), C.text, false);
      if (SHOW_NOTES && e.note) txt(nameCell, e.note, fs('note'), C.muted, false);

      row.addSpacer();

      // Sets and their qualifier share one line. Stacking them vertically
      // made every row ~19pt, which overruns a large widget's height.
      const valCell = row.addStack();
      valCell.layoutHorizontally();
      valCell.centerAlignContent();
      txt(valCell, e.s, fs('sets'), C.red, true);
      if (e.r) {
        valCell.addSpacer(sp(3));
        txt(valCell, e.r, fs('reps'), C.dim, false);
      }

      col.addSpacer(sp(SHOW_NOTES ? 3 : 2));
    }
    col.addSpacer(sp(2));
  }
  col.addSpacer(sp(5));
}

const w = new ListWidget();
w.backgroundColor = C.bg;
w.setPadding(PAD, PAD, PAD, PAD);

// Whole-widget tap target → the live app. Skipped while SITE_URL is still the
// placeholder, so an unedited script doesn't open a dead page.
if (SITE_URL && !/YOUR-SITE/.test(SITE_URL)) w.url = SITE_URL;

const head = w.addStack();
head.layoutHorizontally();
head.centerAlignContent();
const a = head.addText("PARK ");
a.font = Font.heavySystemFont(fs('title')); a.textColor = C.text;
const b2 = head.addText("DESTROYER");
b2.font = Font.heavySystemFont(fs('title')); b2.textColor = C.red;
head.addSpacer();
const m = head.addText("60 MIN · 22 EX");
m.font = Font.mediumSystemFont(fs('meta')); m.textColor = C.dim;

w.addSpacer(sp(3));
const rule = w.addStack();
rule.size = new Size(0, Math.max(1, 1.5 * FIT));
rule.backgroundColor = C.red;
w.addSpacer(sp(5));

const body = w.addStack();
body.layoutHorizontally();
body.topAlignContent();

const cw = colWidth();
const colA = body.addStack(); colA.layoutVertically(); colA.size = new Size(cw, 0);
body.addSpacer(COL_GAP);
const colB = body.addStack(); colB.layoutVertically(); colB.size = new Size(cw, 0);

for (const p of COL_LEFT)  renderPhase(colA, p, cw);
for (const p of COL_RIGHT) renderPhase(colB, p, cw);
colA.addSpacer();
colB.addSpacer();

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  await w.presentLarge();
}
Script.complete();
