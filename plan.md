# Build a Mind Map–to–Presentation Web Application

Build a polished, production-quality web application that combines a mind-mapping tool like XMind with a presentation editor like PowerPoint.

The central idea is:

> Every mind-map node is also a miniature presentation slide containing text, images, and visual elements.

Users should be able to brainstorm quickly in a mind map and then present the same content immediately as a structured slide deck.

## Product objective

Create an application where users can:

1. Build a mind map quickly using keyboard shortcuts.
2. Add text and images directly inside each node.
3. Open any node in a larger slide-editing view.
4. Arrange nodes hierarchically and spatially.
5. Convert the mind-map structure into a presentation.
6. define a custom presentation order.
7. Present the deck in full-screen mode.
8. Save and reopen projects locally.

The application should prioritize:

* Speed
* Simplicity
* Keyboard-first interaction
* Clean visual design
* Smooth editing
* Clear separation between brainstorming and presentation modes

Do not build an overly complex PowerPoint clone. The first version should be focused and maintainable.

---

# Technology stack

Use:

* Next.js with the App Router
* React
* TypeScript with strict mode
* Tailwind CSS
* React Flow for the mind-map canvas
* Zustand for application state
* Tiptap or Lexical for rich-text editing
* Lucide React for icons
* Framer Motion only where animation adds meaningful value
* IndexedDB for local project persistence
* PptxGenJS for PowerPoint export

The application must run locally without requiring external APIs or paid services.

Design the architecture so that authentication, cloud storage, and real-time collaboration can be added later.

---

# Core application modes

The application must have three primary modes.

## 1. Map mode

Map mode is the default workspace.

Display an infinite, zoomable canvas containing connected mind-map nodes.

Each node must look like a small presentation slide rather than a simple text box.

A node preview should display:

* Slide title
* Short text preview
* Image preview when available
* Slide layout
* Node number or presentation order
* A visual indicator when speaker notes exist

Users must be able to:

* Create a root node
* Add child nodes
* Add sibling nodes
* Edit node titles inline
* Select one or multiple nodes
* Drag nodes around the canvas
* Connect parent and child nodes
* Collapse and expand branches
* Duplicate nodes
* Delete nodes
* Copy and paste nodes
* Undo and redo changes
* Zoom and pan
* Fit the map to the viewport
* Automatically arrange the mind map
* Change node size
* Open a node in slide-editing mode

Use smooth curved connectors between nodes.

Parent-child relationships must remain separate from visual position. Moving a node should not accidentally change its hierarchy.

## 2. Slide editor mode

Double-clicking a node should open it in a focused slide editor.

The slide editor should occupy most of the screen while preserving access to the map or slide outline.

Use a fixed 16:9 slide canvas.

For the MVP, support structured layouts instead of a fully unrestricted design canvas.

Include these layouts:

* Title slide
* Section divider
* Title and bullet points
* Title and image
* Image with caption
* Two-column content
* Comparison
* Quote
* Full-image slide
* Blank slide

Users must be able to:

* Edit the title
* Add formatted text
* Add bullet lists
* Upload an image
* Paste an image from the clipboard
* Drag and drop an image
* Replace or remove an image
* Resize and crop images
* Choose an image fit mode
* Change the slide layout
* Change background color
* Change text alignment
* Add speaker notes
* Preview the node as a slide
* Move to the previous or next slide without closing the editor

When the user changes the layout, preserve existing content whenever possible.

## 3. Presentation mode

Create a full-screen presentation experience.

Support two presentation styles.

### Linear presentation

Navigate through slides using the defined presentation order.

Controls:

* Previous slide
* Next slide
* First slide
* Last slide
* Exit presentation
* Show or hide controls
* Full-screen mode
* Keyboard navigation

Keyboard controls:

* Right Arrow or Space: next slide
* Left Arrow: previous slide
* Escape: exit presentation
* Home: first slide
* End: last slide

### Map presentation

Start with the complete mind map and visually zoom into the selected node.

When advancing:

* Zoom to the current slide node
* Expand the node into a readable presentation view
* Move smoothly to the next connected node
* Allow returning to the full-map overview

The animation should feel purposeful and restrained, not distracting.

---

# Keyboard-first workflow

Fast mind-map creation is one of the most important requirements.

Implement these shortcuts in Map mode:

