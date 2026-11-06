# NOXI 1.2 — Your music. Your universe.

A React + TypeScript + Vite custom Spotify Premium client, with seven user-designed color themes, synchronized atmosphere palettes and a GSAP-powered fullscreen player.

## Set up on Windows

1. Extract this complete folder.
2. Copy your existing `.env` from the previous NOXI folder (it is **deliberately excluded** from this archive), or copy `.env.example` to `.env` and enter your Spotify Client ID.
3. In the Spotify Developer Dashboard, register this redirect URI exactly: `http://127.0.0.1:5173/callback`.
4. Open a terminal in this folder and run:

```powershell
npm install
npm run dev
```

5. Open `http://127.0.0.1:5173` in the same browser origin (not `localhost`).
6. Use **Settings → Renew permissions** if Spotify indicates missing OAuth permissions.

## NOXI 1.2 changes

- **Seven themes in Settings → Your color universe**, each with a miniature player preview and its exact three-color palette: Marshmallow Galaxy (original), Royal Ember, Abyssal Bloom, Punk Inferno, Cotton Candy Skies, Wildwood, and Sakura Noir.
- Selecting a theme updates the **whole app**: backgrounds, navigation, text contrast, cards, buttons, sliders, song rows, playlist headers, the Spotify queue drawer and fullscreen controls. Four themes are appropriately dark, and three are light.
- **Atmosphere matches the palette.** Aurora, Drift and Stardust retain their distinctive GSAP animations but repaint ribbons, clouds, stars, energy blooms and visualizer bars using the selected theme's colors. `Boost glow` still works.
- Theme changes apply without page reload and are saved with your other NOXI preferences (`noxi.preferences.v1`), preserving your Spotify session and all settings from NOXI 1.1. `Reset appearance` returns to Marshmallow Galaxy.
- Initial saved theme is applied before React renders to avoid flashing white when launching a dark theme. Browser theme-color also follows the selection.
- Respects Reduce Motion and the browser's motion preferences. No artwork pixels are recolored or filtered.

## NOXI 1.1 changes

- **Spotify playlist playback now preserves playlist order.** Clicking a track inside a playlist sends `context_uri` and `offset.position` to Spotify instead of `uris: [singleTrack]`. The Spotify SDK's Next/Previous buttons then continue through that playlist, following Spotify's shuffle and repeat settings. `Play playlist` continues to start the entire playlist normally.
- **Liked Songs are no longer a one-track session.** Selecting a saved track starts an ordered sequence of up to 100 tracks from the current visible (filtered/sorted) list. The Next button moves through the following liked songs; this is not the same as a native Spotify playlist context, and the sequence has a 100-track limit.
- **More visible fullscreen scenes.** Aurora has richer magenta/violet lighting, Drift has stronger cyan/peach clouds, and Stardust has higher-contrast twilight stars. NOXI 1.2 also lets you recolor all three with your chosen theme.
- **Rhythmic GSAP visuals:** 39 bright ambient bars, animated colored blooms and light flares. Their motion slows down when paused, and each scene retains its own GSAP motion timeline. These effects are intentionally **not audio-beat-synchronized**: Spotify doesn't expose raw audio in the Web Playback SDK and its platform policies restrict media synchronization.
- **Boost glow** appears beside the fullscreen scene buttons for instant Subtle/Vivid switching. Settings continues to save these preferences.
- Reduced Motion and browser `prefers-reduced-motion` disable decorative animations.
- Added `npm test` playback-payload tests to verify playlist context + offset requests.

## NOXI 1.0 changes

- NOXI 1.0 removed the original light/dark toggle; NOXI 1.2 replaces it with seven complete, coordinated palettes.
- Moved the music dock inside the app layout, so it **never overlays** the scrollable track list. Responsive mobile navigation still has its own reserved space.
- Fixed the fullscreen atmosphere selector. **Aurora** now shows moving violet/pink ribbons; **Drift** shows blue/peach cloud lighting; **Stardust** shows a lavender twilight sky and twinkling stars. Scene changes crossfade with GSAP and keep Spotify music playing. Reduced Motion disables animation.
- Made the fullscreen player calmer and more readable. Song changes animate the artwork with GSAP.
- Refined list surfaces, row proportions, typographic contrast, headings, toolbar, scrollbar, sidebar and bottom dock.
- Library loads paginated playlists and liked songs (up to 100 Spotify API pages of each) instead of stopping at 30; playlist track listings are paginated where Spotify permits them.
- Settings features theme selection, atmosphere, intensity, motion, compact-library and connection controls.

## Upgrade from LUMA

The full application is branded **NOXI** (logo, tab title, favicon, text, Spotify browser playback device, code class naming). Existing Spotify sessions and LUMA visual preferences migrate automatically in the same browser on `127.0.0.1:5173`. Keep your old `.env`; the Spotify Developer Dashboard app may still be named LUMA until you rename it there manually. The registered redirect URI does **not** change.

To see the atmosphere fix, play a song, open the fullscreen player and click Aurora / Drift / Stardust. You should immediately see a different composition (not simply a button highlight).

## Spotify notes

You need Spotify Premium to use the browser playback SDK. Developer Mode and Spotify account permissions can restrict available endpoints and playlist contents. Some playlists may play even if their individual tracks cannot be listed by API. NOXI doesn't analyze, record, synthesize or synchronize the decorative bars with Spotify's audio.

## Useful commands

```powershell
npm run typecheck
npm test
npm run build
```

## Project organization

- `src/components/atmosphere/`: visual layers and React component
- `src/hooks/useAtmosphereAnimation.ts`: GSAP animation timelines with cleanup
- `src/styles/atmosphere.css` and `src/styles/atmosphere-energy.css`: scene and pulse styling; GSAP provides movement
- `src/styles/now-playing.css`: fullscreen player presentation
- `src/styles/layout-polish.css`: library/dock/interface cohesion
- `src/styles/themes.css`: seven semantic UI palettes, theme picker, and scene-specific atmosphere recoloring
- `src/features/preferences/themes.ts`: canonical theme registry and swatch colors
- `src/features/preferences/PreferencesProvider.tsx`: locally persisted appearance settings
- `src/features/spotify/api.ts`: Spotify Web API and pagination

No credentials or `node_modules` are included in the download.
