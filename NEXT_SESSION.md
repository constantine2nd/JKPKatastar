# Next Session Notes

## Pending Commit
All changes below are **uncommitted**. Ready to commit — Google Maps is working.

### Changed files (Google Maps migration)
- `client/src/screens/HomeScreen.js`
- `client/src/components/MapComponent.js`
- `client/src/components/MapStepperComponent.js`
- `client/src/screens/grave/SingleGraveScreen.tsx`
- `client/Dockerfile`
- `docker-compose.prod.yml`
- `.github/workflows/deploy.yml`
- `client/package.json` + `client/package-lock.json`

### Changed files (dev infrastructure)
- `development/dev.sh`
- `development/docker-compose.dev.yml`
- `.env`
- `client/.env` — **deleted** (consolidated into root `.env`)

---

## Google Maps Migration (DONE)

Migrated from `google-maps-react` (unmaintained, deprecated `Marker`) to `@vis.gl/react-google-maps`.

### What changed
- `GoogleApiWrapper` HOC removed — replaced with `<APIProvider>` wrapper inside each component
- `<Map>` and `<Marker>` replaced with new `<Map>` and `<AdvancedMarker>`
- Zoom tracking via `onCameraChanged` instead of `mapRef` + `addListener`
- `MapComponent` is not rendered anywhere (dead import removed from `SingleGraveScreen`)
- `HomeScreen` now plain component, no HOC export

### Env vars required
```
REACT_APP_GOOGLE_KEY=your_api_key
REACT_APP_GOOGLE_MAP_ID=your_map_id
```

Both are wired into:
- `.env` (root — single source of truth for all env vars, gitignored)
- `client/Dockerfile` (ARG + ENV, for prod build)
- `docker-compose.prod.yml` (build args)
- `.github/workflows/deploy.yml` (SSH env injection + .env sed replacement)

### GitHub secrets
- `REACT_APP_GOOGLE_KEY` — added
- `REACT_APP_GOOGLE_MAP_ID` — added

---

## Dev infrastructure (DONE)

Single source of truth for env vars: root `.env` only — `client/.env` deleted.

### dev.sh changes
- Sources root `.env` before starting Docker Compose (using script-relative path, works from any CWD)
- Runs `cleanup_previous()` before every `start` and `restart`: tears down old containers/networks and prunes dangling images

### docker-compose.dev.yml changes
- Frontend environment now includes `REACT_APP_GOOGLE_KEY` and `REACT_APP_GOOGLE_MAP_ID`

### .env fixes
- Removed spaces around `=` (bash `source` requires `KEY=value` format)
- `MONGO_URI` changed from `graves_test` → `graves_dev` (matches the dev Docker volume)
- Added `REACT_APP_GOOGLE_KEY` and `REACT_APP_GOOGLE_MAP_ID`

---

## HomeScreen map filter
Filter currently reverted to original (no "Bez tipa" option) by user.
Previous attempt: add `__NO_TYPE__` sentinel option + treat orphaned graveType refs as "no type".
Abandoned — all graves in current DB have a graveType assigned.

---

## Other pending items
- `HomeScreen` still has "Idi na tabelarni prikaz" button (hardcoded Serbian) — not translated
- `LandingScreen.tsx` has a dead function `createTheme` at the bottom (line 89) — can be removed
