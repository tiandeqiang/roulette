import React, { useState } from 'react';
import { PrizeTier, SpinResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyzePerformance } from '../services/geminiService';
import { Calculator, FileText, Loader2, DollarSign, Activity } from 'lucide-react';

interface BusinessDashboardProps {
  history: SpinResult[];
  tiers: PrizeTier[];
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ history, tiers }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSpins = history.length;
  const totalPayout = history.reduce((sum, item) => sum + item.prizeValue, 0);
  const avgPayout = totalSpins > 0 ? totalPayout / totalSpins : 0;
  
  // Calculate Actual RTP vs Theoretical
  // Theoretical RTP = Sum(Value * Probability)
  const theoreticalRTP = tiers.reduce((acc, t) => acc + (t.value * t.probability), 0);
  
  // Prepare chart data
  const chartData = tiers.map(tier => {
    const count = history.filter(h => h.prizeValue === tier.value).length;
    return {
      name: tier.label,
      actual: count,
      expected: Math.round(totalSpins * tier.probability)
    };
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    try {
      const result = await analyzePerformance(history, tiers);
      setReport(result);
    } catch (e) {
      setReport("Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-indigo-400" />
          Business Analytics
        </h2>
        <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">ADMIN MODE</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Total Spins</p>
          <p className="text-2xl font-bold text-white">{totalSpins}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Total Payout</p>
          <p className="text-2xl font-bold text-green-400">${totalPayout}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Avg. Payout / Spin</p>
          <p className="text-2xl font-bold text-indigo-400">${avgPayout.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Expected: ${theoreticalRTP.toFixed(2)}</p>
        </div>
         <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-sm">Net Profit (Est. $5/spin)</p>
          <p className="text-2xl font-bold text-blue-400">${(totalSpins * 5) - totalPayout}</p>
          <p className="text-xs text-slate-500 mt-1">Assuming $5 entry fee</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 h-[300px]">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Frequency Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="actual" name="Actual Hits" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expected" name="Expected Hits" fill="#334155" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-slate-950 p-6 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            AI Performance Analysis
          </h3>
          <button
            onClick={handleGenerateReport}
            disabled={loading || totalSpins === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              loading || totalSpins === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>

        {report && (
          <div className="bg-slate-900 p-4 rounded border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {report}
          </div>
        )}
        {!report && !loading && (
          <div className="text-slate-500 text-sm italic text-center py-8">
            Click "Generate Report" to get a Gemini-powered analysis of your machine's performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;