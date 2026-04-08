# Notary OS Study Hub (macOS)

Regular no-Xcode macOS study + launch app for Ohio Notary OS.

## What it includes
- Start Here dashboard with a study-first `Today’s Study Session` widget
- Private local course packet library
- Resume packet page tracking
- Packet outline by exam topic
- Flashcards with keyboard support
- Practice quizzes with weak-topic tracking
- Final cram sheet with printable mode
- Licensing / launch checklist
- Ohio Notary Business Roadmap with per-phase status, notes, and next steps
- Revenue ladder tracking for employer, mobile, specialty, RON, signing-agent, apostille, and I-9 lanes
- Dark mode / light mode / system theme preference
- ADHD-friendly defaults: one primary next action, lighter planning density, low-motion mode, and progressive disclosure
- Sidebar collapse and shortcut overlay
- Link-out to the live Notary OS operations dashboard
- No Xcode required to build the regular app bundle

## Keyboard shortcuts
- `⌘1` Start Here
- `⌘2` Course Packet
- `⌘3` Study Modules
- `⌘4` Flashcards
- `⌘5` Practice Quiz
- `⌘6` Final Cram
- `⌘7` Licensing Checklist
- `⌘8` Roadmap
- `⌘9` Operations
- `⌘B` Toggle sidebar
- `⌘D` Toggle dark mode quickly
- `⌘P` Print cram sheet
- `⌘/` Shortcut help
- `Space` Flip flashcard
- `← / →` Previous / next flashcard

## Seeded private course asset
This app packages the current paid course packet from:

`/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf`

At build time:
- the PDF is copied into the app bundle
- a private structured study JSON asset is generated from the packet
- the Ohio Notary business roadmap JSON is bundled into the app
- the Ohio Notary revenue-ladder source markdown is bundled into the app
- the app launches a local study workspace with your packet, modules, flashcards, quiz bank, cram sheet, checklist, and roadmap

## Build the regular macOS app
From repo root:

```bash
./macos-app/build_macos_app.sh
```

## Output
- App bundle: `build/Notary OS Study Hub.app`
- Zip: `build/Notary OS Study Hub.zip`
- Drag-and-drop folder: `build/Applications Ready/`

## What the roadmap covers
- Foundation
- Local mobile launch
- Specialty niche expansion
- Digital scale / RON
- Premium services
- Recurring business accounts

## Revenue ladder lanes
- Employer / in-office notary
- Mobile general notary
- Same-day / after-hours
- Hospital / hospice / nursing-home
- Vehicle title / auto docs
- Remote online notarization (RON)
- Notary Signing Agent
- Apostille support
- I-9 authorized representative

The roadmap stays local to the Mac app and is not exposed in the public web app.

## Optional Xcode/native build
The earlier SwiftUI native build script is preserved here if you ever want it later:

```bash
./macos-app/build_swift_macos_app.sh
```

## Notes
- Uses Times New Roman for the calmer legal-study style requested.
- Uses the red legal-scale + notepad icon system.
- Uses browser local storage for study progress, roadmap status, service-lane tracking, theme preference, reduced-motion preference, and daily session state in the no-Xcode build.
- Uses the deployed web app as the business operations backend.
- Paid course content stays in the macOS app bundle only.
