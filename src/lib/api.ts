import { Review, Stats } from "../types";

export const api = {
  async getReviews(): Promise<Review[]> {
    const res = await fetch("/api/reviews");
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
  },

  async submitReview(reviewData: any): Promise<{ success: boolean }> {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to submit review");
    }
    return res.json();
  },

  async getStats(): Promise<Stats> {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  async checkExistingReview(email: string): Promise<Review | null> {
    const reviews = await this.getReviews();
    return reviews.find(r => r.email === email) || null;
  }
};
