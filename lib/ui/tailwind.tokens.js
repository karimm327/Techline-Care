/**
 * Extension Tailwind 3 pour les tokens « Ardoise ».
 * Branché dans tailwind.config.js : theme.extend = require("./lib/ui/tailwind.tokens.js")
 * Source : docs/refonte/tailwind.tokens.js (+ compléments issus de la maquette).
 *
 * Les couleurs utilisent le format `rgb(var(--x) / <alpha-value>)`
 * → `bg-accent/15`, `ring-st-encours/35` fonctionnent.
 */
const c = (v) => `rgb(var(--${v}) / <alpha-value>)`;

module.exports = {
  colors: {
    "bg-sunken": c("bg-sunken"),
    bg: c("bg"),
    surface: {
      DEFAULT: c("surface"),
      2: c("surface-2"),
      3: c("surface-3"),
      hover: c("surface-hover"),
      row: c("surface-row"),
      inset: c("surface-inset"),
    },
    line: {
      DEFAULT: c("line"),
      strong: c("line-strong"),
      soft: c("line-soft"),
      hover: c("line-hover"),
      field: c("line-field"),
      card: c("line-card"),
    },
    fg: {
      DEFAULT: c("fg"),
      1: c("fg-1"),
      2: c("fg-2"),
      3: c("fg-3"),
      4: c("fg-4"),
    },
    field: { focus: c("field-focus") },
    ink: c("ink"),
    scrim: c("scrim"),
    grille: c("grille"),
    skeleton: { hi: c("skeleton-hi") },
    avatar: {
      1: c("avatar-1"),
      2: c("avatar-2"),
      3: c("avatar-3"),
      4: c("avatar-4"),
      5: c("avatar-5"),
      6: c("avatar-6"),
      7: c("avatar-7"),
      8: c("avatar-8"),
    },
    accent: {
      DEFAULT: c("accent"),
      soft: c("accent-soft"),
      fg: c("accent-fg"),
      "fg-2": c("accent-fg-2"),
    },
    st: {
      nouvelle: c("st-nouvelle"),
      "nouvelle-fg": c("st-nouvelle-fg"),
      encours: c("st-encours"),
      "encours-fg": c("st-encours-fg"),
      cloturee: c("st-cloturee"),
      "cloturee-fg": c("st-cloturee-fg"),
      annulee: c("st-annulee"),
      "annulee-fg": c("st-annulee-fg"),
    },
    prio: {
      haute: c("prio-haute"),
      "haute-fg": c("prio-haute-fg"),
      normale: c("prio-normale"),
      basse: c("prio-basse"),
    },
    danger: { DEFAULT: c("st-annulee"), fg: c("st-annulee-fg") },
    success: { DEFAULT: c("st-cloturee"), fg: c("st-cloturee-fg") },
  },
  fontFamily: {
    display: ["var(--font-display)", "system-ui", "sans-serif"],
    sans: ["var(--font-sans)", "system-ui", "sans-serif"],
    mono: ["var(--font-mono)", "ui-monospace", "monospace"],
  },
  fontSize: {
    "display-xl": [
      "46px",
      { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "600" },
    ],
    h1: [
      "32px",
      { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" },
    ],
    h2: [
      "22px",
      { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" },
    ],
    h3: ["16px", { lineHeight: "1.35", fontWeight: "600" }],
    kpi: [
      "38px",
      { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "600" },
    ],
    eyebrow: [
      "12px",
      { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" },
    ],
  },
  borderRadius: {
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
  },
  boxShadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
    glow: "var(--glow-accent)",
    focus: "var(--ring-focus)",
    logo: "var(--shadow-logo)",
    "glow-nav": "var(--glow-nav)",
  },
  transitionTimingFunction: {
    out: "var(--ease-out)",
    "in-out": "var(--ease-in-out)",
    spring: "var(--ease-spring)",
  },
  transitionDuration: {
    fast: "140ms",
    base: "220ms",
    slow: "380ms",
    enter: "560ms",
  },
  spacing: {
    header: "var(--header-h)",
    sidebar: "var(--sidebar-w)",
    "sidebar-collapsed": "var(--sidebar-w-collapsed)",
  },
  zIndex: {
    header: "30",
    sticky: "20",
    toast: "50",
    overlay: "60",
    palette: "70",
  },
  keyframes: {
    rise: {
      from: { opacity: "0", transform: "translateY(14px)" },
      to: { opacity: "1", transform: "none" },
    },
    fade: { from: { opacity: "0" }, to: { opacity: "1" } },
    ping: {
      "0%": { transform: "scale(1)", opacity: ".75" },
      "80%, 100%": { transform: "scale(2.6)", opacity: "0" },
    },
    swing: {
      "0%, 70%, 100%": { transform: "rotate(0)" },
      "74%": { transform: "rotate(16deg)" },
      "79%": { transform: "rotate(-12deg)" },
      "84%": { transform: "rotate(7deg)" },
      "89%": { transform: "rotate(-3deg)" },
    },
    pulse: {
      "0%": { boxShadow: "0 0 0 0 rgb(var(--prio-haute) / .55)" },
      "100%": { boxShadow: "0 0 0 9px rgb(var(--prio-haute) / 0)" },
    },
    draw: { to: { strokeDashoffset: "0" } },
    bar: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
    pop: {
      "0%": { transform: "scale(.6)", opacity: "0" },
      "60%": { transform: "scale(1.08)", opacity: "1" },
      "100%": { transform: "scale(1)" },
    },
    menu: {
      from: { opacity: "0", transform: "translateY(-6px) scale(.97)" },
      to: { opacity: "1", transform: "none" },
    },
    "slide-down": {
      from: { opacity: "0", transform: "translateY(-12px)" },
      to: { opacity: "1", transform: "none" },
    },
    progress: {
      from: { transform: "scaleX(1)" },
      to: { transform: "scaleX(0)" },
    },
    live: { "0%, 100%": { opacity: "1" }, "50%": { opacity: ".35" } },
    bounce3: {
      "0%, 80%, 100%": { transform: "translateY(0)", opacity: ".5" },
      "40%": { transform: "translateY(-5px)", opacity: "1" },
    },
    burst: {
      "0%": { transform: "translate(0,0) rotate(0) scale(1)", opacity: "1" },
      "100%": {
        transform: "translate(var(--dx),var(--dy)) rotate(var(--r)) scale(.6)",
        opacity: "0",
      },
    },
    shimmer: {
      from: { backgroundPosition: "-600px 0" },
      to: { backgroundPosition: "600px 0" },
    },
    float: {
      "0%, 100%": { transform: "translateY(0) rotate(var(--r,0deg))" },
      "50%": { transform: "translateY(-14px) rotate(var(--r,0deg))" },
    },
    grid: {
      from: { backgroundPosition: "0 0" },
      to: { backgroundPosition: "48px 48px" },
    },
    shake: {
      "0%, 100%": { transform: "translateX(0)" },
      "20%": { transform: "translateX(-6px)" },
      "40%": { transform: "translateX(5px)" },
      "60%": { transform: "translateX(-3px)" },
      "80%": { transform: "translateX(2px)" },
    },
    ring: { from: { strokeDashoffset: "var(--c)" } },
    drop: {
      "0%, 100%": {
        borderColor: "rgb(var(--accent-fg) / .35)",
        backgroundColor: "rgb(var(--accent) / .05)",
      },
      "50%": {
        borderColor: "rgb(var(--accent-fg) / .85)",
        backgroundColor: "rgb(var(--accent) / .13)",
      },
    },
    lift: {
      "0%, 100%": { transform: "rotate(-3deg) translateY(0)" },
      "50%": { transform: "rotate(-2deg) translateY(-6px)" },
    },
    glitch: {
      "0%, 92%, 100%": { transform: "none" },
      "94%": { transform: "translate(-3px,1px) skewX(-6deg)" },
      "96%": { transform: "translate(3px,-1px) skewX(4deg)" },
    },
  },
  animation: {
    rise: "rise 560ms var(--ease-out) both",
    fade: "fade 200ms ease both",
    ping: "ping 1.8s cubic-bezier(0,0,.2,1) infinite",
    swing: "swing 6s ease-in-out infinite",
    pulse: "pulse 1.8s ease-out infinite",
    draw: "draw 1.5s var(--ease-in-out) .35s forwards",
    bar: "bar 1s var(--ease-out) .4s both",
    pop: "pop .6s var(--ease-spring) both",
    menu: "menu 200ms var(--ease-out) both",
    "slide-down": "slide-down 320ms var(--ease-out) both",
    progress: "progress 6s linear both",
    live: "live 1.6s ease-in-out infinite",
    bounce3: "bounce3 1.2s ease-in-out infinite",
    burst: "burst .9s cubic-bezier(.15,.7,.3,1) both",
    shimmer: "shimmer 1.5s linear infinite",
    float: "float 6s ease-in-out infinite",
    grid: "grid 6s linear infinite",
    shake: "shake 450ms ease both",
    ring: "ring 1.6s var(--ease-out) .3s both",
    drop: "drop 1.4s ease-in-out infinite",
    lift: "lift 2.4s ease-in-out infinite",
    glitch: "glitch 3.5s steps(1) infinite",
  },
};
