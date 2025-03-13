# Jina AI Models Catalog - Design Specification

## Overview

This design specification outlines the UI/UX for the Jina AI Models catalog section, which presents search foundation models in an interactive timeline format.

## Design Principles

- **Clarity**: Present complex model information in a clear, digestible format
- **Hierarchy**: Establish visual hierarchy to guide users through information
- **Interactivity**: Create engaging interactive elements that reveal additional information
- **Consistency**: Maintain brand consistency with Jina AI's existing design system
- **Accessibility**: Ensure all elements are accessible to all users

## Component Breakdown

### 1. Header Section

- **Title**: "Our Search Foundation Models" (42px, Jina Sans Bold)
- **Subtitle**: Brief description of the model catalog (18px, Jina Sans Regular)
- **Background**: Subtle gradient background (#f8f9fa to #ffffff)
- **Spacing**: 64px padding top, 32px padding bottom

### 2. Search/Filter Controls

- **Search Input**:
  - Placeholder: "Filter by model name..."
  - Rounded input field with search icon
  - Clear button appears when text is entered
- **Filter Dropdowns**:
  - Model type filter (Embeddings, CLIP, etc.)
  - Language support filter
  - Release date filter
  - Context length filter
- **Visual Style**:
  - Subtle border (#eaeaea)
  - 8px border radius
  - 16px padding
  - Shadow: 0 2px 4px rgba(0,0,0,0.05)

### 3. Timeline Visualization

- **Timeline Axis**:
  - Horizontal line spanning the width of the container
  - Tick marks for significant time periods
  - Date labels (16px, Jina Sans Medium)
- **Timeline Layout**:
  - Models positioned chronologically along the axis
  - Vertical positioning to avoid overlapping
  - Responsive layout that adjusts for screen size
- **Visual Indicators**:
  - Color coding for different model types
  - Size indicators for model parameters/complexity

### 4. Model Cards

- **Card Dimensions**: 280px width × variable height
- **Visual Elements**:
  - Model icon (64px × 64px)
  - Model name (22px, Jina Sans Bold)
  - Version tag (14px, Jina Sans Medium, pill-shaped background)
  - Brief description (16px, Jina Sans Regular, max 2 lines with ellipsis)
  - Key metrics (parameter count, supported languages, etc.)
- **Interactive States**:
  - Default state: Basic information
  - Hover state: Subtle elevation, additional preview information
  - Selected state: Highlighted border, expanded information
- **Visual Style**:
  - White background (#ffffff)
  - Border radius: 12px
  - Border: 1px solid #eaeaea
  - Box shadow: 0 4px 12px rgba(0,0,0,0.08)
  - Padding: 24px

### 5. Detailed Model Panel

- **Layout**: Slide-in panel (from right) or modal overlay
- **Header**:
  - Model name (28px, Jina Sans Bold)
  - Release date (16px, Jina Sans Regular)
  - Publication link (16px, Jina Sans Medium)
  - Close button
- **Content Sections**:
  - Description (expandable)
  - Technical specifications (table format)
  - Performance metrics (with visual charts)
  - Code examples (syntax highlighted)
  - Use cases (with icons)
  - Documentation links
- **Interactive Elements**:
  - Tabs for different content categories
  - Copyable code snippets
  - Performance comparison toggles
  - Download/implementation buttons

### 6. Mobile Adaptations

- **Timeline View**:
  - Switches to vertical scrolling timeline
  - Reduced card width (full width - 32px margins)
- **Filtering**:
  - Collapsible filter section
  - Bottom sheet filter UI on very small screens
- **Detail View**:
  - Full screen overlay instead of side panel
  - Simplified metrics display

## Interactions

### Timeline Navigation

1. **Scroll Behavior**:

   - Horizontal scrolling for timeline on desktop
   - Smooth animations when navigating between time periods
   - Quick-jump buttons for significant releases

2. **Zoom Functionality**:

   - Ability to zoom in/out of timeline
   - Focus+context view that shows detail and overview simultaneously

3. **Card Selection**:
   - Clicking a model card selects it and shows detailed information
   - Selected state remains visible when viewing details

### Model Card Interactions

1. **Hover Effects**:

   - Subtle elevation (increase in shadow)
   - Preview of key metrics with animated reveal
   - Cursor change to indicate clickability

2. **Click Behaviors**:

   - Primary click: Open detailed view
   - Right-click: Context menu with quick actions

3. **Touch Support**:
   - Tap to select
   - Long press for context menu
   - Swipe between models

### Detailed View Interactions

1. **Panel Transitions**:

   - Smooth slide-in animation (right to left)
   - Backdrop blur effect on main content
   - Escape key dismisses panel

2. **Content Navigation**:

   - Sticky header with tab navigation
   - Smooth scroll between sections
   - Collapsible sections for long content

3. **Comparison Mode**:
   - Toggle to compare selected model with others
   - Side-by-side metrics comparison
   - Visual highlighting of differences

## Responsive Behavior

### Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop Small**: 1024px - 1439px
- **Desktop Large**: 1440px+

### Adaptations

- **Timeline Orientation**:

  - Mobile: Vertical timeline
  - Tablet+: Horizontal timeline
  - Desktop Large: Enhanced horizontal with preview panels

- **Card Layout**:

  - Mobile: Single column, full width cards
  - Tablet: Two column grid, reduced information density
  - Desktop: Horizontal timeline with variable positioning

- **Detail Panel**:
  - Mobile: Full screen overlay
  - Tablet: 80% width slide-in
  - Desktop: 40% width slide-in with backdrop

## Animation Specifications

### Timeline Animations

- **Initial Load**:
  - Timeline axis draws from left to right (300ms ease-out)
  - Model cards fade in sequentially (staggered 50ms per card)
  - Filter controls slide down (250ms ease-in-out)

### Card Animations

- **Hover State**:

  - Shadow increase (150ms ease-out)
  - Slight scale increase (1.02×, 150ms ease-out)
  - Info preview slides up (200ms ease-out)

- **Selection State**:
  - Highlight pulse (quick flash of border color)
  - Scale ping (quick 1.05× scale and back)
  - Smooth transition to active state (border color change)

### Detail Panel Animations

- **Open Animation**:

  - Panel slides in from right (300ms ease-out)
  - Content fades in (200ms, 100ms delay)
  - Background content scales slightly (0.98×) and blurs

- **Tab Transitions**:
  - Content crossfade between tabs (200ms)
  - Active indicator slides between tabs (250ms ease-in-out)

## Implementation Notes

### Key CSS Variables

```css
:root {
  /* Colors */
  --jina-primary: #009191;
  --jina-secondary: #ff5a5a;
  --jina-tertiary: #ffd25a;
  --jina-dark: #1e1e1e;
  --jina-light: #f8f9fa;
  --jina-gray-100: #f1f3f5;
  --jina-gray-300: #dee2e6;
  --jina-gray-500: #adb5bd;
  --jina-gray-700: #495057;
  --jina-gray-900: #212529;

  /* Typography */
  --jina-font-heading: "Jina Sans", sans-serif;
  --jina-font-body: "Inter", sans-serif;

  /* Spacing */
  --jina-spacing-xs: 4px;
  --jina-spacing-sm: 8px;
  --jina-spacing-md: 16px;
  --jina-spacing-lg: 24px;
  --jina-spacing-xl: 32px;
  --jina-spacing-xxl: 64px;

  /* Transitions */
  --jina-transition-fast: 150ms ease;
  --jina-transition-normal: 250ms ease;
  --jina-transition-slow: 350ms ease;
}
```

### Accessibility Considerations

- Ensure sufficient color contrast (WCAG AA minimum)
- Provide keyboard navigation for all interactive elements
- Include proper ARIA attributes for custom components
- Support screen readers with appropriate text alternatives
- Ensure touch targets are at least 44×44px on mobile

### Performance Optimizations

- Lazy load model cards outside viewport
- Use efficient CSS transitions instead of JavaScript animations where possible
- Implement virtual scrolling for large model datasets
- Optimize images with appropriate formats and sizes
- Prefetch detailed model information on card hover

## Visual Mockups

For visual reference, please see the attached design files:

- models-catalog-desktop.fig
- models-catalog-mobile.fig
- models-catalog-interactions.fig

## Design Assets

All required design assets can be found in the shared design system library:

- Model icons
- Timeline components
- Card templates
- Data visualization components
- Animation presets
