import { useMemo, useState } from "react";
import { simulators, type Simulator } from "./data/simulators";
import SimulatorCanvas from "./components/SimulatorCanvas";
import { ArrowIcon, CompassIcon, GridIcon, PlayIcon, TrophyIcon, UserIcon } from "./components/Icons";

const filters = ["ALL SYSTEMS", "AIR", "LAND", "SEA", "SPACE"];

export default function App() {
  const [activeFilter, setActiveFilter] = useState("ALL SYSTEMS");
  const [activeSim, setActiveSim] = useState<Simulator | null>(null);
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    if (activeFilter === "ALL SYSTEMS") return simulators;
    const map: Record<string,string[]> = { AIR:["flight"], LAND:["drive","rail","rescue"], SEA:["marine"], SPACE:["space"] };
    return simulators.filter(s => map[activeFilter]?.includes(s.id));
  }, [activeFilter]);

  const launch = (sim: Simulator) => {
    if (sim.status === "PLAYABLE") setActiveSim(sim);
    else {
      setNotice(`${sim.title} is in the next expansion.`);
      window.setTimeout(() => setNotice(""), 2600);
    }
  };

  return (
    <div className="app-shell">
      {activeSim && <SimulatorCanvas simulator={activeSim} onClose={() => setActiveSim(null)} />}
      {notice && <div className="toast">{notice}</div>}

      <header className="nav">
        <a className="brand" href="#top" aria-label="SimuVerse home">
          <span className="brand-mark"><CompassIcon size={21}/></span>
          <span>SIMU<b>VERSE</b></span>
        </a>
        <nav>
          <a href="#systems">Systems</a>
          <a href="#world">World</a>
          <a href="#missions">Missions</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Profile"><UserIcon/></button>
          <button className="access-button" onClick={() => document.getElementById("systems")?.scrollIntoView()}>ENTER PLATFORM <ArrowIcon size={16}/></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-grid"/>
          <div className="orbit orbit-one"/>
          <div className="orbit orbit-two"/>
          <div className="hero-vehicle" aria-hidden="true">
            <div className="vehicle-glow"/>
            <div className="wing wing-left"/><div className="wing wing-right"/>
            <div className="fuselage"/><div className="cockpit"/>
            <div className="engine engine-left"/><div className="engine engine-right"/>
          </div>

          <div className="hero-copy">
            <div className="eyebrow"><span/> THE UNIVERSAL SIMULATION PLATFORM</div>
            <h1>ONE WORLD.<br/><em>EVERY MACHINE.</em></h1>
            <p>Fly it. Drive it. Command it. SimuVerse is a connected universe of high-fidelity browser simulations.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => launch(simulators[1])}><PlayIcon size={17}/> START SIMULATING</button>
              <button className="text-button" onClick={() => document.getElementById("systems")?.scrollIntoView()}>EXPLORE SYSTEMS <ArrowIcon size={16}/></button>
            </div>
          </div>

          <div className="telemetry">
            <div><span>ACTIVE PILOTS</span><b>18,204</b></div>
            <div><span>LIVE MISSIONS</span><b>2,841</b></div>
            <div><span>WORLD UPTIME</span><b>99.98%</b></div>
          </div>
          <div className="scroll-cue">SCROLL TO EXPLORE <i/></div>
        </section>

        <section className="systems-section" id="systems">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span/> CHOOSE YOUR SYSTEM</div>
              <h2>Built to feel <em>real.</em></h2>
            </div>
            <p>Each system is a focused simulation. Together, they form one persistent world.</p>
          </div>

          <div className="filter-row">
            {filters.map(filter => <button key={filter} className={activeFilter===filter ? "active":""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
          </div>

          <div className="sim-grid">
            {visible.map((sim, index) => (
              <article className={`sim-card accent-${sim.accent}`} key={sim.id} style={{"--delay":`${index*60}ms`} as React.CSSProperties}>
                <div className={`card-art art-${sim.id}`}>
                  <div className="art-grid"/>
                  <span className="card-stat">{sim.stat}</span>
                  <div className="machine">
                    <i/><i/><i/>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-meta"><span>{sim.eyebrow}</span><b className={sim.status==="PLAYABLE"?"playable":""}>{sim.status}</b></div>
                  <h3>{sim.title}</h3>
                  <p>{sim.description}</p>
                  <button onClick={() => launch(sim)}>
                    {sim.status === "PLAYABLE" ? <>LAUNCH SYSTEM <ArrowIcon size={15}/></> : <>VIEW ROADMAP <ArrowIcon size={15}/></>}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="world-section" id="world">
          <div className="world-copy">
            <div className="eyebrow"><span/> ONE CONNECTED ECONOMY</div>
            <h2>Your actions move<br/>the <em>whole world.</em></h2>
            <p>Fly cargo into the city. Haul it by truck. Unload it at the port. Every mission creates the next one.</p>
            <div className="world-features">
              <div><GridIcon/><span><b>SHARED WORLD</b>Cross-system consequences</span></div>
              <div><TrophyIcon/><span><b>ONE CAREER</b>Progress everywhere</span></div>
            </div>
          </div>
          <div className="world-map">
            <div className="map-ring r1"/><div className="map-ring r2"/><div className="map-ring r3"/>
            <div className="map-route route-a"/>
<div className="map-route route-b"/>
<div className="map-route route-c"/>
            <div className="map-node n1"><span>01</span> AIRPORT</div>
            <div className="map-node n2"><span>02</span> CITY</div>
            <div className="map-node n3"><span>03</span> PORT</div>
            <div className="map-core">SV</div>
          </div>
        </section>

        <section className="cta-section" id="missions">
          <span className="cta-kicker">YOUR FIRST MISSION IS READY</span>
          <h2>Start with the road.<br/>Unlock the universe.</h2>
          <button className="primary-button" onClick={() => launch(simulators[1])}><PlayIcon size={17}/> LAUNCH VELOCITY</button>
          <small>No download. Keyboard controls. Runs in your browser.</small>
        </section>
      </main>

      <footer>
        <div className="brand"><span className="brand-mark"><CompassIcon size={18}/></span><span>SIMU<b>VERSE</b></span></div>
        <p>© 2026 SIMUVERSE SYSTEMS</p>
        <div><a href="#systems">SYSTEMS</a><a href="#world">WORLD</a><a href="#missions">MISSIONS</a></div>
      </footer>
    </div>
  );
}
