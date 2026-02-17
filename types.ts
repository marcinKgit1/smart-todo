
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';

export interface SuggestionResponse {
  suggestions: {
    text: string;
    priority: Priority;
    category: string;
  }[];
}
