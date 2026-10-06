import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  FolderGit2, 
  Trash2, 
  Plus, 
  MessageSquare, 
  AlertCircle,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { aiApi } from '../api/ai.api';
import type { 
  AIChatMessage, 
  AIConversationSummary, 
  SkillGapAnalysisResult,
  LearningPathResult,
  AISearchResultItem
} from '../types/ai';

export const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'skills' | 'search'>('chat');

  // Chat State
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Skill Gap & Learning Path State
  const [skillTarget, setSkillTarget] = useState('Generative AI Developer');
  const [skillGapData, setSkillGapData] = useState<SkillGapAnalysisResult | null>(null);
  const [learningPathData, setLearningPathData] = useState<LearningPathResult | null>(null);
  const [isSkillLoading, setIsSkillLoading] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AISearchResultItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    'What should I learn next after machine learning?',
    'Find upcoming AI events and hackathons',
    'Recommend a collaborative project for my skills',
    'How do I build a Generative AI learning path?',
  ];

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const convs = await aiApi.getConversations();
      setConversations(convs);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (id: string) => {
    try {
      setIsLoading(true);
      setCurrentConversationId(id);
      const msgs = await aiApi.getConversationMessages(id);
      setMessages(msgs);
    } catch (err: any) {
      setChatError('Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
    setChatError(null);
  };

  const deleteCurrentConversation = async () => {
    if (!currentConversationId) return;
    try {
      await aiApi.deleteConversation(currentConversationId);
      setConversations(prev => prev.filter(c => c.id !== currentConversationId));
      startNewChat();
    } catch (err: any) {
      setChatError('Failed to delete conversation.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setChatError(null);
    setInputMessage('');

    // Append user message immediately
    const userMsg: AIChatMessage = {
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await aiApi.chat(text, currentConversationId);
      
      const assistantMsg: AIChatMessage = {
        role: 'assistant',
        content: res.message,
        sources: res.sources,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setCurrentConversationId(res.conversationId);
      loadConversations();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Error processing request.';
      setChatError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Skill Gap Analysis
  const handleAnalyzeSkills = async (targetOverride?: string) => {
    const target = targetOverride || skillTarget;
    setIsSkillLoading(true);
    setSkillError(null);
    try {
      const gapRes = await aiApi.analyzeSkillGap(target);
      setSkillGapData(gapRes);
      const pathRes = await aiApi.generateLearningPath(`Become a ${target}`);
      setLearningPathData(pathRes);
    } catch (err: any) {
      setSkillError(err.response?.data?.error?.message || err.message || 'Failed to analyze skill gap.');
    } finally {
      setIsSkillLoading(false);
    }
  };

  // Grounded Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await aiApi.search(searchQuery.trim());
      setSearchResults(results);
    } catch (err: any) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <DashboardLayout pageTitle="AI Assistant">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header Banner */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div 
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Bot size={22} />
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                AI CLUB Assistant
              </h1>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
              Your personalized academic companion for course recommendations, event discovery, skill maps, and team projects.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', color: '#4ade80' }}>
            <ShieldCheck size={16} />
            <span>Grounded in verified platform records</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'chat' ? 'var(--accent-color, #38bdf8)' : 'transparent',
              color: activeTab === 'chat' ? '#0f172a' : 'var(--text-muted, #94a3b8)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <MessageSquare size={16} />
            Chat Assistant
          </button>

          <button
            onClick={() => {
              setActiveTab('skills');
              if (!skillGapData) handleAnalyzeSkills();
            }}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'skills' ? 'var(--accent-color, #38bdf8)' : 'transparent',
              color: activeTab === 'skills' ? '#0f172a' : 'var(--text-muted, #94a3b8)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <TrendingUp size={16} />
            Skill Gap & Learning Path
          </button>

          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'search' ? 'var(--accent-color, #38bdf8)' : 'transparent',
              color: activeTab === 'search' ? '#0f172a' : 'var(--text-muted, #94a3b8)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Search size={16} />
            Grounded Platform Search
          </button>
        </div>

        {/* TAB 1: CHAT ASSISTANT */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', minHeight: '600px' }}>
            
            {/* Conversation History Sidebar */}
            <div 
              style={{
                background: 'var(--card-bg, #1e293b)',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #334155)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <button
                  onClick={startNewChat}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: '1px dashed var(--accent-color, #38bdf8)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--accent-color, #38bdf8)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  <Plus size={16} />
                  New Conversation
                </button>

                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Recent Sessions
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {conversations.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', padding: '0.5rem 0' }}>
                      No saved conversations yet.
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        style={{
                          textAlign: 'left',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          border: conv.id === currentConversationId ? '1px solid var(--accent-color, #38bdf8)' : '1px solid transparent',
                          background: conv.id === currentConversationId ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                          color: conv.id === currentConversationId ? '#f8fafc' : 'var(--text-muted, #cbd5e1)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <MessageSquare size={14} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title || 'Conversation'}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {currentConversationId && (
                <button
                  onClick={deleteCurrentConversation}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                  Delete Conversation
                </button>
              )}
            </div>

            {/* Chat Messages Panel */}
            <div 
              style={{
                background: 'var(--card-bg, #1e293b)',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #334155)',
                display: 'flex',
                flexDirection: 'column',
                height: '620px',
              }}
            >
              {/* Message Feed */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '480px', padding: '2rem 1rem' }}>
                    <div 
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent-color, #38bdf8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <Sparkles size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
                      How can I help you today?
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                      Ask questions about courses, upcoming workshops, project teams, or your personal learning progression.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {starterPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #334155)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            color: 'var(--text-color, #e2e8f0)',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{prompt}</span>
                          <ChevronRight size={14} style={{ color: 'var(--accent-color, #38bdf8)' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div 
                        style={{
                          maxWidth: '80%',
                          padding: '0.85rem 1.15rem',
                          borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: msg.role === 'user' ? 'var(--accent-color, #0284c7)' : 'rgba(15, 23, 42, 0.8)',
                          color: msg.role === 'user' ? '#ffffff' : '#f8fafc',
                          border: msg.role === 'user' ? 'none' : '1px solid var(--border-color, #334155)',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.content}

                        {/* Verified Source Badges */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-color, #38bdf8)', marginBottom: '0.4rem' }}>
                              Verified Platform Sources:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {msg.sources.map((src, sIdx) => {
                                const targetUrl = src.type === 'COURSE' 
                                  ? `/courses/${src.id}` 
                                  : src.type === 'EVENT' 
                                  ? `/events/${src.id}` 
                                  : `/projects/${src.id}`;
                                return (
                                  <Link
                                    key={sIdx}
                                    to={targetUrl}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      background: 'rgba(56, 189, 248, 0.15)',
                                      color: '#7dd3fc',
                                      textDecoration: 'none',
                                      border: '1px solid rgba(56, 189, 248, 0.3)',
                                    }}
                                  >
                                    {src.type === 'COURSE' && <BookOpen size={12} />}
                                    {src.type === 'EVENT' && <Calendar size={12} />}
                                    {src.type === 'PROJECT' && <FolderGit2 size={12} />}
                                    <span>{src.title}</span>
                                    <ExternalLink size={10} />
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color, #38bdf8)', fontSize: '0.85rem' }}>
                    <Bot size={18} className="animate-pulse" />
                    <span>AI Assistant is analyzing club records...</span>
                  </div>
                )}

                {chatError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{chatError}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color, #334155)', background: 'rgba(15, 23, 42, 0.5)' }}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{ display: 'flex', gap: '0.75rem' }}
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask AI Assistant about courses, hackathons, or project recommendations..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #334155)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--accent-color, #38bdf8)',
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: isLoading || !inputMessage.trim() ? 0.6 : 1,
                    }}
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SKILL GAP & LEARNING PATH */}
        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Target Role Selector */}
            <div 
              style={{
                background: 'var(--card-bg, #1e293b)',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #334155)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                  Target Specialization or Role
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Select your learning destination to compare current profile competencies with curriculum requirements.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={skillTarget}
                  onChange={(e) => {
                    setSkillTarget(e.target.value);
                    handleAnalyzeSkills(e.target.value);
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #334155)',
                    background: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="Generative AI Developer">Generative AI Developer</option>
                  <option value="Computer Vision Specialist">Computer Vision Specialist</option>
                  <option value="NLP Engineer">NLP Engineer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                  <option value="MLOps Engineer">MLOps Engineer</option>
                </select>

                <button
                  onClick={() => handleAnalyzeSkills()}
                  disabled={isSkillLoading}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-color, #38bdf8)',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: isSkillLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <RotateCcw size={14} />
                  Analyze
                </button>
              </div>
            </div>

            {isSkillLoading && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-color, #38bdf8)' }}>
                Analyzing skills matrix and mapping to existing AI CLUB courses...
              </div>
            )}

            {skillError && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                {skillError}
              </div>
            )}

            {skillGapData && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Competency Matrix Card */}
                <div 
                  style={{
                    background: 'var(--card-bg, #1e293b)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #334155)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Skill Gap Breakdown: {skillGapData.target}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                      {skillGapData.summary}
                    </p>
                  </div>

                  {/* Mastered Skills */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.4rem' }}>
                      ✓ Mastered Skills ({skillGapData.currentSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {skillGapData.currentSkills.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>None matched in profile yet</span>
                      ) : (
                        skillGapData.currentSkills.map((s, idx) => (
                          <span key={idx} style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Developing Skills */}
                  {skillGapData.developingSkills.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#60a5fa', marginBottom: '0.4rem' }}>
                        ⚡ Developing ({skillGapData.developingSkills.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {skillGapData.developingSkills.map((s, idx) => (
                          <span key={idx} style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#f59e0b', marginBottom: '0.4rem' }}>
                      🎯 Growth Skills to Acquire ({skillGapData.missingSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {skillGapData.missingSkills.map((s, idx) => (
                        <span key={idx} style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Courses to bridge gaps */}
                  {skillGapData.recommendedCourses.length > 0 && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                        Courses Bridging These Gaps:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {skillGapData.recommendedCourses.map((c, idx) => (
                          <Link 
                            key={idx}
                            to={`/courses/${c.courseId}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.6rem 0.75rem',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-color, #334155)',
                              color: '#f8fafc',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{c.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-color, #38bdf8)' }}>View →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Structured Learning Path Roadmap */}
                <div 
                  style={{
                    background: 'var(--card-bg, #1e293b)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #334155)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: 0 }}>
                      Guided Roadmap
                    </h3>
                    {learningPathData && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
                        ~{learningPathData.estimatedDurationWeeks} Weeks
                      </span>
                    )}
                  </div>

                  {learningPathData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {learningPathData.steps.map((step) => (
                        <div 
                          key={step.step}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            position: 'relative',
                          }}
                        >
                          <div 
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'var(--accent-color, #38bdf8)',
                              color: '#0f172a',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {step.step}
                          </div>

                          <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc' }}>{step.title}</h4>
                              {step.courseId && (
                                <Link 
                                  to={`/courses/${step.courseId}`}
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-color, #38bdf8)',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                  }}
                                >
                                  Course <ExternalLink size={10} />
                                </Link>
                              )}
                            </div>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                              {step.description}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {step.targetSkills.map((sk, sIdx) => (
                                <span key={sIdx} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.1)', color: '#7dd3fc' }}>
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GROUNDED MULTI-DOMAIN SEARCH */}
        {activeTab === 'search' && (
          <div 
            style={{
              background: 'var(--card-bg, #1e293b)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #334155)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#f8fafc' }}>
                Multi-Domain Knowledge Search
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                Search across all published AI CLUB courses, workshops, hackathons, and collaborative projects.
              </p>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. PyTorch, Computer Vision, RAG, Reinforcement Learning)..."
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #334155)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-color, #38bdf8)',
                  color: '#0f172a',
                  fontWeight: 600,
                  cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </form>

            {isSearching && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--accent-color, #38bdf8)' }}>
                Querying platform domains...
              </div>
            )}

            {searchResults && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                {/* Courses */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <BookOpen size={16} />
                    <span>Courses ({searchResults.filter(r => r.type === 'COURSE').length})</span>
                  </div>
                  {searchResults.filter(r => r.type === 'COURSE').length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No matching courses</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchResults.filter(r => r.type === 'COURSE').map(c => (
                        <Link 
                          key={c.id} 
                          to={c.url}
                          style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', color: '#f8fafc', textDecoration: 'none', fontSize: '0.85rem' }}
                        >
                          <div style={{ fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.snippet}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Events */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <Calendar size={16} />
                    <span>Events ({searchResults.filter(r => r.type === 'EVENT').length})</span>
                  </div>
                  {searchResults.filter(r => r.type === 'EVENT').length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No matching events</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchResults.filter(r => r.type === 'EVENT').map(e => (
                        <Link 
                          key={e.id} 
                          to={e.url}
                          style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', color: '#f8fafc', textDecoration: 'none', fontSize: '0.85rem' }}
                        >
                          <div style={{ fontWeight: 600 }}>{e.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{e.snippet}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <FolderGit2 size={16} />
                    <span>Projects ({searchResults.filter(r => r.type === 'PROJECT').length})</span>
                  </div>
                  {searchResults.filter(r => r.type === 'PROJECT').length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No matching projects</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchResults.filter(r => r.type === 'PROJECT').map(p => (
                        <Link 
                          key={p.id} 
                          to={p.url}
                          style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', color: '#f8fafc', textDecoration: 'none', fontSize: '0.85rem' }}
                        >
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.snippet}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
export default AIAssistant;
