export interface Entity {
  id: number;
  theme_id: number;
  name: string;
  attributes?: Record<string, any> | null;
  image_url?: string | null;
  external_id?: string | null;
  created_at?: string;
  updated_at?: string;
}