* Enter: create sibling node
* Tab: create child node
* Shift + Tab: move node one level upward where valid
* F2: rename selected node
* Delete or Backspace: delete selected node
* Ctrl/Cmd + D: duplicate selected node
* Ctrl/Cmd + C: copy selected nodes
* Ctrl/Cmd + V: paste nodes
* Ctrl/Cmd + Z: undo
* Ctrl/Cmd + Shift + Z: redo
* Arrow keys: navigate between nearby nodes
* Space + drag: pan canvas
* Plus and Minus: zoom
* Ctrl/Cmd + Enter: open selected node in the slide editor
* Ctrl/Cmd + Shift + P: start presentation

Shortcuts must not interfere while the user is typing in a text editor.

Show keyboard shortcuts in tooltips and in a dedicated shortcut help modal.

---

# Presentation order

The mind-map hierarchy and presentation order must be related but independent.

By default, create the slide order using depth-first traversal:

1. Root node
2. First branch and its descendants
3. Second branch and its descendants
4. Remaining branches

Provide an outline panel where users can reorder slides using drag and drop.

Changing presentation order must not alter the map hierarchy.

Allow users to:

* Include or exclude nodes from the presentation
* Mark a node as hidden
* Reorder slides
* Reset to hierarchy order
* Start presenting from any selected node

Display slide numbers inside node previews.

---

# User interface layout

Use a desktop-first responsive interface.

## Main application shell

Create:

### Top toolbar

Include:

* Application logo and project title
* Undo
* Redo
* Add node
* Add child
* Add image
* Auto-layout
* Theme selector
* Map/Slide mode switch
* Present
* Export
* Save status
* More menu

### Left sidebar

Support switchable tabs:

* Outline
* Slide order
* Templates
* Project information

The outline should show the hierarchy as a collapsible tree.

### Main workspace

Display either:

* Mind-map canvas
* Slide editor
* Presentation preview

### Right properties panel

Show context-sensitive properties for:

* Selected node
* Slide layout
* Text formatting
* Image settings
* Background
* Connector style
* Speaker notes

The properties panel should update depending on the selected element.

### Bottom status bar

Show:

* Zoom percentage
* Node count
* Slide count
* Current mode
* Save status
* Keyboard shortcut hint

Allow left and right sidebars to be collapsed.

---

# Data model

Use a clear, normalized TypeScript data model.

A project should contain:

```ts
type Project = {
  id: string;
  title: string;
  description?: string;
  rootNodeId: string | null;
  nodes: Record<string, MindMapNode>;
  presentationOrder: string[];
  themeId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};
```

A node should contain:

```ts
type MindMapNode = {
  id: string;
  parentId: string | null;
  childIds: string[];

  position: {
    x: number;
    y: number;
  };

  size: {
    width: number;
    height: number;
  };

  title: string;
  slide: SlideContent;

  isCollapsed: boolean;
  isHiddenFromPresentation: boolean;

  createdAt: string;
  updatedAt: string;
};
```

Slide content should contain:

```ts
type SlideContent = {
  layout: SlideLayout;
  title: string;
  body: RichTextContent;
  image?: SlideImage;
  secondaryImage?: SlideImage;
  caption?: string;
  quoteAuthor?: string;
  speakerNotes?: string;
  background: SlideBackground;
  textAlignment?: "left" | "center" | "right";
};
```

Use discriminated unions where useful.

Do not use `any`.

---

# State management

Use Zustand.

Separate state into logical slices:

* Project state
* Node selection
* Canvas viewport
* Slide editor
* Presentation
* History
* UI panels
* Persistence

Implement undo and redo using command history or immutable state snapshots.

Undo and redo should support:

* Creating nodes
* Deleting nodes
* Moving nodes
* Editing node content
* Changing hierarchy
* Reordering slides
* Changing layouts
* Adding or removing images

Do not store temporary UI state inside the persistent project model.

---

# Local persistence

Use IndexedDB to save projects locally.

Requirements:

* Autosave after meaningful changes
* Debounce autosave to avoid excessive writes
* Display “Saving…” and “Saved” states
* Restore the last opened project
* Create a new project
* Duplicate a project
* Rename a project
* Delete a project
* Export a project as JSON
* Import a project from JSON
* Validate imported project data
* Support project model versioning for future migrations

Use localStorage only for lightweight preferences such as theme and last-opened project ID.

---

# Images

Support:

* File upload
* Drag and drop
* Clipboard paste
* Image preview
* Replacement
* Removal
* Cropping
* Object-fit options
* Alt text

