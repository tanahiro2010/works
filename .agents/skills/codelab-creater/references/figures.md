---
name: figures
description: Visual language for architecture diagrams, concept illustrations, and flow charts in codelab figures — updated from recent Google Cloud / official docs figures for Agent Gateway, A2A, ADK-style agents, and Google Agentspace. Includes concrete layout rules and gen-image prompt templates for generating modern Google-style figures. Read when planning figures for a codelab or before calling gen-image.
---

# Codelab figures — current Google design language

Recent Google Cloud, official docs, and agent documentation figures share a newer visual language than older codelab diagrams. The current style is closer to Material 3 product diagrams: quiet surfaces, large rounded containers, generous spacing, one dominant accent color, product icon chips, and very little decorative detail.

Use this guide for architecture diagrams, concept illustrations, flow charts, hierarchy trees, and annotated screenshots in new codelabs.

## What changed from the old style

The older codelab look used thin bordered cards, dashed grouping boxes, many pastel Google brand fills, small rounded rectangles, and mostly orthogonal technical diagrams. The newer Google figures use a softer hierarchy:

- **Surface layers instead of outlines**: light gray canvases, white cards, pale gray modules, and rounded containers communicate grouping before borders do.
- **Larger radius**: cards and regions use pill-like radii, often 16-32px; outer canvases can be 32-48px.
- **One primary accent**: Google blue is usually the main system/action color; green, yellow, and red appear mostly as status marks, logos, or small semantic indicators.
- **Icon chips and avatars**: product marks, agent icons, and generic icons often sit in circular white chips with black rings or filled blue circles.
- **Sparse arrows**: arrows are black or dark gray, medium weight, and mostly horizontal/vertical. Dashed arrows mean policy, metadata, authorization, observability, or indirect relationships.
- **Subtle elevation is allowed**: foreground callouts and selected objects may have soft shadows. Avoid heavy drop shadows.
- **Text is larger and calmer**: labels are short, high contrast, and set in Google Sans-like type; diagrams avoid dense paragraphs unless they are annotated screenshots.

## When to use which figure form

Pick the form by the learner's need, not by what looks interesting.

| Purpose | Form | Current Google-style treatment |
|---|---|---|
| Show what to click in real software | Screenshot | Real UI screenshot, cropped; use dimmed overlay and a focused callout only when useful |
| Explain a product capability | Concept illustration | Big labels, simple icons/avatars, speech bubbles or feature circles |
| Show how systems fit together | Architecture diagram | Large rounded gray canvas with white/gray modules, blue primary rail or gateway, product icon chips |
| Show request/data movement | Flow chart / sequence | Horizontal or top-to-bottom path, sparse arrows, short labels above arrows |
| Show governance/security/control planes | Layered architecture | Top capability row, middle runtime path, bottom observability/control strip |
| Show parent-child structure | Hierarchy tree | Simple circles or chips connected by thin lines; keep the tree sparse |
| Compare two modes | Two-panel or table | Use a table for precise distinctions; use side-by-side panels only for visual differences |
| Introduce a protocol or brand topic | Header graphic | Dark or image-rich header is acceptable, but keep body diagrams light |

Screenshots stay screenshots. Do not redraw a product UI as a diagram when an actual screenshot is more truthful.

## Design principles

### 1. Start with a surface stack

Use layers of neutral surfaces to create hierarchy.

- Page/background: pure white `#FFFFFF`.
- Diagram canvas: very light gray `#F1F3F4`, `#F5F6F7`, or `#F8F9FA`.
- Major regions: slightly darker gray `#E8EAED` or `#EEF0F2`.
- Component cards: white `#FFFFFF` or pale gray `#F8F9FA`.
- Accent modules: Google blue `#4285F4` for the central product, gateway, protocol rail, or selected action.

Current figures often sit inside one large rounded gray container instead of floating directly on white. When a diagram has many elements, add this container first and place all modules inside it.

### 2. Prefer large rounded modules over small bordered boxes

Use rounded rectangles and pills as the default component shape.

