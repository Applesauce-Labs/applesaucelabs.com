import React, { useRef, useEffect } from 'react';
// Import the parsed path data from your SVG
import pathData from './pathData.json';

interface Point {
  x: number;
  y: number;
}

const AnimatedTitle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let t = 0;
    const animationDuration = 30 * 60; // 30 seconds at 60fps

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300; // Adjust canvas height as needed
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Helper functions for Bezier curves
    function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number) {
      const u = 1 - t;
      return (
        u * u * u * p0 +
        3 * u * u * t * p1 +
        3 * u * t * t * p2 +
        t * t * t * p3
      );
    }

    function quadraticBezier(p0: number, p1: number, p2: number, t: number) {
      const u = 1 - t;
      return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    }

    // Function to flatten the path into segments and sample points
    function getFlattenedPathPoints(pathData: any[], numPoints: number): Point[] {
      const segments: { length: number; points: Point[] }[] = [];
      let currentX = 0;
      let currentY = 0;
      let totalLength = 0;

      for (let cmd of pathData) {
        switch (cmd.code) {
          case 'M':
            currentX = cmd.x;
            currentY = cmd.y;
            break;
          case 'L':
            {
              const startX = currentX;
              const startY = currentY;
              const endX = cmd.x;
              const endY = cmd.y;
              const length = Math.hypot(endX - startX, endY - startY);
              segments.push({
                length,
                points: [
                  { x: startX, y: startY },
                  { x: endX, y: endY },
                ],
              });
              totalLength += length;
              currentX = endX;
              currentY = endY;
            }
            break;
          case 'C':
            {
              const startX = currentX;
              const startY = currentY;
              const steps = 20; // Increase for smoother curves
              const points: Point[] = [];
              let prevX = startX;
              let prevY = startY;
              let segmentLength = 0;

              for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const x = cubicBezier(currentX, cmd.x1, cmd.x2, cmd.x, t);
                const y = cubicBezier(currentY, cmd.y1, cmd.y2, cmd.y, t);
                segmentLength += Math.hypot(x - prevX, y - prevY);
                points.push({ x, y });
                prevX = x;
                prevY = y;
              }
              segments.push({
                length: segmentLength,
                points: [{ x: startX, y: startY }, ...points],
              });
              totalLength += segmentLength;
              currentX = cmd.x;
              currentY = cmd.y;
            }
            break;
          case 'Q':
            {
              const startX = currentX;
              const startY = currentY;
              const steps = 20;
              const points: Point[] = [];
              let prevX = startX;
              let prevY = startY;
              let segmentLength = 0;

              for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const x = quadraticBezier(currentX, cmd.x1, cmd.x, t);
                const y = quadraticBezier(currentY, cmd.y1, cmd.y, t);
                segmentLength += Math.hypot(x - prevX, y - prevY);
                points.push({ x, y });
                prevX = x;
                prevY = y;
              }
              segments.push({
                length: segmentLength,
                points: [{ x: startX, y: startY }, ...points],
              });
              totalLength += segmentLength;
              currentX = cmd.x;
              currentY = cmd.y;
            }
            break;
          case 'Z':
            // Handle closing the path if necessary
            break;
          default:
            break;
        }
      }

      // Sample points along the path
      const pathPoints: Point[] = [];
      const increment = totalLength / (numPoints - 1);
      let distanceCovered = 0;
      let segmentIndex = 0;
      let segmentDistance = 0;

      for (let i = 0; i < numPoints; i++) {
        const targetDistance = increment * i;
        while (segmentIndex < segments.length && segmentDistance + segments[segmentIndex].length < targetDistance) {
          segmentDistance += segments[segmentIndex].length;
          segmentIndex++;
        }

        if (segmentIndex >= segments.length) {
          // We've reached the end of the path
          const lastPoint = segments[segments.length - 1].points.slice(-1)[0];
          pathPoints.push(lastPoint);
          continue;
        }

        const segment = segments[segmentIndex];
        const segmentStartDistance = segmentDistance;
        const segmentProgress = (targetDistance - segmentStartDistance) / segment.length;

        // Interpolate within the segment
        const points = segment.points;
        const segmentPointIndex = Math.floor(segmentProgress * (points.length - 1));
        const t = (segmentProgress * (points.length - 1)) - segmentPointIndex;

        const p0 = points[segmentPointIndex];
        const p1 = points[segmentPointIndex + 1];

        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;

        pathPoints.push({ x, y });
      }

      return pathPoints;
    }

    // Get the starting and ending points of the path
    function getPathStartEndPoints(pathData: any[]): { start: Point; end: Point } {
      let start: Point | null = null;
      let end: Point | null = null;
      let currentX = 0;
      let currentY = 0;

      for (let cmd of pathData) {
        switch (cmd.code) {
          case 'M':
            currentX = cmd.x;
            currentY = cmd.y;
            if (!start) {
              start = { x: currentX, y: currentY };
            }
            end = { x: currentX, y: currentY };
            break;
          case 'L':
          case 'C':
          case 'Q':
            currentX = cmd.x;
            currentY = cmd.y;
            end = { x: currentX, y: currentY };
            break;
          default:
            break;
        }
      }

      if (!start || !end) {
        throw new Error('Unable to determine start or end point of the path');
      }

      return { start, end };
    }

    const numPoints = 500; // Number of points to sample along the path
    let pathPoints: Point[] = [];
    let linePoints: Point[] = [];
    let interpolatedPoints: Point[] = [];

    // Calculate path points and line points
    try {
      pathPoints = getFlattenedPathPoints(pathData, numPoints);

      const { start, end } = getPathStartEndPoints(pathData);

      // Generate straight line points
      linePoints = [];
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        linePoints.push({ x, y });
      }
    } catch (error) {
      console.error('Error processing path data:', error);
      return;
    }

    const { minX, minY, maxX, maxY } = calculateBoundingBox(pathPoints);
    const pathWidth = maxX - minX;
    const pathHeight = maxY - minY;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.save();

      // Scale to fit canvas width
      const scale = canvas.width / pathWidth;
      ctx.scale(scale, scale);

      // Translate to center vertically
      const verticalOffset = (canvas.height / scale - pathHeight) / 2;
      ctx.translate(-minX, verticalOffset - minY);

      // Animation progress
      let progress = t / animationDuration; // Goes from 0 to 1 over 30 seconds
      if (progress > 1) progress = 1;

      // Interpolate between linePoints and pathPoints
      interpolatedPoints = [];
      for (let i = 0; i < numPoints; i++) {
        const linePoint = linePoints[i];
        const pathPoint = pathPoints[i];

        const x = linePoint.x + (pathPoint.x - linePoint.x) * progress;
        const y = linePoint.y + (pathPoint.y - linePoint.y) * progress;

        interpolatedPoints.push({ x, y });
      }

      // Draw the interpolated path
      ctx.beginPath();
      ctx.moveTo(interpolatedPoints[0].x, interpolatedPoints[0].y);

      for (let i = 1; i < interpolatedPoints.length; i++) {
        ctx.lineTo(interpolatedPoints[i].x, interpolatedPoints[i].y);
      }

      ctx.stroke();
      ctx.restore();

      if (progress < 1) {
        t += 1;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Function to calculate the bounding box of points
    function calculateBoundingBox(points: Point[]) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (let point of points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }

      return { minX, minY, maxX, maxY };
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '300px' }}
      aria-label="Animated title"
      role="img"
    />
  );
};

export default AnimatedTitle;
