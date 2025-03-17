# Design Tokens

Design tokens are the foundation of our design system, providing consistent values for colors, typography, spacing, and other UI fundamentals across the Ollama Ecosystem.

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#2563EB` | Primary actions, key UI elements |
| `--color-primary-light` | `#3B82F6` | Hover states, secondary emphasis |
| `--color-primary-dark` | `#1D4ED8` | Active states, strong emphasis |

### Secondary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-secondary` | `#10B981` | Success states, completion |
| `--color-secondary-light` | `#34D399` | Hover states on success elements |
| `--color-secondary-dark` | `#059669` | Active states on success elements |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-neutral-50` | `#F9FAFB` | Page background, lightest elements |
| `--color-neutral-100` | `#F3F4F6` | Card backgrounds, subtle elements |
| `--color-neutral-200` | `#E5E7EB` | Borders, dividers |
| `--color-neutral-300` | `#D1D5DB` | Disabled elements |
| `--color-neutral-400` | `#9CA3AF` | Placeholder text |
| `--color-neutral-500` | `#6B7280` | Secondary text |
| `--color-neutral-600` | `#4B5563` | Body text |
| `--color-neutral-700` | `#374151` | Headings |
| `--color-neutral-800` | `#1F2937` | High-emphasis text |
| `--color-neutral-900` | `#111827` | Black text, high contrast |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-info` | `#3B82F6` | Informational elements |
| `--color-success` | `#10B981` | Success states |
| `--color-warning` | `#F59E0B` | Warning states |
| `--color-error` | `#EF4444` | Error states |

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family-sans` | `'Inter', system-ui, sans-serif` | Primary text font |
| `--font-family-mono` | `'JetBrains Mono', monospace` | Code blocks, technical content |
| `--font-family-display` | `'Lexend', sans-serif` | Headers, featured text |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | `0.75rem` (12px) | Small labels, captions |
| `--font-size-sm` | `0.875rem` (14px) | Secondary text, UI labels |
| `--font-size-md` | `1rem` (16px) | Body text |
| `--font-size-lg` | `1.125rem` (18px) | Large body text |
| `--font-size-xl` | `1.25rem` (20px) | Subheadings |
| `--font-size-2xl` | `1.5rem` (24px) | Section headers |
| `--font-size-3xl` | `1.875rem` (30px) | Page titles |
| `--font-size-4xl` | `2.25rem` (36px) | Large titles |
| `--font-size-5xl` | `3rem` (48px) | Display headings |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-normal` | `400` | Regular body text |
| `--font-weight-medium` | `500` | Medium emphasis |
| `--font-weight-semibold` | `600` | Subheadings, strong emphasis |
| `--font-weight-bold` | `700` | Headings, maximum emphasis |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | `1.25` | Headings, constrained text |
| `--line-height-normal` | `1.5` | Body text |
| `--line-height-relaxed` | `1.75` | Large blocks of text |
| `--line-height-loose` | `2` | Highly readable content |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | `0` | No spacing |
| `--space-px` | `1px` | Hairline borders |
| `--space-1` | `0.25rem` (4px) | Tiny elements, tight spacing |
| `--space-2` | `0.5rem` (8px) | Small elements, compact spacing |
| `--space-3` | `0.75rem` (12px) | Medium-small spacing |
| `--space-4` | `1rem` (16px) | Default spacing |
| `--space-5` | `1.25rem` (20px) | Medium-large spacing |
| `--space-6` | `1.5rem` (24px) | Large spacing |
| `--space-8` | `2rem` (32px) | Extra large spacing |
| `--space-10` | `2.5rem` (40px) | Component separation |
| `--space-12` | `3rem` (48px) | Section separation |
| `--space-16` | `4rem` (64px) | Major section separation |
| `--space-20` | `5rem` (80px) | Page sectioning |
| `--space-24` | `6rem` (96px) | Large layout spacing |
| `--space-32` | `8rem` (128px) | Maximum layout spacing |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | No rounding |
| `--radius-sm` | `0.125rem` (2px) | Subtle rounding |
| `--radius-md` | `0.25rem` (4px) | Button rounding |
| `--radius-lg` | `0.5rem` (8px) | Card rounding |
| `--radius-xl` | `1rem` (16px) | Large component rounding |
| `--radius-full` | `9999px` | Pills, circles |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Medium elevation |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | Large elevation |
| `--shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` | Maximum elevation |
| `--shadow-inner` | `inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)` | Inset shadow |

## Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| `--z-0` | `0` | Base level |
| `--z-10` | `10` | Hovering UI elements |
| `--z-20` | `20` | Dropdown menus |
| `--z-30` | `30` | Floating elements |
| `--z-40` | `40` | Modals |
| `--z-50` | `50` | Tooltips |
| `--z-auto` | `auto` | Automatic z-index |

## Usage in CSS

```css
.primary-button {
  background-color: var(--color-primary);
  color: var(--color-neutral-50);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.primary-button:hover {
  background-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.primary-button:active {
  background-color: var(--color-primary-dark);
}
```

## Implementation

These design tokens are implemented as CSS Custom Properties (variables) for web applications and can be referenced in component libraries and UI development across the Ollama Ecosystem. 