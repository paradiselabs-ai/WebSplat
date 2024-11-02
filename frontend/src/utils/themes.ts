export const darkTheme = {
    // Main UI Colors
    mainBackground: '#212121',
    headerBackground: '#212121',
    navigationBackground: '#222222',
    sidebarBackground: '#2A2A2A',
    panelBackground: '#171717',
    
    // Text Colors
    primaryText: '#FFFFFF',
    secondaryText: '#676767',
    tertiaryText: '#888888',
    placeholderText: '#808080',
    
    // Interactive Elements
    buttonPrimary: '#525252',
    buttonHover: '#757575',
    buttonActive: '#8E8E8E',
    
    // Input Elements
    inputBackground: '#525252',
    inputBorder: '#4A4A4A',
    inputFocus: '#8E8E8E',
    
    // Accent Colors
    accentPrimary: '#4A4A4A',
    accentSecondary: '#808080',
    accentHighlight: '#9A9A9A',
    
    // Hover States
    hoverBackground: '#3A3A3A',
    hoverText: '#AAAAAA',
    
    // Scroll Colors
    scrollTrack: '#171717',
    scrollThumb: '#4A4A4A',
    
    // Border Colors
    borderPrimary: '#4A4A4A',
    borderSecondary: '#757575',

    // Loader Colors
    loaderGradientStart: 'rgba(255, 255, 255, 0.6)',
    loaderGradientEnd: 'rgba(0, 0, 0, 0.6)',
    loaderGlowPrimary: 'rgba(255, 255, 255, 0.8)',
    loaderGlowSecondary: '#FB9B54',
};

export const lightTheme = {
    // Main UI Colors
    mainBackground: '#F2F2F2',
    headerBackground: '#E5E5E5',
    navigationBackground: '#E5E5E5',
    sidebarBackground: '#E5E5E5',
    panelBackground: '#F5F5F5',
    
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
    loaderGradientStart: 'rgba(255, 255, 255, 0.8)',
    loaderGradientEnd: 'rgba(200, 200, 200, 0.6)',
    loaderGlowPrimary: 'rgba(255, 255, 255, 0.9)',
    loaderGlowSecondary: '#FB9B54',
};

export type Theme = typeof darkTheme;
export type ThemeType = 'light' | 'dark';

export const getTheme = (type: ThemeType): Theme => {
    return type === 'dark' ? darkTheme : lightTheme;
};
