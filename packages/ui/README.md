# @flanksource/icons-ui

Curated UI icon set for Flanksource projects. Each icon is shipped as a tiny
React component with a stable name across the Flanksource UI surfaces
(`flanksource-ui`, `clicky-ui`, `facet`, `gavel`, scraper UI, `arch-unit`,
`oipa-cli`).

```tsx
import { UiUpload, UiCheck, UiCheckFilled, UiSearch } from "@flanksource/icons-ui";

<UiUpload />                    // outline variant (1em, currentColor)
<UiCheck size={20} />           // override size
<UiCheck title="done" />        // accessible label (role="img")
<UiCheckFilled className="…" /> // explicit filled variant
<UiSearch className="text-blue-500" />
```

## Variants

Most icons ship two variants:

- **`Ui<Name>`** — outline (Phosphor Light by default). Uses `currentColor`
  for stroke/fill, so `text-{color}` Tailwind classes propagate.
- **`Ui<Name>Filled`** — filled variant (Phosphor Fill, JetBrains expui, or
  another solid alternate selected during review). Multi-color JetBrains
  glyphs keep their brand colors.

When a row only had one variant picked, only that component exists.

## Attribution

Icons are derived from MIT/Apache 2.0-licensed sources:

- **Phosphor Icons** (MIT) — https://github.com/phosphor-icons/core
- **JetBrains IntelliJ Platform** (Apache 2.0) — https://github.com/JetBrains/intellij-community/tree/master/platform/icons
- Selected alternates from **Tabler Icons** (MIT), **Material Design Icons**
  (Apache 2.0), **Lucide** (ISC), **Codicons** (MIT), **Carbon Design**
  (Apache 2.0).
- A few flanksource-icons incumbents (Apache 2.0).

See `NOTICE.md` for the full per-icon attribution table generated at build
time.
