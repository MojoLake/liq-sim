// LiquidKonva.tsx
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Rect, Arrow } from "react-konva";
import { useWasm } from "./hooks/useWasm";

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Gradient {
  x: number;
  y: number;
  gx: number;
  gy: number;
}

interface LiquidKonvaProps {
  width: number;
  height: number;
  amount_of_particles: number;
  smoothing_radius: number;
  dt: number;
  simulationOn: boolean;
}

type ParticleWorldInstance = {
  positions: (positionsBuf: Float32Array) => void;
  velocities: (velocitiesBuf: Float32Array) => void;
  gradients_y: (gradientsYBuf: Float32Array) => void;
  gradients_x: (gradientsXBuf: Float32Array) => void;
  tick: (dt: number) => void;
};

const LiquidKonva = ({
  width,
  height,
  amount_of_particles,
  smoothing_radius,
  dt,
  simulationOn,
}: LiquidKonvaProps) => {
  const wasm = useWasm();

  const worldRef = useRef<ParticleWorldInstance | null>(null);
  const animationRef = useRef<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const [gradients, setGradients] = useState<Gradient[]>([]);

  console.log("Height:", height);
  console.log("Width:", width);

  const simulationOnRef = useRef(simulationOn);
  useEffect(() => {
    simulationOnRef.current = simulationOn;
    console.log("simulationOnRef:", simulationOn);
  }, [simulationOn])

  useEffect(() => {
    if (!wasm) return;
    if (worldRef.current) return;

    const arrowsPerRow = 10;
    const arrowPerCol = Math.ceil(arrowsPerRow * (height / width));
    const cellWidth = width / arrowsPerRow;
    const cellHeight = height / arrowPerCol;

    console.log("Arrows per row:", arrowsPerRow);
    console.log("Arrows per col:", arrowPerCol);

    // debugger;

    worldRef.current = new wasm.ParticleWorld (
      height,
      width,
      amount_of_particles,
      smoothing_radius,
      arrowPerCol,
      arrowsPerRow,
    );

    const positionsBuf = new Float32Array(amount_of_particles * 2);
    const velocitiesBuf = new Float32Array(amount_of_particles * 2);
    const gradientsXBuf = new Float32Array(arrowPerCol * arrowsPerRow);
    const gradientsYBuf = new Float32Array(arrowPerCol * arrowsPerRow);

    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;

    const animate = (now: number) => {
      if (!worldRef.current) return;

      let frameTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (simulationOnRef.current) accumulatorRef.current += frameTime;

      while (accumulatorRef.current >= dt) {
        console.log("Ticking...");
        worldRef.current.tick(dt);
        console.log("Ticked!");
        accumulatorRef.current -= dt;
      }

      worldRef.current.positions(positionsBuf);
      worldRef.current.velocities(velocitiesBuf);
      worldRef.current.gradients_x(gradientsXBuf);
      worldRef.current.gradients_y(gradientsYBuf);


      const newParticles: Particle[] = [];
      for (let i = 0; i < amount_of_particles; i++) {
        newParticles.push({
          x: positionsBuf[2 * i],
          y: positionsBuf[2 * i + 1],
          dx: velocitiesBuf[2 * i],
          dy: velocitiesBuf[2 * i + 1],
        });
      }
      console.log("dy:", newParticles[0].dy);
      setParticles(newParticles);

      console.log("Length of gradientsXBuf:", gradientsXBuf.length);

      const newGradients: Gradient[] = [];
      for (let i = 0; i < arrowPerCol; i++) {
        for (let j = 0; j < arrowsPerRow; j++) {
            let pos_x = (j + 0.5) * cellWidth;
            let pos_y = (i + 0.5) * cellHeight;
            // console.log("i and j:", i, j);
            // console.log("gradientsXBuf[i * width + j]: ", gradientsXBuf[i * width + j]);
            newGradients.push({
              x: pos_x,
              y: pos_y,
              gx: gradientsXBuf[i * arrowsPerRow + j],
              gy: gradientsYBuf[i * arrowsPerRow + j],
          });
          }
       }

      console.log("Length of newGradients:", newGradients.length);
      console.log("All gx's:");
      newGradients.forEach( (g) => {
        console.log(g.gx);
      });
      console.log("End of all gx's");

      setGradients(newGradients);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      worldRef.current = null;
    }
  }, [wasm, amount_of_particles, width, height, dt, smoothing_radius]);


  const MAX_SPEED = 600;

  const colorFromSpeed = (speed: number): string => {
    const t = Math.min(speed / MAX_SPEED, 1);
    const hue = 240 - 240 * t;
    return `hsl(${hue}, 100%, 50%)`;
  }

  const ARROW_SCALE = 10;
  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect width={width} height={height} fill="lightgrey" />
      </Layer>
      <Layer>
        {particles.map((particle, index) => {
          const speed = Math.hypot(particle.dx, particle.dy);
          return (
            <Circle
              key={index}
              x={particle.x}
              y={particle.y}
              radius={smoothing_radius}
              fill={colorFromSpeed(speed)}
            />
          )
        })}
      </Layer>
      <Layer>
        {gradients.map((g, i) => (
          <Arrow
            key={i}
            points={[g.x, g.y, g.x + g.gx * ARROW_SCALE, g.y + g.gy * ARROW_SCALE]} 
            pointerLength={8}
            pointerWidth={6}
            stroke="black"
            fill="black"
            strokeWidth={1}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default LiquidKonva;
