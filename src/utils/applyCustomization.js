// Converts a portfolio's theme/customization object into CSS vars and
// data-attributes that are applied to the .portfolio-wrapper div.
// Everything cascades from there — no individual component changes needed.

export const DEFAULT_CUSTOMIZATION = {
  accentColor: '#c79b3b',   // the current gold used throughout the design
  fontFamily: 'Amethysta',  // current default font (already loaded in main.css)
  imageShape: 'circle',     // circle | rounded | square
  buttonStyle: 'rounded',   // rounded | pill | square
  cardStyle: 'bordered',    // bordered | shadowed | minimal
};

// Builds the inline style object applied to .portfolio-wrapper.
// React supports CSS custom property names (--xxx) in the style prop.
export function buildPortfolioStyle(theme) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(theme || {}) };
  return {
    '--accent-color': c.accentColor,
    '--dark-color': c.accentColor,   // About section background uses --dark-color
    '--portfolio-font': c.fontFamily,
  };
}

// Builds the data-attribute object applied to .portfolio-wrapper.
// customization.css uses [data-xxx] attribute selectors to apply styles.
export function buildPortfolioAttrs(theme) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(theme || {}) };
  return {
    'data-image-shape': c.imageShape,
    'data-btn-style': c.buttonStyle,
    'data-card-style': c.cardStyle,
  };
}
