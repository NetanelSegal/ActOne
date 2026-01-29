export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Script {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
}
