import { useEffect, useRef, useState } from "react";
import type { Simulator } from "../data/simulators";

type Props = {
  simulator: Simulator;
  onClose: () => void;
};

type Keys = Record<string, boolean>;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function SimulatorCanvas({ simulator, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Keys>({});
  const sirenRef = useRef(false);

  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [siren, setSiren] = useState(false);

  useEffect(() => {
    setScore(0);
    setSpeed(0);
    setPaused(false);
    setSiren(false);
    sirenRef.current = false;
  }, [simulator.id]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys.current[key] = true;

      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        e.preventDefault();
      }

      if (key === "p" && !e.repeat) setPaused((value) => !value);

      if (key === "e" && simulator.id === "rescue" && !e.repeat) {
        sirenRef.current = !sirenRef.current;
        setSiren(sirenRef.current);
      }

      if (e.key === "Escape") onClose();
    };

    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onClose, simulator.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let x = 0;
    let velocity = 0;
    let points = 0;
    let altitude = 0;
    let rescuePulse = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const line = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      alpha = 0.3,
      color = "255,255,255",
    ) => {
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const polygon = (points: [number, number][]) => {
      ctx.beginPath();
      points.forEach(([px, py], index) => {
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
    };

    const drawVehicle = (w: number, h: number, color: string, emergency = false) => {
      ctx.save();
      ctx.translate(w / 2 + x * 0.72, h * 0.79);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;

      polygon([
        [-29, 25],
        [-23, -14],
        [-10, -32],
        [12, -32],
        [27, -10],
        [31, 25],
      ]);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#080a0d";
      ctx.fillRect(-17, -18, 30, 13);

      if (emergency) {
        const flash = Math.sin(rescuePulse * 11) > 0;
        ctx.fillStyle = flash ? "#ff3448" : "#4bb8ff";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 22;
        ctx.fillRect(-13, -37, 12, 5);
        ctx.fillStyle = flash ? "#4bb8ff" : "#ff3448";
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(2, -37, 12, 5);
      }

      ctx.restore();
      ctx.shadowBlur = 0;
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (!paused) {
        const throttle =
          keys.current["w"] || keys.current["arrowup"]
            ? 1
            : keys.current["s"] || keys.current["arrowdown"]
              ? -1
              : 0;

        const steer =
          keys.current["a"] || keys.current["arrowleft"]
            ? -1
            : keys.current["d"] || keys.current["arrowright"]
              ? 1
              : 0;

        const acceleration =
          simulator.id === "rail" ? 25 :
          simulator.id === "space" ? 30 :
          simulator.id === "marine" ? 26 :
          simulator.id === "rescue" ? 48 : 44;

        const maxVelocity =
          simulator.id === "rail" ? 75 :
          simulator.id === "marine" ? 72 :
          simulator.id === "space" ? 125 :
          simulator.id === "rescue" ? 100 : 110;

        velocity += throttle * acceleration * dt;
        velocity *= Math.pow(simulator.id === "rail" ? 0.989 : 0.975, dt * 60);
        velocity = clamp(velocity, 0, maxVelocity);

        if (simulator.id !== "rail") {
          x += steer * dt * (70 + velocity * 0.7);
          x *= Math.pow(0.986, dt * 60);
          x = clamp(x, -w * 0.42, w * 0.42);
        }

        if (simulator.id === "flight") {
          altitude += steer * 0.08;
          altitude *= 0.985;
        }

        t += velocity * dt;
        rescuePulse += dt;

        let multiplier = 0.12;
        if (simulator.id === "space") multiplier = 0.18;
        if (simulator.id === "rail") multiplier = 0.1;
        if (simulator.id === "rescue" && sirenRef.current) multiplier = 0.2;

        points += velocity * dt * multiplier;

        const displaySpeed =
          simulator.id === "marine" ? velocity * 0.32 :
          simulator.id === "flight" ? velocity * 3.2 :
          simulator.id === "space" ? velocity * 4.6 :
          simulator.id === "rail" ? velocity * 1.7 :
          velocity * 2.15;

        setSpeed(Math.round(displaySpeed));
        setScore(Math.floor(points));
      }

      const grad = ctx.createLinearGradient(0, 0, 0, h);

      if (simulator.id === "flight") {
        grad.addColorStop(0, "#082133");
        grad.addColorStop(0.55, "#194253");
        grad.addColorStop(1, "#8d7259");
      } else if (simulator.id === "marine") {
        grad.addColorStop(0, "#071923");
        grad.addColorStop(0.55, "#0a4154");
        grad.addColorStop(1, "#08232d");
      } else if (simulator.id === "space") {
        grad.addColorStop(0, "#03020a");
        grad.addColorStop(0.58, "#0b0920");
        grad.addColorStop(1, "#160b2a");
      } else if (simulator.id === "rail") {
        grad.addColorStop(0, "#111722");
        grad.addColorStop(0.52, "#25313a");
        grad.addColorStop(1, "#16140f");
      } else if (simulator.id === "rescue") {
        grad.addColorStop(0, "#07101b");
        grad.addColorStop(0.6, "#111a27");
        grad.addColorStop(1, "#05070b");
      } else {
        grad.addColorStop(0, "#080b13");
        grad.addColorStop(0.6, "#111427");
        grad.addColorStop(1, "#030407");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (simulator.id === "drive") {
        const horizon = h * 0.35;

        ctx.fillStyle = "#080910";
        polygon([
          [w * 0.34, h],
          [w * 0.47, horizon],
          [w * 0.53, horizon],
          [w * 0.66, h],
        ]);
        ctx.fill();

        for (let i = 0; i < 18; i++) {
          const z = (((i * 70 - t * 2.2) % 1260) + 1260) % 1260 / 1260;
          const y = horizon + (1 - z) * (1 - z) * (h - horizon);
          const half = 8 + (1 - z) * w * 0.16;
          ctx.lineWidth = 2;
          line(w / 2 - half, y, w / 2 + half, y, 0.08 + (1 - z) * 0.32);
        }

        ctx.shadowColor = "#b7ff4a";
        ctx.shadowBlur = 16;
        line(w * 0.47 + x * 0.25, h * 0.92, w * 0.495 + x * 0.03, h * 0.59, 0.75, "183,255,74");
        line(w * 0.53 + x * 0.25, h * 0.92, w * 0.505 + x * 0.03, h * 0.59, 0.75, "183,255,74");
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.translate(w / 2 + x * 0.75, h * 0.79);
        ctx.fillStyle = "#d8ff78";
        polygon([[0, -36], [28, 26], [0, 18], [-28, 26]]);
        ctx.fill();
        ctx.restore();
      }

      if (simulator.id === "flight") {
        const horizon = h * 0.54 + altitude * 18;

        ctx.fillStyle = "rgba(237,188,135,.32)";
        ctx.fillRect(0, horizon, w, h - horizon);

        for (let i = 0; i < 11; i++) {
          const y = horizon + ((i * 85 + t * 0.45) % (h - horizon + 100));
          line(0, y, w, y, 0.1);
        }

        ctx.save();
        ctx.translate(w / 2 + x, h * 0.58);
        ctx.rotate(x * 0.0015);
        ctx.fillStyle = "#e8faff";
        ctx.shadowColor = "#5ce1ff";
        ctx.shadowBlur = 22;
        polygon([
          [0, -42], [12, 4], [82, 30], [14, 24],
          [0, 48], [-14, 24], [-82, 30], [-12, 4],
        ]);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;

        line(w / 2 - 130, horizon, w / 2 + 130, horizon, 0.45);
        line(w / 2, horizon - 35, w / 2, horizon + 35, 0.45);
      }

      if (simulator.id === "marine") {
        const horizon = h * 0.31;

        for (let i = 0; i < 16; i++) {
          const y = horizon + ((i * 46 + t * 0.32) % (h - horizon + 50));
          ctx.strokeStyle = "rgba(76,219,255,.22)";
          ctx.beginPath();
          for (let px = 0; px <= w; px += 20) {
            const waveY = y + Math.sin(px * 0.025 + t * 0.01 + i) * 7;
            if (px === 0) ctx.moveTo(px, waveY);
            else ctx.lineTo(px, waveY);
          }
          ctx.stroke();
        }

        for (let i = 0; i < 8; i++) {
          const bx = (i * 187 + t * 0.5) % (w + 120) - 60;
          const by = horizon + 70 + (i % 3) * 95;
          ctx.fillStyle = "#ffb84d";
          ctx.fillRect(bx, by, 4, 26);
          ctx.beginPath();
          ctx.arc(bx + 2, by, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.translate(w / 2 + x * 0.8, h * 0.66);
        ctx.fillStyle = "#e2fbff";
        ctx.shadowColor = "#51d7ff";
        ctx.shadowBlur = 20;
        polygon([[0, -52], [38, 35], [0, 24], [-38, 35]]);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
      }

      if (simulator.id === "space") {
        // Stable starfield generated from deterministic positions.
        for (let i = 0; i < 120; i++) {
          const sx = ((i * 97.13 + t * (0.15 + (i % 5) * 0.04)) % (w + 40)) - 20;
          const sy = (i * 53.7) % h;
          const radius = 0.5 + (i % 4) * 0.35;
          ctx.fillStyle = `rgba(220,230,255,${0.25 + (i % 6) * 0.1})`;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Planet.
        const planetX = w * 0.78 - (t * 0.04) % (w * 0.12);
        const planetY = h * 0.27;
        const planetR = Math.max(55, Math.min(w, h) * 0.1);
        const planetGrad = ctx.createRadialGradient(
          planetX - planetR * 0.35,
          planetY - planetR * 0.35,
          5,
          planetX,
          planetY,
          planetR,
        );
        planetGrad.addColorStop(0, "#b89cff");
        planetGrad.addColorStop(0.55, "#5f3f9c");
        planetGrad.addColorStop(1, "#160e2c");
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Docking station target.
        const stationX = w * 0.25;
        const stationY = h * 0.34 + Math.sin(t * 0.01) * 12;
        ctx.strokeStyle = "rgba(185,255,77,.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(stationX - 34, stationY - 34, 68, 68);
        ctx.beginPath();
        ctx.arc(stationX, stationY, 19, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '9px "DM Mono", monospace';
        ctx.fillStyle = "#b9ff4d";
        ctx.fillText("DOCK", stationX - 14, stationY - 45);

        // Spacecraft.
        ctx.save();
        ctx.translate(w / 2 + x * 0.65, h * 0.68);
        ctx.rotate(x * 0.001);
        ctx.fillStyle = "#f0ecff";
        ctx.shadowColor = "#a07cff";
        ctx.shadowBlur = 24;
        polygon([
          [0, -52], [16, -6], [58, 22], [18, 18],
          [9, 43], [0, 31], [-9, 43], [-18, 18], [-58, 22], [-16, -6],
        ]);
        ctx.fill();
        ctx.fillStyle = "#a07cff";
        ctx.fillRect(-8, 28, 16, 17);
        ctx.restore();
        ctx.shadowBlur = 0;
      }

      if (simulator.id === "rail") {
        const horizon = h * 0.34;

        // Ground.
        ctx.fillStyle = "#14140f";
        ctx.fillRect(0, horizon, w, h - horizon);

        // Distant skyline / trees.
        for (let i = 0; i < 28; i++) {
          const bx = (i * 71 - t * 0.16) % (w + 100);
          const px = bx < -50 ? bx + w + 100 : bx;
          const bh = 18 + (i % 5) * 13;
          ctx.fillStyle = i % 3 === 0 ? "#222b24" : "#1a211d";
          ctx.fillRect(px, horizon - bh, 26 + (i % 4) * 8, bh);
        }

        // Rails converge on the horizon.
        line(w * 0.24, h, w * 0.485, horizon, 0.9, "255,173,76");
        line(w * 0.76, h, w * 0.515, horizon, 0.9, "255,173,76");

        // Sleepers.
        for (let i = 0; i < 24; i++) {
          const z = (((i * 58 - t * 1.5) % 1392) + 1392) % 1392 / 1392;
          const y = horizon + (1 - z) * (1 - z) * (h - horizon);
          const half = 7 + (1 - z) * w * 0.27;
          line(w / 2 - half, y, w / 2 + half, y, 0.18 + (1 - z) * 0.32, "255,210,150");
        }

        // Signal.
        const signalX = w * 0.69;
        const signalY = horizon + 85;
        ctx.fillStyle = "#30353a";
        ctx.fillRect(signalX, signalY, 6, 100);
        ctx.fillStyle = "#111";
        ctx.fillRect(signalX - 11, signalY - 20, 28, 43);
        ctx.fillStyle = velocity < 15 ? "#ff4d55" : "#b9ff4d";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(signalX + 3, signalY - 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cab nose at bottom.
        ctx.fillStyle = "rgba(18,20,23,.92)";
        polygon([
          [w * 0.25, h],
          [w * 0.34, h * 0.84],
          [w * 0.66, h * 0.84],
          [w * 0.75, h],
        ]);
        ctx.fill();
        line(w * 0.36, h * 0.86, w * 0.64, h * 0.86, 0.65, "255,173,76");
      }

      if (simulator.id === "rescue") {
        const horizon = h * 0.28;

        // City road.
        ctx.fillStyle = "#090c12";
        polygon([
          [w * 0.2, h],
          [w * 0.44, horizon],
          [w * 0.56, horizon],
          [w * 0.8, h],
        ]);
        ctx.fill();

        // Buildings.
        for (let i = 0; i < 18; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const depth = (i % 9) / 9;
          const bw = 48 + depth * 80;
          const bh = 90 + (i % 5) * 38;
          const bx = side < 0
            ? w * 0.42 - depth * w * 0.38 - bw
            : w * 0.58 + depth * w * 0.38;
          const by = horizon - bh + depth * 75;

          ctx.fillStyle = i % 3 === 0 ? "#18202b" : "#111823";
          ctx.fillRect(bx, by, bw, bh);

          ctx.fillStyle = "rgba(255,214,111,.25)";
          for (let wy = by + 12; wy < by + bh - 8; wy += 18) {
            for (let wx = bx + 10; wx < bx + bw - 8; wx += 20) {
              if ((Math.floor(wx + wy + i) % 3) === 0) ctx.fillRect(wx, wy, 5, 7);
            }
          }
        }

        // Lane markers.
        for (let i = 0; i < 16; i++) {
          const z = (((i * 82 - t * 2.1) % 1312) + 1312) % 1312 / 1312;
          const y = horizon + (1 - z) * (1 - z) * (h - horizon);
          const half = 2 + (1 - z) * 8;
          line(w / 2 - half, y, w / 2 + half, y, 0.65);
        }

        // Destination beacon.
        const beaconX = w * 0.53;
        const beaconY = horizon + 55;
        const pulse = 16 + Math.sin(rescuePulse * 4) * 5;
        ctx.strokeStyle = "rgba(255,77,85,.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ff4d55";
        ctx.font = '9px "DM Mono", monospace';
        ctx.fillText("INCIDENT", beaconX - 22, beaconY - 27);

        if (sirenRef.current) {
          const flash = Math.sin(rescuePulse * 12) > 0;
          const glow = ctx.createLinearGradient(0, 0, w, 0);
          glow.addColorStop(0, flash ? "rgba(255,35,55,.12)" : "rgba(40,130,255,.12)");
          glow.addColorStop(0.5, "rgba(0,0,0,0)");
          glow.addColorStop(1, flash ? "rgba(40,130,255,.12)" : "rgba(255,35,55,.12)");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, w, h);
        }

        drawVehicle(w, h, "#f1f5f6", sirenRef.current);
      }

      if (paused) {
        ctx.fillStyle = "rgba(0,0,0,.55)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "white";
        ctx.font = "600 28px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", w / 2, h / 2);
        ctx.textAlign = "start";
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [paused, simulator.id]);

  const unit =
    simulator.id === "marine" ? "KNOTS" :
    simulator.id === "flight" ? "KTS" :
    simulator.id === "space" ? "M/S" :
    "KM/H";

  const controlText =
    simulator.id === "rail"
      ? <><kbd>W</kbd> THROTTLE <kbd>S</kbd> BRAKE <kbd>P</kbd> PAUSE</>
      : simulator.id === "rescue"
        ? <><kbd>WASD</kbd> DRIVE <kbd>E</kbd> SIREN <kbd>P</kbd> PAUSE</>
        : simulator.id === "space"
          ? <><kbd>W/S</kbd> THRUST <kbd>A/D</kbd> STEER <kbd>P</kbd> PAUSE</>
          : <><kbd>WASD</kbd> MOVE <kbd>P</kbd> PAUSE</>;

  return (
    <div className="sim-overlay">
      <canvas ref={canvasRef} className="sim-canvas" />

      <div className="sim-topbar">
        <div>
          <span className="live-dot" /> LIVE SIMULATION
          <b>{simulator.title.toUpperCase()}</b>
          {simulator.id === "rescue" && siren && <b> · SIREN ACTIVE</b>}
        </div>
        <button onClick={onClose} aria-label="Exit simulator">
          EXIT · ESC
        </button>
      </div>

      <div className="sim-reticle"><span /><span /></div>

      <div className="sim-hud">
        <div className="hud-stat">
          <small>SPEED</small>
          <strong>{speed}</strong>
          <span>{unit}</span>
        </div>

        <div className="hud-stat">
          <small>MISSION SCORE</small>
          <strong>{score.toString().padStart(5, "0")}</strong>
          <span>PTS</span>
        </div>

        <div className="hud-controls">{controlText}</div>
      </div>
    </div>
  );
}
