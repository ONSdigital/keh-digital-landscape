# Navigation

This project uses a single source of truth for frontend navigation items to avoid duplicated route and label definitions.

## Source of truth

Navigation configuration is centralised in:

- `frontend/src/constants/navigationConstants.js`

This file defines shared navigation metadata including:

- path
- label
- icon
- description (for homepage cards)
- rendering flags (`isLink`, `hasChildren`, `homeUseAnchor`)

## Where it is used

The shared navigation lists are consumed by:

- `frontend/src/components/Sidebar/Sidebar.js`
- `frontend/src/components/MenuDropdown/MenuDropdown.js`
- `frontend/src/pages/HomePage.js`

## Exported navigation lists

The constants file exports three lists:

- `generalNavigationItems`: Main routes shown in the standard navigation.
- `restrictedNavigationItems`: Restricted routes (Review/Admin).
- `homePageNavigationItems`: Card list rendered on the homepage.

It also exports:

- `isNavigationItemActive(item, pathname)`: Shared active-state logic (including child-path handling for Copilot routes).

## Link behaviour notes

Some entries intentionally render as standard anchor tags in specific places:

- Restricted routes in menu/sidebar contexts remain anchor tags for authentication handling.
- Homepage uses `homeUseAnchor` to preserve existing behaviour where needed.

## How to add or update a navigation item

1. Update `frontend/src/constants/navigationConstants.js`.
2. Add or edit the item in the appropriate exported list(s).
3. Confirm the route exists in `frontend/src/App.js`.
4. Check the UI in Sidebar, Menu Dropdown, and Homepage cards.

## Why this approach

Centralising navigation improves consistency and reduces maintenance risk by ensuring route, label, and icon updates are made once and reflected across all navigation.
