// APFM / Stella design tokens — shared by all inline-styled components.
// Source of truth: docs/design-profile-apfm.md + docs/apfm-tokens.css.
// Guardrails: warm cream canvas, navy structure, coral used surgically.
// NO purple/indigo, NO glassmorphism, NO emoji-as-icon, NO dark-mode-by-default.

export const t = {
  // brand core
  ink: "#333333",
  navy: "#1F3D54",       // Nile Blue — primary
  navyTint: "#E7EFF4",
  blue: "#6C9BB8",       // Dove Blue — secondary

  // warm accents (the "love" side — high impact, use sparingly)
  coral: "#E4735E",      // primary CTA / accent
  coralDark: "#C85A47",
  apricot: "#F4C77B",
  cream: "#FBF7F1",      // page background (never stark white)
  sand: "#F1E8DA",

  // support + semantic
  sage: "#6FA890",
  success: "#3F8E6C",    // occupancy up / capacity available
  warning: "#E0A23B",    // vacancy risk / watch
  danger: "#C4503B",     // urgent / demand you can't serve

  // neutrals
  white: "#FFFFFF",
  gray50: "#F7F6F4",
  gray100: "#EEEDEA",
  gray300: "#D6D3CD",
  gray500: "#8A867E",
  gray700: "#55524C",

  // type
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  sans: "'Mulish', -apple-system, 'Segoe UI', Roboto, sans-serif",

  // shape + depth (soft, warm, low — never harsh black shadows)
  radiusSm: 8,
  radius: 12,
  radiusLg: 20,
  shadowSm: "0 1px 2px rgba(31,61,84,.06)",
  shadow: "0 8px 24px rgba(31,61,84,.08)",
};

// Status chip palette — pill, tinted bg + darker text.
export const chip = {
  success: { bg: "#EAF3EE", fg: "#2E6B50" },
  warning: { bg: "#FBF0DC", fg: "#9A6B18" },
  danger:  { bg: "#F7E4E0", fg: "#9E3D2C" },
  info:    { bg: "#E7EFF4", fg: "#1F3D54" },
};

// Reusable card surface: white on cream, soft shadow, warm hairline border.
export const card = {
  background: t.white,
  border: `1px solid ${t.gray100}`,
  borderRadius: t.radiusLg,
  boxShadow: t.shadow,
  padding: 24,
};

// APFM data-viz series order: navy → dove blue → sage → apricot → coral.
// Channel origins are mapped onto this on-brand series (NOT external brand
// hexes) so nothing drifts into banned purple/indigo.
export const channelColor = {
  "ChatGPT":    t.navy,
  "Gemini":     t.blue,
  "Perplexity": t.sage,
  "Epic EHR":   t.coral,
  "Claude":     t.warning,
};

// Intent → semantic chip mapping used across pipeline + dashboard.
export const intentChip = {
  "deposit-ready": chip.success,
  "tour-booked":   chip.info,
  "inquiry":       { bg: t.gray100, fg: t.gray700 },
};