- Outer canvas radius: 32-48px.
- Major region radius: 20-32px.
- Component card radius: 12-20px.
- Small chips/buttons: pill radius or fully circular.
- Borders are usually absent. If needed, use a 1px light gray border `#DADCE0`, not a dark outline.

Use solid fills and whitespace to separate areas. Do not make every component a bordered pastel card.

### 3. Use color with restraint

The current look is not a four-color brand-palette diagram. It is mostly neutral with one confident accent.

- Primary accent: Google blue `#4285F4` for gateways, main actions, highlighted bars, and selected concepts.
- Neutral structure: `#202124` text, `#5F6368` secondary text, `#DADCE0` dividers, `#E8EAED` panels.
- Green `#34A853`: success, check marks, accepted capability, positive status, remote/ready agent.
- Red `#EA4335`: blocked, rejected, missing, warning, failed status.
- Yellow `#FBBC04`: capability branches, protocol dimensions, or attention markers, used sparingly.

Use full-saturation color for important modules or small status marks. Use pale tints for large background regions. Avoid filling a whole diagram with multiple pastel brand colors.

### 4. Typography should feel like product UI

Use Google Sans-like sans-serif throughout.

- Main title: large, bold, left aligned when present.
- Component names: medium-large, semibold or bold.
- Secondary labels: regular weight, smaller, `#5F6368` when less important.
- Code identifiers: monospace only when the diagram is explicitly about code, tool names, or config keys.
- Text inside figures should be short. Prefer nouns and verb phrases over sentences.

Allowed text colors:

- Default text: `#202124`.
- Secondary text: `#5F6368`.
- On blue modules: white.
- Blue accent text: allowed for link-like captions or key interaction labels, but do not color every label.

### 5. Make icons part of the system, not decoration

Icons anchor meaning in recent Google figures.

- Use official Google product icons for named products: Google Cloud, Gemini, Vertex AI, Cloud Run, Cloud Monitoring, IAM, Firebase, Model Armor, Agent Gateway, Agentspace.
- Put product icons in circular chips when they appear in a flow: white circle with a black/dark ring, or filled blue circle for a selected Google Cloud endpoint.
- Use simple Material-style icons for generic concepts: table, document, API, database, lock, monitoring, file, registry, user.
- Agent illustrations can be simple flat robot avatars when representing client/remote agents or friendly agent concepts.
- Keep icon detail flat and vector-like. No 3D, photography, skeuomorphic icons, or emoji.

### 6. Arrows communicate relationship type

Use arrows sparingly and make their meaning consistent.

- Main runtime/data flow: solid dark arrow, 2-3px stroke.
- Policy, metadata, identity, logging, observability, or optional relationship: dashed dark arrow.
- One-to-many capability branches: curved yellow lines are acceptable when the purpose is conceptual rather than runtime architecture.
- Bidirectional policy or identity exchange: dashed two-headed arrow.
- Arrow labels sit above or near the line, not inside crowded boxes.
- Orthogonal arrows are preferred in architecture diagrams. Gentle curves are acceptable for conceptual branch diagrams.

Avoid diagonal arrows in dense architecture diagrams. Avoid colored arrows unless the color itself is the concept, such as yellow capability branches.

### 7. Grouping uses panels, rows, and lanes

Modern Google diagrams often group systems with rows or lanes:

- A top row for platform capabilities: `Agent registry`, `Access authorization`, `AI security`, `Observability`.
- A middle row for the runtime path: `User` → `Front End` → `Agent Gateway` → `Agents`.
- A side panel for external resources: `Agents`, `Tools`, `Models`, `APIs`.
- A bottom strip for observability, logs, or monitoring.

Use broad panels and lanes before adding nested boxes. A label in the top-left of a panel is enough; do not over-explain the group.

### 8. Compose for scanning

The user should understand the diagram in 3-5 seconds.

- Limit primary elements to 5-7 per diagram.
- Keep labels to one or two lines.
- Align components on a simple grid.
- Leave generous whitespace between modules.
- Make the main path visually obvious through size, placement, or blue accent.
- Crop diagrams tightly enough that labels stay legible in codelab pages.

