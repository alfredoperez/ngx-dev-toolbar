# Spec: Tab Component & Custom Tool Demo

**Slug**: 014-tab-component-custom-tool | **Date**: 2026-04-10

## Summary

Create a reusable `ndt-tabs` / `ndt-tab` component for the library's component system and use it in the demo app's custom tool to showcase two tabs: **Finder** (look up entities/links) and **Maker** (create entities/data). The tab component follows existing patterns (standalone, OnPush, signal-based) and is exported from the public API.

## Requirements

### Tab Component

- **R001** (MUST): Create `ToolbarTabsComponent` (`ndt-tabs`) that accepts multiple `ndt-tab` children and renders a tab bar + content area
- **R002** (MUST): Create `ToolbarTabComponent` (`ndt-tab`) with `label` input and content projection for tab body
- **R003** (MUST): Only the active tab's content is rendered (or visually hidden); switching tabs updates which content is shown
- **R004** (MUST): Active tab is visually highlighted in the tab bar using existing design tokens (`--ndt-*` variables)
- **R005** (MUST): Components are standalone, use OnPush change detection, and follow signal-based state patterns
- **R006** (MUST): Export both components from `libs/ngx-dev-toolbar/src/index.ts`
- **R007** (SHOULD): Tab bar uses defensive CSS patterns (explicit spacing, no reliance on browser defaults)
- **R008** (SHOULD): Support keyboard navigation between tabs (arrow keys, Enter/Space to select)

### Custom Tool Demo — Finder Tab

- **R009** (MUST): Finder tab contains a select dropdown ("What to look for") with sample entity types (e.g., User, Order, Product)
- **R010** (MUST): Finder tab contains a "Find" button next to the select
- **R011** (MUST): Below the select/button row, display a results area using `ndt-list-item` components with placeholder/sample results
- **R012** (SHOULD): Clicking "Find" populates the results list with mock data matching the selected type

### Custom Tool Demo — Maker Tab

- **R013** (MUST): Maker tab contains a select dropdown ("What to create") with sample entity types
- **R014** (MUST): Maker tab contains an "Add/Create" button next to the select
- **R015** (MAY): Maker tab can show placeholder content below for future component demos (data entry forms, log output)

## Scenarios

### Tab switching

**Given** the custom tool window is open
**When** the user clicks the "Maker" tab
**Then** the Maker tab content is displayed and the Finder tab content is hidden
**And** the "Maker" tab label is visually highlighted

### Finder — search flow

**Given** the Finder tab is active
**When** the user selects "User" from the dropdown and clicks "Find"
**Then** a list of sample User results appears below

### Maker — initial state

**Given** the Maker tab is active
**Then** the select and button are visible at the top
**And** placeholder content area is shown below (for future expansion)

### Default tab

**Given** the custom tool opens for the first time
**Then** the Finder tab is active by default

## Out of Scope

- Actual data fetching or real search functionality
- Maker data entry forms (future spec)
- Logging/activity feed in Maker tab (future spec)
- Tab close/add/reorder functionality
- Lazy loading of tab content
