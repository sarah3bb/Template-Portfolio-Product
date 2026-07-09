export const DEFAULT_CUSTOMIZATION = {
  accentColor:    '#c79b3b',     // gold — matches the original design
  bgColor:        '',            // empty = transparent (section backgrounds show through)
  fontFamily:     'Amethysta',   // current default; all options already imported in main.css
  imageShape:     'circle',      // circle | rounded | square
  buttonStyle:    'rounded',     // rounded | pill | square
  cardStyle:      'bordered',    // bordered | shadowed | minimal
  sectionSpacing: 'comfortable', // compact | comfortable | spacious
  layoutStyle:    'classic',     // classic | modern | minimal
  headerStyle:    'split',       // split | centered
};

// Inline style object applied to .portfolio-wrapper.
// React supports CSS custom property names (--xxx) in the style prop.
export function buildPortfolioStyle(theme) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(theme || {}) };

  const spacingMap = { compact: '60px', comfortable: '100px', spacious: '140px' };

  return {
    '--accent-color':    c.accentColor,
    '--dark-color':      c.accentColor,  // About section bg uses --dark-color
    '--portfolio-font':  c.fontFamily,
    '--section-spacing': spacingMap[c.sectionSpacing] ?? '100px',
    ...(c.bgColor ? { '--bg-color': c.bgColor } : {}),
  };
}

// Data-attribute object applied to .portfolio-wrapper.
// customization.css uses [data-xxx] selectors to apply styles.
export function buildPortfolioAttrs(theme) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(theme || {}) };
  return {
    'data-image-shape':  c.imageShape,
    'data-btn-style':    c.buttonStyle,
    'data-card-style':   c.cardStyle,
    'data-layout':       c.layoutStyle,
    'data-header-style': c.headerStyle,
  };
}
