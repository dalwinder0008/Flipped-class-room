import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Users, Star, MessageSquare, TrendingUp, Smile, Frown } from "lucide-react";
import StatCard from "@/src/components/StatCard";
import { Stats, Review } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reviewsData] = await Promise.all([
          api.getStats(),
          api.getReviews()
        ]);
        setStats(statsData);
        setRecentReviews(reviewsData.slice(0, 5));
      } catch (error: any) {
        console.error("API Error:", error);
        setError("Failed to connect to the database. Please ensure your MONGODB_URI is configured correctly in the Settings menu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
          <Frown className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold">Database Connection Error</h2>
        <p className="text-slate-400 max-w-md">
          {error || "We couldn't retrieve the analytics data. This usually happens when the MongoDB connection is not established."}
        </p>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-slate-500">
          Tip: Check your <code className="text-brand-400">MONGODB_URI</code> in the AI Studio Settings.
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Positive", value: stats.sentiments.Positive || 0, color: "#10b981" },
    { name: "Neutral", value: stats.sentiments.Neutral || 0, color: "#f59e0b" },
    { name: "Negative", value: stats.sentiments.Negative || 0, color: "#f43f5e" }
  ];

  // Mock trend data
  const trendData = [
    { name: "Mon", positive: 4, negative: 1 },
    { name: "Tue", positive: 7, negative: 2 },
    { name: "Wed", positive: 5, negative: 1 },
    { name: "Thu", positive: 8, negative: 3 },
    { name: "Fri", positive: 12, negative: 2 },
    { name: "Sat", positive: 9, negative: 1 },
    { name: "Sun", positive: 15, negative: 0 },
  ];

  const radarData = [
    { subject: 'Clarity', A: 120, B: 110, fullMark: 150 },
    { subject: 'Engagement', A: 98, B: 130, fullMark: 150 },
    { subject: 'Pacing', A: 86, B: 130, fullMark: 150 },
    { subject: 'Difficulty', A: 99, B: 100, fullMark: 150 },
    { subject: 'Resources', A: 85, B: 90, fullMark: 150 },
    { subject: 'Support', A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Real-time insights from student feedback.</p>
        </div>
        <div className="hidden md:block">
          <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Reviews" 
          value={stats.total} 
          icon={MessageSquare} 
          trend="+12%" 
          trendUp 
          color="bg-brand-600/20 text-brand-400" 
        />
        <StatCard 
          title="Avg Rating" 
          value={stats.avgRating.toFixed(1)} 
          icon={Star} 
          trend="+0.2" 
          trendUp 
          color="bg-amber-500/20 text-amber-400" 
        />
        <StatCard 
          title="Positive" 
          value={stats.sentiments.Positive || 0} 
          icon={Smile} 
          trend="+5%" 
          trendUp 
          color="bg-emerald-500/20 text-emerald-400" 
        />
        <StatCard 
          title="Negative" 
          value={stats.sentiments.Negative || 0} 
          icon={Frown} 
          trend="-2%" 
          trendUp={false} 
          color="bg-rose-500/20 text-rose-400" 
        />
        <StatCard 
          title="Active Students" 
          value="124" 
          icon={Users} 
          color="bg-indigo-500/20 text-indigo-400" 
        />
        <StatCard 
          title="Growth" 
          value="24%" 
          icon={TrendingUp} 
          trend="+8%" 
          trendUp 
          color="bg-violet-500/20 text-violet-400" 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sentiment Donut */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Sentiment Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Sentiment Trend (Weekly)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="negative" stroke="#f43f5e" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Radar */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Feedback Dimensions</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" />
                <Radar
                  name="Current Term"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Previous Term"
                  dataKey="B"
                  stroke="#64748b"
                  fill="#64748b"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Feed */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Live Review Feed</h3>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-brand-400 shrink-0">
                  {review.student_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold truncate">{review.student_name}</h4>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      review.sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-400" : 
                      review.sentiment === "Negative" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {review.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1">{review.content}</p>
                </div>
              </div>
            ))}
            {recentReviews.length === 0 && (
              <p className="text-center text-slate-500 py-12">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
