# GitHub Upload Guide — Ohio Notary OS

## Purpose
Use GitHub for:
- source control
- PR review
- documentation
- optional private release files

Do **not** use GitHub as the runtime for the macOS app. The Mac app runs locally.

## Default repo mode
This guide now assumes your GitHub repo is intended to stay **private**.

That means licensed course material can be stored in the repo **if you choose to do that** and if that fits your own license/risk decision.

## Safe to upload
Upload source:
- `app/`
- `api/`
- `components/`
- `lib/`
- `prisma/`
- `db/`
- `docs/`
- `prompts/`
- `macos-app/` source files
- build scripts
- icon generators and icon source assets
- roadmap JSON and authored markdown content
- `README.md`

Optional for a private repo:
- `macos-app/SeededCourse/OhioNotaryCoursePacket.pdf`
- other private licensed study assets you intentionally want stored in GitHub

## Do not upload
Do **not** commit or publish these by default:
- `build/`
- `.app` bundles
- `.zip` release outputs
- `node_modules/`
- `.next/`
- `.env*`
- logs and local caches
- any local Desktop/Downloads source file path
- public release assets that bundle the paid course packet unless you explicitly want private release distribution

## Private course content rule
You now have two supported storage modes:

### Mode A — local-only PDF
Keep the course PDF outside the repo at:

`/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf`

### Mode B — private-repo PDF
Store the course PDF inside the repo at:

`macos-app/SeededCourse/OhioNotaryCoursePacket.pdf`

Helper command:

```bash
./scripts/import_private_course_pdf.sh
```

The build script now prefers the repo-stored PDF if present and falls back to the Desktop path otherwise.

## GitHub Releases rule
Only upload Mac app release zips if you intentionally want to distribute the built app **and** you are comfortable with everything bundled inside it.

Default rule:
- keep GitHub Releases off for now
- keep GitHub as code + PR history only

Private-repo option:
- if the repo remains private, you may also keep private release assets there
- treat those assets as licensed/private materials

## Recommended workflow
1. Build locally
2. Run the GitHub safety check
3. Commit source files only
4. Push the branch
5. Review through PR #1 or the current active PR
6. Only create a release after checking that no private course material is exposed

## Safety check command
Run:

```bash
./scripts/check_github_upload.sh --private-repo
```

For a public-safe audit, run:

```bash
./scripts/check_github_upload.sh --public-safe
```

## Manual spot checks
Run these before push:

```bash
git status --short
git ls-files '*.pdf'
git ls-files 'build/*'
git ls-files '*.app'
git ls-files '*.zip'
```

Expected result in private-repo mode:
- tracked PDFs are allowed
- no tracked build artifacts
- no tracked app bundles
- no tracked zip files

## Current architecture note
GitHub does **not** replace the Mac app runtime.

Current model:
- GitHub = source control + optional private releases
- Mac app = local packaged runtime
- paid course content = local/private build input or private repo asset

If you want to remove the current browser-based launch behavior, that requires a runtime change, not a GitHub change.
