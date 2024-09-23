import React, { useRef, useEffect } from 'react';
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
        const fps = 60; // Frames per second

        // Animation parameters
        const N_steps = 30; // Number of morph steps
        const spiralDuration = 5; // Time for the spiral to travel from left to right (in seconds)
        const spiralInterval = 1; // Time between spirals starting from the left (in seconds)
        const A = 25; // Amplitude of spiral effect (in pixels)
        const spiralTurns = 5; // Number of turns in the spiral
        const spiralSpeed = 1; // Speed at which the spiral moves (1 for normal speed)

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

        // Number of points to sample along the path
        const numPoints = 2000; // Increased for smoother animation

        // Initialize morph steps for each point
        const morphSteps = new Array(numPoints).fill(0); // Morph step for each point

        // Function to flatten the path into segments and sample points
        function getFlattenedPathPoints(pathData: any[], numPoints: number): Point[] {
            const segments: { length: number; points: Point[] }[] = [];
            let currentX = 0;
            let currentY = 0;
            let totalLength = 0;

            for (let cmd of pathData) {
                const code = cmd.code;
                switch (code) {
                    case 'M':
                        if (cmd.x === undefined || cmd.y === undefined) {
                            throw new Error(`'M' command is missing 'x' or 'y' property: ${JSON.stringify(cmd)}`);
                        }
                        currentX = cmd.x;
                        currentY = cmd.y;
                        break;
                    case 'C':
                        {
                            const requiredProps = ['x1', 'y1', 'x2', 'y2', 'x', 'y'];
                            for (const prop of requiredProps) {
                                if (cmd[prop] === undefined) {
                                    throw new Error(`'C' command is missing '${prop}' property: ${JSON.stringify(cmd)}`);
                                }
                            }

                            const startX = currentX;
                            const startY = currentY;
                            const steps = 50; // Increased steps for smoother curves
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
                    default:
                        console.warn(`Unsupported path command: ${cmd.code}`);
                        break;
                }
            }

            if (segments.length === 0) {
                throw new Error('No segments were generated from the pathData.');
            }

            if (totalLength === 0) {
                throw new Error('Total length of path is zero.');
            }

            // Sample points along the path
            const pathPoints: Point[] = [];
            const increment = totalLength / (numPoints - 1);
            let segmentIndex = 0;
            let segmentDistance = 0;

            for (let i = 0; i < numPoints; i++) {
                const targetDistance = increment * i;
                while (
                    segmentIndex < segments.length &&
                    segmentDistance + segments[segmentIndex].length < targetDistance
                ) {
                    segmentDistance += segments[segmentIndex].length;
                    segmentIndex++;
                }

                if (segmentIndex >= segments.length) {
                    // We've reached the end of the path
                    const lastSegment = segments[segments.length - 1];
                    const lastPoint = lastSegment.points[lastSegment.points.length - 1];
                    pathPoints.push(lastPoint);
                    continue;
                }

                const segment = segments[segmentIndex];
                const segmentStartDistance = segmentDistance;
                const segmentProgress = (targetDistance - segmentStartDistance) / segment.length;

                // Interpolate within the segment
                const points = segment.points;
                const index = segmentProgress * (points.length - 1);
                const lowerIndex = Math.floor(index);
                const upperIndex = Math.ceil(index);
                const t = index - lowerIndex;

                const p0 = points[lowerIndex];
                const p1 = points[upperIndex];

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
                const code = cmd.code;
                switch (code) {
                    case 'M':
                        currentX = cmd.x;
                        currentY = cmd.y;
                        if (!start) {
                            start = { x: currentX, y: currentY };
                        }
                        end = { x: currentX, y: currentY };
                        break;
                    case 'C':
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
          
            interpolatedPoints = [];
          
            const currentTime = t / fps; // Current time in seconds
          
            for (let i = 0; i < numPoints; i++) {
              const s = i / (numPoints - 1);
          
              let totalOffsetX = 0;
              let totalOffsetY = 0;
          
              // Determine if the spiral is affecting this point
              const spiralProgress = (currentTime % spiralDuration) / spiralDuration;
              const spiralPosition = spiralProgress * spiralSpeed; // From 0 to 1
          
              if (s >= spiralPosition && s <= spiralPosition + 0.1) {
                // Spiral is currently affecting this point
                const envelope = 1 - Math.abs(s - (spiralPosition + 0.05)) / 0.05; // Triangular envelope
                const angle = 2 * Math.PI * spiralTurns * (s - spiralPosition);
          
                const offset = A * envelope;
          
                // Calculate position based on spiral equations
                totalOffsetX = offset * Math.cos(angle);
                totalOffsetY = offset * Math.sin(angle);
          
                // Increment morph step for this point
                if (morphSteps[i] < N_steps) {
                  morphSteps[i]++;
                }
              }
          
              const morphProgress = morphSteps[i] / N_steps;
          
              // Calculate the interpolated position
              const linePoint = linePoints[i];
              const pathPoint = pathPoints[i];
          
              const x =
                linePoint.x + (pathPoint.x - linePoint.x) * morphProgress + totalOffsetX;
              const y =
                linePoint.y + (pathPoint.y - linePoint.y) * morphProgress + totalOffsetY;
          
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
          
            t += 1;
            animationFrameId = requestAnimationFrame(animate);
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
