# Graph Report - .  (2026-07-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 961 nodes · 1760 edges · 98 communities (79 shown, 19 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 183 edges (avg confidence: 0.57)
- Token cost: 74,125 input · 8,003 output

## Graph Freshness
- Built from commit: `f8f3da01`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WASM Filesystem Bindings
- Compiled Background Script
- Compiled Offscreen Script
- Minified Map/Promise Helpers
- Emscripten WASM Runtime Init
- Minified Runtime Helpers
- TypeScript App Config
- Minified Runtime Helpers
- TypeScript Node Config
- Minified Runtime Helpers
- Path & Object Utilities
- WASI Syscall Bindings
- Emscripten Module Loading
- Catalog UI Components
- Dev Dependencies
- Runtime Dependencies
- App Layout Components
- Search Bar & Cart Context
- JS Engine Internals
- App Context Providers
- Home & Contact Views
- WASM Exception Handling
- Minified Runtime Helpers
- Product Data & Categories
- Minified Config Helpers
- Package Manifest
- Missing Images Checker
- Iterator Protocol Internals
- Vehicle Garage Selector
- Extension Manifest (Arch Variant)
- Audio Streaming Worklet
- Extension Manifest
- WASM Runtime Lifecycle
- Image Optimization Script
- Component Manifest 2026.1.22
- Component Manifest 2026.2.12
- Ruleset Manifest 614
- Ruleset Manifest 627
- Ruleset Manifest 9.64.0
- Ruleset Manifest 9.65.0
- Filesystem Persist Sync
- Fuse Search Test 4
- Vercel Deploy Config
- Missing Photos Finder
- Component Manifest 8.5866.7803
- Component Manifest 8.6294.2057
- Component Manifest v4
- Component Manifest 2025.6.13
- Component Manifest 10302
- Component Manifest 10343
- Component Manifest 2024.11.26
- Component Manifest 145.0.7584
- Component Manifest 2025.7.24
- Component Manifest 120.0.6050
- Component Manifest 20251024
- Component Manifest 2024.10.17
- Component Manifest 1557
- Component Manifest 1577
- Component Manifest 3091
- Component Manifest v7
- Component Manifest 2025.9.29
- Terminal IOCTL Syscalls
- Component Manifest 20260206
- Component Manifest v3
- Fuse Search Test 1
- Fuse Search Test 2
- Fuse Search Test 3
- Highlighted Text Component
- TypeScript Project References
- ESLint Globals Config
- ESLint Core Package
- React Hooks Lint Plugin
- PostCSS Package
- TypeScript Package
- TypeScript ESLint Plugin
- Vite React Plugin
- Filesystem Sync Syscalls
- WASM Return Value Conversion
- WASM Exit Status
- Embind Wire Types
- Filesystem Path Lookup
- Emscripten Missing Symbols
- Embind Type Registration
- Filesystem Stat Syscalls

## God Nodes (most connected - your core abstractions)
1. `b()` - 48 edges
2. `e()` - 45 edges
3. `B()` - 30 edges
4. `d()` - 29 edges
5. `assignWasmImports()` - 26 edges
6. `assert()` - 25 edges
7. `c()` - 22 edges
8. `f()` - 21 edges
9. `compilerOptions` - 19 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `App()` --indirect_call--> `e()`  [INFERRED]
  src/App.tsx → perfil_robot_v2/WasmTtsEngine/20260206.1/offscreen_compiled.js
- `useProducts()` --indirect_call--> `e()`  [INFERRED]
  src/hooks/useProducts.ts → perfil_robot_v2/WasmTtsEngine/20260206.1/offscreen_compiled.js
- `d()` --indirect_call--> `n()`  [INFERRED]
  perfil_robot_v2/WasmTtsEngine/20260206.1/offscreen_compiled.js → perfil_robot_v2/WasmTtsEngine/20260206.1/background_compiled.js
- `f()` --indirect_call--> `n()`  [INFERRED]
  perfil_robot_v2/WasmTtsEngine/20260206.1/offscreen_compiled.js → perfil_robot_v2/WasmTtsEngine/20260206.1/background_compiled.js
- `Qe()` --indirect_call--> `n()`  [INFERRED]
  perfil_robot_v2/WasmTtsEngine/20260206.1/offscreen_compiled.js → perfil_robot_v2/WasmTtsEngine/20260206.1/background_compiled.js

## Import Cycles
- None detected.

## Communities (98 total, 19 thin omitted)

### Community 0 - "WASM Filesystem Bindings"
Cohesion: 0.02
Nodes (12): RFC-2279, RFC-3629, NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),, NOTE: This is also used as the process return code code in shell environments, TODO: check for O_SEARCH? (== search for dir only), NOTE: None of the defaults here are true. We're just returning safe and, TODO: Use mozResponseArrayBuffer, responseStream, etc. if available., TODO: in theory we should write to the winsize struct that gets (+4 more)

### Community 1 - "Compiled Background Script"
Cohesion: 0.08
Nodes (28): aa(), B(), ba(), ca(), D(), ea(), F(), fa() (+20 more)

