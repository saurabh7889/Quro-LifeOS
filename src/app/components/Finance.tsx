import { useState, useEffect, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  Plus,
  X,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as api from "../api";
import { SmartContextMenu } from "./ui/SmartContextMenu";
import { useToast } from "./ui/Toast";
import { ConfirmDeleteDialog, LargeViewDialog } from "./ui/ItemActionDialogs";
import { useItemContextActions } from "./ui/useItemContextActions";
import { SectionEmptyState } from "./ui/SectionEmptyState";
import { SwipeableCard } from "./ui/SwipeableCard";
import { useIsMobile } from "./ui/use-mobile";

export function Finance() {
  const isMobile = useIsMobile();
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", type: "expense", category: "Other" });
  const [pinnedIds, setPinnedIds] = useState<Record<string, boolean>>({});
  const [largeView, setLargeView] = useState<{ type: "transaction" | "category"; item: any } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const { showToast } = useToast();
  const buildActions = useItemContextActions();

  useEffect(() => {
    api.finance.getSummary().then(setSummary);
    api.finance.getTransactions().then(setTransactions);
  }, []);

  const createTransaction = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) return;
    const amount = form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount));
    await api.finance.createTransaction({ name: form.name, amount, type: form.type, category: form.category });
    const [newSummary, newTxns] = await Promise.all([api.finance.getSummary(), api.finance.getTransactions()]);
    setSummary(newSummary);
    setTransactions(newTxns);
    setForm({ name: "", amount: "", type: "expense", category: "Other" });
    setShowForm(false);
  };

  const togglePin = (key: string) => {
    setPinnedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const duplicateTransaction = async (transaction: any) => {
    await api.finance.createTransaction({
      name: `${transaction.name} (Copy)`,
      amount: transaction.amount,
      type: transaction.amount > 0 ? "income" : "expense",
      category: transaction.category || "Other",
    });
    const [newSummary, newTxns] = await Promise.all([api.finance.getSummary(), api.finance.getTransactions()]);
    setSummary(newSummary);
    setTransactions(newTxns);
    showToast({ message: "Transaction duplicated", type: "success" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const previous = transactions;
    setTransactions((prev) => prev.filter((txn) => txn.id !== target.id));
    try {
      await api.finance.deleteTransaction(target.id);
      const updatedSummary = await api.finance.getSummary();
      setSummary(updatedSummary);
      showToast({
        message: "Transaction deleted",
        type: "warning",
        undoAction: async () => {
          setTransactions(previous);
          const rollbackSummary = await api.finance.getSummary();
          setSummary(rollbackSummary);
        },
      });
    } catch {
      setTransactions(previous);
      showToast({ message: "Could not delete transaction", type: "error" });
    }
  };

  if (!summary) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>;
  const hasFinanceData = transactions.length > 0;

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4 md:space-y-6`}>
      <div className="flex items-center justify-between">
        <div><h2 className={`mb-1 ${isMobile ? 'text-lg' : ''}`}>Finance</h2><p className="text-sm text-muted-foreground">Track your income, expenses, and savings</p></div>
        <button onClick={() => setShowForm(!showForm)} className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-primary text-primary-foreground rounded-lg hover:glow transition-all flex items-center gap-2 tap-feedback`}><Plus className="w-4 h-4" />{isMobile ? 'Add' : 'Add Transaction'}</button>
      </div>

      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={createTransaction} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between"><h3>New Transaction</h3><button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button></div>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name..." required className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none" />
          <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" required className="px-3 py-2 bg-input rounded-lg border border-border" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 bg-input rounded-lg border border-border">
              <option value="income">Income</option><option value="expense">Expense</option>
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 bg-input rounded-lg border border-border">
              <option>Housing</option><option>Food</option><option>Transport</option><option>Entertainment</option><option>Salary</option><option>Freelance</option><option>Other</option>
            </select>
          </div>
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:glow transition-all">Add Transaction</button>
        </motion.form>
      )}

      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Income</p><h3 className="font-bold">₹{summary.totalIncome.toLocaleString()}</h3></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-500" /></div><div><p className="text-xs text-muted-foreground">Expenses</p><h3 className="font-bold">₹{summary.totalExpenses.toLocaleString()}</h3></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Wallet className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Savings</p><h3 className="font-bold">₹{summary.savings.toLocaleString()}</h3></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"><PiggyBank className="w-5 h-5 text-accent" /></div><div><p className="text-xs text-muted-foreground">Net Worth</p><h3 className="font-bold">₹{summary.netWorth.toLocaleString()}</h3></div></div>
        </motion.div>
      </div>

      {hasFinanceData && (
        <div className={`grid gap-4 md:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
            <BarChart data={summary.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6">
          <h3 className="mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 250}>
            <PieChart>
              <Pie data={summary.expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {summary.expenseBreakdown.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(20, 20, 35, 0.9)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {summary.expenseBreakdown.map((item: any) => {
              const pinKey = `finance-category-${item.name}`;
              return (
                <SmartContextMenu
                  key={item.name}
                  actions={buildActions({
                    section: "finance",
                    isPinned: !!pinnedIds[pinKey],
                    onOpenLargeView: () => setLargeView({ type: "category", item }),
                    onEdit: () => showToast({ message: "Category editor coming soon", type: "default" }),
                    editLabel: "Edit Category Rules",
                    aiEdit: true,
                    onTogglePin: () => togglePin(pinKey),
                  })}
                >
                  <div className="flex items-center gap-2 cursor-default rounded-lg px-2 py-1.5 hover:bg-white/5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-bold ml-auto">₹{item.value}</span>
                  </div>
                </SmartContextMenu>
              );
            })}
          </div>
        </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Savings Target</h3>
          {!editingGoal && (
            <button
              onClick={() => { setGoalInput(String(summary.savingsGoal || "")); setEditingGoal(true); }}
              className="px-3 py-1.5 text-xs bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
            >
              {summary.savingsGoal > 0 ? "Edit Target" : "Set Target"}
            </button>
          )}
        </div>

        {editingGoal ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Savings Goal Amount (₹)</label>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const amount = parseFloat(goalInput);
                  if (isNaN(amount) || amount <= 0) {
                    showToast({ message: "Enter a valid amount", type: "error" });
                    return;
                  }
                  await api.finance.updateSavingsGoal({ goal_amount: amount });
                  const updated = await api.finance.getSummary();
                  setSummary(updated);
                  setEditingGoal(false);
                  showToast({ message: "Savings target updated!", type: "success" });
                }}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:glow transition-all text-sm font-bold"
              >
                Save Target
              </button>
              <button
                onClick={() => setEditingGoal(false)}
                className="px-4 py-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : summary.savingsGoal > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Progress to ₹{summary.savingsGoal.toLocaleString()}</span>
              <span className="font-bold">₹{summary.netWorth.toLocaleString()} / ₹{summary.savingsGoal.toLocaleString()}</span>
            </div>
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((summary.netWorth / summary.savingsGoal) * 100, 100)}%` }} transition={{ duration: 1.5, delay: 0.5 }} className={`absolute inset-y-0 left-0 rounded-full ${summary.netWorth >= summary.savingsGoal ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-primary to-accent"}`} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-muted-foreground">
                {summary.netWorth >= summary.savingsGoal
                  ? "🎉 Goal reached! Set a new target."
                  : `₹${(summary.savingsGoal - summary.netWorth).toLocaleString()} remaining`}
              </p>
              <span className="text-sm font-bold text-primary">{Math.min(Math.round((summary.netWorth / summary.savingsGoal) * 100), 100)}%</span>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <PiggyBank className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No savings target set yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Set Target" to start tracking your savings progress.</p>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-6">
        <h3 className="mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 10).map((transaction, i) => {
            const pinKey = `finance-transaction-${transaction.id}`;
            return (
              <SmartContextMenu
                key={transaction.id}
                actions={buildActions({
                  section: "finance",
                  isPinned: !!pinnedIds[pinKey],
                  onOpenLargeView: () => setLargeView({ type: "transaction", item: transaction }),
                  onDuplicate: () => duplicateTransaction(transaction),
                  onTogglePin: () => togglePin(pinKey),
                  onDelete: () => setDeleteTarget(transaction),
                })}
              >
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.amount > 0 ? "bg-green-500/20" : "bg-red-500/20"}`}>
                      {transaction.amount > 0 ? <TrendingUp className="w-5 h-5 text-green-500" /> : <CreditCard className="w-5 h-5 text-red-500" />}
                    </div>
                    <div><p className="text-sm font-medium">{transaction.name}</p><p className="text-xs text-muted-foreground">{transaction.date}</p></div>
                  </div>
                  <span className={`font-bold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                    {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </motion.div>
              </SmartContextMenu>
            );
          })}
          {transactions.length === 0 && (
            <SectionEmptyState message="No transactions yet. Add your first income or expense to start tracking finance." className="py-4" />
          )}
        </div>
      </motion.div>

      <LargeViewDialog
        open={!!largeView}
        onOpenChange={(open) => !open && setLargeView(null)}
        title={largeView?.item?.name || "Finance Insight"}
        description="Focused detail mode with trend context, editable properties, and AI-ready recommendations."
        details={largeView?.item || {}}
        insight="AI suggestion: this item is trending higher than your average spend velocity. Consider setting a budget alert."
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete transaction?"
        description={`This action will remove ${deleteTarget?.name || "this transaction"}. You can undo from the toast.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
