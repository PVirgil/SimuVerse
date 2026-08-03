import { useEffect, useRef, useState } from "react";
import type { Simulator } from "../data/simulators";

type Props = {
  simulator: Simulator;
  onClose: () => void;
};

type Keys = Record<string, boolean>;

export default function SimulatorCanvas({ simulator, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Keys>({});
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key.toLowerCase() === "p") setPaused(v => !v);
      if (e.key === "Escape") onClose();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onClose]);

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

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    window.addEventListener("resize", resize);

    const line = (x1:number,y1:number,x2:number,y2:number,alpha=.3) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    };

    const frame = (now:number) => {
      const dt = Math.min((now-last)/1000, .05); last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!paused) {
        const throttle = keys.current["w"] || keys.current["arrowup"] ? 1 : keys.current["s"] || keys.current["arrowdown"] ? -1 : 0;
        const steer = keys.current["a"] || keys.current["arrowleft"] ? -1 : keys.current["d"] || keys.current["arrowright"] ? 1 : 0;
        velocity += throttle * 44 * dt;
        velocity *= Math.pow(.975, dt * 60);
        velocity = Math.max(0, Math.min(110, velocity));
        x += steer * dt * (70 + velocity * .7);
        x *= Math.pow(.986, dt * 60);
        t += velocity * dt;
        points += velocity * dt * .12;
        setSpeed(Math.round(velocity * (simulator.id === "marine" ? .32 : simulator.id === "flight" ? 3.2 : 2.15)));
        setScore(Math.floor(points));
      }

      const grad = ctx.createLinearGradient(0,0,0,h);
      if (simulator.id === "flight") { grad.addColorStop(0,"#082133"); grad.addColorStop(.55,"#194253"); grad.addColorStop(1,"#8d7259"); }
      else if (simulator.id === "marine") { grad.addColorStop(0,"#071923"); grad.addColorStop(.55,"#0a4154"); grad.addColorStop(1,"#08232d"); }
      else { grad.addColorStop(0,"#080b13"); grad.addColorStop(.6,"#111427"); grad.addColorStop(1,"#030407"); }
      ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);

      if (simulator.id === "drive") {
        const horizon = h*.35;
        ctx.fillStyle="#080910"; ctx.beginPath(); ctx.moveTo(w*.34,h); ctx.lineTo(w*.47,horizon); ctx.lineTo(w*.53,horizon); ctx.lineTo(w*.66,h); ctx.fill();
        for(let i=0;i<18;i++){
          const z=((i*70-t*2.2)%1260+1260)%1260/1260;
          const y=horizon+(1-z)*(1-z)*(h-horizon);
          const half=8+(1-z)*w*.16;
          ctx.strokeStyle=`rgba(166,255,67,${.1+(1-z)*.7})`; ctx.lineWidth=2;
          line(w/2-half,y,w/2+half,y,.08+(1-z)*.32);
        }
        ctx.strokeStyle="#b7ff4a"; ctx.shadowColor="#b7ff4a"; ctx.shadowBlur=16;
        line(w*.47+x*.25,h*.92,w*.495+x*.03,h*.59,.75); line(w*.53+x*.25,h*.92,w*.505+x*.03,h*.59,.75);
        ctx.shadowBlur=0;
        ctx.save(); ctx.translate(w/2+x*.75,h*.79); ctx.fillStyle="#d8ff78";
        ctx.beginPath(); ctx.moveTo(0,-36); ctx.lineTo(28,26); ctx.lineTo(0,18); ctx.lineTo(-28,26); ctx.closePath(); ctx.fill(); ctx.restore();
      } else if (simulator.id === "flight") {
        const horizon=h*.54;
        ctx.fillStyle="rgba(237,188,135,.32)"; ctx.fillRect(0,horizon,w,h-horizon);
        for(let i=0;i<11;i++){ const y=horizon+((i*85+t*.45)%(h-horizon+100)); line(0,y,w,y,.1); }
        ctx.save(); ctx.translate(w/2+x,h*.58); ctx.rotate(x*.0015);
        ctx.fillStyle="#e8faff"; ctx.shadowColor="#5ce1ff"; ctx.shadowBlur=22;
        ctx.beginPath(); ctx.moveTo(0,-42); ctx.lineTo(12,4); ctx.lineTo(82,30); ctx.lineTo(14,24); ctx.lineTo(0,48); ctx.lineTo(-14,24); ctx.lineTo(-82,30); ctx.lineTo(-12,4); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.shadowBlur=0;
        line(w/2-130,horizon,w/2+130,horizon,.45); line(w/2,horizon-35,w/2,horizon+35,.45);
      } else {
        const horizon=h*.31;
        for(let i=0;i<16;i++){
          const y=horizon+((i*46+t*.32)%(h-horizon+50));
          ctx.strokeStyle="rgba(76,219,255,.22)"; ctx.beginPath();
          for(let px=0;px<=w;px+=20) ctx.lineTo(px,y+Math.sin(px*.025+t*.01+i)*7);
          ctx.stroke();
        }
        for(let i=0;i<8;i++){
          const bx=(i*187+(t*.5))%(w+120)-60; const by=horizon+70+(i%3)*95;
          ctx.fillStyle="#ffb84d"; ctx.fillRect(bx,by,4,26); ctx.beginPath();ctx.arc(bx+2,by,8,0,Math.PI*2);ctx.fill();
        }
        ctx.save(); ctx.translate(w/2+x*.8,h*.66); ctx.fillStyle="#e2fbff"; ctx.shadowColor="#51d7ff";ctx.shadowBlur=20;
        ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(38,35);ctx.lineTo(0,24);ctx.lineTo(-38,35);ctx.closePath();ctx.fill();ctx.restore();ctx.shadowBlur=0;
      }
      if(paused){ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(0,0,w,h);ctx.fillStyle="white";ctx.font="600 28px system-ui";ctx.textAlign="center";ctx.fillText("PAUSED",w/2,h/2);}
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, [paused, simulator.id]);

  const unit = simulator.id === "marine" ? "KNOTS" : simulator.id === "flight" ? "KTS" : "KM/H";
  return (
    <div className="sim-overlay">
      <canvas ref={canvasRef} className="sim-canvas" />
      <div className="sim-topbar">
        <div><span className="live-dot"/> LIVE SIMULATION <b>{simulator.title.toUpperCase()}</b></div>
        <button onClick={onClose} aria-label="Exit simulator">EXIT · ESC</button>
      </div>
      <div className="sim-reticle"><span/><span/></div>
      <div className="sim-hud">
        <div className="hud-stat"><small>SPEED</small><strong>{speed}</strong><span>{unit}</span></div>
        <div className="hud-stat"><small>MISSION SCORE</small><strong>{score.toString().padStart(5,"0")}</strong><span>PTS</span></div>
        <div className="hud-controls"><kbd>WASD</kbd> MOVE <kbd>P</kbd> PAUSE</div>
      </div>
    </div>
  );
}
