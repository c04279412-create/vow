'use client';

import React, { useState } from 'react';

export default function RevenueChart({ dateRange = '30d', totalSales = 36560 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Daily data points for the trend curve
  const dataPoints = [
    { date: '10-01', amount: 3200, label: 'Oct 01' },
    { date: '10-02', amount: 4800, label: 'Oct 02' },
    { date: '10-03', amount: 8900, label: 'Oct 03' },
    { date: '10-04', amount: 5600, label: 'Oct 04' },
    { date: '10-05', amount: 12400, label: 'Oct 05' },
    { date: '10-06', amount: 7200, label: 'Oct 06' },
    { date: '10-07', amount: 9600, label: 'Oct 07' },
  ];

  const maxVal = Math.max(...dataPoints.map((d) => d.amount)) * 1.15;
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = (index, value) => {
    const x = paddingX + (index / (dataPoints.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (value / maxVal) * (height - 2 * paddingY);
    return { x, y };
  };

  const points = dataPoints.map((d, i) => getCoordinates(i, d.amount));

  // Build smooth bezier curve path
  const buildSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full relative">
      {/* Interactive Tooltip Overlay */}
      {hoveredPoint && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 bg-[#1C1917] text-white rounded-lg shadow-xl border border-[#B5936C] text-xs font-mono"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          <div className="font-sans font-bold text-[#E3C677]">{hoveredPoint.label}</div>
          <div className="font-bold">PKR {hoveredPoint.amount.toLocaleString()}</div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-56 sm:h-64 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B5936C" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#C59A27" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B5936C" />
            <stop offset="50%" stopColor="#C59A27" />
            <stop offset="100%" stopColor="#A47A1A" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - paddingY - ratio * (height - 2 * paddingY);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E7E5E4"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={y + 3}
                textAnchor="end"
                className="fill-stone-400 text-[10px] font-mono select-none"
              >
                {Math.round((ratio * maxVal) / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#revenueGradient)" />

        {/* Smooth Curved Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {points.map((p, i) => {
          const d = dataPoints[i];
          const isHovered = hoveredPoint?.date === d.date;
          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ ...d, ...p })} onMouseLeave={() => setHoveredPoint(null)}>
              {/* Outer halo */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 8 : 5}
                fill={isHovered ? '#B5936C' : '#FFFFFF'}
                stroke="#B5936C"
                strokeWidth="2.5"
                className="transition-all duration-150"
              />
              {/* X-axis date labels */}
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-stone-500 text-[11px] font-mono select-none"
              >
                {d.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
