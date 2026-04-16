import { useState } from "react";
import { motion } from "motion/react";
import { Send, Brain, ThumbsUp, ThumbsDown, Star, Clock } from "lucide-react";

export function QuroAI() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm QURO, your AI life assistant. I can help you with task prioritization, study planning, habit building, and life optimization. What would you like to work on today?",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    { id: 1, title: "Help me plan my study schedule", description: "Get guidance on organizing subjects and setting CGPA targets", category: "Study" },
    { id: 2, title: "Create a workout routine", description: "Start building a consistent exercise habit", category: "Health" },
    { id: 3, title: "Set up my budget", description: "Learn how to track income, expenses, and savings goals", category: "Finance" },
    { id: 4, title: "Build a productive routine", description: "Tips on task management, habits, and daily consistency", category: "Productivity" },
  ];

  const generateResponse = (userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    if (lower.includes("study") || lower.includes("exam") || lower.includes("cgpa")) {
      return "Here's how to get started with your study system:\n\n1. **Add your subjects** in the Study section with current scores\n2. **Set a target CGPA** using the CGPA Advisor\n3. **Upload resources** like notes, videos, and courses\n\nAs you track progress, I'll provide personalized insights based on your actual performance. Head to the Study section to begin!";
    }
    if (lower.includes("task") || lower.includes("priority") || lower.includes("productive")) {
      return "Let's set up your task system:\n\n1. **Create tasks** with priorities (Low / Medium / High)\n2. **Set difficulty levels** and XP rewards\n3. **Complete tasks** to earn XP and level up\n\n🔴 Focus on high-priority tasks first\n🟡 Schedule medium ones for later\n🟢 Low-priority can be deferred\n\nHead to the Tasks section to add your first task!";
    }
    if (lower.includes("habit") || lower.includes("streak")) {
      return "Building habits is the key to consistency! Here's how:\n\n1. **Add daily habits** you want to track\n2. **Complete them each day** to build streaks\n3. **Earn XP** for every completion\n\nTips for success:\n• Start with 2-3 habits, not 10\n• Stack habits together (e.g., meditate right after waking up)\n• Set specific times for each habit\n\nHead to the Habits section to create your first habit!";
    }
    if (lower.includes("workout") || lower.includes("exercise") || lower.includes("health")) {
      return "Let's build your fitness tracking:\n\n1. **Log workouts** with name, duration, and calories\n2. **Track health metrics** like steps and fitness score\n3. **Monitor weekly activity** trends\n\n💪 Suggested weekly plan:\n- Mon/Wed/Fri: Cardio (30-45 min)\n- Tue/Thu: Strength training\n- Sat: Active recovery (yoga/stretching)\n\nHead to the Health section to log your first workout!";
    }
    if (lower.includes("finance") || lower.includes("money") || lower.includes("budget")) {
      return "Let's set up your financial tracking:\n\n1. **Add transactions** — both income and expenses\n2. **Categorize spending** (Housing, Food, Transport, etc.)\n3. **Set a savings goal** to track progress\n\nRecommendations:\n• Log every transaction daily for accurate tracking\n• Review your expense breakdown weekly\n• Set up a realistic savings target\n\nHead to the Finance section to add your first transaction!";
    }
    return "I'd be happy to help you with that! Here are some areas I can assist with:\n\n📋 **Tasks** — Create and prioritize your to-do list\n🔄 **Habits** — Build daily consistency\n📚 **Study** — Track subjects and CGPA\n💰 **Finance** — Monitor income and expenses\n💪 **Health** — Log workouts and fitness\n📝 **Diary** — Reflect on your day\n\nAs you add data to each section, I'll provide personalized insights. Which area would you like to start with?";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue;
    setMessages([...messages, { role: "user", content: userMsg }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <h2 className="mb-1 flex items-center gap-2"><Brain className="w-6 h-6 text-accent" />QURO AI</h2>
          <p className="text-sm text-muted-foreground">Your intelligent life assistant</p>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${message.role === "user" ? "glass rounded-2xl rounded-tr-sm p-4" : "glass rounded-2xl rounded-tl-sm p-4 border border-primary/30"}`}>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div>
                    <span className="text-xs font-bold text-accent">QURO</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button className="p-1 rounded hover:bg-accent/10 transition-colors"><ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-green-500" /></button>
                    <button className="p-1 rounded hover:bg-accent/10 transition-colors"><ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-red-500" /></button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass rounded-2xl rounded-tl-sm p-4 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Brain className="w-4 h-4 text-white" /></div>
                  <span className="text-xs font-bold text-accent">QURO</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="relative">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask QURO anything..." className="w-full px-6 py-4 pr-14 bg-input rounded-2xl border border-border focus:border-primary focus:outline-none" />
          <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-xl hover:glow transition-all flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <aside className="w-80 border-l border-border p-6 overflow-y-auto">
        <h3 className="mb-2">Getting Started</h3>
        <p className="text-xs text-muted-foreground mb-4">Suggestions will become personalized as you track your life data.</p>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <motion.div key={suggestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-4 cursor-pointer hover:glow-hover" onClick={() => { setInputValue(suggestion.title); }}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm flex-1">{suggestion.title}</h4>
                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{suggestion.category}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>
              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-xs flex items-center justify-center gap-1"><ThumbsUp className="w-3 h-3" />Ask</button>
                <button className="px-3 py-1.5 bg-muted/30 text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors text-xs"><Star className="w-3 h-3" /></button>
                <button className="px-3 py-1.5 bg-muted/30 text-muted-foreground rounded-lg hover:bg-muted/50 transition-colors text-xs"><Clock className="w-3 h-3" /></button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 glass rounded-xl p-4">
          <h4 className="text-sm mb-3">Quick Actions</h4>
          <div className="space-y-2">
            {["How do I get started?", "What can you help with?", "Suggest a daily routine", "How does XP work?"].map((action, i) => (
              <button key={i} onClick={() => { setInputValue(action); handleSend(); }}
                className="w-full px-3 py-2 text-left text-xs rounded-lg bg-muted/30 hover:bg-primary/20 hover:text-primary transition-colors">{action}</button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
