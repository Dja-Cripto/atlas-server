# Luxembourg pilot

33 seconds, 1920×1080, 30 fps. First supervised composition, not yet an autonomous assembly pipeline.

Run `node scripts/cut-pilot.mjs` from the project root, then `npx remotion render src/index.ts LuxembourgPilot out/luxembourg-pilot.mp4` from `renderer`.

## Assets and facts

- Existing Fish Audio narration, cut locally using word timestamps from faster-whisper. Cuts are recorded in `public/pilot/cuts.json`. Original narration is preserved.
- Luxembourg residential footage: Jack Kazanjyan, https://www.pexels.com/video/a-view-of-a-village-in-luxembourg-during-rainy-season-8211790/ — source identifies Luxembourg; visually checked. Pexels License: https://www.pexels.com/license/
- Train footage: Jack Kazanjyan, https://www.pexels.com/video/drone-footage-of-trains-traveling-in-opposite-directions-8374061/ — used to illustrate rail transport, not as evidence of the particular train's passengers or their residence.
- Approximate cross-border share, 47% at end of 2025: Luxembourg government, https://luxembourg.public.lu/en/work-and-study/employment-in-luxembourg/travailler-etudier-emploi-luxembourg-main-oeuvre.html (updated August 10, 2026).
- Geographic boundaries: Natural Earth, public domain, https://www.naturalearthdata.com/about/terms-of-use/ ; downloaded from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson . Rendered as projected geographic SVG; arrows are schematic directions, not measured routes or volumes.

## Scope

Reusable transparent text, video background, projected map and explanatory chart components. Selection and editorial arrangement supervised for this pilot. No claim that general automatic sourcing or quality review is complete. No new AI-generated imagery, no re-generated narration, no music.
