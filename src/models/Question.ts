import type {QuestionOption} from './QuestionOption'
export interface Question {
  id: number;
  text: any;        // سؤال رئيسي
  hint?: string;
  category_id: number;
  options: QuestionOption[];
}