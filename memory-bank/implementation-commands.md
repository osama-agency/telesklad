# КОМАНДЫ ДЛЯ РЕАЛИЗАЦИИ РЕФАКТОРИНГА SCSS

## 🚀 ЭТАП 1: СОЗДАНИЕ БАЗОВОЙ АРХИТЕКТУРЫ

### 1.1 Создание структуры папок
```bash
# Создать новую структуру
mkdir -p src/styles/core
mkdir -p src/styles/components  
mkdir -p src/styles/modules
mkdir -p src/styles/telegram

# Создать backup текущих файлов
mkdir -p backups/scss-refactor-$(date +%Y%m%d)
cp -r src/styles/* backups/scss-refactor-$(date +%Y%m%d)/
```

### 1.2 Создание core файлов
```bash
# Создать variables.scss
cat > src/styles/core/variables.scss << 'VARS'
// ========================================
// CORE VARIABLES - Centralized Design System
// ========================================

// Colors
:root {
  // Primary colors
  --color-primary: #48C928;
  --color-primary-light: #f0fcf0;
  --color-primary-dark: #3da821;
  
  // Neutral colors
  --color-text: #3D4453;
  --color-text-light: #8E8E93;
  --color-text-hint: #999999;
  --color-bg: #f9f9f9;
  --color-bg-white: #ffffff;
  --color-border: #e0e0e0;
  
  // Status colors
  --color-success: #48C928;
  --color-error: #FF3B30;
  --color-warning: #FF9500;
  --color-info: #007AFF;
  
  // Spacing system (4px base)
  --space-1: 4px;   // 0.25rem
  --space-2: 8px;   // 0.5rem
  --space-3: 12px;  // 0.75rem
  --space-4: 16px;  // 1rem
  --space-5: 20px;  // 1.25rem
  --space-6: 24px;  // 1.5rem
  --space-8: 32px;  // 2rem
  --space-10: 40px; // 2.5rem
  --space-12: 48px; // 3rem
  --space-16: 64px; // 4rem
  
  // Typography
  --font-family-primary: "Inter", -apple-system, system-ui, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  // Breakpoints
  --breakpoint-xs: 375px;
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1200px;
  
  // Z-index scale
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 50;
  --z-modal-backdrop: 100;
  --z-modal: 1000;
  --z-popover: 1010;
  --z-tooltip: 1020;
}

// SCSS Variables for calculations
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;
$space-16: 64px;

$color-primary: #48C928;
$color-text: #3D4453;
$color-text-light: #8E8E93;
$color-bg: #f9f9f9;
$color-bg-white: #ffffff;

$font-family-primary: "Inter", -apple-system, system-ui, sans-serif;
VARS

# Создать utilities.scss
cat > src/styles/core/utilities.scss << 'UTILS'
// ========================================
// UTILITY CLASSES - Atomic Design Helpers
// ========================================

// Flexbox utilities
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-center { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.flex-between { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
}
.flex-start { 
  display: flex; 
  align-items: center; 
  justify-content: flex-start; 
}
.flex-end { 
  display: flex; 
  align-items: center; 
  justify-content: flex-end; 
}
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }

// Spacing utilities - Margin
.m-0 { margin: 0 !important; }
.m-1 { margin: var(--space-1) !important; }
.m-2 { margin: var(--space-2) !important; }
.m-3 { margin: var(--space-3) !important; }
.m-4 { margin: var(--space-4) !important; }
.m-5 { margin: var(--space-5) !important; }
.m-6 { margin: var(--space-6) !important; }
.m-8 { margin: var(--space-8) !important; }

.mt-0 { margin-top: 0 !important; }
.mt-1 { margin-top: var(--space-1) !important; }
.mt-2 { margin-top: var(--space-2) !important; }
.mt-3 { margin-top: var(--space-3) !important; }
.mt-4 { margin-top: var(--space-4) !important; }
.mt-6 { margin-top: var(--space-6) !important; }
.mt-8 { margin-top: var(--space-8) !important; }

.mb-0 { margin-bottom: 0 !important; }
.mb-1 { margin-bottom: var(--space-1) !important; }
.mb-2 { margin-bottom: var(--space-2) !important; }
.mb-3 { margin-bottom: var(--space-3) !important; }
.mb-4 { margin-bottom: var(--space-4) !important; }
.mb-6 { margin-bottom: var(--space-6) !important; }
.mb-8 { margin-bottom: var(--space-8) !important; }

.ml-0 { margin-left: 0 !important; }
.ml-1 { margin-left: var(--space-1) !important; }
.ml-2 { margin-left: var(--space-2) !important; }
.ml-4 { margin-left: var(--space-4) !important; }

.mr-0 { margin-right: 0 !important; }
.mr-1 { margin-right: var(--space-1) !important; }
.mr-2 { margin-right: var(--space-2) !important; }
.mr-4 { margin-right: var(--space-4) !important; }

// Spacing utilities - Padding
.p-0 { padding: 0 !important; }
.p-1 { padding: var(--space-1) !important; }
.p-2 { padding: var(--space-2) !important; }
.p-3 { padding: var(--space-3) !important; }
.p-4 { padding: var(--space-4) !important; }
.p-6 { padding: var(--space-6) !important; }
.p-8 { padding: var(--space-8) !important; }

.px-0 { padding-left: 0 !important; padding-right: 0 !important; }
.px-1 { padding-left: var(--space-1) !important; padding-right: var(--space-1) !important; }
.px-2 { padding-left: var(--space-2) !important; padding-right: var(--space-2) !important; }
.px-4 { padding-left: var(--space-4) !important; padding-right: var(--space-4) !important; }
.px-6 { padding-left: var(--space-6) !important; padding-right: var(--space-6) !important; }

.py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
.py-1 { padding-top: var(--space-1) !important; padding-bottom: var(--space-1) !important; }
.py-2 { padding-top: var(--space-2) !important; padding-bottom: var(--space-2) !important; }
.py-4 { padding-top: var(--space-4) !important; padding-bottom: var(--space-4) !important; }
.py-6 { padding-top: var(--space-6) !important; padding-bottom: var(--space-6) !important; }

// Z-index utilities
.z-0 { z-index: 0; }
.z-10 { z-index: var(--z-dropdown); }
.z-20 { z-index: var(--z-sticky); }
.z-50 { z-index: var(--z-fixed); }
.z-100 { z-index: var(--z-modal-backdrop); }
.z-1000 { z-index: var(--z-modal); }

// Button reset
.btn-reset {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

// Text utilities
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }

.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.text-xl { font-size: var(--font-size-xl); }
.text-2xl { font-size: var(--font-size-2xl); }

// Width utilities
.w-full { width: 100%; }
.w-auto { width: auto; }
.max-w-full { max-width: 100%; }

// Height utilities
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }

// Overflow utilities
.overflow-hidden { overflow: hidden; }
.overflow-x-hidden { overflow-x: hidden; }
.overflow-y-hidden { overflow-y: hidden; }

// Position utilities
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

// Display utilities
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.hidden { display: none; }

// Border radius utilities
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: 4px; }
.rounded { border-radius: 8px; }
.rounded-lg { border-radius: 12px; }
.rounded-xl { border-radius: 16px; }
.rounded-full { border-radius: 50%; }
UTILS

# Создать mixins.scss
cat > src/styles/core/mixins.scss << 'MIXINS'
// ========================================
// MIXINS - Reusable Style Patterns
// ========================================

// Media query mixins
@mixin mobile {
  @media (max-width: 480px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 481px) and (max-width: 768px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 769px) {
    @content;
  }
}

@mixin mobile-only {
  @media (max-width: 480px) {
    @content;
  }
}

// Container mixin
@mixin container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

// Card mixin
@mixin card {
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: var(--space-4);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

// Button mixin
@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  
  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
}

@mixin button-primary {
  @include button-base;
  background: var(--color-primary);
  color: white;
  
  &:hover {
    background: var(--color-primary-dark);
  }
  
  &:disabled {
    background: var(--color-text-light);
    cursor: not-allowed;
  }
}

// Text truncation
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin truncate-lines($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Safe area support
@mixin safe-area-padding {
  padding-top: max(env(safe-area-inset-top), var(--space-4));
  padding-left: max(env(safe-area-inset-left), var(--space-4));
  padding-right: max(env(safe-area-inset-right), var(--space-4));
  padding-bottom: max(env(safe-area-inset-bottom), var(--space-4));
}

// Focus styles
@mixin focus-ring {
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

// No focus styles (for touch interfaces)
@mixin no-focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent !important;
  
  &:focus,
  &:focus-visible,
  &:focus-within,
  &:active,
  &:hover {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
}
MIXINS

# Создать reset.scss
cat > src/styles/core/reset.scss << 'RESET'
// ========================================
// RESET - Base styles and normalization
// ========================================

// Modern CSS reset
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  overflow-x: hidden;
  max-width: 100vw;
}

body {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Remove focus outlines for touch interfaces
html,
body {
  -webkit-tap-highlight-color: transparent !important;
  -webkit-focus-ring-color: transparent !important;
}

// Force light theme
:root {
  color-scheme: light !important;
  --tg-bg-color: #ffffff !important;
  --tg-text-color: #000000 !important;
  --tg-hint-color: #999999 !important;
  --tg-link-color: #48C928 !important;
  --tg-button-color: #48C928 !important;
  --tg-button-text-color: #ffffff !important;
}

@media (prefers-color-scheme: dark) {
  :root,
  html,
  body {
    color-scheme: light !important;
    background-color: #ffffff !important;
    color: #000000 !important;
  }
}

// Remove all focus styles globally
*:focus,
*:focus-visible,
*:focus-within,
*:active,
*:hover {
  -webkit-tap-highlight-color: transparent !important;
  -webkit-focus-ring-color: transparent !important;
}

*, *::before, *::after {
  outline: none !important;
}

// Button and input resets
button,
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
  background: none;
  border: none;
}

// List resets
ul,
ol {
  list-style: none;
}

// Link resets
a {
  color: inherit;
  text-decoration: none;
}

// Image resets
img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

// Form element resets
input,
button,
textarea,
select {
  outline: none;
  border: none;
  background: none;
}

// Remove search input styling
input[type="search"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-results-button,
input[type="search"]::-webkit-search-results-decoration {
  -webkit-appearance: none;
  display: none;
}

// Remove autofill styles
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: none;
  box-shadow: none;
  outline: none;
  border: none;
}
RESET
```

