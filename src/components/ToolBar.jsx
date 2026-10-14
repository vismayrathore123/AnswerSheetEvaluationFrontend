import { Pen, Check, X, Highlighter, MessageSquare, Eraser, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';

const TOOLS = [
  { id: 'pen', label: 'Pen', Icon: Pen },
  { id: 'tick', label: 'Tick', Icon: Check },
  { id: 'cross', label: 'Cross', Icon: X },
  { id: 'highlight', label: 'Highlighter', Icon: Highlighter },
  { id: 'comment', label: 'Comment', Icon: MessageSquare },
  { id: 'eraser', label: 'Eraser', Icon: Eraser },
];

export const PEN_COLORS = ['#d32f2f', '#1565c0', '#1b1b1b'];

export default function ToolBar({
  tool, setTool, color, setColor,
  onUndo, onRedo, canUndo, canRedo,
  zoom, setZoom, disabled,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__group">
        {TOOLS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tool ${tool === id ? 'tool--active' : ''}`}
            onClick={() => setTool(id)}
            disabled={disabled}
            title={label}
          >
            <Icon size={16} /> <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar__group">
        {PEN_COLORS.map((c) => (
          <button
            key={c}
            className={`swatch ${color === c ? 'swatch--active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            disabled={disabled}
            title="Ink colour"
            aria-label={`Ink colour ${c}`}
          />
        ))}
      </div>

      <div className="toolbar__group">
        <button className="tool" onClick={onUndo} disabled={disabled || !canUndo} title="Undo">
          <Undo2 size={16} /> <span>Undo</span>
        </button>
        <button className="tool" onClick={onRedo} disabled={disabled || !canRedo} title="Redo">
          <Redo2 size={16} /> <span>Redo</span>
        </button>
      </div>

      <div className="toolbar__group toolbar__group--right">
        <button className="icon-btn" onClick={() => setZoom((z) => Math.max(40, z - 10))} title="Zoom out">
          <ZoomOut size={18} />
        </button>
        <button className="zoom-value" onClick={() => setZoom(100)} title="Reset zoom">{zoom}%</button>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.min(250, z + 10))} title="Zoom in">
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
  );
}
