export interface Theme {
  id: number;
  name: string;
  slug: string;
  description?: Record<string, string> | null; 
  icon:string,
  created_at?: string;
  updated_at?: string;
  
}