### 1.3 Создание main.scss
```bash
cat > src/styles/main.scss << 'MAIN'
// ========================================
// MAIN STYLES - Entry point for all styles
// ========================================

// 1. Core styles (must be first)
@import './core/variables';
@import './core/reset';
@import './core/mixins';
@import './core/utilities';

// 2. Telegram system
@import './telegram/design-system';
@import './telegram/adaptive-theme';
@import './telegram/webapp-base';

// 3. Components (reusable UI elements)
@import './components/header';
@import './components/search';
@import './components/loader';
@import './components/photo-uploader';

// 4. Modules (page-specific styles)
@import './modules/profile';
@import './modules/cart';
@import './modules/catalog';
@import './modules/support';
@import './modules/delivery';
@import './modules/bonus';
@import './modules/action-cards';
MAIN
```

## 🔄 ЭТАП 2: МИГРАЦИЯ КОМПОНЕНТОВ

### 2.1 Миграция header
```bash
# Создать новый header.scss с namespace
cat > src/styles/components/header.scss << 'HEADER'
// ========================================
// HEADER COMPONENT - .header- namespace
// ========================================

.header-container {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: var(--color-bg);
  border-bottom: none;
  transition: all 0.2s ease;

  &.scrolled {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .header-inner {
    @include container;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-2);
    padding-bottom: var(--space-2);
  }

  .header-search {
    flex: 1;
    min-width: 0;
  }

  .header-actions {
    display: flex;
    gap: var(--space-1);
  }
}

.header-action-button {
  @include button-base;
  @include no-focus;
  
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: transparent;
  color: var(--color-text-light);

  &:hover {
    background-color: transparent !important;
    transform: none !important;
    color: var(--color-text-light) !important;
  }

  &.active {
    color: var(--color-primary) !important;
    background-color: transparent !important;
  }

  .header-action-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;

    svg {
      width: 24px;
      height: 24px;
      color: inherit;
    }
  }

  .header-action-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    background: var(--color-primary);
    color: white;
    font-size: 9px;
    font-weight: var(--font-weight-bold);
    line-height: 14px;
    text-align: center;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 2px solid var(--color-bg-white);
    transform: translate(25%, -25%);
  }
}

.header-profile-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-bg-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// Responsive
@include mobile {
  .header-container {
    .header-inner {
      padding-left: var(--space-3);
      padding-right: var(--space-3);
      gap: var(--space-2);
    }
  }

  .header-action-button {
    width: 36px;
    height: 36px;
    
    .header-action-icon {
      width: 22px;
      height: 22px;
      
      svg {
        width: 22px;
        height: 22px;
      }
    }
    
    .header-action-badge {
      top: -8px;
      right: -8px;
      min-width: 12px;
      height: 12px;
      font-size: 8px;
      line-height: 12px;
      padding: 0 2px;
      border-radius: 7px;
      border-width: 1.5px;
      transform: translate(20%, -20%);
    }
  }

  .header-profile-avatar {
    width: 22px;
    height: 22px;
  }
}
HEADER
```

