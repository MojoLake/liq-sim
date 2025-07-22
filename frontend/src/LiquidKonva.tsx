// LiquidKonva.tsx
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";
import { useWasm } from "./hooks/useWasm";

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
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

  const simulationOnRef = useRef(simulationOn);
  useEffect(() => {
    simulationOnRef.current = simulationOn;
    console.log("simulationOnRef:", simulationOn);
  }, [simulationOn])

  useEffect(() => {
    if (!wasm) return;
    if (worldRef.current) return;

    worldRef.current = new wasm.ParticleWorld (
      height,
      width,
      amount_of_particles,
      smoothing_radius,
      height,
      width,
    );

    const positionsBuf = new Float32Array(amount_of_particles * 2);
    const velocitiesBuf = new Float32Array(amount_of_particles * 2);

    const arrowsPerRow = 10;
    const arrowPerCol = arrowsPerRow * (height / width);

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
    </Stage>
  );
};

export default LiquidKonva;
