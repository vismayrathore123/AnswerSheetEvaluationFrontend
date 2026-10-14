import { PanelLeftClose, FileText } from 'lucide-react';

export default function QuestionPaperPanel({ paper, onPick, onCollapse }) {
  return (
    <section className="panel panel--paper">
      <div className="panel__head">
        <h2>Question paper</h2>
        <button className="icon-btn" onClick={onCollapse} title="Hide question paper">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="panel__body">
        {!paper && (
          <div className="empty">
            <FileText size={34} />
            <p>No question paper yet.</p>
            <button className="btn btn--primary" onClick={onPick}>Choose PDF or image</button>
          </div>
        )}
        {paper?.kind === 'pdf' && <iframe className="paper-frame" src={paper.url} title={paper.name} />}
        {paper?.kind === 'image' && (
          <div className="paper-image">
            <img src={paper.url} alt={paper.name} />
          </div>
        )}
      </div>
    </section>
  );
}