### 2.2 Миграция search
```bash
# Создать search.scss объединяющий все поисковые стили
cat > src/styles/components/search.scss << 'SEARCH'
// ========================================
// SEARCH COMPONENT - .search- namespace
// ========================================

.search-container {
  position: relative;
  width: 100%;
  
  .search-box {
    position: relative;
    height: 36px;
    border-radius: 20px;
    background: #f5f5f5;
    border: 1px solid transparent;
    display: flex;
    align-items: center;

    &:focus-within {
      background: #f8f8f8;
      border-color: #e0e0e0;
    }

    .search-input {
      @include no-focus;
      
      width: 100%;
      height: 100%;
      font-size: var(--font-size-sm);
      padding: 0 36px;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--font-family-primary);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      width: 18px;
      height: 18px;
      color: var(--color-text-light);
      pointer-events: none;
    }

    .search-clear {
      position: absolute;
      right: 8px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-light);
      
      &:hover {
        color: var(--color-text);
      }
    }
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-bg-white);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    z-index: var(--z-dropdown);
    max-height: 400px;
    overflow-y: auto;
    margin-top: var(--space-2);

    .search-result-item {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;

      &:hover {
        background: var(--color-bg);
      }

      &:last-child {
        border-bottom: none;
      }

      .result-title {
        font-weight: var(--font-weight-medium);
        color: var(--color-text);
        margin-bottom: var(--space-1);
      }

      .result-description {
        font-size: var(--font-size-xs);
        color: var(--color-text-light);
      }
    }

    .search-no-results {
      padding: var(--space-6) var(--space-4);
      text-align: center;
      color: var(--color-text-light);
      font-size: var(--font-size-sm);
    }
  }
}

// Modern search styles (from algolia integration)
.search-modern {
  .search-container {
    .search-box {
      height: 40px;
      border-radius: 12px;
      background: var(--color-bg-white);
      border: 1px solid var(--color-border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
      }
    }
  }
}

// Perfect centering for search results
.search-centered {
  .search-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
}

// Responsive
@include mobile {
  .search-container {
    .search-box {
      height: 34px;
      
      .search-input {
        font-size: 13px;
      }
    }
  }
}
SEARCH
```

