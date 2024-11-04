export const darkTheme = {
    // Main UI Colors - Added blue undertones for sophistication
    mainBackground: '#1A1D24',      // Darker blue-gray base
    headerBackground: '#1A1D24',    // Matching main background
    navigationBackground: '#1C2027', // Slight contrast from main
    sidebarBackground: '#16191F',   // Slightly lighter than background
    panelBackground: '#16191F',     // Darkest shade for depth

    // Text Colors - Improved contrast and readability
    primaryText: '#FFFFFF',         // Kept pure white for maximum contrast
    secondaryText: '#9BA1AF',       // Warmer blue-gray
    tertiaryText: '#7A8194',        // Deeper blue-gray
    placeholderText: '#485263',     // Mid-tone blue-gray

    // Interactive Elements - Using cyan as primary accent
    buttonPrimary: '#2A2F38',       // Structured gray with blue undertone
    buttonHover: '#3DB9CF',         // Cyan accent
    buttonActive: '#2C8BA3',        // Darker cyan for active state

    // Input Elements - Matching the new color scheme
    inputBackground: '#2A2F38',     // Matching button primary
    inputBorder: '#485263',         // Mid-tone blue-gray
    inputFocus: '#3DB9CF',          // Cyan accent for focus

    // Accent Colors - Shifted from orange to cyan
    accentPrimary: '#2A2F38',       // Structured blue-gray
    accentSecondary: '#485263',     // Mid-tone blue-gray
    accentHighlight: '#5B9ECA',     // Light blue highlight
    logoAnimation: '#3DB9CF',       // Changed from orange to cyan

    // Hover States - More distinctive and visible
    hoverBackground: '#242830',     // Lighter than background
    hoverText: '#67E8FF',          // Bright cyan for hover

    // Scroll Colors - Better contrast
    scrollTrack: '#16191F',        // Darkest shade
    scrollThumb: '#2A2F38',        // Visible but not distracting

    // Border Colors - More refined
    borderPrimary: '#2A2F38',      // Structured blue-gray
    borderSecondary: '#485263',    // Mid-tone blue-gray

    // Loader Colors - Adjusted for new theme
    loaderGradientStart: 'rgba(232, 236, 243, 0.6)', // Blue-tinted white
    loaderGradientEnd: 'rgba(22, 25, 31, 0.6)',      // Darker blue-gray
    loaderGlowPrimary: 'rgba(232, 236, 243, 0.8)',   // Brighter blue-white
    loaderGlowSecondary: '#3DB9CF',                  // Cyan accent

    // Progress Bar Colors - Complementary to new theme
    progressGradientStart: '#3DB9CF',  // Cyan
    progressGradientEnd: '#5B9ECA',    // Light blue
    progressTrackBg: '#16191F',        // Slightly lighter than background
    progressTextColor: '#E8ECF3',      // Slightly blue-tinted white

    // StyledButton Colors - New theme variables
    styledButtonText: '#FFFFFF',
    styledButtonBg: '#2A2F38',
    styledButtonBorder: '#485263',
    styledButtonShadowDark: '#16191F',
    styledButtonShadowLight: '#3D4452',
    styledButtonHoverBorder: '#5B9ECA',
    styledButtonActiveShadowDark: '#1A1D24',
    styledButtonActiveShadowLight: '#343B47'
};

export const lightTheme = {
    // Main UI Colors
    mainBackground: '#F2F2F2',
    headerBackground: '#E5E5E5',
    navigationBackground: '#E5E5E5',
    sidebarBackground: '#E5E5E5',
    panelBackground: '#F5F9FC',
    
    // Text Colors
    primaryText: '#333333',
    secondaryText: '#666666',
    tertiaryText: '#999999',
    placeholderText: '#C9C9C9',
    
    // Interactive Elements
    buttonPrimary: '#C9C9C9',
    buttonHover: '#A9A9A9',
    buttonActive: '#969696',
    
    // Input Elements
    inputBackground: '#FFFFFF',
    inputBorder: '#C9C9C9',
    inputFocus: '#969696',
    
    // Accent Colors
    accentPrimary: '#C9C9C9',
    accentSecondary: '#A9A9A9',
    accentHighlight: '#969696',
    logoAnimation: '#00B4B5',
    
    // Hover States
    hoverBackground: '#D9D9D9',
    hoverText: '#333333',
    
    // Scroll Colors
    scrollTrack: '#E5E5E5',
    scrollThumb: '#C9C9C9',
    
    // Border Colors
    borderPrimary: '#C9C9C9',
    borderSecondary: '#A9A9A9',

    // Loader Colors
    loaderGradientStart: 'rgba(0, 180, 181, 0.3)',
    loaderGradientEnd: 'rgba(30, 59, 145, 0.6)',
    loaderGlowPrimary: 'rgba(30, 59, 145, 0.1)',
    loaderGlowSecondary: 'rgba(30, 59, 145, 0.1)',

    // Progress Bar Colors
    progressGradientStart: '#FF1493', 
    progressGradientEnd: '#FFA500',  
    progressTrackBg: '#E5E5E5',
    progressTextColor: '#333333',

    // StyledButton Colors - New theme variables
    styledButtonText: '#090909',
    styledButtonBg: '#e8e8e8',
    styledButtonBorder: '#e8e8e8',
    styledButtonShadowDark: '#c5c5c5',
    styledButtonShadowLight: '#ffffff',
    styledButtonHoverBorder: '#ffffff',
    styledButtonActiveShadowDark: '#d1d1d1',
    styledButtonActiveShadowLight: '#ffffff'
};

export type Theme = typeof darkTheme;
export type ThemeType = 'light' | 'dark';

export const getTheme = (type: ThemeType): Theme => {
    return type === 'dark' ? darkTheme : lightTheme;
};
