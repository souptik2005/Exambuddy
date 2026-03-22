export type ExamContent = {
  title?: string;
  importantQuestions: { question: string; answer: string }[];
  mcqs: { question: string; options: string[]; answer: string }[];
};

export type HistoryItem = {
  id: string;
  title: string;
  date: string;
  results: ExamContent;
};

export type TopicSummary = {
  topic: string;
  summary: string;
  detailedExplanation: string;
  keyPoints: string[];
  youtubeLinks: { title: string; url: string }[];
};
