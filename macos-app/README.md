# Notary OS Study Hub (macOS)

Regular no-Xcode macOS study + launch app for Ohio Notary OS.

It now opens in a **self-contained native macOS window** using WebKit, without Chrome.

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
- No Chrome required at runtime

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
This app supports two private source modes for the paid course packet:

### Option 1 — local Desktop file
`/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf`

### Option 2 — repo-stored private file
`macos-app/SeededCourse/OhioNotaryCoursePacket.pdf`

Helper import command:

```bash
./scripts/import_private_course_pdf.sh
```

The build script prefers the repo-stored PDF if it exists and falls back to the Desktop path otherwise.

This app packages the current paid course packet from one of those private locations.

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

Build requirement:
- Apple Command Line Tools with `clang`

## GitHub / privacy workflow
- GitHub is the source-control home for this app.
- The Mac app still runs locally.
- Private licensed course files may be stored in the repo if you intentionally keep the repo private.
- Do not commit `build/`, `.app`, or `.zip` outputs.
- Run the upload check before push:

```bash
./scripts/check_github_upload.sh --private-repo
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
- Paid course content may stay local-only or be stored in the private repo, depending on your chosen workflow.
- Uses a native WebKit window launcher instead of a Chrome app window.
