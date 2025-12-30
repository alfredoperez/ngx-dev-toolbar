# Presentation: "Building a Developer Toolbar"

**Duration:** 30-35 minutes
**Format:** Slides + Live Demos
**Target Audience:** Developers, tech leads, engineering teams
**Style:** Minimal text, progressive code reveals, demo-focused

---

## SECTION 1: INTRO (Slides 1-5)

### Slide 1: Title
**Visual:** Clean title slide, centered
```
Building a
Developer Toolbar
```
**Notes:** Welcome. Today I'll show you how to eliminate hardcoding and speed up development workflows.

---

### Slide 2: About Me
**Visual:** Your photo, social handles
```
@alfredo.perez.q
@alfredo-perez
```
**Notes:** Quick intro - who you are, what you do.

---

### Slide 3: The Problem (Text only)
**Visual:** Bold text, centered, stacked vertically
```
Hardcoding

External Tools

Risk of Committing

Breaking Environments
```
**Notes:** We all do it. Hardcode feature flags, change configs, modify permissions just to test. It's slow and risky.

---

### Slide 4: The Problem (Workflow)
**Visual:** Current workflow diagram (messy, many steps)
```
Developer needs to test feature...

Modify Backend → Restart Server
Change Config → Hope you remember to undo
Switch Tools → Lost Context
Risk Commit → Break Team
```
**Notes:** This is the current reality. Takes 15 minutes, multiple tools, and you might break your team's environment.

---

### Slide 5: The Solution
**Visual:** Bold text, centered
```
Runtime
Overrides
```
**Subtitle (smaller text):** "Without touching code"

**Notes:** What if you could change everything at runtime, locally, without affecting anyone else?

---

## SECTION 2: DEMO INTRO (Slides 6-11)

### Slide 6: ~~REMOVED~~

---

### Slide 7: Demo - Toolbar Appears
**Visual:** Screenshot of toolbar at bottom of screen
```
Hover to open
```
**Notes:** The toolbar lives at the bottom. Hover over it and it expands.

---

### Slide 8: Tools Overview
**Visual:** Grid/list of tool names (minimal)
```
Feature Flags
Permissions
App Features
Presets
```
**Notes:** You get these tools out of the box. Each one lets you override different aspects of your app.

---

### Slide 9: How It Works (1/3)
**Visual:** Architecture diagram - Step 1 highlighted
```
[Your App]
    ↓
Register Options
```
**Notes:** Three layers. First, your app registers what's available - feature flags, permissions, app features, etc.

---

### Slide 10: How It Works (2/3)
**Visual:** Same diagram - Step 2 highlighted
```
[Your App]
    ↓
Register Options
    ↓
[Toolbar] ← Capture Overrides
```
**Notes:** The toolbar lets you override any of those values through the UI.

---

### Slide 11: How It Works (3/3)
**Visual:** Same diagram - Step 3 highlighted (complete flow)
```
[Your App]
    ↓
Register Options
    ↓
[Toolbar] ← Capture Overrides
    ↓
[Merged Values] → Your Logic
```
**Notes:** Your app gets the merged result. Overrides take precedence. Everything updates in real-time.

---

## SECTION 3: FEATURE FLAGS (Slides 12-18)

### Slide 12: Feature Flags
**Visual:** Title slide
```
Feature Flags
```
**Notes:** Let's start with feature flags - the most common use case.

---

### Slide 13: Code - Register Flags (1/3)
**Visual:** Code snippet - imports highlighted
```typescript
import { DevToolbarFeatureFlagsService } from 'ngx-dev-toolbar';

export class FeatureFlagsService {







}
```
**Notes:** First, import the DevToolbar service.

---

### Slide 14: Code - Register Flags (2/3)
**Visual:** Code snippet - constructor highlighted, imports dimmed
```typescript
import { DevToolbarFeatureFlagsService } from 'ngx-dev-toolbar';

export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);






}
```
**Notes:** Inject it into your feature flags service.

---

