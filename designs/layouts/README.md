# Layout Design Documentation

This directory contains design specifications, grid systems, and responsive design patterns for page layouts used throughout the Ollama Ecosystem.

## Layout Structure

Layouts are organized into several categories:

1. **Grid Systems**: Foundational grid structures for page layout
2. **Page Layouts**: Standard page templates for different sections of the application
3. **Responsive Patterns**: Strategies for adapting layouts to different screen sizes
4. **Layout Components**: Specialized layout components like split views and panels

## Grid System

Our grid system uses a 12-column layout with responsive breakpoints:

| Breakpoint | Description | Width Range | Column Behavior |
|------------|-------------|-------------|-----------------|
| `xs` | Mobile | <640px | 4 columns, stack vertically |
| `sm` | Small tablets | 640px-767px | 8 columns |
| `md` | Tablets/small laptops | 768px-1023px | 12 columns |
| `lg` | Laptops/desktops | 1024px-1279px | 12 columns |
| `xl` | Large desktops | 1280px-1535px | 12 columns |
| `2xl` | Extra large displays | ≥1536px | 12 columns |

### Grid Specifications

- **Columns**: 12 columns for desktop, scaling down for smaller screens
- **Gutters**: 16px standard (varies by breakpoint)
- **Margins**: Responsive margins adjusting by screen size
- **Container**: Max-width 1280px for centered content

## Page Layouts

We provide several standard page layouts to maintain consistency:

### Dashboard Layout

```
+-----------------------------------------------------------------------------+
| Header: Navigation, User Controls                                           |
+-----------------------------------------------------------------------------+
| Sidebar      | Main Content Area                                            |
| - Navigation | - Card Components                                            |
| - Quick      | - Data Visualization                                         |
|   Actions    | - Content Sections                                           |
|              |                                                              |
|              |                                                              |
+-----------------------------------------------------------------------------+
| Footer: Links, Copyright                                                    |
+-----------------------------------------------------------------------------+
```

### Research Layout

```
+-----------------------------------------------------------------------------+
| Header: Navigation, Search                                                  |
+-----------------------------------------------------------------------------+
| Sidebar        | Research Content                          | Context Panel  |
| - Topic        | - Research Results                        | - Source Info  |
|   Hierarchy    | - Content Sections                        | - Related      |
| - Filters      | - Data Visualization                      |   Topics       |
| - Saved        |                                           | - Notes        |
|   Research     |                                           |                |
+-----------------------------------------------------------------------------+
| Footer: Links, Copyright                                                    |
+-----------------------------------------------------------------------------+
```

### Settings Layout

```
+-----------------------------------------------------------------------------+
| Header: Navigation, User Controls                                           |
+-----------------------------------------------------------------------------+
| Sidebar        | Settings Content                                           |
| - Categories   | - Form Elements                                            |
| - Quick        | - Options                                                  |
|   Navigation   | - Configuration Controls                                   |
|                |                                                            |
|                |                                                            |
+-----------------------------------------------------------------------------+
| Footer: Links, Copyright                                                    |
+-----------------------------------------------------------------------------+
```

### Chat Layout

```
+-----------------------------------------------------------------------------+
| Header: Navigation, Model Selection                                         |
+-----------------------------------------------------------------------------+
| Sidebar        | Chat Content                             | Context Panel   |
| - Conversation | - Message Bubbles                        | - Source Info   |
|   History      | - Input Area                             | - Related       |
| - Model        | - Control Buttons                        |   Knowledge     |
|   Selection    |                                          | - Notes         |
| - Templates    |                                          |                 |
+-----------------------------------------------------------------------------+
| Footer: Links, Copyright                                                    |
+-----------------------------------------------------------------------------+
```

## Responsive Design Patterns

### Sidebar Collapse

For small screens, the sidebar collapses to an icon bar or off-canvas menu:

```
+----------------------------+    +---+------------------------+
| Header                     |    | H |                        |
+-------+--------------------+    +---+------------------------+
| Side  | Content            |    | S | Content                |
| bar   |                    | -> | B |                        |
|       |                    |    |   |                        |
+-------+--------------------+    +---+------------------------+
| Footer                     |    | Footer                     |
+----------------------------+    +----------------------------+
```

### Panel Transforms

Secondary panels stack vertically on mobile:

```
+------------------------+    +------------------------+
| Header                 |    | Header                 |
+------+--------+-------+    +------------------------+
|      |        |       |    | Main Content           |
| Side | Main   | Panel |    |                        |
|      |        |       |    +------------------------+
|      |        |       |    | Panel                  |
+------+--------+-------+ -> |                        |
| Footer                |    +------------------------+
+------------------------+    | Sidebar (collapsed)   |
                             +------------------------+
                             | Footer                 |
                             +------------------------+
```

## Layout Components

### Split View

The Split View component allows for flexible content arrangement:

```
+--------------------------------+
| +------------+----------------+|
| |            |                ||
| |  Primary   |  Secondary     ||
| |  Content   |  Content       ||
| |            |                ||
| |            |                ||
| +------------+----------------+|
+--------------------------------+
```

Features:

- Adjustable split ratios (50/50, 60/40, 70/30, etc.)
- Resizable divider
- Collapsible panels
- Swappable panel positions

### Card Grid

The Card Grid provides a responsive layout for displaying card components:

```
+--------------------------------+
| +--------+ +--------+ +------+|
| |        | |        | |      ||
| |  Card  | |  Card  | | Card ||
| |        | |        | |      ||
| +--------+ +--------+ +------+|
| +--------+ +--------+ +------+|
| |        | |        | |      ||
| |  Card  | |  Card  | | Card ||
| |        | |        | |      ||
| +--------+ +--------+ +------+|
+--------------------------------+
```

Features:

- Automatically adjusts cards per row based on screen size
- Maintains consistent spacing between cards
- Supports multiple card sizes
- Optional masonry layout for varying height cards

## Layout Guidelines

When designing layouts, follow these guidelines:

1. **Consistency**: Maintain consistency across different pages and sections
2. **Responsive First**: Design layouts to be responsive from the beginning
3. **Content Priority**: Prioritize content visibility and accessibility
4. **Whitespace**: Use appropriate whitespace to improve readability
5. **Logical Flow**: Design layouts that guide users through a logical flow
6. **Flexibility**: Create layouts that accommodate varying content lengths
7. **Context Preservation**: Ensure users maintain context during navigation

## Contributing

When adding a new layout design:

1. Create a new markdown file named after the layout
2. Include ASCII diagrams or wireframes showing the layout structure
3. Document responsive behavior and breakpoints
4. Provide rationale for layout decisions
5. Update this README with the new layout information
