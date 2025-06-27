# Category Filter Full Width Fix

## Issue
After updating the dark theme background, the category filter appeared to have borders and didn't scroll edge-to-edge as it did before. Additionally, content was being clipped at the edges during scrolling.

## Solution
Applied best practices for horizontal scrolling components that need to be full-width while the main content is constrained:

### Changes Made:

1. **Updated Layout Structure** (`src/app/tgapp/layout.tsx`):
   - Removed `max-w-[600px] mx-auto` from the main container
   - Applied width constraints only where needed

2. **Updated Catalog Page Structure** (`src/app/tgapp/catalog/page.tsx`):
   - Search bar and catalog content wrapped in `max-w-[600px] mx-auto` containers
   - Category filter remains full-width without wrapper
   - Added padding to catalog content container

3. **Updated CategoryFilterHorizontal Component** (`src/app/tgapp/_components/CategoryFilterHorizontal.tsx`):
   - Applied `category-filter-container` class for full viewport width
   - Simplified gradient overlays
   - Used standard padding approach with `px-4` on content
   - Added `w-max` to ensure content doesn't wrap

4. **Enhanced Catalog Styles** (`src/app/tgapp/styles/catalog.css`):
   - Added `.category-filter-container` with viewport width technique:
     ```css
     width: 100vw;
     position: relative;
     left: 50%;
     right: 50%;
     margin-left: -50vw;
     margin-right: -50vw;
     ```
   - Added scroll snap for better UX
   - Improved scrollbar hiding

### Technical Details:

The solution uses the "full viewport width" technique which:
1. Sets the container to `100vw` width
2. Centers it with `left: 50%` and `margin-left: -50vw`
3. This breaks out of any parent container constraints
4. Content inside can then scroll edge-to-edge without clipping

### Best Practices Applied:
- **No Overflow Hidden**: Parent containers don't have `overflow: hidden`
- **Viewport Units**: Using `100vw` ensures true edge-to-edge width
- **Scroll Snap**: Added for better mobile UX when scrolling between categories
- **Proper Padding**: Content has padding, but scroll container extends beyond
- **Gradient Overlays**: Indicate scrollable content without blocking interaction

### Result:
The category filter now:
- Scrolls true edge-to-edge without any clipping
- Maintains proper content padding
- Works consistently across all devices and browsers
- Provides smooth scrolling with visual indicators 