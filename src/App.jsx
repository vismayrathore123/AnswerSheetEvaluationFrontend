import { useRef, useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';

import TopBar from './components/TopBar';
import QuestionPaperPanel from './components/QuestionPaperPanel';
import ToolBar, { PEN_COLORS } from './components/ToolBar';
import AnswerCopyViewer from './components/AnswerCopyViewer';
import MarkingTable, { validateMark } from './components/MarkingTable';
import SubmitDialog from './components/SubmitDialog';
import useAnnotations from './hooks/useAnnotations';
import { fileToCopy, fileToPaper, uid } from './utils/files';
import { defaultQuestions } from './data/defaultQuestions';

export default function App() {
  const [examName, setExamName] = useState('Half Yearly 2026');
  const [subject, setSubject] = useState('Mathematics');

  const [paper, setPaper] = useState(null);
  const [copies, setCopies] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState(defaultQuestions);
  const [marksByCopy, setMarksByCopy] = useState({}); // { copyId: { questionId: '2' } }
  const [submittedIds, setSubmittedIds] = useState({}); // { copyId: true }

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [zoom, setZoom] = useState(100);
  const [leftOpen, setLeftOpen] = useState(true);

  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null);

  const paperInput = useRef(null);
  const copiesInput = useRef(null);
  const ann = useAnnotations();

  const copy = copies[index] ?? null;
  const copyId = copy?.id;
  const marks = (copyId && marksByCopy[copyId]) || {};
  const isSubmitted = !!(copyId && submittedIds[copyId]);

  const say = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ---- uploads ----
  const onPaperChosen = (e) => {
    const file = e.target.files?.[0];
    if (file) setPaper(fileToPaper(file));
    e.target.value = '';
  };

  const onCopiesChosen = async (e) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = '';
    if (!files.length) return;
    setLoading(true);
    try {
      const added = [];
      for (const f of files) added.push(await fileToCopy(f));
      setCopies((prev) => {
        if (!prev.length) setIndex(0);
        return [...prev, ...added];
      });
      say(`${added.length} copy added`);
    } catch (err) {
      say(err.message || 'Could not read the file');
    } finally {
      setLoading(false);
    }
  };

  // ---- marks ----
  const setMark = (qid, value) =>
    setMarksByCopy((m) => ({ ...m, [copyId]: { ...(m[copyId] ?? {}), [qid]: value } }));

  const setMax = (qid, max) => setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, max } : q)));

  const addQuestion = () =>
    setQuestions((qs) => [...qs, { id: `q${uid()}`, no: `Q${qs.length + 1}`, max: 5 }]);

  const removeQuestion = (qid) =>
    setQuestions((qs) => qs.filter((q) => q.id !== qid).map((q, i) => ({ ...q, no: `Q${i + 1}` })));

  // ---- save / submit ----
  const buildPayload = () => ({
    exam: examName,
    subject,
    barcode: copy.barcode,
    questionMarks: questions.map((q) => ({
      question: q.no,
      maxMarks: q.max,
      marksObtained: Number(marks[q.id] ?? 0),
    })),
    totalMarks: questions.reduce((s, q) => s + Number(marks[q.id] ?? 0), 0),
    annotations: ann.get(copyId),
  });

  const onSave = () => {
    console.log('SAVE', buildPayload());
    say('Saved on this screen (not sent to server yet)');
  };

  const onSubmit = () => {
    const missing = questions.filter((q) => marks[q.id] === undefined || marks[q.id] === '');
    const invalid = questions.filter((q) => validateMark(marks[q.id], q.max));
    if (missing.length) return say(`Enter marks for ${missing.map((q) => q.no).join(', ')} (type 0 if not attempted)`);
    if (invalid.length) return say(`Fix marks for ${invalid.map((q) => q.no).join(', ')}`);
    setSubmittedIds((s) => ({ ...s, [copyId]: true }));
    setDialog(buildPayload());
  };

  return (
    <div className="app">
      <input ref={paperInput} type="file" accept="application/pdf,image/*" hidden onChange={onPaperChosen} />
      <input ref={copiesInput} type="file" accept="application/pdf,image/*" multiple hidden onChange={onCopiesChosen} />

      <TopBar
        examName={examName} setExamName={setExamName}
        subject={subject} setSubject={setSubject}
        copy={copy} index={index} total={copies.length}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(copies.length - 1, i + 1))}
        onPickPaper={() => paperInput.current.click()}
        onPickCopies={() => copiesInput.current.click()}
        onSave={onSave} onSubmit={onSubmit}
        submitted={isSubmitted} loading={loading}
      />

      <main className="main">
        {leftOpen ? (
          <QuestionPaperPanel
            paper={paper}
            onPick={() => paperInput.current.click()}
            onCollapse={() => setLeftOpen(false)}
          />
        ) : (
          <button className="rail" onClick={() => setLeftOpen(true)} title="Show question paper">
            <PanelLeftOpen size={18} />
            <span>Question paper</span>
          </button>
        )}

        <section className="panel panel--copy">
          <ToolBar
            tool={tool} setTool={setTool} color={color} setColor={setColor}
            onUndo={() => ann.undo(copyId)} onRedo={() => ann.redo(copyId)}
            canUndo={!!copy && ann.canUndo(copyId)} canRedo={!!copy && ann.canRedo(copyId)}
            zoom={zoom} setZoom={setZoom}
            disabled={!copy || isSubmitted}
          />
          <AnswerCopyViewer
            copy={copy}
            annotations={copy ? ann.get(copyId) : []}
            tool={tool} color={color} zoom={zoom}
            disabled={isSubmitted}
            onCommit={(list) => ann.commit(copyId, list)}
            onPick={() => copiesInput.current.click()}
          />
        </section>
      </main>

      <MarkingTable
        questions={questions} marks={marks}
        disabled={!copy || isSubmitted}
        onMark={setMark} onMax={setMax}
        onAddQuestion={addQuestion} onRemoveQuestion={removeQuestion}
      />

      {toast && <div className="toast" role="status">{toast}</div>}
      {dialog && <SubmitDialog payload={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}
