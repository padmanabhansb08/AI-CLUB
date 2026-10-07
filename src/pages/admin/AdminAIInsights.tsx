import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Activity,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { aiApi } from '../../api/ai.api';
import type { AdminAIInsights as AdminAIInsightsType, AdminAIAnalytics, AIStatus } from '../../types/ai';

export const AdminAIInsights: React.FC = () => {
  const [insights, setInsights] = useState<AdminAIInsightsType | null>(null);
  const [analytics, setAnalytics] = useState<AdminAIAnalytics | null>(null);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [insightsData, analyticsData, statusData] = await Promise.all([
        aiApi.getAdminInsights(),
        aiApi.getAdminAnalytics(),
        aiApi.getStatus(),
      ]);
      setInsights(insightsData);
      setAnalytics(analyticsData);
      setStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load admin AI insights:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AdminLayout pageTitle="AI Insights & Observability">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Sparkles size={22} style={{ color: 'var(--accent-color, #38bdf8)' }} />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-color, #f8fafc)' }}>
                Platform AI Intelligence & Observability
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
              High-level automated synthesis of club metrics, learning progression, and AI gateway usage telemetry.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #334155)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* Telemetry Metric Cards */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Total AI Requests</span>
                <Activity size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
                {analytics.totalRequests}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Across all platform features
              </div>
            </div>

            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Success Rate</span>
                <CheckCircle2 size={18} color="#4ade80" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4ade80' }}>
                {analytics.successRatePct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Graceful fallback on failures
              </div>
            </div>

            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Avg Latency</span>
                <Clock size={18} color="#60a5fa" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
                {analytics.avgLatencyMs} ms
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                In-memory cached candidate scoring
              </div>
            </div>

            <div style={{ background: 'var(--card-bg, #1e293b)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Estimated Cost</span>
                <DollarSign size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
                ${analytics.estimatedTotalCost.toFixed(4)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Deterministic pre-filtering
              </div>
            </div>
          </div>
        )}

        {/* Executive Platform Summary */}
        {insights && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
            <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-color, #38bdf8)', letterSpacing: '0.05em' }}>
                  Platform Synthesis
                </span>
                <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: '0.25rem 0 0.75rem 0' }}>
                  Executive Observation
                </h2>
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {insights.executiveSummary}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
                  Key Signals Detected:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {insights.observations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} color="#f59e0b" />
                  Recommended Areas for Admin Review:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {insights.areasToInvestigate.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gateway Configuration & Safety Guardrails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={16} color="#38bdf8" />
                  Gateway Status
                </h3>
                {status && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Active Provider:</span>
                      <span style={{ color: '#f8fafc', fontWeight: 600, textTransform: 'uppercase' }}>{status.provider}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Assistant API:</span>
                      <span style={{ color: status.assistantAvailable ? '#4ade80' : '#f87171' }}>
                        {status.assistantAvailable ? 'Online' : 'Disabled'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Recommendations:</span>
                      <span style={{ color: status.recommendationsAvailable ? '#4ade80' : '#f87171' }}>
                        {status.recommendationsAvailable ? 'Online' : 'Disabled'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Skill Matrix:</span>
                      <span style={{ color: status.skillAnalysisAvailable ? '#4ade80' : '#f87171' }}>
                        {status.skillAnalysisAvailable ? 'Online' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="#4ade80" />
                  AI Action Boundary
                </h3>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  Strict architectural containment: AI acts solely in <strong>READ, ANALYZE, RECOMMEND</strong> modes.
                </p>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80' }}>
                    <CheckCircle2 size={14} /> Zero autonomous database writes
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80' }}>
                    <CheckCircle2 size={14} /> Zero autonomous role elevations
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80' }}>
                    <CheckCircle2 size={14} /> Grounded multi-domain citations
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80' }}>
                    <CheckCircle2 size={14} /> Strict data minimization
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Usage Breakdown Table */}
        {analytics && analytics.byFeature && (
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: '0 0 1rem 0' }}>
              Telemetry Breakdown by Feature
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color, #334155)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Feature</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Request Count</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Average Latency</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.byFeature.map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-color, #38bdf8)' }}>{f.feature}</td>
                      <td style={{ padding: '0.75rem' }}>{f.count}</td>
                      <td style={{ padding: '0.75rem' }}>{f.avgLatencyMs} ms</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.75rem' }}>
                          Healthy
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default AdminAIInsights;
