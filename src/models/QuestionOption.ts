export interface QuestionOption {
  id: number;
  text: any;
  image: string | null;
  answer?: 'yes' | 'no' | 'unknown';
}