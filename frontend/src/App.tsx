import "./App.css";
import { useState } from "react";
import LiquidKonva from './LiquidKonva';


function App() {
  const [amountOfParticles, setAmountOfParticles] = useState<number>(500);
  const [smoothingRadius, setSmoothingRadius] = useState<number>(10);
  const [dt, setDt] = useState<number>(100);
  const [on, setOn] = useState<boolean>(false);

  const width = window.innerWidth;
  const height = window.innerHeight;


  return (
    <>
      <div>
        <h3>Amount of particles</h3>
        <input
          type="number"
          value={amountOfParticles}
          onChange={(e) => setAmountOfParticles(Number(e.target.value)) }
        />
      </div>
      <div>
        <h3>Smoothing radius</h3>
        <input 
          type="number"
          value={smoothingRadius}
          onChange={(e) => setSmoothingRadius(Number(e.target.value)) }
        />
      </div>
      <div>
        <h3>Speed</h3>
        <input 
          type="number"
          value={dt}
          onChange={(e) => setDt(Number(e.target.value)) }
        />
      </div>
      <div>
        <h3>Play/pause</h3>
        <button type="button" onClick={() => setOn(!on) }>
          {on ? "pause" : "play"}
        </button>
      </div>
      <div className="flex items-center justify-center w-screen h-screen">
        <LiquidKonva
          width={width / 2}
          height={height / 1.5}
          amount_of_particles={amountOfParticles}
          smoothing_radius={smoothingRadius}
          dt={1/dt}
          simulationOn={on}
        />
      </div>
    </>
  );
}

export default App;
