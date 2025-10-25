# Pre-Commit Review

You are performing a comprehensive pre-commit code review for the ngx-dev-toolbar project. This review ensures code quality, Angular best practices, and documentation accuracy before commits.

## Review Scope

Focus your review on:
- **Library code**: `libs/ngx-dev-toolbar/`
- **Demo app**: `apps/ngx-dev-toolbar-demo/`

## Your Task

Perform the following checks and provide a comprehensive advisory report:

### 1. Run Automated Quality Checks

Execute the nx affected command to run linting, tests, build, and e2e on affected projects:

```bash
nx affected -t lint,test,build,e2e
```

**What this checks:**
- Runs ESLint to catch code quality issues
- Executes unit tests on affected projects
- Attempts to build affected projects to catch compilation errors
- Runs end-to-end tests if affected

**Report the results:**
- If all checks pass, note it in the ✅ Passed Checks section
- If any checks fail, include specific failures in the ⚠️ Warnings section with file paths and error messages

### 2. Angular Modernization Review

Use the Task tool with subagent_type="general-purpose" to review Angular code for modern patterns:

**Check for:**
- ✅ Components use `standalone: true` (implicit, not explicitly set)
- ✅ Components use `OnPush` change detection strategy
- ✅ Use of `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators
- ✅ State management uses signals (`signal()`, `computed()`, `effect()`)
- ✅ No deprecated Angular APIs (e.g., `@ViewChild` with `{ static: true }` unnecessarily)
- ✅ Proper use of `inject()` function for dependency injection
- ✅ No `ngClass` or `ngStyle` (use class/style bindings instead)
- ✅ Reactive Forms over Template-driven forms where applicable
- ❌ Old patterns like `any` types without justification
- ❌ Manual subscriptions without proper cleanup (should use async pipe or takeUntilDestroyed)
- ❌ Constructor-based DI when `inject()` would be cleaner

**Files to review:**
- All `.ts` files in `libs/ngx-dev-toolbar/src/`
- All `.ts` files in `apps/ngx-dev-toolbar-demo/src/`
- Focus on recently changed files (use git diff to identify)

### 3. Documentation Verification

**A. README Accuracy Check:**

Compare `README.md` with actual implementation:
1. Read `README.md`
2. Read `libs/ngx-dev-toolbar/src/index.ts` to verify exported APIs
3. Check that README examples match current API:
   - Installation instructions are correct
   - Usage examples reference correct imports
   - Feature list matches implemented features
   - Configuration options match actual interfaces
4. Verify version numbers and compatibility claims

**B. API Documentation Match:**

If documentation site exists in `apps/documentation/`:
1. Read API reference pages in `apps/documentation/src/app/pages/docs/`
2. Cross-reference code examples with actual library code
3. Verify that API signatures shown match current implementation
4. Check that deprecated APIs are marked as such

### 4. Code Quality Checks (Standard Level)

**A. Remove Unnecessary Comments:**
- ❌ Commented-out code blocks (unless marked with clear reason like "// TODO: Re-enable after v2.0")
- ❌ Obvious comments that just repeat the code (e.g., `// Set value` above `value = x`)
- ✅ Keep: JSDoc, complex logic explanations, important warnings

**B. Debug Code:**
- ❌ `console.log`, `console.debug`, `console.warn` (unless in error handling)
- ❌ `debugger` statements
- ❌ Commented debugging code

**C. Type Safety:**
- ❌ Explicit `any` types without JSDoc justification
- ❌ `@ts-ignore` or `@ts-expect-error` without explanation
- ✅ Proper return types on functions
- ✅ Interface/type definitions for complex objects

**D. Error Handling:**
- ✅ Try-catch blocks where appropriate (async operations, parsing, external calls)
- ✅ Proper error messages that help debugging
- ❌ Empty catch blocks
- ❌ Swallowed errors without logging

**E. Accessibility:**
- ✅ Buttons have accessible labels or aria-label
- ✅ Form inputs have associated labels
- ✅ Icons have aria-hidden="true" or descriptive text
- ✅ Interactive elements are keyboard accessible

### 5. Additional Quality Checks

**A. Imports:**
- ❌ Unused imports
- ✅ Imports organized (Angular core, third-party, relative)
- ❌ Relative imports going up more than 2 levels (use path aliases)

**B. File Naming:**
- ✅ Follows Angular style guide: `*.component.ts`, `*.service.ts`, `*.models.ts`
- ✅ Kebab-case for file names
- ✅ `.spec.ts` files exist alongside components/services

**C. Test Coverage:**
- For new components/services, check if `.spec.ts` file exists
- Warn if new functionality lacks tests (but don't block)

**D. Code Formatting:**
- ✅ Consistent indentation (2 spaces)
- ✅ No trailing whitespace
- ✅ Files end with newline

## Output Format

Provide your review in this format:

```
# Pre-Commit Review Report

## ✅ Passed Checks
- Automated checks: lint, test, build, e2e all passed
- Angular modernization: [X/Y files reviewed]
- Documentation accuracy: README up to date
- Code quality: No debug statements found
- [other passed checks]

## ⚠️  Warnings

### Automated Checks
- **Lint**: 2 issues found
  - `libs/ngx-dev-toolbar/src/example.ts:15`: 'foo' is assigned a value but never used
  - `apps/demo/src/app.ts:8`: Missing return type on function 'getData'
- **Tests**: 1 test failed
  - `libs/ngx-dev-toolbar/src/service.spec.ts`: Test "should handle errors" failed
- **Build**: Passed ✅
- **E2E**: Passed ✅

### Angular Patterns
- `libs/ngx-dev-toolbar/src/example.component.ts:42`: Using `@Input()` decorator instead of `input()` function
- `apps/ngx-dev-toolbar-demo/src/app/app.component.ts:15`: Manual subscription without takeUntilDestroyed

### Code Quality
- `libs/ngx-dev-toolbar/src/utils/helper.ts:23`: Commented-out code block (remove or document reason)
- `apps/ngx-dev-toolbar-demo/src/app/feature.ts:8`: console.log statement found

### Documentation
- README.md: Feature "Presets Tool" mentioned but not found in exports
- API docs example shows old `setOptions()` method, should be `setAvailableOptions()`

### Type Safety
- `libs/ngx-dev-toolbar/src/models/config.ts:12`: Using `any` type without justification

### Tests
- New component `PresetToolComponent` missing spec file

## 📊 Summary

**Total Issues Found**: X warnings
**Files Reviewed**: Y files
**Recommendation**: ⚠️ Review warnings before committing (advisory only)

## 🎯 Actionable Items

1. Update input() decorators in 2 components
2. Remove 1 console.log statement
3. Add justification or fix 1 any type
4. Consider adding spec file for PresetToolComponent
5. Update README feature list
```

## Important Notes

- This is an **advisory review** - do not block the commit
- Focus on actionable, specific feedback with file paths and line numbers
- Prioritize issues that affect code maintainability and user experience
- If no issues found, provide a positive summary
- Be thorough but concise - group similar issues together
