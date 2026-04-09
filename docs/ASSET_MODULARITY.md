# Asset Modularity (Invariant)

## Rule
All visual and audio assets — meshes, textures, materials, sounds — must be **swappable** via
a manifest, props, or a board profile. Never hard-code an asset import inside a component file.

## Wrong
```jsx
// src/components/ESP32Board.jsx
import boardMesh from './esp32.glb'  // ❌ NO

export function ESP32Board() {
  return <primitive object={boardMesh} />
}
```

## Right
```jsx
// src/components/ESP32Board.jsx
export function ESP32Board({ profile }) {
  return <primitive object={profile.mesh} />
}

// src/boardProfiles/esp32-s3-sense.js
import mesh from '../assets/boards/esp32-s3-sense.glb'  // ✓ OK in a profile/manifest file
export const esp32S3Sense = { name: 'ESP32-S3-Sense', mesh, pins: { /* ... */ } }
```

## Why
Three reasons:
1. **Multi-board support (Memory M11).** Current simulator targets a generic ESP32-S3.
   Real hardware on hand is the **ESP32-S3-Sense**. More boards will follow. Hard-coded assets
   make multi-board support impossible without rewriting every component.
2. **Procedural placeholders → commissioned art.** Today the geometry is generated/placeholder.
   When real models are commissioned, swapping them in must be a manifest change, not a
   component rewrite.
3. **Constraint C9-asset enforces this.** The firewall blocks `.glb`/`.gltf`/`.png`/etc.
   imports in `src/components/**/*.jsx`. Put asset imports in `src/boardProfiles/`,
   `src/assets/`, or a manifest file instead.

## Allowed Locations for Asset Imports
- `src/assets/` — raw asset bundles
- `src/boardProfiles/` — board-specific configurations
- `src/manifests/` — registries that map names to assets
- Any file that is *not* a component

## How to Apply
- Components accept assets as props or read from a profile/registry
- Asset imports live in `src/assets/`, `src/boardProfiles/`, or a manifest file — never inside
  a component
- Generated/procedural geometry is fine for now; just keep it injectable so the real model can
  drop in later
