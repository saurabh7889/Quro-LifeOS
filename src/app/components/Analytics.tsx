import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Activity, Target, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import * as api from "../api";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { useIsMobile } from "./ui/use-mobile";

export function Analytics() {
  const isMobile = useIsMobile();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.analytics.get().then(setData);
  }, []);

  if (!data) return <div className="p-6"><p className="text-muted-foreground">Loading analytics...</p></div>;
  const hasAnyData = !!data.hasAnyData;
  const weeklyData = hasAnyData ? (data.productivityData || []) : [];
  const radarData = hasAnyData ? (data.lifeBalanceData || []) : [];
  const hasWeeklyData = weeklyData.length > 0;
  const hasRadarData = Array.isArray(radarData) && radarData.some((item: any) => Number(item.value) > 0);
  const hasXpData = (data.xpGrowthData?.length || 0) > 0;

  const scoreCards = [
    { label: "Overall Score", value: `${data.overallScore || 0}/100`, icon: Target, color: "primary" },
    { label: "Productivity", value: `${data.productivity || 0}%`, icon: Zap, color: "accent" },
    { label: "Health Score", value: `${data.healthScore || 0}%`, icon: Activity, color: "green-500" },
    { label: "Study Score", value: `${data.studyScore || 0}%`, icon: TrendingUp, color: "blue-500" },
  ];

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div><h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Analytics</h2><p className="text-sm text-muted-foreground">Deep insights into your productivity and life balance</p></div>

      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        {scoreCards.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${item.color}/20 flex items-center justify-center`}><Icon className={`w-5 h-5 text-${item.color}`} /></div>
                <div><p className="text-xs text-muted-foreground">{item.label}</p><h3 className="font-bold">{item.value}</h3></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">Weekly Progress</h3>
          {hasWeeklyData ? (
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
                <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="tasks" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="habits" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="study" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <SectionEmptyState message="No activity data yet." />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">Life Balance Radar</h3>
          {hasRadarData ? (
            <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99, 102, 241, 0.2)" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: 12 }} />
                <PolarRadiusAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <SectionEmptyState message="Start tracking different areas of your life to see balance insights." />
          )}
        </motion.div>
      </div>

      {hasXpData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">XP Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
            <LineChart data={data.xpGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="xp" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#6366f1", r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {(data.achievements?.length > 0 || data.improvements?.length > 0) && (
        <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">Top Achievements This Month</h3>
          <div className="space-y-3">
            {data.achievements.map((a: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-2xl">{a.icon}</span><span className="text-sm">{a.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">Areas for Improvement</h3>
          <div className="space-y-3">
            {data.improvements.map((item: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }} className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span>{item.area}</span><span className="font-bold">{item.score}%</span></div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1, delay: 0.6 + i * 0.05 }} className={`absolute inset-y-0 left-0 bg-${item.color}-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      )}

      {!hasAnyData && (
        <div className="glass rounded-2xl p-6">
          <SectionEmptyState message="No analytics data yet. Start adding real activity across sections to unlock insights." className="py-0" />
        </div>
      )}
    </div>
  );
}
