import { Plus, X } from 'lucide-react';

/** Returns an error text if the entered value is not valid, otherwise ''. */
export function validateMark(value, max) {
  if (value === '' || value === undefined) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return 'Numbers only';
  if (n < 0) return 'Cannot be below 0';
  if (n > max) return `Maximum is ${max}`;
  if (n * 2 !== Math.round(n * 2)) return 'Use whole or half marks';
  return '';
}

export default function MarkingTable({ questions, marks, disabled, onMark, onMax, onAddQuestion, onRemoveQuestion }) {
  const totalMax = questions.reduce((s, q) => s + (Number(q.max) || 0), 0);
  const totalGot = questions.reduce((s, q) => {
    const v = marks[q.id];
    return s + (v === '' || v === undefined || validateMark(v, q.max) ? 0 : Number(v));
  }, 0);
  const filled = questions.filter((q) => marks[q.id] !== undefined && marks[q.id] !== '').length;

  return (
    <section className="marking">
      <div className="marking__head">
        <h2>Marking table</h2>
        <span className="marking__hint">
          {filled} of {questions.length} questions marked · half marks allowed
        </span>
      </div>

      <div className="marking__scroll">
        <table className="grid">
          <thead>
            <tr>
              <th className="grid__label">Question</th>
              {questions.map((q) => (
                <th key={q.id}>
                  <span className="qno">{q.no}</span>
                  {!disabled && questions.length > 1 && (
                    <button className="qremove" onClick={() => onRemoveQuestion(q.id)} title={`Remove ${q.no}`}>
                      <X size={12} />
                    </button>
                  )}
                </th>
              ))}
              <th className="grid__total">Total</th>
              <th className="grid__add">
                {!disabled && (
                  <button className="icon-btn" onClick={onAddQuestion} title="Add question">
                    <Plus size={16} />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="grid__label">Maximum marks</th>
              {questions.map((q) => (
                <td key={q.id}>
                  <input
                    className="cell cell--max" type="number" min="0" step="0.5"
                    value={q.max} disabled={disabled}
                    onChange={(e) => onMax(q.id, e.target.value === '' ? 0 : Number(e.target.value))}
                    aria-label={`Maximum marks for ${q.no}`}
                  />
                </td>
              ))}
              <td className="grid__total"><strong>{totalMax}</strong></td>
              <td />
            </tr>
            <tr>
              <th className="grid__label">Marks obtained</th>
              {questions.map((q) => {
                const err = validateMark(marks[q.id], q.max);
                return (
                  <td key={q.id}>
                    <input
                      className={`cell cell--got ${err ? 'cell--error' : ''}`}
                      type="number" min="0" max={q.max} step="0.5" inputMode="decimal"
                      value={marks[q.id] ?? ''} disabled={disabled}
                      onChange={(e) => onMark(q.id, e.target.value)}
                      aria-label={`Marks obtained for ${q.no}`}
                    />
                    {err && <div className="cell__error">{err}</div>}
                  </td>
                );
              })}
              <td className="grid__total grid__total--got">
                <strong>{totalGot}</strong> <span>/ {totalMax}</span>
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
