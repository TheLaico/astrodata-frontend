import React, { useEffect, useRef } from "react";

export default function BlackHoleScene() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    const particles = Array.from({ length: 72 }, (_, index) => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.72 + Math.random() * 1.34,
      speed: 0.000035 + Math.random() * 0.00011,
      size: 0.45 + Math.random() * 1.25,
      band: Math.random(),
      phase: Math.random() * Math.PI * 2,
      warmth: Math.random(),
      drift: index % 3 === 0 ? -1 : 1,
      glowColor: Math.random() > 0.62 ? "#c66d35" : "#eafff4",
      fillPrefix: Math.random() > 0.62 ? "rgba(211,103,44," : "rgba(231,250,238,",
    }));
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.3,
      alpha: 0.12 + Math.random() * 0.55,
    }));
    const diskBands = Array.from({ length: 34 }, (_, i) => ({
      offset: (i - 17) * 0.012,
      width: 0.6 + Math.random() * 2.2,
      warm: Math.random() > 0.48,
      phase: Math.random() * Math.PI * 2,
      start: Math.random() * Math.PI * 2,
      span: Math.PI * (0.22 + Math.random() * 0.78),
      rxJitter: 0.9 + Math.random() * 0.34,
      yJitter: -0.04 + Math.random() * 0.08,
    }));

    let animationFrame;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let start = performance.now();
    let lastFrame = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawArc(cx, cy, rx, ry, rotation, start, end, color, widthLine, alpha, blur = 0) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = widthLine;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, start, end);
      ctx.stroke();
      ctx.restore();
    }

    function draw(time) {
      if (time - lastFrame < 33) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;
      const elapsed = time - start;
      const cx = width * 0.64;
      const cy = height * 0.44;
      const scale = Math.min(width, height);
      const diskRx = scale * 0.58;
      const diskRy = scale * 0.145;
      const tilt = -0.19;
      const mouse = mouseRef.current;

      const background = ctx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "#020201");
      background.addColorStop(0.34, "#15110d");
      background.addColorStop(0.58, "#332115");
      background.addColorStop(1, "#e7f4ef");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      stars.forEach((star) => {
        const twinkle = 0.55 + Math.sin(elapsed * 0.0012 + star.x * 20) * 0.22;
        ctx.globalAlpha = star.alpha * twinkle;
        ctx.fillStyle = "#f6fff9";
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      const haze = ctx.createRadialGradient(cx, cy, scale * 0.08, cx, cy, scale * 0.72);
      haze.addColorStop(0, "rgba(245,255,246,0.56)");
      haze.addColorStop(0.22, "rgba(205,230,216,0.28)");
      haze.addColorStop(0.54, "rgba(121,74,39,0.22)");
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      diskBands.forEach((band, i) => {
        const shimmer = 0.92 + Math.sin(elapsed * 0.00022 + band.phase) * 0.08;
        const alpha = (0.018 + (1 - Math.abs(i - 17) / 18) * 0.045) * shimmer;
        const warm = band.warm ? "rgba(202,102,44,1)" : "rgba(230,244,232,1)";
        const start = band.start + elapsed * 0.000018 * (band.warm ? 1 : -1);
        drawArc(
          cx - scale * 0.03,
          cy + scale * (0.042 + band.offset * 0.32 + band.yJitter),
          diskRx * (0.98 + band.offset * 0.25) * band.rxJitter,
          diskRy * (0.88 + Math.abs(band.offset) * 0.85),
          tilt + Math.sin(band.phase) * 0.018,
          start,
          start + band.span,
          warm,
          band.width,
          alpha,
          3,
        );
      });

      const beam = ctx.createLinearGradient(width * 0.28, height * 0.7, width, height * 0.34);
      beam.addColorStop(0, "rgba(80,42,20,0)");
      beam.addColorStop(0.38, "rgba(214,128,68,0.22)");
      beam.addColorStop(0.58, "rgba(242,255,245,0.72)");
      beam.addColorStop(1, "rgba(242,255,245,0.08)");
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.fillStyle = beam;
      ctx.fillRect(-diskRx * 1.34, -diskRy * 0.55, diskRx * 2.65, diskRy * 1.1);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 0;
      particles.forEach((particle, index) => {
        const orbitRadius = diskRx * particle.radius;
        const particleAngle = particle.angle + elapsed * particle.speed * particle.drift;
        const localX = Math.cos(particleAngle) * orbitRadius;
        const localY = Math.sin(particleAngle) * diskRy * (0.52 + particle.band * 0.75);
        const cos = Math.cos(tilt);
        const sin = Math.sin(tilt);
        let x = cx + localX * cos - localY * sin;
        let y = cy + localX * sin + localY * cos;
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distance = Math.hypot(dx, dy);
        const influence = mouse.active ? Math.max(0, 1 - distance / 120) : 0;
        const push = influence * 5;
        x += (dx / (distance || 1)) * push;
        y += (dy / (distance || 1)) * push;

        const depth = (Math.sin(particleAngle) + 1) / 2;
        const glow = 0.14 + depth * 0.42 + influence * 0.16;
        const size = particle.size * (0.55 + depth * 0.78 + influence * 0.32);
        ctx.fillStyle = `${particle.fillPrefix}${glow})`;
        if (index % 4 === 0 || influence > 0.35) {
          ctx.shadowColor = particle.glowColor;
          ctx.shadowBlur = 4 + influence * 5;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      drawArc(cx, cy, diskRx * 0.44, diskRy * 1.9, tilt + Math.PI / 2, Math.PI * 0.7, Math.PI * 1.82, "rgba(235,255,244,1)", 2.1, 0.58, 12);
      drawArc(cx, cy + scale * 0.018, diskRx * 0.78, diskRy * 0.7, tilt, Math.PI * 0.03, Math.PI * 0.98, "rgba(255,251,226,1)", 2.4, 0.36, 18);
      drawArc(cx, cy + scale * 0.06, diskRx * 1.08, diskRy * 0.88, tilt, Math.PI * 0.08, Math.PI * 0.86, "rgba(187,89,40,1)", 1.4, 0.16, 12);
      ctx.restore();

      const coreGradient = ctx.createRadialGradient(cx - scale * 0.026, cy - scale * 0.015, 0, cx, cy, scale * 0.19);
      coreGradient.addColorStop(0, "#000000");
      coreGradient.addColorStop(0.52, "#010101");
      coreGradient.addColorStop(0.7, "rgba(2,2,1,0.96)");
      coreGradient.addColorStop(0.82, "rgba(12,15,12,0.82)");
      coreGradient.addColorStop(1, "rgba(238,255,244,0.05)");
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.19, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      const shadow = ctx.createLinearGradient(0, 0, width * 0.72, height);
      shadow.addColorStop(0, "rgba(0,0,0,0.78)");
      shadow.addColorStop(0.48, "rgba(0,0,0,0.18)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      animationFrame = requestAnimationFrame(draw);
    }

    function handlePointerMove(event) {
      mouseRef.current = { x: event.clientX, y: event.clientY, active: true };
    }

    function handlePointerLeave() {
      mouseRef.current.active = false;
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <section className="black-hole-scene" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="event-horizon-glass" />
    </section>
  );
}
