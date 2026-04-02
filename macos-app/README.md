# Notary OS Study Hub (macOS)

Native macOS study + launch shell for Ohio Notary OS.

## What it includes
- Start Here dashboard
- Local course packet library
- PDF reading with resume progress
- Notes + bookmarks
- Licensing / launch checklist
- Embedded Operations web view for the deployed Notary OS dashboard

## Seeded private course asset
This app packages the current paid course packet from:

`/Users/kerriannlark/Desktop/Study Guide with PowerPoint Handouts-2.pdf`

At build time, the PDF is copied into the app bundle and then imported into Application Support on first launch.

## Build
From repo root:

```bash
./macos-app/build_macos_app.sh
```

## Output
- App bundle: `build/Notary OS Study Hub.app`
- Zip: `build/Notary OS Study Hub.zip`
- Drag-and-drop folder: `build/Applications Ready/`

## Notes
- Uses Times New Roman for the calmer legal-study style requested.
- Uses local SwiftData persistence for study progress and launch checklist state.
- Uses the deployed web app as the business operations backend.
