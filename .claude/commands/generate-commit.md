# Generate Commit Message

**Purpose**: Generate an Angular conventional commit title and description based on staged changes, with special handling for AI configuration files.

**Usage**: `/generate-commit`

## Instructions

You are a commit message generator following Angular Conventional Commits format.

### Step 1: Analyze Staged Changes

Run `git diff --cached --name-only` and `git diff --cached --stat` to see what files are staged.

If no files are staged, inform the user to stage their changes first with `git add <files>`.

### Step 2: Determine Commit Type

Based on the changed files, determine the commit type:

- **feat**: New features or functionality changes in `.ts`, `.html`, `.scss` files (excluding tests)
- **fix**: Bug fixes
- **docs**: Documentation changes (`.md` files, comments)
- **test**: Test files (`.spec.ts`, `.test.ts`, `e2e`)
- **refactor**: Code refactoring without changing functionality
- **style**: Code style changes (formatting, whitespace)
- **build**: Build system or dependency changes (`package.json`, `nx.json`, `angular.json`, etc.)
- **ci**: CI/CD configuration changes
- **chore**: Other changes (configs, gitignore, etc.)

### Step 3: Determine Scope (Optional)

Extract scope from file paths:

- If changes are in `libs/ngx-dev-toolbar/src/tools/[tool-name]/` → scope is the tool name (e.g., `feature-flags`, `permissions`)
- If changes are in `libs/ngx-dev-toolbar/src/components/` → scope is `components`
- If changes are in `libs/ngx-dev-toolbar/src/` (core files) → scope is `core`
- If changes are in `apps/[app-name]/` → scope is the app name
- If changes span multiple areas → omit scope

### Step 4: Generate Commit Title

Format: `<type>(<scope>): <description>`

Example:
- `feat(permissions): add permissions tool with boolean toggles`
- `docs: update toolbar expansion plan`
- `build: upgrade Angular to v19.1`
- `chore(ci): configure GitHub Actions workflow`

**Rules**:
- Title must be ≤72 characters
- Use imperative mood ("add" not "added" or "adds")
- No period at the end
- Lowercase after colon

### Step 5: Generate Commit Body

Write a **concise summary** followed by organized bullet points. Structure the body as follows:

```markdown
{{1-2 sentence summary of the overall change}}

## Changes
- Concise change description (focus on WHAT was added/changed, avoid implementation details)
- Another change
- Etc.

## Demo App
- Concise change to demo app (if applicable)

## Documentation
- Concise change to documentation website or README files (if applicable)
```

**Guidelines**:
- Keep the summary to 1-2 sentences maximum
- Use bullet points for all changes (be specific but brief)
- Focus on WHAT changed, not HOW it was implemented
- Avoid implementation details like pixel sizes, specific patterns, or technical internals
- DO NOT mention tests, test coverage, or unit tests
- Omit sections (Demo App, Documentation) if there are no changes
- Use imperative mood in bullet points ("Add" not "Added")

### Step 6: Output Format

Present the commit message in this format:

```
📝 SUGGESTED COMMIT TITLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<type>(<scope>): <description>

📄 SUGGESTED COMMIT BODY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{Summary}}

## Changes
- Change 1
- Change 2

## Demo App
- Demo app change (if applicable)

## Documentation
- Documentation change (if applicable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TO COMMIT:
You can now commit manually using:
  git commit -F- <<'EOF'
<type>(<scope>): <description>

{{Full commit body with sections}}
EOF

Or copy the message and use:
  git commit
(Opens editor where you can paste the full message)
```

### Step 7: Additional Information

After generating the message, also show:
1. **Diff stats**: Output of `git diff --cached --stat`
2. **Breaking changes**: If you detect breaking changes, add `BREAKING CHANGE:` footer
3. **Related issues**: Suggest adding `Closes #123` if relevant (ask user)

## Important Notes

- **DO NOT commit** - only generate the message
- **DO NOT stage files** - only analyze already staged files
- If files span multiple commit types, suggest splitting into multiple commits
- If commit would be too large (>20 files), suggest breaking it up
- Always use imperative mood in descriptions
- Keep titles concise and descriptive

## Examples

### Example 1: Feature Addition
```
feat(permissions): add permissions tool with boolean toggles

Implemented new permissions tool for runtime permission override testing.

## Changes
- Add Permissions tool with 3-layer architecture
- Add service API for setting available permissions
- Add method to retrieve forced permission values
```

### Example 2: Documentation
```
docs: create comprehensive toolbar expansion plan

Added detailed implementation roadmap for three new toolbar tools.

## Documentation
- Add specifications for Permissions, App Features, and Presets tools
- Include architecture patterns and data models
- Add service API examples and integration guides
```

### Example 3: Multiple Changes
```
feat: add list components and refactor tools

Created reusable list components and refactored all tools to use shared UI patterns.

## Changes
- Add reusable list and list-item components
- Refactor feature-flags, permissions, and app-features tools
- Add preset support to all tool services
- Improve type safety across services

## Demo App
- Update services to use new preset APIs

## Documentation
- Update README with new components
- Add component usage examples
```
