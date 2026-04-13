# Native Mac Release QA

## Goal
Confirm the packaged macOS Study Hub opens in its own native WebKit window and supports the private course + commission-launch workflow.

## Run
```bash
./macos-app/qa_native_release.sh
```

## Manual spot checks
- Launch the app with Chrome closed.
- Confirm the app opens as its own Mac window.
- Open the course packet PDF.
- Play one audio file.
- Open one DOCX/XLSX preview from Course Library.
- Confirm the dashboard next action is **File the Ohio commission application**.
- Confirm filing prep shows:
  - signature sample
  - BCI report
  - provider proof
- Confirm roadmap shows:
  - RON = Ohio authorization
  - Notary Signing Agent = Industry credential
  - Apostille = Non-notarial service
  - I-9 = Non-notarial service / no seal
- Confirm local edits persist after relaunch.

## Release outputs
- `build/Notary OS Study Hub.app`
- `build/Notary OS Study Hub.zip`
- `build/Applications Ready/`
