import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Plus, Pencil, Trash2, Play, CheckCircle2, XCircle, Trophy, ArrowLeft, Save } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { QuizCard } from "../components/QuizCard";
import { quizQuestions } from "../data/quizQuestions";
import { useTheme } from "../context/ThemeContext";
import { calculateQuizResult, formatQuizTime, validateQuizDraft } from "../utils/customQuiz";

const STORAGE_KEY = "cyber-custom-quizzes";
const readQuizzes = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const createEmptyForm = () => ({
  title: "",
  description: "",
  questionIds: [],
  timeLimit: 5,
  passingScore: 70,
});

export const CustomQuizBuilder = () => {
  const [quizzes, setQuizzes] = useState(readQuizzes);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [attemptQuiz, setAttemptQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);
  const { recordQuizScore } = useTheme();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
    } catch {
      setFormError("Could not save quizzes. Check available browser storage.");
    }
  }, [quizzes]);

  const selectedQuestions = useMemo(
    () => quizQuestions.filter((question) => form.questionIds.includes(question.id)),
    [form.questionIds]
  );

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setFormError("");
  };

  const toggleQuestion = (id) => {
    setForm((previous) => ({
      ...previous,
      questionIds: previous.questionIds.includes(id)
        ? previous.questionIds.filter((questionId) => questionId !== id)
        : [...previous.questionIds, id],
    }));
  };

  const saveQuiz = (event) => {
    event.preventDefault();
    const validationError = validateQuizDraft(form);
    if (validationError) return setFormError(validationError);
    const title = form.title.trim();

    const quiz = {
      id: editingId || (window.crypto?.randomUUID?.() ?? `quiz-${Date.now()}`),
      title,
      description: form.description.trim(),
      questionIds: [...new Set(form.questionIds)],
      timeLimit: Number(form.timeLimit),
      passingScore: Number(form.passingScore),
      updatedAt: new Date().toISOString(),
    };

    setQuizzes((previous) =>
      editingId ? previous.map((item) => (item.id === editingId ? quiz : item)) : [quiz, ...previous]
    );
    resetForm();
  };

  const editQuiz = (quiz) => {
    setEditingId(quiz.id);
    setForm({
      title: quiz.title,
      description: quiz.description || "",
      questionIds: quiz.questionIds,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAttempt = (quiz) => {
    const questions = quizQuestions.filter((question) => quiz.questionIds.includes(question.id));
    if (!questions.length) return;
    submittedRef.current = false;
    setAttemptQuiz({ ...quiz, questions });
    setAnswers({});
    setCurrent(0);
    setTimeLeft(quiz.timeLimit * 60);
    setResult(null);
  };

  const finishAttempt = (timedOut = false) => {
    if (!attemptQuiz || submittedRef.current) return;
    submittedRef.current = true;
    const score = calculateQuizResult(attemptQuiz.questions, answers, attemptQuiz.passingScore);
    setResult({ ...score, timedOut });
    recordQuizScore(correct, total);
  };

  useEffect(() => {
    if (!attemptQuiz || result) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attemptQuiz, result]);

  useEffect(() => {
    if (attemptQuiz && timeLeft === 0 && !result && !submittedRef.current) {
      finishAttempt(true);
    }
  }, [timeLeft, attemptQuiz, result]);

  const leaveAttempt = () => {
    setAttemptQuiz(null);
    setResult(null);
    setAnswers({});
  };

  if (attemptQuiz && result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SectionTitle title="Quiz Results" subtitle={attemptQuiz.title} />
        <CyberCard glow className="text-center mb-8">
          <Trophy className="mx-auto text-neon-green mb-3" size={48} />
          <p className="text-5xl font-display font-bold text-white">{result.percentage}%</p>
          <p className={result.passed ? "text-neon-green mt-2" : "text-danger mt-2"}>
            {result.passed ? "Passed" : "Not passed"} · {result.correct}/{result.total} correct
          </p>
          {result.timedOut && <p className="text-warning text-sm mt-2">Time expired. Your answers were submitted automatically.</p>}
        </CyberCard>
        <div className="space-y-4 mb-8">
          {attemptQuiz.questions.map((question, index) => {
            const isCorrect = answers[question.id] === question.correct;
            return (
              <CyberCard key={question.id} hover={false}>
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle2 className="text-neon-green mt-1" /> : <XCircle className="text-danger mt-1" />}
                  <div>
                    <p className="text-white font-semibold mb-2">{index + 1}. {question.question}</p>
                    <p className="text-sm text-slate-400">Your answer: {answers[question.id] === undefined ? "Not answered" : question.options[answers[question.id]]}</p>
                    <p className="text-sm text-neon-green mt-1">Correct answer: {question.options[question.correct]}</p>
                    <p className="text-sm text-slate-400 mt-2">{question.explanation}</p>
                  </div>
                </div>
              </CyberCard>
            );
          })}
        </div>
        <AnimatedButton onClick={leaveAttempt} icon={ArrowLeft}>Back to My Quizzes</AnimatedButton>
      </div>
    );
  }

  if (attemptQuiz) {
    const question = attemptQuiz.questions[current];
    const selected = answers[question.id] ?? null;
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6 gap-4">
          <button onClick={leaveAttempt} className="text-slate-400 hover:text-white text-sm">← Exit quiz</button>
          <span className={timeLeft <= 30 ? "text-danger font-mono text-lg" : "text-neon-green font-mono text-lg"}>
            <Clock3 className="inline mr-2" size={18} />{formatQuizTime(timeLeft)}
          </span>
          <span className="text-slate-400 text-sm">{current + 1}/{attemptQuiz.questions.length}</span>
        </div>
        <SectionTitle title={attemptQuiz.title} subtitle={attemptQuiz.description || "Choose one answer for each question."} />
        <QuizCard
          question={question.question}
          options={question.options}
          selected={selected}
          onSelect={(index) => setAnswers((previous) => ({ ...previous, [question.id]: index }))}
          showResult={false}
          correctIndex={question.correct}
          disabled={false}
        />
        <div className="flex justify-between mt-6">
          <AnimatedButton variant="secondary" disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))}>Previous</AnimatedButton>
          {current < attemptQuiz.questions.length - 1 ? (
            <AnimatedButton icon={Play} onClick={() => setCurrent((value) => value + 1)}>Next</AnimatedButton>
          ) : (
            <AnimatedButton onClick={() => finishAttempt(false)}>Submit quiz</AnimatedButton>
          )}
        </div>
        <p className="text-xs text-slate-500 text-right mt-3">{Object.keys(answers).length} of {attemptQuiz.questions.length} answered</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle title="Custom Quiz Builder" subtitle="Create, configure, and take quizzes from the cybersecurity question bank." />
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <CyberCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-white">{editingId ? "Edit quiz" : "Create a quiz"}</h3>
            {editingId && <button onClick={resetForm} className="text-xs text-slate-400 hover:text-white">Cancel edit</button>}
          </div>
          <form onSubmit={saveQuiz} className="space-y-4">
            <label className="block text-sm text-slate-300">Quiz title
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={80} required className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-3 text-white outline-none focus:border-neon-green" placeholder="e.g. Phishing Awareness Level 1" />
            </label>
            <label className="block text-sm text-slate-300">Description
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={240} rows={2} className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-3 text-white outline-none focus:border-neon-green" placeholder="What will this quiz cover?" />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm text-slate-300">Time limit (minutes)
                <input type="number" min="1" max="60" value={form.timeLimit} onChange={(event) => setForm({ ...form, timeLimit: event.target.value })} className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-3 text-white" />
              </label>
              <label className="block text-sm text-slate-300">Passing score (%)
                <input type="number" min="0" max="100" value={form.passingScore} onChange={(event) => setForm({ ...form, passingScore: event.target.value })} className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-3 text-white" />
              </label>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-slate-300 font-semibold">Question bank</p>
                <span className="text-xs text-neon-green">{selectedQuestions.length} selected</span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {quizQuestions.map((question) => (
                  <label key={question.id} className="flex items-start gap-3 rounded-lg border border-slate-700/70 bg-white/[0.03] p-3 cursor-pointer hover:border-neon-green/40">
                    <input type="checkbox" checked={form.questionIds.includes(question.id)} onChange={() => toggleQuestion(question.id)} className="mt-1 accent-emerald-400" />
                    <span className="text-sm text-slate-300">{question.question}</span>
                  </label>
                ))}
              </div>
            </div>
            {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}
            <div className="flex flex-wrap gap-3">
              <AnimatedButton type="submit" icon={Save}>{editingId ? "Save changes" : "Create quiz"}</AnimatedButton>
              <span className="self-center text-xs text-slate-500">Quizzes are saved in this browser.</span>
            </div>
          </form>
        </CyberCard>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-white">My quizzes</h3>
            <span className="text-xs text-slate-400">{quizzes.length} saved</span>
          </div>
          {quizzes.length === 0 ? (
            <CyberCard hover={false} className="text-center py-10">
              <Plus className="mx-auto text-neon-green mb-3" size={32} />
              <p className="text-white font-semibold">No custom quizzes yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first quiz using the question bank.</p>
            </CyberCard>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <CyberCard key={quiz.id} hover={false}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold">{quiz.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{quiz.description || "Custom cybersecurity quiz"}</p>
                    </div>
                    <span className="text-xs text-neon-green whitespace-nowrap">{quiz.questionIds.length} questions</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-4">
                    <span><Clock3 className="inline mr-1" size={14} />{quiz.timeLimit} min</span>
                    <span>Pass: {quiz.passingScore}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    <AnimatedButton onClick={() => startAttempt(quiz)} icon={Play}>Take quiz</AnimatedButton>
                    <button onClick={() => editQuiz(quiz)} aria-label={`Edit ${quiz.title}`} className="p-3 rounded-lg border border-slate-700 text-slate-300 hover:text-neon-green"><Pencil size={17} /></button>
                    <button onClick={() => {
                      if (window.confirm(`Delete "${quiz.title}"?`)) {
                        setQuizzes((previous) => previous.filter((item) => item.id !== quiz.id));
                        if (editingId === quiz.id) resetForm();
                      }
                    }} aria-label={`Delete ${quiz.title}`} className="p-3 rounded-lg border border-slate-700 text-slate-300 hover:text-danger"><Trash2 size={17} /></button>
                  </div>
                </CyberCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