If the diagram needs dense text, it is probably a table, screenshot, or step-by-step explanation rather than an architecture figure.

## Figure patterns

### Pattern A: Google Cloud architecture / gateway diagram

Use this for systems like Agent Gateway, A2A, service integration, or identity/security paths.

Structure:

1. Large rounded light-gray outer canvas.
2. Optional top capability lane with pale gray cards.
3. Horizontal runtime path across the middle.
4. Blue main product module or rail for the central gateway/protocol.
5. Product icon chips in the path.
6. Right-side resource panel for tools, models, APIs, data, or external services.
7. Dashed vertical arrows from runtime path to governance/control panels.

Visual cues:

- Blue filled gateway/rail with white label.
- White agent group card with circular icon chips.
- Pale gray modules for capabilities.
- Dark arrows for flow; dashed arrows for metadata/policy/logs.

### Pattern B: Capability concept illustration

Use this to explain an abstract capability such as discovery, negotiation, state management, or secure collaboration.

Structure:

1. White background.
2. Two or three large visual actors, often agent avatars or simple rounded speech bubbles.
3. Large colored concept branches or circles for capability names.
4. Minimal arrows; relationships can be implied by proximity and connector lines.

Visual cues:

- Friendly flat agent avatars are acceptable.
- Green and blue tints can distinguish remote/client sides.
- Yellow circular outlines work well for enumerated protocol capabilities.
- Labels are large; avoid technical paragraphs.

### Pattern C: Product screenshot with explanatory overlay

Use this when the source of truth is a UI.

Structure:

1. Real screenshot as the base.
2. Optional translucent dim layer to reduce background noise.
3. One foreground callout card or popover.
4. Highlight selection with a pale blue rectangle or text selection.
5. Keep actual product chrome visible enough to orient the learner.

Visual cues:

- Foreground callout card: white or pale blue, 16-24px radius, subtle shadow.
- Use a small illustration inside the callout if it explains the product concept.
- Do not cover the exact UI element the learner needs to see.

### Pattern D: Agent / workflow diagram

Use this for loop agents, coordinator-subagent flows, tool dispatch, or handoffs.

Structure:

1. Large title at top-left if the figure stands alone.
2. Input panel on the left, output panel on the right.
3. Central agent card with a small agent icon and internal steps.
4. Internal sub-steps as yellow or pale cards.
5. Solid arrows for normal progression; dotted arrows for exit conditions.

Visual cues:

- Pale yellow panels can represent input/output or task payloads.
- The central agent can sit on a light gray card.
- Use a refresh/loop icon for iteration metadata.
- Keep code-like keys, such as `max_iterations=2`, in monospace.

### Pattern E: Hierarchy tree

Use this for agent hierarchy, tool ownership, or parent-child structure.

Structure:

1. White background.
2. Root node at top, children below.
3. Circular or chip-like nodes, not heavy boxes.
4. Thin dark connector lines.
5. A small label to the side of representative nodes.

Visual cues:

- Agent nodes can be circular icons with a thin black ring.
- Do not over-label every repeated node.
- Use dotted continuation marks for collapsed or repeated children.

### Pattern F: Comparison table

Use this when differences are semantic and exact, such as `Agent-as-a-tool` vs `Sub-agent`.

Structure:

1. Simple table with a short title.
2. Light blue or gray header row.
3. Strong row labels in the first column.
4. Minimal grid lines; avoid decorative icons.

Tables are allowed to look more utilitarian than concept diagrams.

## Style rules

Do:

- Use a light gray rounded canvas for multi-part architecture diagrams.
- Use white or pale gray rounded modules with generous padding.
- Use Google blue as the dominant accent for central products or selected paths.
- Use icon chips for agents, products, and services.
- Use dark, readable arrows with clear relationship semantics.
- Use subtle shadow only for foreground callouts, selected cards, or screenshot overlays.
- Keep labels short and large enough to read after the image is embedded in a codelab.

Avoid:

