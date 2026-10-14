import { Upload, FileText, ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';

export default function TopBar({
  examName, setExamName, subject, setSubject,
  copy, index, total, onPrev, onNext,
  onPickPaper, onPickCopies, onSave, onSubmit, submitted, loading,
}) {
  return (
    <header className="topbar">
      <div className="topbar__group">
        <label className="field">
          <span>Exam</span>
          <input value={examName} onChange={(e) => setExamName(e.target.value)} />
        </label>
        <label className="field">
          <span>Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <div className="field field--static">
          <span>Copy barcode</span>
          <strong>{copy ? copy.barcode : '—'}</strong>
        </div>
      </div>

      <div className="topbar__group">
        <button className="btn btn--ghost" onClick={onPickPaper}>
          <FileText size={16} /> Upload question paper
        </button>
        <button className="btn btn--ghost" onClick={onPickCopies}>
          <Upload size={16} /> Upload answer copies
        </button>
      </div>

      <div className="topbar__group">
        <button className="icon-btn" onClick={onPrev} disabled={index <= 0} title="Previous copy">
          <ChevronLeft size={18} />
        </button>
        <span className="topbar__count">Copy {total ? index + 1 : 0} of {total}</span>
        <button className="icon-btn" onClick={onNext} disabled={index >= total - 1} title="Next copy">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="topbar__group">
        {loading && <span className="topbar__loading">Reading files…</span>}
        <button className="btn btn--ghost" onClick={onSave} disabled={!copy}>
          <Save size={16} /> Save
        </button>
        <button className="btn btn--primary" onClick={onSubmit} disabled={!copy || submitted}>
          <Send size={16} /> {submitted ? 'Submitted' : 'Submit marks'}
        </button>
      </div>
    </header>
  );
}
