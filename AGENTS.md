# dmb-timers

- This is a dependency-free Node.js app. `server.js` serves the API and the pages and persists settings in `DATA_DIR/config.json`. The public and admin UIs live in `public/index.html` and `public/admin.html`.
- Read [the README](README.md) for setup and configuration. Use its Localization and Statuses sections when editing interface text or service statuses. Keep English, Russian, and Belarusian interface strings in sync in `public/i18n.js`.
- When adding an HTML page or browser script, check the `FILES` allowlist in `server.js`. The server generates a Content Security Policy nonce for inline scripts in HTML.

## Local checks

Run commands from the repository root with Node.js 18 or newer. There is no dependency installation or build step.

```sh
(for file in server.js public/*.js; do node --check "$file" || exit 1; done)
ADMIN_PASSWORD=local-preview-only DATA_DIR="$(mktemp -d)" TZ=Europe/Minsk PORT=3123 node server.js
```

In another terminal, run `curl -fsS http://localhost:3123/healthz` and `curl -fsS http://localhost:3123/api/config`. For HTML, CSS, or client behavior changes, open `/` or `/admin` on that port and check the affected flow in a browser. Use a fresh data directory for checks that change settings or counters.

For container and deployment changes, see [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml), and the [image publishing workflow](.github/workflows/publish-image.yml).
