# Product

## Register
product

## Users
Frontend engineers building features in Angular apps. They switch between writing
code and exercising their app many times an hour, and need realistic app state to
develop against — empty state, populated state, edge cases. Their context is a
running dev server, browser open, terminal nearby. They value keyboard speed and
hate context switches that break flow.

## Product Purpose
ngx-dev-toolbar removes the friction of seeding test data and inspecting app state.
Instead of writing throwaway seed scripts, opening DevTools, or restarting the dev
server, the engineer opens the toolbar, asks for "10 customers with invoices," and
gets links to each created entity. Success looks like: zero context switches between
"I want this state" and "I have this state."

## Brand Personality
Terminal-native precision blended with AI-native cinema. Three words: precise,
expert, alive. Voice is technical without being austere — the toolbar narrates
what it's doing, but only when it's doing something. The chrome stays out of the way.

## Anti-references
- Generic SaaS dashboards. No hero-metric tiles, no repeated icon-card grids,
  no flat lifted shadows, no blue-gradient CTAs.
- Browser DevTools chrome. No gray gradients, no beveled tabs, no system-grey
  panels, no splitter chrome.
- Flashy AI aesthetics. No rainbow gradient borders, no glow text, no conic
  gradients, no neon-on-black.
- Material / Bootstrap defaults. No ripple buttons, no stock focus rings, no
  template-shaped lift shadows.

## Design Principles
1. **Stillness, then motion.** Chrome is still; streaming is cinematic.
   Animation is reserved for moments that earn it. Idle UI should feel paused.
2. **Density without hostility.** Dev tools should be compact, not cramped.
   Hierarchy comes from type weight and color, not whitespace bloat.
3. **Show the work.** The streaming UX is the brand. Watching the agent
   generate data is the premium feel — never collapse it into a spinner.
4. **Traceable by default.** Every generated entity becomes a deeplink. The
   engineer never asks "what was created and where?"
5. **Survives integration.** The toolbar lives inside other apps with
   unknown CSS resets. Defensive layout (explicit spacing, contained chrome)
   is non-negotiable.

## Accessibility & Inclusion
- WCAG AA on all text and UI controls (4.5:1, 3:1).
- `prefers-reduced-motion` disables the streaming choreography — steps render
  instantly, no fade or slide.
- Full keyboard navigation: tab order follows reading order, Esc closes the
  tool, Cmd/Ctrl+Enter submits the input.
- Screen reader: streaming steps announced via aria-live (polite), generated
  entity links labeled with type + name.
