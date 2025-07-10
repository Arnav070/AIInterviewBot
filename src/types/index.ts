export interface InterviewQuestion {
  text: string;
  audio: string;
}

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
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  interviewerAvatar: string;
}
