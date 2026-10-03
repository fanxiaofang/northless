# Dark theme semantic token audit

Scope: `src/` color architecture only. No layout, typography, behavior, dependency, light theme, theme state, or celestial background changes.

## Inventory and migration

The initial scan found 548 `#hex` or `rgb(a)` occurrences: 368 in CSS and 180 in TS/TSX. After migration, 189 remain: 109 in root token definitions and 80 in CSS component details. TS/TSX has zero color literals and zero theme colored Tailwind arbitrary values. The scan includes gradients, masks, shadows, outlines, fills, and strokes; the numbers count color literals, not every gradient or shadow declaration.

| Inventory role | Semantic destination |
| --- | --- |
| A Canvas / background | `--surface-canvas`, `--surface-sidebar` |
| B Surface / panel | `--surface-panel`, `--surface-panel-subtle`, `--surface-panel-raised` |
| C Recessed / input | `--surface-recessed`, `--surface-recessed-hover`, `--surface-recessed-focus` |
| D Border / divider | `--border-subtle`, `--border-default`, `--border-strong`, interactive/accent/input aliases |
| E Text | Existing text rails and semantic aliases |
| F Accent | Existing Brass, Verdigris, Copper tokens |
| G Status | `--status-danger-*`, Verdigris success alias, existing effort palette |
| H Controls | Existing `--control-*` gradients and edges, now using foundation surfaces where practical |
| I Overlay / modal | `--surface-overlay`, `--surface-backdrop`, `--surface-floating` |
| J Shadow / highlight | `--shadow-control`, `--shadow-floating`, `--shadow-modal`; local optical highlights remain |
| K Roadmap | Existing roadmap component tokens, now derived from border, surface, and accent roles |
| L Scrollbar | Canvas track and semantic thumb surface tokens |
| M Decorative | Intrinsic rivet, LED, rail, mask, and optical material details |

## Retained architecture

The existing six text rails, six semantic text aliases, Brass/Verdigris/Copper roles, effort palette, focus tokens, and control sizes/gradients remain. The dark canvas, sidebar, panel, raised/overlay, and recessed layers retain distinct values because they serve distinct depths. Controls keep restrained gradient texture. Roadmap state remains completed = Verdigris, current = Brass, future = neutral.

Exact or near exact consolidation includes `#151413` to canvas, `#11100f` to sidebar, `#181715` and close panel drift to panel, `#161514` and close subtle drift to subtle panel, `#1c1a17` to raised/overlay, repeated form `rgba(11,10,9,.24)` to recessed, repeated Brass borders to border roles, and repeated floating/modal shadows to their shared roles. Close hues were merged only where they served the same layer; the optical gradients and roadmap details retain separate component treatment.

## Residual color classification

Run `rg -n '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' src` to inspect every residual. All remaining literals fall into these documented classes:

- **E, primitive token definitions:** the 109 matches in the `:root` token block of `src/index.css`. This includes existing text/accent/effort/control values and the new dark foundation definitions.
- **C, component specific decorative effect:** 78 matches below the root block in `src/index.css`. They are local roadmap socket/rail shadows and highlights; ledger stroke gradients; optic panel and Inbox inset lighting; control/button inset shadows, text shadows and faint material glints; the modal's inset glint; the rivet gradient and shadow. These are intentionally retained because collapsing their small alpha and directional differences would change the mechanical material. They do not choose ordinary text, surface, border, accent, or status colors.
- **B, intrinsic detail:** two `#000` stops in the ledger mask are geometry for a mask, not visible theme color.

No regular UI component in TSX contains a hardcoded theme color. The celestial experiment was untouched.

## Visual and quality checks

The unmodified HEAD and updated working tree were run side by side in the browser. Today, Tracks, History, Inbox, and Settings screenshots were visually compared at matching 1280×800 viewports; the updated app was also inspected at 1440×900 and 1920×1080. Main recommendation and secondary cards, track dossier/roadmap/Next, weekly matrix/daily archive, Inbox composer/items, and Settings tabs/form retained the original hierarchy. No obvious redesign or horizontal document overflow was observed. The log modal, context export, command palette, score explanation, info popover, track select, quick add, and deletion confirmation were opened and checked.

Computed text contrast on the dark panel is approximately 9.58:1 primary, 6.31:1 secondary, and 4.51:1 muted. Ghost text is approximately 2.71:1 and remains limited to decorative/technical marks rather than body copy. This pass did not brighten the existing typography rails.

`tsc --noEmit`, Vite production build, and `git diff --check` pass. Browser console: zero new warnings or errors. Vite emits its existing `vite.config.ts` `__dirname` future compatibility notice during build.

## Light theme readiness

Main UI surfaces, borders, text, accents, forms, floating layers, status, roadmap, and scrollbars can now be rethemed centrally. The remaining local optical glints and inset shadows are deliberate component material details; a future light theme may override the small number of related component tokens or adjust those effects after visual review. No light theme or theme switching code was added here.
