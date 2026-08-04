# SimuVerse

> **One platform. Every kind of simulation.**

SimuVerse is an interactive browser-based simulation platform built
around a simple idea: instead of visiting a different product for every
type of simulator, bring them together inside one consistent digital
world.

The current experience includes six playable simulation categories
spanning aviation, driving, marine navigation, spaceflight, rail
transport, and emergency response. Each simulator shares SimuVerse's
visual language and HUD while providing its own environment, controls,
movement, scoring, and atmosphere.

------------------------------------------------------------------------

## About the Project

SimuVerse explores what a universal simulation platform can feel like on
the web. The site combines a cinematic interface with lightweight,
real-time Canvas simulations that launch directly from the simulator
library.

Rather than treating the homepage as a static catalog, SimuVerse lets
visitors immediately enter an experience. The project is designed so new
simulator categories can be added over time without changing the core
identity of the platform.

### The Vision

The long-term concept is larger than six mini-simulators: a connected
simulation ecosystem where vehicles, locations, missions, progression,
and eventually users can exist across many different simulation
experiences.

Aviation, road transport, shipping, orbital operations, rail networks,
emergency services, and future categories can all become different ways
of interacting with the same simulated universe.

------------------------------------------------------------------------

## The Simulators

  -----------------------------------------------------------------------
  Simulator               System                  Experience
  ----------------------- ----------------------- -----------------------
  **Aviation**            Sky Systems             Aircraft movement,
                                                  navigation, and an
                                                  endless procedural
                                                  horizon

  **Velocity**            Ground Systems          High-speed driving
                                                  through a reactive neon
                                                  roadway

  **Mariner**             Ocean Systems           Marine navigation
                                                  through waves, buoys,
                                                  and open-water routes

  **Orbital**             Space Systems           Spacecraft flight
                                                  through a starfield
                                                  with orbital scenery
                                                  and docking targets

  **Railworks**           Transit Systems         Train operation along
                                                  converging rails with
                                                  signals and passing
                                                  scenery

  **Response**            Emergency Systems       Emergency driving
                                                  through a city toward
                                                  time-critical incidents
  -----------------------------------------------------------------------

All six simulator cards are playable in the current version.

------------------------------------------------------------------------

## Controls

Most modes use:

  Key         Action
  ----------- ----------------------
  `W` / `↑`   Accelerate or thrust
  `S` / `↓`   Decelerate or brake
  `A` / `←`   Move or steer left
  `D` / `→`   Move or steer right
  `P`         Pause / resume
  `Esc`       Exit the simulator

Some modes have specialized controls. **Response** uses `E` to toggle
emergency lights/siren mode, while **Railworks** focuses on throttle and
braking rather than lateral steering.

------------------------------------------------------------------------

## How the Simulations Work

The simulations run directly in the browser using the HTML Canvas API. A
React component manages the active simulator, keyboard input, animation
loop, movement state, scoring, speed, HUD data, and simulator-specific
rendering.

The simulation engine uses `requestAnimationFrame` for continuous
rendering and frame delta time for movement. Each simulator uses the
same underlying runtime but branches into its own environment and
gameplay behavior. This keeps the project lightweight while making the
architecture extensible.

------------------------------------------------------------------------

## The Connected World Concept

A major part of SimuVerse's identity is the idea that these are not
permanently isolated experiences.

The site's world visualization represents a future in which airports,
cities, ports, rail systems, emergency services, and eventually orbital
infrastructure can belong to a shared persistent world. A flight could
end at an airport that exists in the driving simulator. Cargo arriving
by ship could continue by rail. Emergency events could occur within the
same cities explored in other modes.

The current project is an interactive foundation for that larger concept
rather than a full persistent-world implementation.

------------------------------------------------------------------------

## Technology

SimuVerse is built as a modern front-end application using:

-   **React** for the interface and component architecture
-   **TypeScript** for typed application and simulator logic
-   **Vite** for development and production bundling
-   **HTML Canvas** for real-time 2D simulator rendering
-   **CSS** for the visual system, responsive layout, HUD elements,
    simulator artwork, and animations

The simulator renderer is intentionally dependency-light. The current
playable experiences do not require a heavyweight game engine.

------------------------------------------------------------------------

## Project Structure

``` text
src/
├── components/
│   └── SimulatorCanvas.tsx   # Runtime, controls, HUD state, and rendering
├── data/
│   └── simulators.ts         # Simulator definitions and metadata
├── App.tsx                   # Main site structure and simulator launching
├── styles.css                # Site visuals, responsive design, and simulator UI
└── main.tsx                  # React application entry point
```

### `simulators.ts`

This file is the simulator catalog. Each entry defines the simulator's
ID, title, system category, description, status, accent, and display
statistic.

