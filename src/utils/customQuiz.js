export function validateQuizDraft({ title, questionIds, timeLimit, passingScore }) {
  if (!String(title || "").trim()) return "Enter a quiz title.";
  if (!Array.isArray(questionIds) || questionIds.length === 0) return "Select at least one question.";
  if (!Number.isInteger(Number(timeLimit)) || Number(timeLimit) < 1 || Number(timeLimit) > 60) {
    return "Time limit must be between 1 and 60 minutes.";
  }
  if (!Number.isFinite(Number(passingScore)) || Number(passingScore) < 0 || Number(passingScore) > 100) {
    return "Passing score must be between 0 and 100.";
  }
  return null;
}

export function calculateQuizResult(questions, answers, passingScore) {
  const total = Array.isArray(questions) ? questions.length : 0;
  const correct = (questions || []).reduce(
    (count, question) => count + (answers?.[question.id] === question.correct ? 1 : 0),
    0
  );
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  return {
    correct,
    total,
    percentage,
    passed: total > 0 && percentage >= Number(passingScore),
  };
}

export function formatQuizTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}
