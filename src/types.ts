export type Sentiment = "Positive" | "Negative" | "Neutral";

export interface Review {
  id: string;
  student_name: string;
  email: string;
  rating: number;
  content: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  created_at: string;
}

export interface Stats {
  total: number;
  sentiments: Record<string, number>;
  avgRating: number;
}
