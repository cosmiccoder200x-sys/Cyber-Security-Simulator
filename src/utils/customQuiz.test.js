import test from "node:test";
import assert from "node:assert/strict";
import { calculateQuizResult, formatQuizTime, validateQuizDraft } from "./customQuiz.js";

test("requires a title and at least one selected question", () => {
  assert.equal(validateQuizDraft({ title: " ", questionIds: [1], timeLimit: 5, passingScore: 70 }), "Enter a quiz title.");
  assert.equal(validateQuizDraft({ title: "Basics", questionIds: [], timeLimit: 5, passingScore: 70 }), "Select at least one question.");
});

test("rejects invalid time limits and passing scores", () => {
  const base = { title: "Basics", questionIds: [1], timeLimit: 5, passingScore: 70 };
  assert.match(validateQuizDraft({ ...base, timeLimit: 0 }), /Time limit/);
  assert.match(validateQuizDraft({ ...base, timeLimit: 61 }), /Time limit/);
  assert.match(validateQuizDraft({ ...base, passingScore: 101 }), /Passing score/);
  assert.equal(validateQuizDraft(base), null);
});

test("calculates scores and applies the passing threshold", () => {
  const questions = [{ id: "a", correct: 1 }, { id: "b", correct: 0 }, { id: "c", correct: 2 }];
  const result = calculateQuizResult(questions, { a: 1, b: 2 }, 60);
  assert.deepEqual(result, { correct: 1, total: 3, percentage: 33, passed: false });
  assert.equal(calculateQuizResult(questions, { a: 1, b: 0, c: 2 }, 100).passed, true);
});

test("handles empty quiz data without dividing by zero", () => {
  assert.deepEqual(calculateQuizResult([], {}, 50), {
    correct: 0, total: 0, percentage: 0, passed: false,
  });
});

test("formats remaining time consistently", () => {
  assert.equal(formatQuizTime(300), "5:00");
  assert.equal(formatQuizTime(9), "0:09");
  assert.equal(formatQuizTime(-2), "0:00");
});
