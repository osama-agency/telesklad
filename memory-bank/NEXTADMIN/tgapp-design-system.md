# TgApp Design System

## Overview
TgApp uses a custom CSS-based design system for consistency across all pages. The design follows the same patterns as the profile page with CSS variables for theming.

## Core Design Principles

1. **CSS Variables for Theming**
   - `--tg-bg-color` - Background color
   - `--tg-secondary-bg-color` - Card backgrounds
   - `--tg-text-color` - Primary text
   - `--tg-hint-color` - Secondary text
   - `--tg-border-color` - Default borders
   - `--tg-border-hover` - Hover state borders
   - `--tg-shadow-light/medium/heavy` - Shadow levels
   - `--tg-button-color` - Primary button color (green)

2. **Consistent Card Styling**
   - Border radius: 12px (16px for larger elements)
   - Border: 1px solid with color variables
   - Shadow: Light shadow default, medium on hover
   - Dark theme: backdrop-filter blur effect

3. **Green Accent Color**
   - Primary: #22c55e
   - Hover: #16a34a
   - Dark: #15803d

## Component Structure

### Product Cards (`.tgapp-product-card`)
```css
background: var(--tg-secondary-bg-color);
border-radius: 12px;
border: 1px solid var(--tg-border-color);
box-shadow: var(--tg-shadow-light);
```

### Action Cards (`.tgapp-action-card`)
Similar to product cards with icon containers using green accent.

### Loading States
- Skeleton animations using CSS gradients
- Light theme: #f0f0f0 → #e0e0e0
- Dark theme: rgba(255,255,255,0.05) → rgba(255,255,255,0.1)

## File Structure
- `/styles/tgapp.css` - Base styles
- `/styles/profile.css` - Profile page specific
- `/styles/catalog.css` - Catalog layout
- `/styles/product-card.css` - Product card components
- `/styles/telegram-ui-theme.css` - Theme overrides

## Dark Theme Features
- Gradient background: `linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)`
- Backdrop blur on cards
- Enhanced shadows for depth
- Subtle borders with transparency

## Implementation Status
✅ Profile page
✅ Catalog page
✅ Product cards
✅ Category filter
✅ Loading states
✅ Error states
✅ Empty states
🔲 Cart page (needs update)
🔲 Product detail page (needs update)
🔲 Orders page (needs update)

## Recent Updates
- 2024-12: Converted VirtualProductCatalog from Tailwind to TgApp CSS classes
- 2024-12: Added product-card.css for comprehensive product styling
- 2024-12: Updated SkeletonCatalog to use pure CSS animations