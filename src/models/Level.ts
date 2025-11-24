export interface Level {
  id: number;
  theme_id?: number | null;
  name: string;
  categories_count: number;
  time_per_attempt: number;
  hint:string;
  created_at?: string;
  updated_at?: string;
}