- Filling every component with a different Google brand tint.
- Dark borders around every card.
- Small 8px boxes everywhere; the current style uses softer, larger radii.
- Decorative gradients, bokeh, stock-photo backgrounds, glassmorphism, or 3D.
- Dense labels, paragraphs, or tiny monospace text in diagrams.
- Diagonal arrows in architecture diagrams.
- Unofficial logos or invented product marks.
- Watermarks, stray legends, and extra decorative captions.

Use only when appropriate:

- Dark backgrounds: acceptable for hero/header protocol graphics or screenshots of dark UI, not for ordinary codelab architecture diagrams.
- Dashed borders: rare; prefer panels. Use dashed lines for relationships more often than dashed boxes.
- Shadows: subtle and purposeful; never make every card float.

## Generating figures with `/gen-image`

`/gen-image` can drift toward decorative illustrations. Specify that the output is a modern Google Cloud / Material 3 product diagram with neutral surfaces, large rounded modules, sparse arrows, and product icon chips.

### Prompt template

```text
A modern Google Cloud / Material 3 style [diagram type: architecture
diagram / concept illustration / flow chart / hierarchy tree /
annotated screenshot overlay] illustrating [topic in one sentence].

Language: [Japanese / English]. All labels inside the figure must use
this language only.

Canvas:
- Pure white page background.
- [For architecture diagrams] one large rounded light-gray canvas
  (#F1F3F4 / #F5F6F7), radius about 36px, with generous padding.
- No decorative background, no gradient, no watermark.

Elements:
- [Element 1: exact label, role, shape, icon if any]
- [Element 2: exact label, role, shape, icon if any]
- [Element 3: exact label, role, shape, icon if any]

Layout:
- [horizontal runtime path / top capability lane plus middle runtime
  path / vertical tree / two-panel comparison / screenshot with one
  callout].
- Align elements to a clean grid with generous whitespace.
- Make [main product/concept] visually dominant using Google blue.

Surfaces and shapes:
- Use large rounded rectangles and pill cards, not sharp boxes.
- White cards on pale gray panels; pale gray modules for secondary
  areas.
- Thin light-gray borders only when needed.
- Subtle shadow only for selected foreground callouts, never on every
  component.

Color:
- Mostly neutral grays and white.
- Google blue #4285F4 for the central product, selected rail, or
  primary action.
- Green #34A853 only for success/check/ready status.
- Red #EA4335 only for blocked/error/missing status.
- Yellow #FBBC04 only for capability branches or attention markers.
- Avoid using all Google brand colors as equal large fills.

Typography:
- Google Sans-like sans-serif.
- Dark text #202124; secondary text #5F6368.
- White text on blue modules.
- Short labels, one or two lines maximum.
- Use monospace only for explicit code/config identifiers.

Icons:
- Use official Google product icons for named Google products.
- Put product/agent icons in circular chips when they appear in a flow.
- Use simple Material-style icons for generic concepts.
- Use flat agent robot avatars only when representing client/remote
  agents conceptually.

Relationships:
- Main flow: solid dark arrows.
- Policy, metadata, auth, logs, observability, optional or indirect
  relationship: dashed dark arrows.
- [If needed] yellow curved connector branches for conceptual
  capabilities.
- No diagonal arrows in dense architecture diagrams.

Aspect ratio: [16:9 / wide / square / portrait], with labels legible at
codelab embed size.
```

### Worked example — Agent Gateway architecture

```text
A modern Google Cloud / Material 3 style architecture diagram
illustrating how Agent Gateway governs client-to-agent interactions.

Language: English. All labels inside the figure must be English.

Canvas:
- Pure white page background.
- One large rounded light-gray canvas (#F1F3F4), radius about 40px.

Layout:
- Top capability lane with four pale gray rounded cards:
  Agent registry, Access authorization, AI security, Observability.
- Middle runtime path from left to right:
  Clients -> Agent Gateway -> Agents -> Resources.
- Agent Gateway is the dominant Google blue rounded rectangle with
  white text and an Agent Gateway icon chip on the left.
- Agents is a white rounded card containing five circular icon chips:
  ADK agent, generic agent, Gemini, framework agent, remote agent.
- Resources is a right-side white rounded panel with four pale gray
  cards labeled Agents, Tools, Models, APIs, plus Google product icon
  chips.
- Dashed vertical arrows connect the runtime path to capability cards
  for registry, authorization, security, and observability.

Style:
- Neutral gray surfaces, large rounded modules, generous whitespace.
- Google blue #4285F4 only for Agent Gateway.
- Dark solid arrows for runtime flow; dark dashed arrows for policy,
  metadata, and logs.
- Google Sans-like typography, dark text #202124.
- No decorative gradient, no 3D, no watermark.

Aspect ratio: wide 21:9.
```

