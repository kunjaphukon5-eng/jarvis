'use client';

import React, { useRef, useEffect } from 'react';

interface MinimapProps {
  playerPos: { x: number; y: number; z: number };
  playerRotation: number;
  policePositions: { x: number; y: number; z: number }[];
  vehiclePositions: { x: number; y: number; z: number }[];
  waypointPos?: { x: number; y: number; z: number } | null;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerRotation,
  policePositions,
  vehiclePositions,
  waypointPos,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const scale = 0.35; // meters to canvas pixels

    // Clear background
    ctx.fillStyle = '#070a14';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-playerRotation);

    // Draw main road network lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 14;

    for (let i = -5; i <= 5; i++) {
      const offset = i * 120;

      // X-Roads
      ctx.beginPath();
      ctx.moveTo(-600 * scale - playerPos.x * scale, (offset - playerPos.z) * scale);
      ctx.lineTo(600 * scale - playerPos.x * scale, (offset - playerPos.z) * scale);
      ctx.stroke();

      // Z-Roads
      ctx.beginPath();
      ctx.moveTo((offset - playerPos.x) * scale, -600 * scale - playerPos.z * scale);
      ctx.lineTo((offset - playerPos.x) * scale, 600 * scale - playerPos.z * scale);
      ctx.stroke();
    }

    // Draw Vehicles (Cyan dots)
    ctx.fillStyle = '#00f3ff';
    for (const v of vehiclePositions) {
      const vx = (v.x - playerPos.x) * scale;
      const vz = (v.z - playerPos.z) * scale;
      ctx.beginPath();
      ctx.arc(vx, vz, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Police Cars (Flashing Red/Blue dots)
    for (const p of policePositions) {
      const px = (p.x - playerPos.x) * scale;
      const pz = (p.z - playerPos.z) * scale;
      ctx.fillStyle = Date.now() % 400 < 200 ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(px, pz, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Waypoint (Yellow diamond)
    if (waypointPos) {
      const wx = (waypointPos.x - playerPos.x) * scale;
      const wz = (waypointPos.z - playerPos.z) * scale;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(wx, wz - 6);
      ctx.lineTo(wx + 6, wz);
      ctx.lineTo(wx, wz + 6);
      ctx.lineTo(wx - 6, wz);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Player Marker (Center cyan triangle pointing UP)
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.moveTo(center, center - 7);
    ctx.lineTo(center + 6, center + 6);
    ctx.lineTo(center - 6, center + 6);
    ctx.closePath();
    ctx.fill();

    // Circular Radar Frame Border
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [playerPos, playerRotation, policePositions, vehiclePositions, waypointPos]);

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-slate-950/90 backdrop-blur select-none">
      <canvas ref={canvasRef} width={176} height={176} className="w-full h-full" />
    </div>
  );
};
