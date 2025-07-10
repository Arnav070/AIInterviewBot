export interface InterviewResponse {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

export interface InterviewData {
  userName: string;
  userEmail: string;
  jobPosition: string;
  cvContent?: string;
  questions: string[];
  responses: InterviewResponse[];
}
