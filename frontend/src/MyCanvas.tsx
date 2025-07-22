import { useRef, useEffect } from "react";

export const MyCanvas = ({ width = 400, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Example: draw a blue rectangle
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, width, height);

    // You can run animations here…
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default MyCanvas;
