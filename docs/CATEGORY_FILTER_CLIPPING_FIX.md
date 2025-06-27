# Fix for Category Filter Top Clipping Issue

## Problem
The category filter was being clipped at the top edges due to negative margins that were used to achieve full-width scrolling.

## Solution
Removed the negative margin approach that was causing the clipping:

1. **Removed negative margins** from `.category-filter-container` CSS
2. **Removed the problematic CSS class** from the component
3. **Simplified the structure** - no special full-width tricks needed

## Changes Made

### `src/app/tgapp/styles/catalog.css`
- Removed negative margins (`margin-left: -1rem; margin-right: -1rem;`)
- Added simple scrollbar hiding styles for `.category-filter-scroll`

### `src/app/tgapp/_components/CategoryFilterHorizontal.tsx`
- Removed `category-filter-container` class usage
- Simplified component structure
- Filter now scrolls naturally edge-to-edge with padding

## Result
- Category filter no longer clips at the top
- Clean scrolling behavior maintained
- Full-width appearance preserved through natural layout 