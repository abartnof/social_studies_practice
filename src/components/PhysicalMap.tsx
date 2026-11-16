import type { KeyboardEvent } from 'react';
import type { MapPin, MapRegion, MapSpec } from '../types/quiz';

export interface PhysicalMapProps {
  mapSpec: MapSpec;
  selectedPinId: string | null;
  correctPinId: string;
  isSubmitted: boolean;
  onSelectPin: (pinId: string) => void;
}

const REGION_ARIA_LABELS: Record<MapRegion, string> = {
  world: 'Physical geography map of the world',
  mediterranean: 'Physical geography map of the Mediterranean basin',
  north_america: 'Physical geography map of North America',
  east_asia: 'Physical geography map of East Asia',
  indian_ocean: 'Physical geography map of the Indian Ocean basin',
};

const LAND_STYLE = {
  fill: 'rgba(255, 255, 255, 0.06)',
  stroke: 'rgba(255, 255, 255, 0.24)',
  strokeWidth: 1.2,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

const WATER_INLAND_STYLE = {
  fill: '#000000',
  stroke: 'rgba(255, 255, 255, 0.22)',
  strokeWidth: 1,
  strokeLinejoin: 'round' as const,
};

const RIVER_STYLE = {
  fill: 'none',
  stroke: 'rgba(255, 255, 255, 0.20)',
  strokeWidth: 1.05,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const RIDGE_STYLE = {
  fill: 'none',
  stroke: 'rgba(255, 255, 255, 0.16)',
  strokeWidth: 1,
  strokeDasharray: '2 3',
  strokeLinecap: 'round' as const,
};

function renderGeography(region: MapRegion) {
  switch (region) {
    case 'world':
      return (
        <g aria-hidden="true">
          {/* Faint Equator & Tropics */}
          <line x1="0" y1="122" x2="358" y2="122" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" strokeWidth="0.8" />
          {/* North America */}
          <path
            {...LAND_STYLE}
            d="M 18 46 L 42 36 L 76 28 L 106 34 L 116 48 L 102 64 L 108 74 L 94 86 L 80 88 L 76 102 L 86 112 L 78 116 L 66 104 L 54 92 L 46 74 L 30 62 L 16 56 Z"
          />
          {/* Greenland */}
          <path {...LAND_STYLE} d="M 114 14 L 138 12 L 146 26 L 130 38 L 116 30 Z" />
          {/* South America */}
          <path
            {...LAND_STYLE}
            d="M 86 118 L 104 118 L 124 132 L 130 148 L 116 170 L 102 198 L 92 204 L 88 182 L 82 152 L 78 132 Z"
          />
          {/* Eurasia + Africa (Old World) */}
          <path
            {...LAND_STYLE}
            d="M 164 56 L 178 44 L 196 36 L 218 30 L 254 24 L 296 28 L 330 36 L 344 46 L 328 58 L 314 68 L 306 86 L 294 98 L 284 114 L 274 106 L 264 116 L 252 104 L 240 118 L 232 102 L 222 96 L 212 106 L 200 100 L 196 86 L 182 82 L 166 78 L 162 66 Z"
          />
          {/* Africa */}
          <path
            {...LAND_STYLE}
            d="M 164 88 L 188 86 L 210 92 L 222 110 L 234 122 L 226 144 L 216 168 L 202 184 L 192 178 L 186 154 L 180 132 L 162 122 L 154 104 Z"
          />
          {/* Madagascar */}
          <path {...LAND_STYLE} d="M 232 156 L 238 152 L 236 172 L 229 174 Z" />
          {/* British Isles & Japan */}
          <path {...LAND_STYLE} d="M 156 50 L 162 48 L 162 60 L 155 60 Z" />
          <path {...LAND_STYLE} d="M 320 62 L 328 56 L 330 68 L 320 76 Z" />
          {/* Maritime SE Asia */}
          <path {...LAND_STYLE} d="M 284 126 L 296 128 L 294 136 L 282 134 Z" />
          <path {...LAND_STYLE} d="M 302 128 L 314 132 L 312 140 L 300 138 Z" />
          {/* Australia */}
          <path
            {...LAND_STYLE}
            d="M 290 156 L 314 150 L 332 162 L 330 182 L 310 188 L 288 180 L 284 166 Z"
          />
        </g>
      );

    case 'mediterranean':
      return (
        <g aria-hidden="true">
          {/* Southern Europe & Anatolia */}
          <path
            {...LAND_STYLE}
            d="M 0 0 L 358 0 L 358 118 L 324 114 L 288 106 L 258 98 L 244 82 L 236 62 L 216 62 L 208 84 L 196 102 L 182 96 L 176 74 L 156 54 L 138 64 L 146 92 L 164 114 L 154 124 L 138 104 L 124 72 L 104 62 L 82 68 L 68 88 L 46 106 L 20 104 L 12 82 L 0 78 Z"
          />
          {/* Black Sea cutout */}
          <path
            {...WATER_INLAND_STYLE}
            d="M 244 26 L 296 20 L 326 36 L 316 56 L 266 60 L 240 46 Z"
          />
          {/* Levant & Arabian Peninsula */}
          <path
            {...LAND_STYLE}
            d="M 294 118 L 358 120 L 358 220 L 312 220 L 286 176 L 274 152 L 288 134 Z"
          />
          {/* North Africa */}
          <path
            {...LAND_STYLE}
            d="M 0 124 L 38 118 L 88 124 L 118 120 L 134 134 L 162 152 L 196 154 L 238 148 L 262 152 L 280 194 L 294 220 L 0 220 Z"
          />
          {/* Sicily, Crete, Cyprus */}
          <path {...LAND_STYLE} d="M 140 124 L 152 124 L 148 134 L 136 130 Z" />
          <path {...LAND_STYLE} d="M 206 124 L 228 124 L 226 130 L 206 129 Z" />
          <path {...LAND_STYLE} d="M 268 116 L 282 114 L 280 121 L 266 121 Z" />
          {/* Nile River & Delta */}
          <path {...RIVER_STYLE} d="M 254 220 L 252 186 L 254 162 L 248 150 M 254 162 L 262 152" />
          {/* Tigris / Euphrates hint */}
          <path {...RIVER_STYLE} d="M 326 98 L 340 128 L 354 152" />
        </g>
      );

    case 'north_america':
      return (
        <g aria-hidden="true">
          {/* Continental North America */}
          <path
            {...LAND_STYLE}
            d="M 48 0 L 336 0 L 336 28 L 306 48 L 288 66 L 272 88 L 252 116 L 238 146 L 248 176 L 238 184 L 228 164 L 214 156 L 188 160 L 166 172 L 160 194 L 176 212 L 154 220 L 122 200 L 106 176 L 94 162 L 82 138 L 62 126 L 44 96 L 40 62 L 44 26 Z"
          />
          {/* Great Lakes */}
          <path {...WATER_INLAND_STYLE} d="M 186 44 L 210 38 L 214 48 L 190 54 Z" />
          <path {...WATER_INLAND_STYLE} d="M 204 56 L 212 54 L 214 76 L 204 76 Z" />
          <path {...WATER_INLAND_STYLE} d="M 216 54 L 232 56 L 230 72 L 218 70 Z" />
          <path {...WATER_INLAND_STYLE} d="M 224 76 L 242 72 L 242 80 L 224 82 Z" />
          <path {...WATER_INLAND_STYLE} d="M 244 66 L 260 62 L 260 70 L 244 72 Z" />
          {/* Mississippi, Ohio, Missouri, Rio Grande */}
          <path {...RIVER_STYLE} d="M 186 58 L 184 96 L 188 124 L 184 158" />
          <path {...RIVER_STYLE} d="M 186 108 L 214 96 L 236 86" />
          <path {...RIVER_STYLE} d="M 128 62 L 156 84 L 184 102" />
          <path {...RIVER_STYLE} d="M 122 126 L 142 154 L 162 174" />
          {/* Appalachian Ridge */}
          <path {...RIDGE_STYLE} d="M 284 56 L 262 84 L 240 108 L 220 132" />
        </g>
      );

    case 'east_asia':
      return (
        <g aria-hidden="true">
          {/* Mainland East Asia + Korean Peninsula */}
          <path
            {...LAND_STYLE}
            d="M 0 0 L 248 0 L 242 28 L 226 48 L 218 68 L 228 84 L 232 108 L 222 114 L 212 96 L 202 82 L 184 74 L 168 84 L 184 96 L 170 110 L 186 132 L 182 158 L 162 184 L 136 196 L 116 208 L 96 220 L 0 220 Z"
          />
          {/* Japanese Archipelago */}
          <path {...LAND_STYLE} d="M 294 22 L 314 26 L 312 46 L 292 48 Z" />
          <path {...LAND_STYLE} d="M 296 54 L 308 60 L 300 94 L 272 114 L 258 112 L 278 92 L 290 74 Z" />
          <path {...LAND_STYLE} d="M 248 116 L 260 116 L 256 134 L 244 130 Z" />
          {/* Taiwan & Hainan */}
          <path {...LAND_STYLE} d="M 192 162 L 200 162 L 198 182 L 190 180 Z" />
          <path {...LAND_STYLE} d="M 126 202 L 138 202 L 136 212 L 124 210 Z" />
          {/* Yellow River (Huang He) */}
          <path {...RIVER_STYLE} d="M 52 96 L 94 94 L 106 72 L 130 72 L 132 96 L 172 88" />
          {/* Yangtze River (Chang Jiang) */}
          <path {...RIVER_STYLE} d="M 42 126 L 82 142 L 122 138 L 154 134 L 186 132" />
          {/* Tibetan Plateau / Himalaya Ridge */}
          <path {...RIDGE_STYLE} d="M 14 148 L 46 156 L 78 164" />
        </g>
      );

    case 'indian_ocean':
      return (
        <g aria-hidden="true">
          {/* East Africa */}
          <path
            {...LAND_STYLE}
            d="M 0 64 L 32 78 L 54 104 L 78 106 L 62 134 L 46 164 L 38 198 L 28 220 L 0 220 Z"
          />
          {/* Madagascar */}
          <path {...LAND_STYLE} d="M 62 164 L 72 160 L 68 194 L 56 196 Z" />
          {/* Arabian Peninsula & Persian Gulf */}
          <path
            {...LAND_STYLE}
            d="M 26 0 L 128 0 L 124 26 L 106 38 L 116 56 L 98 78 L 62 90 L 46 72 L 32 34 Z"
          />
          {/* Indian Subcontinent & Bay of Bengal */}
          <path
            {...LAND_STYLE}
            d="M 134 0 L 256 0 L 258 74 L 244 82 L 222 76 L 198 106 L 186 136 L 176 122 L 164 90 L 152 68 L 138 56 L 146 30 Z"
          />
          {/* Sri Lanka */}
          <path {...LAND_STYLE} d="M 192 132 L 198 134 L 196 146 L 190 144 Z" />
          {/* Malay Peninsula & Sumatra / Java (Malacca Strait) */}
          <path
            {...LAND_STYLE}
            d="M 262 66 L 282 72 L 286 106 L 302 132 L 296 144 L 280 124 L 270 96 Z"
          />
          <path {...LAND_STYLE} d="M 268 128 L 296 156 L 288 166 L 260 138 Z" />
          <path {...LAND_STYLE} d="M 298 168 L 336 172 L 334 180 L 296 176 Z" />
          {/* Indus & Ganges Rivers */}
          <path {...RIVER_STYLE} d="M 164 16 L 154 40 L 148 58" />
          <path {...RIVER_STYLE} d="M 182 26 L 208 48 L 228 66" />
          {/* Himalayan Ridge */}
          <path {...RIDGE_STYLE} d="M 164 14 L 204 28 L 244 36" />
        </g>
      );
  }
}

interface PinPill {
  pin: MapPin;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
}

function overlapsBoxesOrDots(
  x: number,
  y: number,
  w: number,
  h: number,
  placed: PinPill[],
  allPins: MapPin[],
): boolean {
  const pad = 5;
  if (
    placed.some(
      (p) =>
        x < p.boxX + p.boxW + pad &&
        x + w + pad > p.boxX &&
        y < p.boxY + p.boxH + pad &&
        y + h + pad > p.boxY,
    )
  ) {
    return true;
  }
  const dotPad = 7;
  return allPins.some(
    (dot) =>
      dot.x >= x - dotPad &&
      dot.x <= x + w + dotPad &&
      dot.y >= y - dotPad &&
      dot.y <= y + h + dotPad,
  );
}

function computePinPills(pins: MapPin[]): PinPill[] {
  const placed: PinPill[] = [];
  const boxH = 24;

  for (const pin of pins) {
    const boxW = Math.min(346, Math.max(56, pin.label.length * 7.8 + 24));
    const clampX = (x: number) => Math.max(6, Math.min(352 - boxW, x));
    const clampY = (y: number) => Math.max(6, Math.min(214 - boxH, y));

    const candidates: Array<[number, number]> = [
      // Above or below the dot
      [clampX(pin.x - boxW / 2), clampY(pin.y - boxH - 12)],
      [clampX(pin.x - boxW / 2), clampY(pin.y + 12)],
      // Right or left of the dot
      [clampX(pin.x + 12), clampY(pin.y - boxH / 2)],
      [clampX(pin.x - boxW - 12), clampY(pin.y - boxH / 2)],
      // Diagonal offsets
      [clampX(pin.x + 12), clampY(pin.y - boxH - 10)],
      [clampX(pin.x + 12), clampY(pin.y + 10)],
      [clampX(pin.x - boxW - 12), clampY(pin.y - boxH - 10)],
      [clampX(pin.x - boxW - 12), clampY(pin.y + 10)],
      // Further vertical offsets
      [clampX(pin.x - boxW / 2), clampY(pin.y + boxH + 18)],
      [clampX(pin.x - boxW / 2), clampY(pin.y - boxH * 2 - 18)],
    ];

    let boxX = candidates[0][0];
    let boxY = candidates[0][1];

    for (const [cx, cy] of candidates) {
      if (!overlapsBoxesOrDots(cx, cy, boxW, boxH, placed, pins)) {
        boxX = cx;
        boxY = cy;
        break;
      }
    }

    placed.push({ pin, boxX, boxY, boxW, boxH });
  }

  return placed;
}

export function PhysicalMap({
  mapSpec,
  selectedPinId,
  correctPinId,
  isSubmitted,
  onSelectPin,
}: PhysicalMapProps) {
  const handleKeyDown = (e: KeyboardEvent<SVGGElement>, pinId: string) => {
    if (isSubmitted) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectPin(pinId);
    }
  };

  const pills = computePinPills(mapSpec.pins);

  return (
    <div
      style={{
        width: '100%',
        background: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 358 220"
        width="100%"
        role="img"
        aria-label={REGION_ARIA_LABELS[mapSpec.region]}
        style={{ display: 'block', background: '#000000', touchAction: 'manipulation' }}
      >
        {renderGeography(mapSpec.region)}

        {pills.map(({ pin, boxX, boxY, boxW, boxH }) => {
          const isSelected = pin.id === selectedPinId;
          const isCorrect = pin.id === correctPinId;

          let dotColor = '#FFFFFF';
          let lineColor = 'rgba(255, 255, 255, 0.55)';
          let fill = '#000000';
          let stroke = '#FFFFFF';
          let strokeWidth = 1;
          let textColor = '#FFFFFF';

          if (!isSubmitted) {
            if (isSelected) {
              dotColor = '#FFFFFF';
              lineColor = '#FFFFFF';
              fill = '#FFFFFF';
              stroke = '#FFFFFF';
              strokeWidth = 1.25;
              textColor = '#000000';
            }
          } else if (isCorrect) {
            dotColor = '#39FF88';
            lineColor = '#39FF88';
            fill = '#000000';
            stroke = '#39FF88';
            strokeWidth = 1.25;
            textColor = '#39FF88';
          } else if (isSelected) {
            dotColor = '#FF4D6D';
            lineColor = '#FF4D6D';
            fill = '#000000';
            stroke = '#FF4D6D';
            strokeWidth = 1.25;
            textColor = '#FF4D6D';
          } else {
            dotColor = 'rgba(255, 255, 255, 0.4)';
            lineColor = 'rgba(255, 255, 255, 0.28)';
            fill = '#000000';
            stroke = 'rgba(255, 255, 255, 0.4)';
            strokeWidth = 1;
            textColor = 'rgba(255, 255, 255, 0.4)';
          }

          // Nearest point on text box edge to (pin.x, pin.y)
          const edgeX = Math.max(boxX, Math.min(boxX + boxW, pin.x));
          const edgeY = Math.max(boxY, Math.min(boxY + boxH, pin.y));

          return (
            <g
              key={pin.id}
              role="button"
              tabIndex={isSubmitted ? -1 : 0}
              aria-label={pin.label}
              aria-pressed={isSelected}
              onClick={() => {
                if (!isSubmitted) onSelectPin(pin.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, pin.id)}
              style={{
                cursor: isSubmitted ? 'default' : 'pointer',
                outline: 'none',
              }}
            >
              {/* Leader line from exact dot to nearest box edge */}
              <line
                x1={pin.x}
                y1={pin.y}
                x2={edgeX}
                y2={edgeY}
                stroke={lineColor}
                strokeWidth={1}
              />
              {/* Generous touch hit-targets on both dot and pill */}
              <circle cx={pin.x} cy={pin.y} r={14} fill="transparent" />
              <rect
                x={boxX - 5}
                y={boxY - 7}
                width={boxW + 10}
                height={boxH + 14}
                rx={6}
                fill="transparent"
              />
              {/* Exact geographic location dot */}
              <circle cx={pin.x} cy={pin.y} r={3.5} fill={dotColor} />
              {/* Visible label box */}
              <rect
                x={boxX}
                y={boxY}
                width={boxW}
                height={boxH}
                rx={4}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
              <text
                x={boxX + boxW / 2}
                y={boxY + boxH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                fontSize="10.5"
                fontWeight="600"
                fontFamily="inherit"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
