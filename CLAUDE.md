# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (binds to 0.0.0.0)
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build
```

No test suite is configured.

## Environment Variables

Copy `.env` and adjust as needed. All vars are prefixed `VITE_`:

| Variable | Purpose |
|---|---|
| `VITE_BASE_URL` | REST API base URL (e.g. `http://localhost:3000/api`) |
| `VITE_IMAGE_URL` | S3 base URL for user/profile images |
| `VITE_MQTT_URL` / `VITE_GSM_MQTT_URL` | MQTT WebSocket URLs for robot telemetry |
| `VITE_CHIRPSTACK_TOKEN` | ChirpStack API JWT |
| `VITE_GOOGLE_MAP_KEY` | Google Maps JS API key |
| `VITE_REACT_APP_OPENWEATHER_API_KEY` | OpenWeather API key |
| `VITE_ROBOT_DEVICE_PROFILE_ID` / `VITE_ROBOT_APPLICATION_ID` | ChirpStack device config IDs |

## Architecture

This is a React 19 + Vite dashboard for managing solar panel cleaning robots. The domain entities are: **sites** (solar plants) → **blocks** (panel sections) → **rows** → **robots** (LoRaWAN/GSM devices) + **gateways** (LoRaWAN). It integrates ChirpStack (LoRaWAN server) via MQTT and REST for live telemetry, FUOTA (firmware OTA), and alarms.

### Directory layout

```
src/
  config/         # API layer
  routes/         # React Router definitions + auth guard
  component/      # Reusable presentational components and auth pages
  container/      # Feature pages (one directory per domain area)
  utils/          # Validation schemas, auth helpers, toaster, constants
  assets/         # Images, SVGs, fonts — exported via barrel files
```

### API layer (`src/config/`)

- **`DataService.jsx`** — Axios instance configured with `VITE_BASE_URL`. Handles JWT injection from `sessionStorage` and transparent token refresh on 401 (refresh token is sent as an HttpOnly cookie via `withCredentials: true`). On refresh failure, clears storage and redirects to `/`.
- **`Api.jsx`** — Flat object of all API endpoint path strings. Always add new endpoints here.
- **`ApiHandler.js`** — Four thin wrappers (`apiGetHandler`, `apiPostHandler`, `apiPutHandler`, `apiDeleteHandler`) that call `DataService` and normalize the response shape to `{ data, status, message }`.

### Barrel import pattern

Two barrel files centralise imports so feature pages don't have long import lists:

- **`src/container/Index.jsx`** — re-exports all commonly used MUI components.
- **`src/container/PagesIndex.jsx`** — re-exports API handlers, `Api` constants, Formik, Yup schemas, toaster helpers, common components (Sidebar, Header, modals, etc.), and asset barrels.

Feature containers import from these: `import Index from "../../Index"` / `import PagesIndex from "../../PagesIndex"`. When adding a new shared utility or component, add it to the relevant barrel.

### Routing & auth (`src/routes/`)

- **`Routes.jsx`** — single `<BrowserRouter>` with all routes. Public routes: `/`, `/forgot-password`, `/otp-verify`, `/reset-password/:token`. All `/admin/*` routes are nested inside a `<PrivateRoutes>` wrapper.
- **`PrivateRoutes.jsx`** — reads token from `sessionStorage` via `getStoredToken()`. If absent, redirects to `/`.
- Token is stored as `sessionStorage.setItem("token", JSON.stringify(accessToken))`.

### Layout

`AdminLayOut` (`src/container/admin/pages/adminLayout/AdminLayOut.jsx`) wraps every authenticated page. It fetches the current user's profile once on mount and provides it via `ProfileContext`. Sidebar and Header are rendered here; child routes render via `<Outlet>`.

### Forms

All forms use **Formik** + **Yup**. All Yup schemas live in `src/utils/validation/FormikValidation.js`. Add new schemas there and export them through `PagesIndex`.

### Real-time data

Robot telemetry is streamed over MQTT (`mqtt` npm package). The MQTT connection is set up in feature components (see `src/container/admin/pages/mqtt/Mqtt.jsx` and the monitoring components). ChirpStack is also accessed directly via its REST API using `VITE_CHIRPSTACK_TOKEN`.

### Notifications

Use `toasterSuccess(message)` / `toasterError(message)` from `src/utils/toaster/toaster.jsx` (re-exported via `PagesIndex`). The `<Toaster>` is mounted once in `App.jsx`.

### Styling

Global CSS is at `src/assets/style/global.css` and `global.responsive.css`. The MUI theme (Poppins font family) is set in `App.jsx`. Avoid inline styles for layout — prefer CSS classes defined in the global stylesheet.
