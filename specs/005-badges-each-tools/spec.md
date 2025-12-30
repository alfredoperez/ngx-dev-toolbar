# Feature Specification: Tool Badges and UX Improvements

**Feature Branch**: `005-badges-each-tools`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "add badges in each tools (permission, feature flags and app features) to count forced values - save sort, search and filters per tool in local storage - modify readme file so the npm package looks better in the npm website without html - Make sure the readme has only information needed to use library"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Forced Values Badge Visibility (Priority: P1)

As a developer using the toolbar, I want to see at a glance how many values I have forced in each tool (Feature Flags, Permissions, App Features) so I can quickly understand my current development configuration without opening each tool.

**Why this priority**: This provides immediate visibility into forced state across all tools. Developers frequently need to know if they have active overrides, especially when debugging unexpected behavior or switching contexts.

**Independent Test**: Can be fully tested by forcing values in each tool and verifying the badge count displays correctly on the toolbar buttons. Delivers immediate value by showing override counts without opening tools.

**Acceptance Scenarios**:

1. **Given** a developer has forced 3 feature flags (2 enabled, 1 disabled), **When** they view the toolbar, **Then** they see a badge showing "3" on the Feature Flags tool button
2. **Given** a developer has no forced values in a tool, **When** they view the toolbar, **Then** no badge is displayed on that tool button (not "0")
3. **Given** a developer forces/unforces values, **When** they change the forced state, **Then** the badge updates immediately to reflect the new count
4. **Given** a developer has forced values and refreshes the page, **When** the toolbar loads, **Then** the badge shows the correct count based on persisted state

---

### User Story 2 - Persisted Filter and Search State (Priority: P2)

As a developer, I want my search queries, selected filters, and sort preferences to be remembered per tool so I don't have to reconfigure them every time I open a tool or refresh the page.

**Why this priority**: Reduces repetitive configuration work. Developers often work with specific subsets of flags/permissions repeatedly, and maintaining those view preferences saves time and reduces friction.

**Independent Test**: Can be tested by configuring search/filter/sort in a tool, closing and reopening the tool (or refreshing the page), and verifying settings are restored. Delivers standalone value for any single tool.

**Acceptance Scenarios**:

1. **Given** a developer has typed "auth" in the search box of Feature Flags tool, **When** they close and reopen the tool, **Then** the search box shows "auth" and the list is pre-filtered
2. **Given** a developer has selected the "forced" filter in Permissions tool, **When** they refresh the page and open the tool, **Then** the "forced" filter is still selected
3. **Given** a developer has changed the sort order to descending, **When** they close and reopen the tool, **Then** the sort order remains descending
4. **Given** a developer clears all toolbar settings via the Home tool, **When** they open any tool, **Then** the filter/search/sort settings are reset to defaults
5. **Given** a developer has different settings in different tools, **When** they switch between tools, **Then** each tool shows its own persisted settings independently

---

### User Story 3 - Simplified NPM README (Priority: P3)

As a potential library user browsing npm, I want to see a clean, readable README that shows me how to use the library without cluttered HTML markup so I can quickly evaluate and adopt the library.

**Why this priority**: The README is the first impression for potential users. A clean, focused README increases adoption by making the library appear professional and easy to use.

**Independent Test**: Can be tested by viewing the README on npm website and verifying it renders correctly, is concise, and contains only usage-essential information. Delivers value by improving library discoverability and adoption.

**Acceptance Scenarios**:

1. **Given** a user views the package on npm website, **When** the README renders, **Then** it displays correctly without broken formatting or raw HTML tags
2. **Given** a user wants to install the library, **When** they read the README, **Then** they find installation instructions within the first scroll
3. **Given** a user wants to use a specific tool, **When** they read the README, **Then** they find a concise example for that tool without excessive detail
4. **Given** the README content, **When** compared to current version, **Then** it contains no HTML tags (images via markdown syntax only)
5. **Given** the README content, **When** reviewed for completeness, **Then** it includes only: package description, installation, basic usage, tool overview, and links to full documentation

