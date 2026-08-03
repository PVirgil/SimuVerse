export type Simulator = {
  id: "drive" | "flight" | "marine" | "space" | "rail" | "rescue";
  title: string;
  eyebrow: string;
  description: string;
  status: "PLAYABLE" | "COMING SOON";
  accent: string;
  stat: string;
};

export const simulators: Simulator[] = [
  {
    id: "flight",
    title: "Aviation",
    eyebrow: "SKY SYSTEMS",
    description: "Master lift, pitch and navigation across an endless procedural horizon.",
    status: "PLAYABLE",
    accent: "cyan",
    stat: "12,400 FT",
  },
  {
    id: "drive",
    title: "Velocity",
    eyebrow: "GROUND SYSTEMS",
    description: "Thread a high-speed machine through a reactive neon highway.",
    status: "PLAYABLE",
    accent: "lime",
    stat: "240 KM/H",
  },
  {
    id: "marine",
    title: "Mariner",
    eyebrow: "OCEAN SYSTEMS",
    description: "Navigate shifting currents, buoys and deep-water routes.",
    status: "PLAYABLE",
    accent: "blue",
    stat: "32 KNOTS",
  },
  {
    id: "space",
    title: "Orbital",
    eyebrow: "SPACE SYSTEMS",
    description: "Dock, explore and build beyond the atmosphere.",
    status: "PLAYABLE",
    accent: "violet",
    stat: "0.8 AU",
  },
  {
    id: "rail",
    title: "Railworks",
    eyebrow: "TRANSIT SYSTEMS",
    description: "Operate freight and passenger networks at continental scale.",
    status: "PLAYABLE",
    accent: "orange",
    stat: "6,200 T",
  },
  {
    id: "rescue",
    title: "Response",
    eyebrow: "EMERGENCY SYSTEMS",
    description: "Coordinate time-critical rescue missions across one shared city.",
    status: "PLAYABLE",
    accent: "red",
    stat: "CODE 3",
  },
];
