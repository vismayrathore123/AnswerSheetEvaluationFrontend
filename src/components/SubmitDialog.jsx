export default function SubmitDialog({ payload, onClose }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <h2>Marks submitted</h2>
        <p>This copy is now locked. This is the data we will send to the .NET API later:</p>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
        <button className="btn btn--primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