For the local MVP, store images as compressed blobs in IndexedDB rather than inserting large base64 strings directly into the project JSON.

Validate file type and file size.

Show clear errors for unsupported files.

---

# Themes

Create at least four built-in themes:

1. Minimal Light
2. Dark Professional
3. Warm Creative
4. Corporate Blue

Each theme should define:

* Slide background
* Primary text color
* Secondary text color
* Accent color
* Heading font
* Body font
* Node border style
* Connector style
* Slide spacing

Themes must apply consistently to:

* Node previews
* Slide editor
* Presentation mode
* Exported PowerPoint slides

Allow individual slides to override their background.

---

# Auto-layout

Add an auto-layout feature for the mind map.

Support:

* Horizontal tree
* Vertical tree
* Radial layout

Use a suitable layout algorithm such as Dagre or ELK.

Auto-layout must:

* Respect node dimensions
* Prevent major overlaps
* Preserve hierarchy
* Animate nodes to their new positions
* Be undoable

Do not automatically rearrange manually positioned nodes unless the user explicitly selects auto-layout.

---

# PowerPoint export

Use PptxGenJS to export the presentation as a `.pptx` file.

Export only nodes included in the presentation.

Respect:

* Presentation order
* 16:9 slide size
* Theme colors
* Selected layouts
* Titles
* Text
* Bullet points
* Images
* Captions
* Speaker notes where supported

The exported presentation should remain editable in Microsoft PowerPoint.

Do not export each slide as a flat screenshot unless an unsupported element requires it.

Create a clear mapping between application slide layouts and PowerPoint element positions.

Show export progress and meaningful error messages.

---

# JSON export and import

Allow the user to export the complete project as a JSON backup.

The JSON export should include:

* Project metadata
* Node hierarchy
* Slide content
* Node positions
* Presentation order
* Theme selection
* Application schema version

Provide an import flow with:

* File validation
* Schema validation
* Error reporting
* Duplicate project handling

---

# Sample project

Include a preloaded example project called:

“Product Launch Plan”

Structure:

* Product Launch Plan

  * Problem

    * Customer pain points
    * Current alternatives
  * Solution

    * Product overview
    * Key features
    * Demo
  * Market

    * Target users
    * Market size
    * Competitors
  * Business model

    * Pricing
    * Revenue projection
  * Roadmap

    * Current status
    * Next milestones
  * Closing

    * Key takeaway
    * Call to action

Use a mixture of slide layouts so users immediately understand the product.

Use placeholder images or locally generated gradients instead of remote image dependencies.

---

# Empty states and onboarding

When a user opens a new project, show:

* A clear root-node placeholder
* “Start with your main idea”
* Keyboard hints for Enter and Tab
* A button to open the example project

Add a short onboarding walkthrough covering:

1. Create a node
2. Add a child
3. Add slide content
4. Reorder slides
5. Start presenting

The walkthrough must be dismissible and should not repeatedly appear after dismissal.

---

# Visual design requirements

The interface should feel like a serious modern productivity application.

Use:

* Clean typography
* Generous but efficient spacing
* Subtle shadows
* Soft borders
* Clear selected states
* High-quality empty states
* Smooth transitions
* Accessible contrast
* Consistent iconography

Avoid:

* Excessive gradients
* Glassmorphism everywhere
* Oversized rounded cards
* Unnecessary animations
* Decorative elements that reduce workspace
* A generic AI-dashboard appearance

Node previews must remain readable at normal canvas zoom.

Selected nodes should have a clear outline and resize handles.

---

# Accessibility

Implement:

* Keyboard navigation
* Visible focus states
* Semantic HTML
* ARIA labels for icon buttons
* Accessible modal dialogs
* Sufficient color contrast
* Screen-reader labels
* Reduced-motion support
* Alt text for images

Do not rely only on color to communicate state.

---

# Error handling

Fail clearly and safely.

Handle:

* Invalid project imports
* Unsupported image formats
* Images that exceed the size limit
* IndexedDB failures
* Corrupt saved projects
* PowerPoint export failures
* Missing parent nodes
* Invalid hierarchy operations
* Circular node relationships

Show clear user-facing messages.

Do not silently swallow errors or use broad empty catch blocks.

Log technical details in development mode.

---

# Code quality requirements

Write code for humans to maintain.

Follow these principles:

* Keep components small and focused.
* Use descriptive names.
* Prefer explicit logic over clever abstractions.
* Avoid unnecessary design patterns.
* Keep domain logic separate from UI components.
* Put hierarchy operations in dedicated utility functions.
* Put export logic in a separate module.
* Keep persistence code isolated.
* Use pure functions where practical.
* Add comments only when explaining why something is done.
* Validate all external data.
* Use strict TypeScript.
* Avoid hidden side effects.
* Avoid large monolithic components.
* Do not use placeholder functions for core functionality.

The final code should be boring, obvious, and maintainable.

---

# Suggested project structure

```text
src/
  app/
    page.tsx
    project/
      [projectId]/
        page.tsx

  components/
    app-shell/
    canvas/
    nodes/
    slide-editor/
    presentation/
    outline/
    properties/
    toolbar/
    dialogs/
    common/

  features/
    projects/
    mind-map/
    slides/
    presentation/
    export/
    persistence/
    history/
    themes/

  store/
    project-store.ts
    selectors.ts

  domain/
    project.ts
    node.ts
    slide.ts
    theme.ts

  lib/
    hierarchy/
    layout/
    export/
    persistence/
    validation/
    images/
    keyboard/

  hooks/
  styles/
  tests/
```

---

# Testing

Add automated tests for critical domain logic.

At minimum, test:

* Creating a child node
* Creating a sibling node
* Deleting a node and its descendants
* Reparenting a node
* Preventing circular hierarchy
* Collapsing a branch
* Generating default presentation order
* Reordering slides independently of hierarchy
* Undo and redo
* Project import validation
* Project serialization
* Layout mapping for PowerPoint export

Use unit tests for domain logic and a small number of integration tests for major user flows.

---

# Implementation phases

Build the application in this order.

## Phase 1: Foundation

* Initialize the project
* Add the application shell
* Define TypeScript domain models
* Add Zustand state
* Create sample project data
* Add local persistence

## Phase 2: Mind-map canvas

* Render nodes using React Flow
* Create custom slide-preview nodes
* Add hierarchy operations
* Add keyboard shortcuts
* Add selection and dragging
* Add collapse and expand
* Add auto-layout

## Phase 3: Slide editor

* Add structured layouts
* Add rich-text editing
* Add image support
* Add speaker notes
* Add theme support
* Synchronize slide changes with node previews

## Phase 4: Presentation

* Add presentation order
* Add slide outline
* Add linear presentation mode
* Add map presentation mode
* Add full-screen support

## Phase 5: Export and polish

* Add PowerPoint export
* Add JSON import and export
* Add onboarding
* Add keyboard shortcut modal
* Add accessibility improvements
* Add tests
* Fix responsive layout issues

Complete each phase before introducing advanced features.

---

# MVP acceptance criteria

The MVP is complete when a user can:

1. Open the application.
2. Create a new project.
3. Create a root node.
4. Rapidly add child and sibling nodes using Tab and Enter.
5. Edit text inside each node.
6. Add an image to a node.
7. Open a node in a larger slide editor.
8. Select a structured slide layout.
9. Rearrange the mind map.
10. Collapse and expand branches.
11. Define a custom presentation order.
12. Present the nodes as full-screen slides.
13. Save and reopen the project locally.
14. Export the presentation as an editable `.pptx`.
15. Export and import a project backup as JSON.

---

# Out-of-scope features for the first version

Do not implement these during the initial MVP unless all core requirements are complete:

* AI-generated content
* AI-generated images
* Real-time multiplayer editing
* Comments
* Cloud synchronization
* User accounts
* Payments
* Public template marketplace
* Advanced charts
* Video embedding
* Audio recording
* Complex slide animations
* Fully free-positioned PowerPoint-style elements
* Mobile slide editing

Keep the architecture extensible, but do not over-engineer for these features.

---

# Final delivery requirements

Deliver:

1. A complete working application.
2. Clean TypeScript source code.
3. A README containing:

   * Setup instructions
   * Development commands
   * Architecture overview
   * Keyboard shortcuts
   * Data model explanation
   * Export limitations
4. A sample project.
5. Automated tests for critical logic.
6. No broken buttons or fake functionality.
7. No unresolved TypeScript errors.
8. No major console errors.
9. No dependency on external APIs.
10. A polished, usable interface.

Before considering the work complete:

* Run the application.
* Test the main user flow manually.
* Run linting.
* Run type checking.
* Run automated tests.
* Fix all blocking errors.
* Confirm that saved projects reload correctly.
* Confirm that exported PowerPoint files open successfully.