### Slide 15: Code - Register Flags (3/3)
**Visual:** Code snippet - setAvailableOptions highlighted, rest dimmed
```typescript
import { DevToolbarFeatureFlagsService } from 'ngx-dev-toolbar';

export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);

  loadFlags() {
    const flags = this.getFromBackend(); // Your logic
    this.devToolbar.setAvailableOptions(flags);
  }
}
```
**Notes:** When you load flags from your backend, register them with the toolbar. Now the toolbar knows what's available to override.

---

### Slide 16: Code - Get Flags (Used by App)
**Visual:** Code snippet - getFlags method
```typescript
export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);

  getFlags(): Observable<FeatureFlag[]> {
    return this.devToolbar.getValues();
  }





}
```
**Notes:** Your app calls getFlags(). This returns the merged values - backend flags WITH any toolbar overrides applied.

---

### Slide 17: Code - Initialize (Load from Backend)
**Visual:** Code snippet - initialization method highlighted
```typescript
export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);

  getFlags(): Observable<FeatureFlag[]> {
    return this.devToolbar.getValues();
  }

  initialize(): void {
    this.http.get<FeatureFlag[]>('/api/flags')
      .subscribe(flags => {
        this.devToolbar.setAvailableOptions(flags);
      });
  }
}
```
**Notes:** On app startup, load flags from backend and register them with the toolbar. Now the toolbar knows what's available to override.

---

### Slide 18: Demo
**Visual:** Simple text
```
DEMO
```

**Demo Outline:**
1. **Show the toolbar**
   - Hover to open
   - Show it hanging at bottom

2. **Open Feature Flags tool**
   - Point out search bar
   - Point out real value indicator
   - Point out flags list
   - Point out filters (all/enabled/disabled)

3. **Toggle dark mode flag**
   - Show it's OFF
   - Click to turn ON
   - UI updates immediately (dark theme appears)

4. **Show persistence**
   - Reload page
   - Flag still ON
   - Explain: localStorage, only on your machine

5. **Return to slides**

**Notes:** Let me switch to the live app and show you how this works.

---

## SECTION 4: OTHER TOOLS (Slides 19-23)

### Slide 19: Same Pattern
**Visual:** Title
```
Same
Pattern
```
**Notes:** Permissions and App Features work exactly the same way. Same pattern, same code structure.

---

### Slide 20: Code - Same Interface
**Visual:** Code snippet showing the pattern
```typescript
// Permissions
devToolbarPermissions.setAvailableOptions(permissions);
devToolbarPermissions.getValues();

// App Features
devToolbarAppFeatures.setAvailableOptions(features);
devToolbarAppFeatures.getValues();

// Same pattern every time
```
**Notes:** You register options, you get merged values. That's it.

---

### Slide 21: Permissions
**Visual:** Simple text/icon
```
Permissions

Admin, Editor, Viewer
Grant or Deny
```
**Notes:** Use permissions to test role-based access. Grant admin rights, deny delete permissions, etc.

---

### Slide 22: App Features
**Visual:** Simple text/icon
```
App Features

Free, Pro, Enterprise
Tier-based functionality
```
**Notes:** App features are for tier-based functionality. Test free tier, pro tier, enterprise features.

---

### Slide 23: Demo
**Visual:** Simple text
```
DEMO
```

**Demo Outline:**
1. **Open Permissions tool**
   - Show list of permissions
   - Grant admin permission
   - Show UI changes (admin panel appears)

2. **Open App Features tool**
   - Show tier features
   - Toggle enterprise tier
   - Show premium features appear

3. **Return to slides**

**Notes:** Let me show you both quickly.

---

## SECTION 5: PRESETS (Slides 24-32)

### Slide 24: Multiple Configurations
**Visual:** Text
```
Admin User
Guest User
Premium Spanish
QA Bug #1234
```
**Notes:** Now you know how to override flags, permissions, and features. But switching between configurations manually is still tedious.

---

### Slide 25: Presets
**Visual:** Title
```
Presets
```
**Subtitle:** "Save & Share"
**Notes:** Presets solve this. Save your entire toolbar state.

---

### Slide 26: What's a Preset?
**Visual:** Diagram
```
Preset = Complete Snapshot

✓ Feature Flags
✓ Permissions
✓ App Features

One Click → Full Configuration
```
**Notes:** Everything we just saw - flags, permissions, features - all saved together. Apply it with one click.

---

