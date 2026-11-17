# DanceDrop desktop companion (Windows)

The tray application that draws DanceDrop characters on top of other Windows
applications, only for a device that activated itself and turned consent on.

## What it does

- Registers the PC with the DanceDrop device API (`/api/device/register`) and
  stores the device secret encrypted with the Windows credential store (DPAPI via
  Electron `safeStorage`).
- Sends a heartbeat every 5 seconds, which is what makes the device appear online
  in the admin console.
- Draws a transparent, click-through, always-on-top overlay window on every
  display, sized to that display, so the character lands in the middle of the
  screen at any resolution or scaling.
- Acknowledges every command (`acknowledged`, `completed`, `rejected`) so the
  admin console shows the real status.
- Local control at all times: tray menu has stop, pause (revokes consent) and
  quit; the window has the same controls.

## What it never does

- No screen capture, no input control, no microphone, no file access.
- No silent activation: the first launch shows a consent screen and nothing is
  registered until the owner presses Activate.
- No auto-start with Windows.

## Build locally (only needs Node installed on the build machine, not on the
## machines of people who install the app)

```bash
cd desktop
npm install
npm run dist
```

The installer lands in `desktop/release/DanceDrop-Setup.exe`.

## Build in CI (no local toolchain)

`build-windows.yml` in this folder builds the installer on `windows-latest` and
attaches it to a GitHub Release. GitHub does not let the app sync write workflow
files, so copy it once into the repository:

```bash
mkdir -p .github/workflows
cp desktop/build-windows.yml .github/workflows/build-windows.yml
git add .github/workflows/build-windows.yml
git commit -m "Add Windows installer build"
git push
```

Then run it from the Actions tab ("Build Windows installer" → Run workflow), or
push a tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Publishing the installer on the website

Once the build finished, add a record to the `CompanionRelease` entity:

| field | value |
| --- | --- |
| version | `1.0.0` |
| platform | `windows` |
| file_name | `DanceDrop-Setup.exe` |
| file_url | the release asset URL, e.g. `https://github.com/OWNER/REPO/releases/latest/download/DanceDrop-Setup.exe` |
| size_bytes | size of the file |
| sha256 | hash printed by the workflow |
| released_at | today |

The website's Download button serves the newest published release. Until one
exists, it says the installer is not published instead of shipping a placeholder.

## Device API used

Base URL: `https://dance-drop-live.base44.app` (override with the `DANCEDROP_API`
environment variable when building against another deployment).

- `POST /api/device/register` → device id, device secret, activation code
- `POST /api/device/heartbeat` (headers `x-device-id`, `x-device-secret`) → pending commands
- `POST /api/device/ack` → command status
- `POST /api/device/consent` → grant or revoke consent
- `DELETE /api/device/consent` → disconnect the device permanently