### Community 2 - "Compiled Offscreen Script"
Cohesion: 0.05
Nodes (46): Bd(), bh(), ce(), df(), ef(), fc(), ff(), $g() (+38 more)

### Community 3 - "Minified Map/Promise Helpers"
Cohesion: 0.12
Nodes (13): E(), ac(), b(), d(), e(), f(), l(), pa() (+5 more)

### Community 4 - "Emscripten WASM Runtime Init"
Cohesion: 0.09
Nodes (28): assert(), assignWasmExports(), createExportWrapper(), createNode(), createStandardStreams(), createStream(), createWasm(), establishStackSpace() (+20 more)

### Community 5 - "Minified Runtime Helpers"
Cohesion: 0.18
Nodes (21): Ah(), eh(), fh(), hh(), ih(), jh(), kh(), la() (+13 more)

### Community 6 - "TypeScript App Config"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, composite, isolatedModules (+16 more)

### Community 7 - "Minified Runtime Helpers"
Cohesion: 0.13
Nodes (23): ab(), ae(), Ba(), be(), cd(), de(), ee(), fd() (+15 more)

### Community 8 - "TypeScript Node Config"
Cohesion: 0.09
Nodes (22): ES2023, node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module (+14 more)

### Community 9 - "Minified Runtime Helpers"
Cohesion: 0.16
Nodes (21): $a(), bb(), bc(), bf(), cb(), cc(), cf(), db() (+13 more)

### Community 10 - "Path & Object Utilities"
Cohesion: 0.09
Nodes (18): r(), toAbsolute(), af(), c(), Ed(), Hd(), I(), Jd() (+10 more)

### Community 11 - "WASI Syscall Bindings"
Cohesion: 0.10
Nodes (20): assignWasmImports(), _clock_time_get(), EnsureDir(), _environ_get(), _environ_sizes_get(), _fd_close(), _fd_read(), _fd_seek() (+12 more)

### Community 12 - "Emscripten Module Loading"
Cohesion: 0.11
Nodes (19): abort(), absolutePath(), checkIncomingModuleAPI(), createFolder(), createLazyFile(), createLink(), forceLoadFile(), get() (+11 more)

### Community 13 - "Catalog UI Components"
Cohesion: 0.23
Nodes (11): CatalogView, Props, ImageZoom(), ImageZoomProps, LazyImage(), Props, ProductDetailModal(), getMotoImage() (+3 more)

### Community 14 - "Dev Dependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, eslint, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint, eslint-plugin-react-refresh, tailwindcss (+9 more)

### Community 15 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (17): framer-motion, fuse.js, lucide-react, dependencies, framer-motion, fuse.js, lucide-react, react (+9 more)

### Community 16 - "App Layout Components"
Cohesion: 0.19
Nodes (10): CatalogView, ContactView, BottomNav(), CartDrawer(), Footer(), Navbar(), ScrollToTopButton(), useCart() (+2 more)

### Community 17 - "Search Bar & Cart Context"
Cohesion: 0.17
Nodes (14): Props, SearchBar(), SearchBarProps, SpeechRecognitionAlternative, SpeechRecognitionEvent, SpeechRecognitionResult, SpeechRecognitionResultList, Window (+6 more)

### Community 19 - "App Context Providers"
Cohesion: 0.16
Nodes (11): ScrollToTop(), CartProvider(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), Toast, ToastContext (+3 more)

### Community 20 - "Home & Contact Views"
Cohesion: 0.21
Nodes (8): HeroSection(), HomeView(), HomeViewProps, WhatsAppButton(), WhatsAppButtonProps, APP_CONFIG, MODELOS, ORDEN_SECCIONES

### Community 22 - "Minified Runtime Helpers"
Cohesion: 0.29
Nodes (10): dc(), ec(), jf(), lf(), nc(), Ue(), Ve(), We() (+2 more)

### Community 23 - "Product Data & Categories"
Cohesion: 0.26
Nodes (9): App(), FeaturedCategories(), supabase, limpiarPrecio(), useProducts(), CATEGORIAS, CATEGORY_RULES, detectarSeccion() (+1 more)

### Community 24 - "Minified Config Helpers"
Cohesion: 0.22
Nodes (8): ad(), rc(), sc(), Tb(), Te(), uc(), Vb(), Wb()

### Community 25 - "Package Manifest"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 26 - "Missing Images Checker"
Cohesion: 0.25
Nodes (8): checkImages(), DATA_Cuenca, DATA_Guayaquil, __dirname, __filename, getProducts(), IMAGES_DIR, OUTPUT_FILE

### Community 27 - "Iterator Protocol Internals"
Cohesion: 0.61
Nodes (6): na(), oa(), ra(), sa(), ta(), ua()

### Community 28 - "Vehicle Garage Selector"
Cohesion: 0.28
Nodes (6): BIKE_DB, VehicleSelector(), GarageContext, GarageContextType, SelectedVehicle, useGarage()

### Community 29 - "Extension Manifest (Arch Variant)"
Cohesion: 0.25
Nodes (7): accept_arch, manifest_version, name, version, x64, x86_64, x86_64h