### Slide 27: Use Cases
**Visual:** List with icons
```
👤 User Personas
🐛 Bug Reproduction
🧪 Test Scenarios
👥 Team Onboarding
```
**Notes:** Create personas for testing, save bug configurations for QA, define test scenarios, onboard new devs instantly.

---

### Slide 28: Demo
**Visual:** Simple text
```
DEMO
```

**Demo Outline:**
1. **Configure toolbar**
   - Enable dark mode flag
   - Grant admin permission
   - Enable enterprise features

2. **Save as preset**
   - Open Presets tool
   - Click "Save Current Config"
   - Name it "Admin Dark Enterprise"

3. **Reset everything**
   - Clear all overrides
   - Show app returns to normal

4. **Apply preset**
   - Click "Admin Dark Enterprise"
   - Everything restores instantly

5. **Show export**
   - Click export button
   - Show JSON
   - Explain: share with team via Slack/email/repo

6. **Return to slides**

**Notes:** Let me create and apply a preset.

---

### Slide 29: Share with Team
**Visual:** Simple diagram
```
Developer → Export JSON → Team
Team → Import → Same Config
```
**Notes:** Export as JSON and share. Your team imports it and has the exact same configuration.

---

### Slide 30: Version Control
**Visual:** Text/icon
```
Commit presets to repo

team-presets/
  admin.json
  guest.json
  bug-1234.json
```
**Notes:** Even better - commit presets to your repo. Everyone gets them automatically.

---

### Slide 31: Testing
**Visual:** Text
```
Unit Tests
E2E Tests
Storybook

Load preset data
```
**Notes:** Use presets in your tests. Load preset data for consistent test fixtures.

---

### Slide 32: The Power
**Visual:** Bold text
```
10 Seconds

vs

15 Minutes
```
**Notes:** That's the difference. 15 minutes of manual setup becomes 10 seconds with a preset.

---

## SECTION 6: REAL-WORLD SCENARIO (Slides 33-42)

### Slide 33: Scenario
**Visual:** Title
```
Friday
3 PM
```
**Notes:** Let me show you a real scenario. It's Friday at 3 PM.

---

### Slide 34: The Bug Report
**Visual:** Text (styled like a chat message or bug ticket)
```
Bug Report #1234

"Checkout fails for
premium Spanish users
with dark mode enabled"
```
**Notes:** QA reports this bug. You need to reproduce it.

---

### Slide 35: Old Way (Title)
**Visual:** Text
```
Without Toolbar
```
**Notes:** Here's what you'd do without the toolbar.

---

### Slide 36: Old Way (Steps 1-2)
**Visual:** Checklist
```
☐ Modify backend (premium user)
☐ Restart server
```
**Notes:** First, modify your backend to make yourself a premium user. Restart the server.

---

### Slide 37: Old Way (Steps 3-4)
**Visual:** Checklist (previous items checked)
```
☑ Modify backend (premium user)
☑ Restart server
☐ Hardcode dark mode
☐ Change browser language
```
**Notes:** Hardcode dark mode in your code. Change your browser language to Spanish.

---

### Slide 38: Old Way (Step 5 + Time)
**Visual:** Checklist (all checked) + time
```
☑ Modify backend (premium user)
☑ Restart server
☑ Hardcode dark mode
☑ Change browser language
☑ Hope you got everything right

⏱️ 15 minutes
```
**Notes:** Hope you remembered everything. 15 minutes wasted.

---

### Slide 39: New Way (Title)
**Visual:** Text
```
With Toolbar
```
**Notes:** Now with the toolbar.

---

### Slide 40: New Way (Demo or Screenshot)
**Visual:** Screenshot of applying preset OR just text
```
Apply Preset

"Premium Spanish Dark"
```
**Notes:** Open toolbar. Apply the "Premium Spanish Dark" preset. Done.

---

### Slide 41: New Way (Result)
**Visual:** Large text
```
⏱️ 10 seconds
```
**Notes:** 10 seconds. Bug reproduced. That's the difference.

---

### Slide 42: Share with QA
**Visual:** Simple flow
```
QA creates preset → Exports → Shares
Developer imports → Reproduces instantly
```
**Notes:** Even better - QA can create the preset when they find the bug, export it, and send it to you. You import and reproduce instantly.

