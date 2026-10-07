import React, { useEffect, useRef } from 'react';

interface OrganicTerrainCanvasProps {
  className?: string;
}

export const OrganicTerrainCanvas: React.FC<OrganicTerrainCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let time = 0;

    // Mouse drift
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Responsive Canvas Resizing with device pixel ratio
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 35;
      targetMouseY = y * 25;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Pause rendering when canvas is not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Grid configuration for 3D terrain
    const cols = 38;
    const rows = 28;

    // Draw Loop
    const render = () => {
      if (isVisible) {
        if (!prefersReducedMotion) {
          time += 0.007;
          mouseX += (targetMouseX - mouseX) * 0.04;
          mouseY += (targetMouseY - mouseY) * 0.04;
        }

        ctx.clearRect(0, 0, width, height);

        // Warm radial vignette / ambient studio illumination
        const ambientGrad = ctx.createRadialGradient(
          width * 0.5 + mouseX,
          height * 0.45 + mouseY,
          width * 0.05,
          width * 0.5,
          height * 0.5,
          width * 0.65
        );
        ambientGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        ambientGrad.addColorStop(0.5, 'rgba(242, 240, 235, 0.6)');
        ambientGrad.addColorStop(1, 'rgba(235, 233, 227, 0)');
        ctx.fillStyle = ambientGrad;
        ctx.fillRect(0, 0, width, height);

        const centerX = width * 0.5 + mouseX * 0.7;
        const centerY = height * 0.42 + mouseY * 0.7;
        const fov = 420;

        // Calculate points in 3D
        const points: { x: number; y: number; z: number; px: number; py: number; alpha: number }[][] = [];

        for (let r = 0; r <= rows; r++) {
          points[r] = [];
          const v = (r / rows) - 0.5;
          const zBase = r * 16 - 180;

          for (let c = 0; c <= cols; c++) {
            const u = (c / cols) - 0.5;
            const xBase = u * (width * 0.92);

            // Multi-harmonic gentle organic terrain displacement
            const distFromCenter = Math.sqrt(u * u + v * v);
            const wave1 = Math.sin(u * 5.2 + time * 1.1) * Math.cos(v * 4.6 + time * 0.85);
            const wave2 = Math.sin(u * 9.5 - time * 0.7) * Math.sin(v * 7.8 + time * 1.2) * 0.4;
            const wave3 = Math.cos(distFromCenter * 8.4 - time * 1.4) * 0.35;
            
            // Subtle mountain/pedestal dome in center
            const dome = Math.exp(-distFromCenter * 3.8) * 45;

            const elevation = (wave1 + wave2 + wave3) * 28 + dome;

            // 3D coordinate
            const x = xBase;
            const y = 90 - elevation;
            const z = zBase + 340;

            // Perspective projection
            const scale = fov / (fov + z);
            const px = centerX + x * scale;
            const py = centerY + y * scale;
            const alpha = Math.max(0.08, Math.min(0.85, (z + 200) / 500));

            points[r][c] = { x, y, z, px, py, alpha };
          }
        }

        // Draw cross-hatch terrain ribbon surfaces & contour lines
        for (let r = 0; r < rows; r++) {
          // Flowing horizontal contour lines
          ctx.beginPath();
          for (let c = 0; c <= cols; c++) {
            const pt = points[r][c];
            if (c === 0) ctx.moveTo(pt.px, pt.py);
            else ctx.lineTo(pt.px, pt.py);
          }
          const depthRatio = r / rows;
          const strokeAlpha = 0.12 + depthRatio * 0.28;
          ctx.strokeStyle = `rgba(17, 17, 17, ${strokeAlpha})`;
          ctx.lineWidth = 1.05 + depthRatio * 0.45;
          ctx.stroke();

          // Longitudinal rib lines at selective intervals
          for (let c = 0; c < cols; c += 2) {
            const p1 = points[r][c];
            const p2 = points[r + 1][c];
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(17, 17, 17, 0.07)`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Draw intelligent network nodes emerging from peaks
        for (let r = 3; r < rows - 3; r += 4) {
          for (let c = 4; c < cols - 4; c += 5) {
            const pt = points[r][c];
            const pulse = (Math.sin(time * 2.5 + r * 1.2 + c * 0.9) + 1) * 0.5;
            const nodeRadius = 2.5 + pulse * 2.2;

            // Node shadow
            ctx.beginPath();
            ctx.arc(pt.px, pt.py + 4, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(17, 17, 17, 0.08)';
            ctx.fill();

            // Core node
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#050505';
            ctx.fill();

            // Fine connection line to neighboring node
            if (c + 5 < cols) {
              const nextPt = points[r][c + 5];
              ctx.beginPath();
              ctx.moveTo(pt.px, pt.py);
              ctx.lineTo(nextPt.px, nextPt.py);
              ctx.strokeStyle = `rgba(17, 17, 17, ${0.08 + pulse * 0.15})`;
              ctx.setLineDash([3, 4]);
              ctx.lineWidth = 0.9;
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ minHeight: '380px' }}
      />
      {/* Subtle photographic grain filter layer */}
      <div className="grain-overlay" />
    </div>
  );
};
