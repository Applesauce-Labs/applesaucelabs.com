import React, { useRef, useEffect } from 'react';
import pathData from './pathData.json';

import styles from './AnimatedTitle.module.css';


interface Point {
  initialX: number;
  initialY: number;
  finalX: number;
  finalY: number;
  morphStep: number;
  currentX: number;
  currentY: number;
}

const AnimatedTitle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const morphSteps = 10;
    const spiralDuration = 5000; // milliseconds
    const amplitude = 20;
    const spiralTurns = 3;
    const spiralWidth = 50;
    const numPoints = 1000; // Adjust as needed

    // Compute pathPoints from pathData
    function computePathPoints(pathData: any[]): { x: number; y: number }[] {
      const pathPoints: { x: number; y: number }[] = [];
      let currentX = 0;
      let currentY = 0;
      pathData.forEach((command) => {
        if (command.code === 'M') {
          // Move to
          currentX = command.x;
          currentY = command.y;
          pathPoints.push({ x: currentX, y: currentY });
        } else if (command.code === 'C') {
          // Cubic Bezier curve
          const x0 = currentX;
          const y0 = currentY;
          const x1 = command.x1;
          const y1 = command.y1;
          const x2 = command.x2;
          const y2 = command.y2;
          const x3 = command.x;
          const y3 = command.y;

          // Sample points along the curve
          const numSamples = 20; // Adjust as needed
          for (let t = 0; t <= 1; t += 1 / numSamples) {
            const x = cubicBezier(x0, x1, x2, x3, t);
            const y = cubicBezier(y0, y1, y2, y3, t);
            pathPoints.push({ x, y });
          }

          currentX = x3;
          currentY = y3;
        }
        // Handle other commands if present
      });
      return pathPoints;
    }

    function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
      const c0 = (1 - t) ** 3;
      const c1 = 3 * (1 - t) ** 2 * t;
      const c2 = 3 * (1 - t) * t ** 2;
      const c3 = t ** 3;
      return c0 * p0 + c1 * p1 + c2 * p2 + c3 * p3;
    }

    const pathPoints = computePathPoints(pathData);

    // Compute bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    pathPoints.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const pathWidth = maxX - minX;
    const pathHeight = maxY - minY;

    // Compute scale and offsets
    const scaleX = (canvasWidth * 0.8) / pathWidth;
    const scaleY = (canvasHeight * 0.8) / pathHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvasWidth - pathWidth * scale) / 2 - minX * scale;
    const offsetY = (canvasHeight - pathHeight * scale) / 2 - minY * scale;

    // Adjust pathPoints
    pathPoints.forEach((p) => {
      p.x = p.x * scale + offsetX;
      p.y = p.y * scale + offsetY;
    });

    // Set lineY to match the starting Y position of the path
    const lineY = pathPoints[0].y;

    // Initialize points along the horizontal line aligned with the path
    const points: Point[] = [];

    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * canvasWidth;
      const y = lineY;
      points.push({
        initialX: x,
        initialY: y,
        finalX: 0, // To be set
        finalY: 0, // To be set
        morphStep: 0,
        currentX: x,
        currentY: y,
      });
    }

    // Compute cumulative lengths
    const cumulativeLengths: number[] = [0];
    for (let i = 1; i < pathPoints.length; i++) {
      const dx = pathPoints[i].x - pathPoints[i - 1].x;
      const dy = pathPoints[i].y - pathPoints[i - 1].y;
      const distance = Math.hypot(dx, dy);
      cumulativeLengths.push(cumulativeLengths[i - 1] + distance);
    }

    const totalLength = cumulativeLengths[cumulativeLengths.length - 1];

    // Assign final positions to points
    for (let i = 0; i < numPoints; i++) {
      const targetLength = (i / (numPoints - 1)) * totalLength;
      // Find index j
      let j = 0;
      while (j < cumulativeLengths.length - 1 && cumulativeLengths[j + 1] < targetLength) {
        j++;
      }
      const lengthBefore = cumulativeLengths[j];
      const lengthAfter = cumulativeLengths[j + 1];
      const t = (targetLength - lengthBefore) / (lengthAfter - lengthBefore);

      const x = pathPoints[j].x * (1 - t) + pathPoints[j + 1].x * t;
      const y = pathPoints[j].y * (1 - t) + pathPoints[j + 1].y * t;

      points[i].finalX = x;
      points[i].finalY = y;
    }

    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Compute spiral position
      const spiralProgress = (elapsed % spiralDuration) / spiralDuration;
      const spiralX = spiralProgress * canvasWidth;

      // Draw points
      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        // Base position based on morphStep
        const t = point.morphStep / morphSteps;
        const baseX = point.initialX * (1 - t) + point.finalX * t;
        const baseY = point.initialY * (1 - t) + point.finalY * t;

        // Check if spiral is over the point
        const dx = point.initialX - spiralX;
        if (Math.abs(dx) < spiralWidth / 2) {
          // Spiral is over the point

          // Apply temporary displacement
          const angle = ((dx / (spiralWidth / 2)) * Math.PI * spiralTurns);
          const spiralEffect = Math.sin(angle) * amplitude;
          const displacedY = baseY + spiralEffect;

          // Update point position
          point.currentX = baseX;
          point.currentY = displacedY;

          // Advance morphStep
          if (point.morphStep < morphSteps) {
            point.morphStep += 1;
          }
        } else {
          // Spiral not over point
          point.currentX = baseX;
          point.currentY = baseY;
        }

        // Draw point
        ctx.beginPath();
        ctx.arc(point.currentX, point.currentY, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Animated title: Applesauce Labs"
        role="img"
      />
    </div>
  );
};

export default AnimatedTitle;
