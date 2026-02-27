# OpenTelemetry Blueprints

An interactive tool for generating OpenTelemetry reference architectures from composable layers. Select your environment, scale, collection needs, and resilience requirements — the tool composes a blueprint diagram from proven patterns and compatible components.

OpenTelemetry Blueprints are starting points, not turnkey deployments. Each blueprint is intended to be adapted to an organisation's requirements around scale, security, networking, compliance, and operational processes.

## Features

- **Architecture Wizard** — toggle requirements (environment, data volume, collection capabilities, processing, resilience) and get a composed architecture in real time
- **Visual Pipeline Diagrams** — dynamic diagrams that reflect the composed architecture, including edge collectors, gateways, load balancers, buffering layers, and backend destinations
- **Volume-Aware Gateway Placement** — gateway replicas, node placement, and load balancer type adapt to Low / Medium / High data volume profiles
- **Resilience Layers** — persistent queues (WAL) and Kafka buffering are added based on data loss policy
- **Kubernetes & Host/VM Support** — architectures adapt to environment constraints such as serverless Kubernetes (no DaemonSets) and per-service isolation (sidecars)
- **Complexity Scoring** — operational complexity is calculated based on the components in the architecture (Kafka, tail sampling, gateway tier, etc.)
- **Explore & How It Works Pages** — browse individual OTel modules and understand the three-layer composition model (Edge, Processing, Resilience)

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for build and dev server
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons
- [Playwright](https://playwright.dev/) for end-to-end tests

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── data/
│   ├── composer.ts          # Core composition engine — builds architectures from requirements
│   ├── layers.ts            # Layer definitions (edge, processing, buffering modules)
│   ├── decisionLevers.ts    # Slider and toggle definitions for the wizard UI
│   └── components.ts        # OTel component metadata
├── components/
│   ├── Layout/              # Header, MainView (wizard), Sidebar
│   ├── Composer/             # VisualPipelineDiagram, ComposedArchitectureView, LayerCard
│   ├── Pages/                # HowItWorksPage, ExplorePage
│   ├── Architecture/         # ArchitectureDiagram
│   └── UI/                   # OTelLogo, ThemeToggle, CodeBlock
├── context/
│   └── AppContext.tsx        # Global state (requirements, current page)
├── App.tsx
└── main.tsx
```

## How Composition Works

The composition engine (`src/data/composer.ts`) takes a set of requirements and produces a `ComposedArchitecture`:

1. **Edge Layer** — determines which collectors sit closest to your applications (DaemonSet Agent, Sidecar Agent, Host Agent, or Direct SDK)
2. **Processing Layer** — adds gateways, tail sampling tiers, or load balancers when requirements demand centralised processing
3. **Resilience Layer** — enables persistent queues (WAL via `file_storage` extension) or Kafka buffering based on data loss policy

The volume profile controls gateway sizing:

| Volume | Replicas | Placement | Load Balancer |
|--------|----------|-----------|---------------|
| Low    | *(no gateway unless required)* | — | — |
| Medium | 3–5 | Dedicated node pool, same cluster | Standard |
| High   | 5–20+ | Dedicated pool or separate cluster | L7 |

## License

This project is provided as-is for educational and reference purposes.
