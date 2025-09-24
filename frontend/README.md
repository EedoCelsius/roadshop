# Road Shop Pay Frontend

A Vue 3 + Vite single-page experience that guides visitors at Korean street shops to the right QR payment option. The
site now starts in English, automatically follows the browser language when possible, and lets guests switch between
English, Korean, and Japanese manually.

## Tech stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/) state management
- [Tailwind CSS](https://tailwindcss.com/) styling

## Getting started

Install dependencies:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open your browser at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Lint the project

```bash
npm run lint
```

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site on pushes to `main` and publishes the static
assets to the `gh-pages` branch for GitHub Pages hosting.