### Worked example — A2A capability concept

```text
A modern Google Cloud concept illustration explaining Agent2Agent
capabilities.

Language: English. All labels inside the figure must be English.

Elements:
- Top right: blue flat robot avatar labeled Client Agent.
- Lower left: green flat robot avatar labeled Remote Agent.
- Between them: two large rounded speech bubbles, one pale green and
  one pale blue, each containing simple table and document icons.
- Add green check status circles to accepted capability icons and one
  red x status circle to a rejected document icon.
- Bottom: four large white circles with thick yellow outlines connected
  by gentle yellow curved lines from the agents. Circle labels:
  Secure Collaboration, Task and State Management, User Experience
  Negotiation, Capability Discovery.

Style:
- White background, large labels, simple flat vector shapes.
- Google Sans-like typography, dark text #202124.
- Use blue and green tints for the two agents; yellow only for the
  capability branches.
- No dense paragraphs, no photo texture, no watermark.

Aspect ratio: 4:3.
```

### Worked example — Loop agent workflow

```text
A modern Google Cloud workflow diagram titled Loop agents.

Language: English. All labels inside the figure must be English.

Layout:
- Large bold title at top-left: Loop agents.
- Left: tall pale yellow rounded panel labeled Input.
- Center: light gray rounded card labeled Loop Agent with a small agent
  icon. Inside it, stack four yellow pill cards labeled sub_agents_1,
  sub_agents_2, sub_agents_3, sub_agents_4.
- Right: tall pale yellow rounded panel labeled Output.
- Solid dark arrows show Input -> sub_agents_1 -> sub_agents_2 ->
  sub_agents_3 -> sub_agents_4 -> Output.
- Dotted dark arrows from each sub-agent to an exit bracket labeled
  Exit condition met.
- Bottom of central card: refresh icon, label Loop, monospace
  max_iterations=2.

Style:
- White background, neutral gray central surface, pale yellow input and
  output panels, large rounded corners.
- Google Sans-like typography; code identifier in monospace.
- No borders except arrows and dotted exit lines.
- No shadows, no decorative background.

Aspect ratio: 16:9.
```

## Generation checklist

Before accepting a generated figure, verify:

- The main idea is readable at codelab embed size.
- It uses neutral surfaces first and color second.
- There is one clear focal element or path.
- Product icons are plausible and not invented logos.
- Text is spelled correctly and uses the requested language only.
- Arrows have consistent meaning.
- No stray labels, watermarks, decorative captions, or irrelevant logos appear.
- The figure does not look like an old pastel-box diagram unless matching an existing legacy page intentionally.

## Operational notes

- `/gen-image` writes to `./images/` under the current working directory. After generation, move the file into `<content-name>/img/` (`mv ./images/foo.png <content-name>/img/`) and reference it from `claat.md` with the standard `![...](img/...)` syntax.
- One `codex exec` call produces exactly one file. For variations, call multiple times with different filenames.
- If labels are wrong, regenerate with fewer elements and exact label text in the prompt.
- If product icons look fake, ask for generic Material-style icons instead of official product icons, or place known product logos manually afterward.
- If the result looks too old, add: `Use the recent Google Cloud documentation style: large rounded light-gray canvas, white surface cards, one dominant blue module, circular icon chips, sparse dark arrows, no pastel rainbow boxes.`
- If the result looks too decorative, add: `This is a documentation diagram, not marketing art. No gradients, no 3D, no photographic background, no decorative shapes.`