---

### Edge Cases

- What happens when badge count exceeds 99? Display "99+" to prevent badge overflow
- How does system handle corrupted localStorage data for filter settings? Reset to defaults and continue without error
- What happens if a search query persisted in localStorage matches no items? Display empty state with the persisted search visible so user understands why
- How does the toolbar behave if localStorage is disabled/unavailable? All features work but without persistence (graceful degradation)
- What happens to persisted filters when available options change? Filters remain; if filter no longer applies (e.g., filtering by a removed category), reset to "all"

## Requirements *(mandatory)*

### Functional Requirements

**Badges**

- **FR-001**: System MUST display a badge on the Feature Flags tool button showing the count of forced flags (enabled + disabled count)
- **FR-002**: System MUST display a badge on the Permissions tool button showing the count of forced permissions (granted + denied count)
- **FR-003**: System MUST display a badge on the App Features tool button showing the count of forced app features (enabled + disabled count)
- **FR-004**: System MUST hide the badge when the count is zero (no badge displayed, not "0")
- **FR-005**: System MUST display "99+" when badge count exceeds 99
- **FR-006**: System MUST update badges immediately when forced values change (no refresh required)
- **FR-007**: System MUST show correct badge counts on initial load from persisted state

**State Persistence**

- **FR-008**: System MUST persist search query per tool to localStorage
- **FR-009**: System MUST persist selected filter per tool to localStorage
- **FR-010**: System MUST persist sort preference per tool to localStorage
- **FR-011**: System MUST restore search/filter/sort settings when tool is opened
- **FR-012**: System MUST restore search/filter/sort settings after page refresh
- **FR-013**: System MUST store settings independently for each tool (Feature Flags, Permissions, App Features)
- **FR-014**: System MUST reset tool view settings when "Clear All Settings" is triggered
- **FR-015**: System MUST gracefully handle missing or corrupted localStorage data by resetting to defaults

**README**

- **FR-016**: README MUST render correctly on npm website without raw HTML tags visible
- **FR-017**: README MUST contain installation instructions
- **FR-018**: README MUST contain basic usage example
- **FR-019**: README MUST contain brief overview of available tools
- **FR-020**: README MUST NOT contain HTML markup (use markdown syntax for all formatting including images)
- **FR-021**: README MUST NOT exceed reasonable length for quick scanning (target: under 200 lines)
- **FR-022**: README MUST link to full documentation for detailed information

### Key Entities

- **ToolViewState**: Represents the persisted UI state for a tool (searchQuery, selectedFilter, sortOrder)
- **BadgeCount**: Represents the derived count displayed on tool buttons (computed from forced values)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can see forced value counts without opening any tool (badges visible on toolbar)
- **SC-002**: All badge counts update within 100ms of forcing/unforcing a value
- **SC-003**: Tool view state persists across page refreshes with 100% accuracy
- **SC-004**: README renders correctly on npm website with no formatting issues
- **SC-005**: New users can find installation instructions within 10 seconds of viewing README
- **SC-006**: README contains zero HTML tags after update
- **SC-007**: All three tools (Feature Flags, Permissions, App Features) maintain independent view state

## Assumptions

- Badge styling will use the existing `.tool-button__badge` CSS class already defined in the codebase
- The existing storage service will be used for persisting view state
- "Sort" refers to the existing alphabetical sorting; if no sort toggle exists currently, the default sort order will be persisted (ascending by name)
- The README should link to an external documentation site or wiki for detailed tool documentation
- The badge count computation follows the pattern already used in presets-tool: `enabled.length + disabled.length` or `granted.length + denied.length`

## Out of Scope

- Adding new sorting options (only persisting current sort state)
- Adding new filter options (only persisting current filter selection)
- Creating a separate documentation website
- Badges for tools other than Feature Flags, Permissions, and App Features
- Badge customization (colors, positions) - will use existing design