## 🔄 ЭТАП 3: TELEGRAM NAMESPACE

### 3.1 Рефакторинг telegram-design-system.scss
```bash
# Создать новый telegram design system с .tg- namespace
cat > src/styles/telegram/design-system.scss << 'TG_DESIGN'
// ========================================
// TELEGRAM DESIGN SYSTEM - .tg- namespace
// ========================================

.tg-design-system {
  // Telegram theme variables
  --tg-header-height: 60px;
  --tg-safe-area-top: 0px;
  --tg-safe-area-bottom: 0px;
  --tg-safe-area-left: 0px;
  --tg-safe-area-right: 0px;
  
  // Animations for 60fps
  --tg-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --tg-transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --tg-transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);

  .tg-header {
    position: sticky;
    top: 0;
    z-index: var(--z-fixed);
    background-color: var(--tg-bg-color, var(--color-bg));
    color: var(--tg-text-color, var(--color-text));
    transition: all var(--tg-transition-normal);
    will-change: transform, box-shadow;
    
    // Safe area support
    padding-top: var(--tg-safe-area-top);
    padding-left: var(--tg-safe-area-left);
    padding-right: var(--tg-safe-area-right);
    
    &.tg-header-scrolled {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    // Low-end device optimization
    &.tg-header-low-end {
      will-change: auto;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      
      &.tg-header-scrolled {
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      }
    }
  }

  .tg-button {
    @include button-base;
    @include no-focus;
    
    position: relative;
    padding: var(--space-2);
    border-radius: 12px;
    color: var(--tg-text-color, var(--color-text));
    background-color: transparent;
    
    &:hover {
      background-color: transparent !important;
      transform: none !important;
      color: var(--tg-text-color, var(--color-text)) !important;
    }
    
    &.tg-button-active {
      color: var(--tg-link-color, var(--color-primary)) !important;
      background-color: transparent !important;
    }
    
    &:focus-visible {
      outline: 2px solid var(--tg-link-color, var(--color-primary));
      outline-offset: 2px;
    }
    
    &:active {
      transform: none !important;
      background-color: transparent !important;
    }
    
    .tg-button-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: var(--font-weight-semibold);
      color: var(--tg-button-text-color, white);
      background-color: var(--tg-button-color, var(--color-primary));
      border-radius: 9px;
      padding: 0 4px;
      line-height: 1;
      animation: tgBadgeAppear var(--tg-transition-normal) ease-out;
    }
  }

  .tg-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--tg-secondary-bg-color, var(--color-bg));
    transition: none !important;
    
    .tg-button-active & {
      border-color: var(--tg-link-color, var(--color-primary));
    }
  }
}

// Animations
@keyframes tgBadgeAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// Responsive
@include mobile {
  .tg-design-system {
    .tg-button {
      padding: var(--space-1);
    }
  }
}

// Dark theme support (optional)
@media (prefers-color-scheme: dark) {
  .tg-design-system.tg-support-dark-theme {
    --tg-bg-color: #1c1c1e;
    --tg-text-color: #ffffff;
    --tg-hint-color: #8e8e93;
    --tg-secondary-bg-color: #2c2c2e;
  }
}
TG_DESIGN
```

