import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Target, Brain, Heart, BookOpen, Wallet, Zap } from "lucide-react";
import * as api from "../api";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { useIsMobile } from "./ui/use-mobile";

const iconMap: Record<string, any> = { Zap, Heart, BookOpen, Wallet, Target };

export function LifeMeter() {
  const isMobile = useIsMobile();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.analytics.getLifeMeter().then(setData);
  }, []);

  if (!data) return <div className="p-6"><p className="text-muted-foreground">Loading life meter...</p></div>;
  const hasInsightData = (data.insights?.length || 0) > 0;
  const hasRecommendationData = (data.recommendations?.length || 0) > 0;
  const hasCategoryData = (data.categories?.length || 0) > 0;

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div><h2 className={`mb-1 flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}><Trophy className="w-5 h-5 md:w-6 md:h-6 text-accent" />Life Meter</h2><p className="text-sm text-muted-foreground">Your comprehensive life performance dashboard</p></div>

      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className={`lg:col-span-1 glass rounded-2xl ${isMobile ? 'p-6' : 'p-8'} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-purple-500/20" />
          <div className="relative z-10">
            <h3 className="text-sm text-muted-foreground mb-6 text-center">Overall Life Score</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="85" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="14" fill="none" />
                  <motion.circle cx="96" cy="96" r="85" stroke="url(#life-gradient)" strokeWidth="14" fill="none" strokeLinecap="round"
                    initial={{ strokeDasharray: "534", strokeDashoffset: 534 }} animate={{ strokeDashoffset: 534 - (534 * data.lifeScore) / 100 }} transition={{ duration: 2, ease: "easeOut" }} />
                  <defs><linearGradient id="life-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="50%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">{data.lifeScore}</span>
                  <span className="text-lg text-muted-foreground mt-1">/ 100</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Performance Level</p>
              <p className="text-2xl font-bold text-accent">{data.performanceLabel}</p>
            </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-4">
          {hasCategoryData ? data.categories.map((category: any, index: number) => {
            const Icon = iconMap[category.icon] || Zap;
            return (
              <motion.div key={category.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h4>{category.name}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: category.color }}>{category.score}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${category.score}%` }} transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }} className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: category.color }} />
                </div>
              </motion.div>
            );
          }) : (
            <div className="glass rounded-xl p-6">
              <SectionEmptyState message="No life meter data yet. Complete actions across sections to unlock your life profile." className="py-6" />
            </div>
          )}
        </div>
      </div>

      {hasInsightData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-4 md:p-6">
          <h3 className="mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-accent" />AI-Powered Insights</h3>
          <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {data.insights.map((insight: any, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + index * 0.05 }}
                className={`p-5 rounded-xl border-2 ${insight.type === "positive" ? "bg-green-500/10 border-green-500/30" : insight.type === "warning" ? "bg-orange-500/10 border-orange-500/30" : "bg-blue-500/10 border-blue-500/30"}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-bold">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${insight.type === "positive" ? "bg-green-500/20 text-green-500" : insight.type === "warning" ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500"}`}>{insight.score}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {hasRecommendationData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass rounded-2xl p-4 md:p-6">
          <h3 className="mb-4">Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.map((rec: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.05 }} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${rec.priority === "high" ? "bg-red-500" : rec.priority === "medium" ? "bg-orange-500" : "bg-green-500"}`} />
                  <div><p className="text-sm font-medium">{rec.title}</p><p className="text-xs text-muted-foreground">{rec.category}</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-bold text-accent">{rec.impact}</p></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
