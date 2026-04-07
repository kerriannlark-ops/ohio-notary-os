# Notary OS Study Hub (macOS)

Regular macOS study + launch app for Ohio Notary OS.

## What it includes
- Start Here dashboard
- Local course packet library
- Resume packet page tracking
- Packet outline by exam topic
- Flashcards
- Practice quizzes
- Final cram sheet
- Licensing / launch checklist
- Link-out to the live Notary OS operations dashboard
- No Xcode required to build the regular app bundle

## Seeded private course asset
This app packages the current paid course packet from:

`/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf`

At build time:
- the PDF is copied into the app bundle
- a private structured study JSON asset is generated from the packet
- the app launches a local study workspace with your packet, modules, flashcards, quiz bank, and cram sheet

## Build the regular macOS app
From repo root:

```bash
./macos-app/build_macos_app.sh
```

## Output
- App bundle: `build/Notary OS Study Hub.app`
- Zip: `build/Notary OS Study Hub.zip`
- Drag-and-drop folder: `build/Applications Ready/`

## Optional Xcode/native build
The earlier SwiftUI native build script is preserved here if you ever want it later:

```bash
./macos-app/build_swift_macos_app.sh
```

## Notes
- Uses Times New Roman for the calmer legal-study style requested.
- Uses a red / oxblood icon and low-stimulation palette.
- Uses browser local storage for study progress in the no-Xcode build.
- Uses the deployed web app as the business operations backend.
- Paid course content stays in the macOS app bundle only.
