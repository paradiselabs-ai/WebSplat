// Current theme colors (dark theme)
export const colors = {
  // Main background colors
  background: '#212121',      // Main background color
  chatArea: '#212121',        // Main chat area background
  leftPanel: '#171717',       // Left panel/sidebar background
  mainBg: '#212121',         // Very top header background
  navBg: '#222222',          // Navigation header background
  
  // Text colors
  foreground: '#FFFFFF',      // Main text color
  buttonActive: '#FFFFFF',    // Active button text
  
  // Accent colors
  accentPrimary: '#4A4A4A',   // Text selection color
  accentSecondary: '#808080', // Secondary accent
  accentHighlight: '#9A9A9A', // Outside text bar color

  // Component specific colors (extracted from components)
  sidebar: {
    background: '#2A2A2A',
    text: '#888888',
    hover: '#3A3A3A',
    iconHover: '#4A4A4A',
    textHover: '#AAAAAA'
  },

  button: {
    primary: '#525252',
    hover: '#757575',
    active: '#8E8E8E'
  },

  input: {
    background: '#525252',
    border: '#4A4A4A',
    placeholder: '#808080',
    focus: '#8E8E8E'
  },

  text: {
    primary: '#676767',
    secondary: '#808080',
    tertiary: '#9A9A9A',
    hover: '#C1C1C1'
  }
};

// Function to get CSS variables string (for dynamic theme switching later)
export const getCssVariables = (theme = colors) => {
  return `
    --background: ${theme.background};
    --foreground: ${theme.foreground};
    --chat-area: ${theme.chatArea};
    --left-panel: ${theme.leftPanel};
    --button-active: ${theme.buttonActive};
    --accent-primary: ${theme.accentPrimary};
    --accent-secondary: ${theme.accentSecondary};
    --accent-highlight: ${theme.accentHighlight};
    --main-bg: ${theme.mainBg};
    --nav-bg: ${theme.navBg};
  `;
};

// Usage example in components:
// import { colors } from '../utils/colors';
// 
// // In styled components or CSS-in-JS:
// background-color: ${colors.background};
// 
// // In Tailwind classes (when needed):
// className={`bg-[${colors.background}]`}
//
// // For theme switching later:
// // 1. Create a light theme object with the same structure
// // 2. Use getCssVariables(lightTheme) to switch themes
