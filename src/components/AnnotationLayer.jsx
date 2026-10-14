import { useRef, useState } from 'react';
import { uid } from '../utils/files';

const clamp = (v) => Math.min(1, Math.max(0, v));

/**
 * Transparent SVG placed on top of one scanned page.
 * Everything is stored with positions between 0 and 1 (not pixels),
 * so the drawing stays correct at any zoom level.
 */
export default function AnnotationLayer({ page, pageIndex, annotations, tool, color, disabled, onAdd, onErase }) {
  const svgRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const erasedRef = useRef(new Set());
  const [erased, setErased] = useState(new Set());

  const W = page.width;
  const H = page.height;

  const getPoint = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  };

  const eraseAt = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const id = el?.closest?.('[data-ann-id]')?.getAttribute('data-ann-id');
    if (id && !erasedRef.current.has(id)) {
      erasedRef.current.add(id);
      setErased(new Set(erasedRef.current));
    }
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    const p = getPoint(e);

    if (tool === 'pen' || tool === 'highlight') {
      svgRef.current.setPointerCapture(e.pointerId);
      setDraft({ type: tool, color: tool === 'highlight' ? '#ffe600' : color, points: [p] });
    } else if (tool === 'tick' || tool === 'cross') {
      onAdd({ id: uid(), page: pageIndex, type: tool, color, x: p.x, y: p.y });
    } else if (tool === 'comment') {
      const text = window.prompt('Write a comment for this spot:');
      if (text && text.trim()) onAdd({ id: uid(), page: pageIndex, type: 'comment', color, x: p.x, y: p.y, text: text.trim() });
    } else if (tool === 'eraser') {
      svgRef.current.setPointerCapture(e.pointerId);
      erasedRef.current = new Set();
      setErased(new Set());
      eraseAt(e);
    }
  };

  const onPointerMove = (e) => {
    if (draft) {
      const p = getPoint(e);
      setDraft((d) => ({ ...d, points: [...d.points, p] }));
    } else if (tool === 'eraser' && e.buttons === 1) {
      eraseAt(e);
    }
  };

  const onPointerUp = () => {
    if (draft) {
      if (draft.points.length > 1) onAdd({ id: uid(), page: pageIndex, ...draft });
      setDraft(null);
    }
    if (erasedRef.current.size) {
      onErase([...erasedRef.current]);
      erasedRef.current = new Set();
      setErased(new Set());
    }
  };

  const toPoints = (pts) => pts.map((p) => `${p.x * W},${p.y * H}`).join(' ');

  const renderOne = (a, isDraft = false) => {
    const key = a.id ?? 'draft';
    if (a.type === 'pen' || a.type === 'highlight') {
      const hl = a.type === 'highlight';
      const pts = toPoints(a.points);
      return (
        <g key={key} data-ann-id={a.id}>
          {!isDraft && <polyline points={pts} fill="none" stroke="transparent" strokeWidth={W * 0.02} strokeLinecap="round" />}
          <polyline
            points={pts} fill="none" stroke={a.color} strokeLinecap="round" strokeLinejoin="round"
            strokeWidth={hl ? W * 0.022 : W * 0.004} opacity={hl ? 0.35 : 1}
          />
        </g>
      );
    }
    const cx = a.x * W;
    const cy = a.y * H;
    const s = W * 0.024;
    if (a.type === 'tick') {
      return (
        <g key={key} data-ann-id={a.id}>
          <circle cx={cx} cy={cy} r={s} fill="transparent" />
          <polyline
            points={`${cx - s * 0.6},${cy} ${cx - s * 0.15},${cy + s * 0.5} ${cx + s * 0.7},${cy - s * 0.6}`}
            fill="none" stroke={a.color} strokeWidth={W * 0.0055} strokeLinecap="round" strokeLinejoin="round"
          />
        </g>
      );
    }
    if (a.type === 'cross') {
      const d = s * 0.5;
      return (
        <g key={key} data-ann-id={a.id}>
          <circle cx={cx} cy={cy} r={s} fill="transparent" />
          <path d={`M${cx - d},${cy - d} L${cx + d},${cy + d} M${cx + d},${cy - d} L${cx - d},${cy + d}`}
            stroke={a.color} strokeWidth={W * 0.0055} strokeLinecap="round" fill="none" />
        </g>
      );
    }
    if (a.type === 'comment') {
      return (
        <g key={key} data-ann-id={a.id}>
          <text x={cx} y={cy} fontSize={W * 0.02} fontWeight="600" fill={a.color}
            stroke="#fff" strokeWidth={W * 0.004} paintOrder="stroke" fontFamily="IBM Plex Sans, Arial, sans-serif">
            {a.text}
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <svg
      ref={svgRef}
      className={`annot annot--${tool} ${disabled ? 'annot--disabled' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {annotations.filter((a) => !erased.has(a.id)).map((a) => renderOne(a))}
      {draft && renderOne(draft, true)}
    </svg>
  );
}