## 📋 КОМАНДЫ ДЛЯ ТЕСТИРОВАНИЯ

### Проверка после каждого этапа
```bash
# Запустить dev сервер
PORT=3000 npm run dev

# Проверить сборку
npm run build

# Проверить размер bundle
npm run analyze

# Запустить линтер (если настроен)
npm run lint:styles
```

### Rollback команды (на случай проблем)
```bash
# Откатить к backup
cp -r backups/scss-refactor-YYYYMMDD/* src/styles/

# Откатить git изменения
git checkout -- src/styles/

# Удалить новые файлы
rm -rf src/styles/core
rm -rf src/styles/components
rm -rf src/styles/modules
rm -rf src/styles/telegram
```

## 🔍 КОМАНДЫ ДЛЯ АНАЛИЗА

### Поиск дублирующихся стилей
```bash
# Найти дублирующиеся селекторы
grep -r "\.webapp-" src/styles/ | sort | uniq -d

# Найти дублирующиеся переменные
grep -r "\$\|--" src/styles/ | grep ":" | sort | uniq -d

# Анализ размеров файлов
du -h src/styles/*.scss | sort -hr
```

### Поиск неиспользуемых стилей
```bash
# Найти селекторы в SCSS
grep -r "\.[a-zA-Z]" src/styles/ > scss-classes.txt

# Найти использование в компонентах
grep -r "className\|class=" src/app/ > component-classes.txt

# Сравнить (требует дополнительной обработки)
```

---

**Примечание**: Эти команды нужно выполнять поэтапно, тестируя после каждого шага. Обязательно создавайте backup перед началом каждого этапа.