### Community 30 - "Audio Streaming Worklet"
Cohesion: 0.29
Nodes (3): TODO: add type annotations, TODO: find externs so we can use @override., StreamingWorkletProcessor

### Community 31 - "Extension Manifest"
Cohesion: 0.33
Nodes (5): description, manifest_version, name, update_url, version

### Community 32 - "WASM Runtime Lifecycle"
Cohesion: 0.47
Nodes (6): checkStackCookie(), consumedModuleProp(), initRuntime(), postRun(), preRun(), run()

### Community 33 - "Image Optimization Script"
Cohesion: 0.53
Nodes (4): format_size(), has_transparency(), main(), optimize_image()

### Community 34 - "Component Manifest 2026.1.22"
Cohesion: 0.40
Nodes (4): manifest_version, name, preload_data_format, version

### Community 35 - "Component Manifest 2026.2.12"
Cohesion: 0.40
Nodes (4): manifest_version, name, preload_data_format, version

### Community 36 - "Ruleset Manifest 614"
Cohesion: 0.40
Nodes (4): manifest_version, name, ruleset_format, version

### Community 37 - "Ruleset Manifest 627"
Cohesion: 0.40
Nodes (4): manifest_version, name, ruleset_format, version

### Community 38 - "Ruleset Manifest 9.64.0"
Cohesion: 0.40
Nodes (4): manifest_version, name, ruleset_format, version

### Community 39 - "Ruleset Manifest 9.65.0"
Cohesion: 0.40
Nodes (4): manifest_version, name, ruleset_format, version

### Community 40 - "Filesystem Persist Sync"
Cohesion: 0.40
Nodes (5): done(), mount(), onPersistComplete(), startPersist(), syncfs()

### Community 41 - "Fuse Search Test 4"
Cohesion: 0.40
Nodes (4): fuse, fuseConfig, productos, query

### Community 42 - "Vercel Deploy Config"
Cohesion: 0.40
Nodes (4): buildCommand, headers, outputDirectory, rewrites

### Community 43 - "Missing Photos Finder"
Cohesion: 0.67
Nodes (3): get_products(), main(), Carga los productos de un archivo JSON.

### Community 44 - "Component Manifest 8.5866.7803"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 45 - "Component Manifest 8.6294.2057"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 46 - "Component Manifest v4"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 47 - "Component Manifest 2025.6.13"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 48 - "Component Manifest 10302"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 49 - "Component Manifest 10343"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 50 - "Component Manifest 2024.11.26"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 51 - "Component Manifest 145.0.7584"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 52 - "Component Manifest 2025.7.24"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 53 - "Component Manifest 120.0.6050"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 54 - "Component Manifest 20251024"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 55 - "Component Manifest 2024.10.17"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 56 - "Component Manifest 1557"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 57 - "Component Manifest 1577"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 58 - "Component Manifest 3091"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 59 - "Component Manifest v7"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 60 - "Component Manifest 2025.9.29"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 61 - "Terminal IOCTL Syscalls"
Cohesion: 0.50
Nodes (4): ioctl_tcgets(), ioctl_tcsets(), ioctl_tiocgwinsz(), ___syscall_ioctl()

### Community 62 - "Component Manifest 20260206"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 63 - "Component Manifest v3"
Cohesion: 0.50
Nodes (3): manifest_version, name, version

### Community 64 - "Fuse Search Test 1"
Cohesion: 0.50
Nodes (3): fuse, fuseConfig, productos

### Community 65 - "Fuse Search Test 2"
Cohesion: 0.50
Nodes (3): fuse, fuseConfig, productos

### Community 66 - "Fuse Search Test 3"
Cohesion: 0.50
Nodes (3): fuse, fuseConfig, productos

## Knowledge Gaps
- **218 isolated node(s):** `__filename`, `__dirname`, `DATA_Cuenca`, `DATA_Guayaquil`, `IMAGES_DIR` (+213 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `e()` connect `Minified Map/Promise Helpers` to `Compiled Background Script`, `Compiled Offscreen Script`, `Emscripten WASM Runtime Init`, `Minified Runtime Helpers`, `Minified Runtime Helpers`, `Minified Runtime Helpers`, `Path & Object Utilities`, `Minified Runtime Helpers`, `Product Data & Categories`, `Minified Config Helpers`, `Iterator Protocol Internals`?**
  _High betweenness centrality (0.254) - this node is a cross-community bridge._
- **Why does `createWasm()` connect `Emscripten WASM Runtime Init` to `WASM Filesystem Bindings`, `Minified Map/Promise Helpers`, `Emscripten Module Loading`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Why does `App()` connect `Product Data & Categories` to `App Layout Components`, `App Context Providers`, `Minified Map/Promise Helpers`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `b()` (e.g. with `E()` and `G()`) actually correct?**
  _`b()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `e()` (e.g. with `.delete()` and `.get()`) actually correct?**
  _`e()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `d()` (e.g. with `B()` and `.B()`) actually correct?**
  _`d()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 24 inferred relationships involving `assignWasmImports()` (e.g. with `_clock_time_get()` and `EnsureDir()`) actually correct?**
  _`assignWasmImports()` has 24 INFERRED edges - model-reasoned connections that need verification._