---

## SECTION 7: BENEFITS & RECAP (Slides 43-47)

### Slide 43: Why?
**Visual:** Title
```
Why Build This?
```
**Notes:** So why should you build a developer toolbar?

---

### Slide 44: Benefits
**Visual:** Icon + text list
```
⚡ Faster Development
🛡️ Safe Experiments
🤝 Team Collaboration
🧪 Consistent Testing
📦 No Code Pollution
```
**Notes:** Faster iteration cycles. Safe to experiment - everything's local. Better team collaboration with presets. Consistent test fixtures. No hardcoded values in your codebase.

---

### Slide 45: Before vs After
**Visual:** Two-column comparison
```
BEFORE              AFTER
---------------     -----------
15 min setup   →    10 sec
Multiple tools →    One toolbar
Risk commits   →    Local only
Manual config  →    Presets
Break team     →    Isolated
```
**Notes:** This is the transformation. From slow and risky to fast and safe.

---

### Slide 46: The Pattern
**Visual:** Simple diagram
```
1. Register Options
2. Capture Overrides
3. Merge Values

Works for everything
```
**Notes:** And it's the same simple pattern for everything - flags, permissions, features, whatever you need.

---

### Slide 47: Key Takeaways
**Visual:** Numbered list
```
1. Override at runtime
2. Persist locally (localStorage)
3. Share with presets
4. Same pattern repeats
```
**Notes:** Remember these four things. Runtime overrides, local persistence, shareable presets, consistent pattern.

---

## SECTION 8: OUTRO (Slides 48-52)

### Slide 48: What Now?
**Visual:** Title
```
What Now?
```
**Notes:** So what should you do next?

---

### Slide 49: Your Options
**Visual:** Two paths
```
Option 1:
Use ngx-dev-toolbar
(Angular 19+)

Option 2:
Build your own
(Any framework)
```
**Notes:** If you're on Angular 19+, use my library - it's ready to go. For other frameworks, build your own using the same pattern.

---

### Slide 50: Resources
**Visual:** QR code + bit.ly link (large)
```
bit.ly/dev-toolbar-ng

📦 GitHub
📖 Documentation
🎬 Live Demo
📝 Articles
```
**Notes:** Everything is here. Repo, docs, live demo, and articles showing how to build it.

---

### Slide 51: Contact
**Visual:** Social handles (large)
```
@alfredo.perez.q
@alfredo-perez

Questions?
```
**Notes:** Find me on social media. I'd love to hear what you build.

---

### Slide 52: Thank You
**Visual:** Simple, clean
```
Thank You

Start building today
```
**Notes:** Thank you! Stop hardcoding, start overriding. Build your toolbar today.

---

## PRESENTATION SUMMARY

**Total Slides:** 51 (Slide 6 removed)
**Total Time:** 30-35 minutes
**Demo Points:** 4 live demos
- Demo 1: Feature flags (Slide 18)
- Demo 2: Permissions & App Features (Slide 23)
- Demo 3: Presets (Slide 28)
- Demo 4 (optional): Real-world scenario walkthrough (Slide 40)

**Key Sections:**
1. Intro (Slides 1-5) - Problem & Solution
2. Demo Intro (Slides 7-11) - Architecture overview
3. Feature Flags (Slides 12-18) - Deep dive with code + demo
4. Other Tools (Slides 19-23) - Same pattern + demo
5. Presets (Slides 24-32) - Save/share + demo
6. Real-World Scenario (Slides 33-42) - Friday 3PM bug story
7. Benefits & Recap (Slides 43-47) - Why it matters
8. Outro (Slides 48-52) - Call to action

**Code Reveal Sequences:**
- Feature Flags registration: 3 slides (13-15)
- Feature Flags usage: 2 slides (16-17)
- Same pattern: 1 slide (20)

**Demo Flow:**
- Start with simple (feature flags)
- Show it's the same pattern (permissions, app features)
- Show the power (presets combining everything)
- Tell a story (real-world scenario)

**Call to Action:**
- Use ngx-dev-toolbar (Angular devs)
- Build your own (other frameworks)
- Share what you build