``` ts
{
  id: "space",
  title: "Orbital",
  eyebrow: "SPACE SYSTEMS",
  description: "Dock, explore and build beyond the atmosphere.",
  status: "PLAYABLE",
  accent: "violet",
  stat: "0.8 AU"
}
```

The simulator `id` connects each catalog entry to its behavior inside
the renderer.

### `SimulatorCanvas.tsx`

This is the heart of the playable experience. It handles:

-   keyboard state and controls
-   acceleration and velocity
-   steering
-   animation timing
-   scoring
-   speed conversion and HUD units
-   pausing and exiting
-   simulator-specific environments
-   vehicles and targets
-   Response's emergency mode

Because the six experiences share one runtime, improvements to common
systems can benefit every simulator.

------------------------------------------------------------------------

## Design Language

SimuVerse uses a dark, technical visual system inspired by simulation
interfaces, navigation instruments, telemetry displays, and futuristic
control systems.

The interface emphasizes dark environments, lime/cyan system indicators,
geometric simulator artwork, thin technical linework, radar/orbit
motifs, compact telemetry typography, HUD-style information hierarchy,
restrained glow effects, and responsive layouts.

Each simulator has its own accent and environmental identity while
remaining recognizably part of SimuVerse.

------------------------------------------------------------------------

## Current Scope

SimuVerse is currently a polished interactive prototype/MVP for the
broader platform concept.

The simulations demonstrate distinct environments and mechanics, but
they are intentionally lightweight browser experiences rather than
physics-certified or full game-engine simulations. Systems such as real
aerodynamics, tire physics, hydrodynamics, orbital mechanics, railway
signaling, AI traffic, multiplayer networking, and persistent
progression would require substantially deeper simulation layers.

The current project demonstrates the **platform, interaction model,
visual identity, and extensible simulator architecture**.

------------------------------------------------------------------------

## Where SimuVerse Can Go Next

Natural future expansions include richer physics, 3D rendering, missions
and objectives, persistent player profiles, achievements, unlockable
vehicles, shared locations, weather and time systems, AI traffic,
multiplayer sessions, leaderboards, and cross-simulator progression.

A future 3D version could move selected experiences from Canvas
rendering to technologies such as Three.js/WebGPU and a dedicated
physics layer while retaining React as the surrounding platform
interface.

The most important evolution would be the **shared world layer**:
turning the individual simulators from separate experiences into
interconnected systems whose locations, missions, cargo, events, and
progression affect one another.

------------------------------------------------------------------------

## Adding Another Simulator

At a high level, a new simulator requires:

1.  A new simulator ID in the `Simulator` type.
2.  A corresponding entry in the `simulators` array.
3.  Simulator-specific rendering and mechanics in `SimulatorCanvas.tsx`.
4.  Any new card artwork or visual rules needed in `styles.css`.
5.  Simulator-specific controls, units, objectives, or HUD information
    where appropriate.

Possible future categories include construction equipment, agriculture,
public transit, logistics, racing, robotics, submarines, industrial
machinery, weather systems, city management, and more.

The guiding principle is that a new mode should feel distinct enough to
be worth exploring while still feeling like part of the same platform.

------------------------------------------------------------------------

## Project Philosophy

SimuVerse is built around three ideas:

**Accessible simulation.** A visitor should be able to enter an
experience immediately from a web browser without installing a dedicated
simulator.

**A consistent platform.** Different simulation categories should share
a recognizable interface and underlying system instead of feeling like
unrelated demos.

**A world that can grow.** The six current experiences are a starting
point. The architecture and visual concept are intended to support an
expanding library---and eventually connections between those
experiences.

------------------------------------------------------------------------

## Status

**Current stage:** Interactive web platform / simulation MVP\
**Playable simulators:** 6\
**Primary interface:** Desktop and mobile web\
**Simulation rendering:** Real-time HTML Canvas\
**Core stack:** React + TypeScript + Vite

------------------------------------------------------------------------

## Contributing

Contributions that improve simulation depth, performance, accessibility,
responsive behavior, visual polish, or extensibility are welcome.

When adding a feature, preserve the project's central design principle:
**every simulator should feel unique, but every simulator should still
feel like SimuVerse.**

For larger additions, keep simulator-specific logic clearly separated
from shared runtime behavior so the platform remains maintainable as the
library grows.

------------------------------------------------------------------------

## Disclaimer

SimuVerse is an entertainment and technology project. Its simulations
are simplified and are **not substitutes for professional training,
certified simulation equipment, navigation systems, emergency-response
training, or real-world operational instruction**.

------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<strong>`{=html}SIMUVERSE`</strong>`{=html}`<br>`{=html} One platform.
Every kind of simulation.
```{=html}
</p>
```
