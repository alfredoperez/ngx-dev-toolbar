# Spec: Mock Tool Polish

**Slug**: 023-mock-tool-polish | **Date**: 2026-05-08

## Summary

The mock-data custom tool ships in the demo (PR #50) but has rough edges: bundle steps can't reference IDs from prior steps, so a generated invoice can't point at a real customer; the demo page outside the toolbar still describes a removed Finder/Maker tabs UI with hardcoded preview rows; and the FIND actions return static lists instead of items the user actually created. This spec evolves `StreamStep<T>.runItem` to receive a chaining context, refreshes the demo page to mirror real created entities, points FIND actions at live data, and fills the missing developer guidance (custom-tool docs guide + a stream-runner showcase in the demo app).

## Requirements

- **R001** (MUST): `StreamStep<T>.runItem` MUST accept an optional second argument — a context object that exposes items completed in prior steps of the same run, keyed by step index and/or step label. Existing `runItem: async (i) => …` callers MUST continue to work without source changes (the second arg is additive and optional).
- **R002** (MUST): The mock-data tool's CREATE bundles MUST use the new chaining context so cross-entity references are real — e.g. each generated invoice carries a `customerId` matching a customer id produced in step 1 of the same run, instead of a freestanding random id.
- **R003** (MUST): The demo page wrapper at `apps/ngx-dev-toolbar-demo/src/app/components/custom-tool/custom-tool-demo.component.ts` MUST display the entities created by the toolbar's mock-data tool live, replacing the current hardcoded preview rows that describe a Finder/Maker UI no longer present in the tool.
- **R004** (SHOULD): FIND-flow actions in the mock-data tool SHOULD return entities that were previously created through the tool when such data exists, falling back to the existing hardcoded sample only when the in-memory store is empty.
- **R005** (SHOULD): The demo app SHOULD include a route that showcases the standalone `<ndt-stream-runner>` component with at least two scripted scenarios (a quick discovery flow and a multi-step generation flow), serving the role of a Storybook story until Storybook is introduced.
- **R006** (SHOULD): The custom-tool guide at `apps/docs/src/content/docs/guides/custom-tool.mdx` SHOULD gain a new section that walks through building a tool around `<ndt-stream-runner>`, covering `StreamStep`, the chaining context, and the mock-data tool as the worked example.
- **R007** (MAY): The chaining context MAY also expose run-level metadata (current step index, elapsed time) for advanced consumers, but only if it falls out of the design — adding it is not a goal of this spec.

## Scenarios

### Bundle step references prior step's IDs

**When** the user runs the "Billing data" bundle and the Invoices step executes after Customers
**Then** each generated invoice's `customerId` matches the `id` of a customer produced in step 1 of the same run, and the invoice's deeplink points to a route under that customer.

### Demo page mirrors created entities

**When** the user generates 5 customers via the toolbar's Mock Data tool
**Then** the demo page (outside the toolbar) shows those 5 customers in a live list using the same ids the runner produced, replacing the static preview rows that previously described a Finder/Maker UI.

### FIND returns previously created entities

**When** the user runs CREATE → Customers, then opens FIND → Customers
**Then** the FIND action streams back the customers that were just created (same ids, same names), not a hardcoded sample list.

### Empty-state for FIND with no prior creates

**When** the user opens FIND → Customers without having created any
**Then** the action runs to completion and surfaces an empty result with a hint pointing at the matching CREATE flow.

### Backwards compatibility for existing runItem callers

**When** an existing `runItem: async (i) => …` (single-argument) callsite is used unchanged with the new runner
**Then** the runner still calls it correctly and the run completes — no type errors at compile time and no runtime errors from the additional context argument going unused.

## Non-Functional Requirements

- **NFR001** (SHOULD): Chaining-context lookup MUST be O(1) per step access (e.g. items cached on `StreamStepRecord` keyed by step index already exists — the context wraps it without per-item filtering) so long bundles don't accumulate quadratic cost.
- **NFR002** (MAY): Demo-page reactions to created entities should be batched per step or per N items rather than per item, so a 50-item burst does not trigger 50 separate DOM updates.

## Out of Scope

- A real persistence layer for the demo — created entities live in memory only and reset on page reload.
- Standing up Storybook itself; the "stories" requirement is satisfied by demo-app routes until a Storybook setup lands separately.
- Cross-bundle chaining (e.g. a Billing invoice referencing a User from the Onboarding bundle) — chaining stays within a single run.
- New FIND types beyond mirroring existing CREATE bundles (no FIND for routes-from-router, etc., unless they already exist today).
- Reworking the `<ndt-stream-runner>` visual design — this spec only adds an input to `StreamStep` and consumes it.
