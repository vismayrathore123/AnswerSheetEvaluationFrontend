import { FileUp } from 'lucide-react';
import AnnotationLayer from './AnnotationLayer';

export default function AnswerCopyViewer({ copy, annotations, tool, color, zoom, disabled, onCommit, onPick }) {
  if (!copy) {
    return (
      <div className="viewer viewer--empty">
        <div className="empty">
          <FileUp size={34} />
          <p>No answer copy yet. Scanned copies can be PDF, JPG or PNG.</p>
          <button className="btn btn--primary" onClick={onPick}>Choose answer copies</button>
        </div>
      </div>
    );
  }

  const addOne = (ann) => onCommit([...annotations, ann]);
  const eraseMany = (ids) => onCommit(annotations.filter((a) => !ids.includes(a.id)));

  return (
    <div className="viewer">
      <div className="pages" style={{ width: `${zoom}%` }}>
        {copy.pages.map((page, i) => (
          <div className="page" key={i}>
            <div className="page__label">Page {i + 1} of {copy.pages.length}</div>
            <div className="page__sheet">
              <img src={page.src} alt={`${copy.barcode} page ${i + 1}`} draggable={false} />
              <AnnotationLayer
                page={page}
                pageIndex={i}
                annotations={annotations.filter((a) => a.page === i)}
                tool={tool}
                color={color}
                disabled={disabled}
                onAdd={addOne}
                onErase={eraseMany}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
