import React from "react";
import { Star, Calendar, Hash, Quote } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Review } from "@/src/types";

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="glass-card flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center font-bold text-brand-400">
            {review.student_name[0]}
          </div>
          <div>
            <h4 className="font-bold">{review.student_name}</h4>
            <p className="text-xs text-slate-500">{review.email}</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
          review.sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-400" : 
          review.sentiment === "Negative" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
        )}>
          {review.sentiment}
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <Star 
            key={num} 
            className={cn("w-4 h-4", num <= review.rating ? "text-amber-400 fill-current" : "text-slate-700")} 
          />
        ))}
      </div>

      <div className="relative mb-6 flex-1">
        <Quote className="w-8 h-8 text-white/5 absolute -top-2 -left-2" />
        <p className="text-slate-300 text-sm leading-relaxed relative z-10 italic">
          "{review.content}"
        </p>
      </div>

      <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 mb-4">
        {JSON.parse(review.keywords as any || "[]").map((kw: string) => (
          <span key={kw} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5">
            #{kw}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {review.id}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(review.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
