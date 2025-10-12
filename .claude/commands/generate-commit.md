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

Write a **concise, explanatory description** of what changed and why. DO NOT list individual files.

```markdown
<2-5 short sentences explaining what was implemented/changed and the purpose>

Include:
- What functionality was added/changed
- Key architectural decisions or patterns used
- Important side effects or impacts
- Brief mention of supporting changes (docs, tests, config)
```

**Guidelines**:
- Be concise but informative (aim for 3-10 lines total)
- Focus on WHAT changed and WHY, not WHERE (no file paths)
- Use plain sentences, not bullet lists
- For AI config files, briefly mention: "Includes 🤖 Claude Code setup" or "Added 📋 SpecKit workflows"
- Avoid technical jargon unless necessary

**AI Configuration mentions**:
- 🤖 Claude Code configuration
- 📋 SpecKit workflow setup
- 📚 Knowledge base updates

### Step 6: Output Format

Present the commit message in this format:

```
📝 SUGGESTED COMMIT TITLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<type>(<scope>): <description>

📄 SUGGESTED COMMIT BODY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Concise explanation of what changed and why, in 2-5 sentences>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TO COMMIT:
You can now commit manually using:
  git commit -m "title" -m "body"

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

Implemented new permissions tool following the 3-layer architecture pattern
with component, internal service, and public service. Allows developers to
override user permissions at runtime for testing different role scenarios
without backend changes. Includes comprehensive test coverage.
```

### Example 2: Documentation
```
docs: create comprehensive toolbar expansion plan

Added detailed implementation roadmap for three new toolbar tools: Permissions,
App Features, and Presets. Includes architecture patterns, data models, service
APIs, and integration examples for each tool.
```

### Example 3: Multiple Changes
```
chore: setup project structure and AI workflows

Initial project setup with build tooling, dependency management, and development
workflows. Includes 🤖 Claude Code agents for automated commits and reviews,
📋 SpecKit templates for feature specification, and 📚 knowledge base
documentation for project architecture.
```
