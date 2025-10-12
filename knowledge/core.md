# Knowledge Base Core

## Purpose

Central index and standards for our AI-optimized knowledge base system.

## Primary Reference

**[CLAUDE.md](/CLAUDE.md)** - The authoritative source for project configuration, commands, architecture, and conventions. Always consult this file first for project-specific guidance.

## Knowledge Base Index

### [/code-style](./code-style/)

Framework and language-specific coding patterns and conventions.

- **[typescript-rules.md](./code-style/typescript-rules.md)** - TypeScript code style rules and best practices
- **angular/** - Angular-specific patterns (components, services, state management, templates, etc.)
- **testing/** - Testing patterns and best practices
- **storybook/** - Storybook configuration and patterns

### [/project](./project/)

Project-specific implementations, architecture, and guides.

- **guides/** - Step-by-step implementation guides for common tasks

### [/tools](./tools/)

AI tool configurations, agents, and custom commands.

- **agents/** - Specialized agent definitions for specific tasks
- **commands/** - Custom slash command definitions

## Structure Overview

### Code Style Organization

Framework and language-specific patterns that are project-agnostic.

- Split by framework/tool (angular/, testing/, etc.)
- Each file focuses on one aspect (components, services, etc.)

### Project Organization

Project-specific implementations and patterns.

- /guides - Step-by-step implementations

### Tools Organization

AI tool configurations and templates.

- /agents - Specialized agent definitions
- /commands - Quick command definitions

## File Standards

### Naming

- Use kebab-case: `component-patterns.md`
- Be specific and searchable
- Avoid generic names like `guide.md` or `rules.md`

### Size Guidelines

- Target 100-500 lines per file
- Split large topics into multiple files
- Link related files rather than duplicate

### XML Tag Usage

- `<example>` - Code examples showing correct implementation
- `<pattern>` - Reusable patterns with context
- `<avoid>` - Anti-patterns to explicitly avoid
- Only use tags for code that must be followed exactly

## Quick Reference

- Common patterns: `code-style/[framework]/`
- Project guides: `project/guides/`
- Agent configs: `tools/agents/`
