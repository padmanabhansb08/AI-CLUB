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
            background: '#FFFFFF',
            border: '1px solid rgba(17, 17, 17, 0.08)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div 
                style={{
                  background: '#050505',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Bot size={22} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#111111', letterSpacing: '-0.02em' }}>
                AI CLUB Intelligence Companion
              </h1>
            </div>
            <p style={{ margin: 0, color: '#66645F', fontSize: '0.9rem' }}>
              Curriculum guidance, workshop recommendations, skill gap mapping, and project pod discovery.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(21, 128, 61, 0.06)', border: '1px solid rgba(21, 128, 61, 0.18)', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', color: '#15803d', fontWeight: 500 }}>
            <ShieldCheck size={16} />
            <span>Grounded in verified platform records</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(17, 17, 17, 0.08)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              border: activeTab === 'chat' ? '1px solid #050505' : '1px solid transparent',
              background: activeTab === 'chat' ? '#050505' : 'transparent',
              color: activeTab === 'chat' ? '#FFFFFF' : '#66645F',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
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
              borderRadius: '9999px',
              border: activeTab === 'skills' ? '1px solid #050505' : '1px solid transparent',
              background: activeTab === 'skills' ? '#050505' : 'transparent',
              color: activeTab === 'skills' ? '#FFFFFF' : '#66645F',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <TrendingUp size={16} />
            Skill Gap & Learning Path
          </button>

          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              border: activeTab === 'search' ? '1px solid #050505' : '1px solid transparent',
              background: activeTab === 'search' ? '#050505' : 'transparent',
              color: activeTab === 'search' ? '#FFFFFF' : '#66645F',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={16} />
            Grounded Platform Search
          </button>
        </div>

        {/* TAB 1: CHAT ASSISTANT */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.25rem', minHeight: '620px' }}>
            
            {/* Conversation History Sidebar */}
            <div 
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid rgba(17, 17, 17, 0.08)',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div>
                <button
                  onClick={startNewChat}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid #050505',
                    background: '#050505',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginBottom: '1.25rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Plus size={16} />
                  New Conversation
                </button>

                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#92908A', marginBottom: '0.65rem', letterSpacing: '0.05em' }}>
                  Recent Sessions
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {conversations.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#92908A', padding: '0.5rem 0' }}>
                      No saved conversations yet.
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        style={{
                          textAlign: 'left',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: conv.id === currentConversationId ? '1px solid rgba(17, 17, 17, 0.2)' : '1px solid transparent',
                          background: conv.id === currentConversationId ? '#F5F4F0' : 'transparent',
                          color: conv.id === currentConversationId ? '#111111' : '#66645F',
                          fontWeight: conv.id === currentConversationId ? 600 : 400,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
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
                    borderRadius: '8px',
                    border: '1px solid rgba(185, 28, 28, 0.2)',
                    background: 'rgba(185, 28, 28, 0.05)',
                    color: '#b91c1c',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    marginTop: '1rem',
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
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid rgba(17, 17, 17, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                height: '620px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                overflow: 'hidden',
              }}
            >
              {/* Message Feed */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#FAF9F6' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '480px', padding: '2rem 1rem' }}>
                    <div 
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#EBE9E3',
                        color: '#111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                      }}
                    >
                      <Sparkles size={26} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: '#111111', marginBottom: '0.5rem', fontWeight: 600 }}>
                      What would you like to explore today?
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#66645F', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Ask questions about courses, upcoming workshops, research tracks, project pods, or your personal mock test review.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {starterPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(17, 17, 17, 0.08)',
                            background: '#FFFFFF',
                            color: '#111111',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(17, 17, 17, 0.25)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(17, 17, 17, 0.08)';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{prompt}</span>
                          <ChevronRight size={14} style={{ color: '#92908A' }} />
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
                          maxWidth: '78%',
                          padding: '0.95rem 1.25rem',
                          borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: msg.role === 'user' ? '#050505' : '#FFFFFF',
                          color: msg.role === 'user' ? '#FFFFFF' : '#111111',
                          border: msg.role === 'user' ? 'none' : '1px solid rgba(17, 17, 17, 0.08)',
                          fontSize: '0.9rem',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        {msg.content}

                        {/* Verified Source Badges */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(17, 17, 17, 0.08)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#66645F', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Verified Platform References:
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
                                      gap: '0.35rem',
                                      padding: '0.25rem 0.6rem',
                                      borderRadius: '9999px',
                                      fontSize: '0.75rem',
                                      background: '#F5F4F0',
                                      color: '#111111',
                                      textDecoration: 'none',
                                      border: '1px solid rgba(17, 17, 17, 0.1)',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {src.type === 'COURSE' && <BookOpen size={12} />}
                                    {src.type === 'EVENT' && <Calendar size={12} />}
                                    {src.type === 'PROJECT' && <FolderGit2 size={12} />}
                                    <span>{src.title}</span>
                                    <ExternalLink size={10} style={{ opacity: 0.6 }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#66645F', fontSize: '0.85rem', fontWeight: 500 }}>
                    <Bot size={18} className="animate-pulse text-[#050505]" />
                    <span>AI Assistant is analyzing club records...</span>
                  </div>
                )}

                {chatError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(185, 28, 28, 0.08)', border: '1px solid rgba(185, 28, 28, 0.2)', color: '#b91c1c', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{chatError}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(17, 17, 17, 0.08)', background: '#FFFFFF' }}>
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
                    placeholder="Ask about courses, research tracks, hackathons, or project teams..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1.15rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(17, 17, 17, 0.15)',
                      background: '#FFFFFF',
                      color: '#111111',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '9999px',
                      border: 'none',
                      background: '#050505',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: isLoading || !inputMessage.trim() ? 0.4 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Send size={15} />
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
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid rgba(17, 17, 17, 0.08)',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#111111', fontWeight: 600 }}>
                  Target Specialization or Role
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#66645F' }}>
                  Select your learning destination to compare current profile competencies with club curriculum requirements.
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
                    borderRadius: '9999px',
                    border: '1px solid rgba(17, 17, 17, 0.15)',
                    background: '#FFFFFF',
                    color: '#111111',
                    fontSize: '0.875rem',
                    outline: 'none',
                    fontWeight: 500,
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
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#050505',
                    color: '#FFFFFF',
                    fontWeight: 500,
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
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#66645F', fontSize: '0.9rem', fontWeight: 500 }}>
                Analyzing skills matrix and mapping to existing AI CLUB courses...
              </div>
            )}

            {skillError && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(185, 28, 28, 0.08)', color: '#b91c1c', border: '1px solid rgba(185, 28, 28, 0.2)', fontSize: '0.85rem' }}>
                {skillError}
              </div>
            )}

            {skillGapData && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Competency Matrix Card */}
                <div 
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid rgba(17, 17, 17, 0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#111111', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Skill Gap Breakdown: {skillGapData.target}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#66645F', margin: 0, lineHeight: 1.5 }}>
                      {skillGapData.summary}
                    </p>
                  </div>

                  {/* Mastered Skills */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#15803d', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      ✓ Mastered Skills ({skillGapData.currentSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {skillGapData.currentSkills.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#92908A' }}>None matched in profile yet</span>
                      ) : (
                        skillGapData.currentSkills.map((s, idx) => (
                          <span key={idx} style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', background: 'rgba(21, 128, 61, 0.08)', color: '#15803d', border: '1px solid rgba(21, 128, 61, 0.2)', fontWeight: 500 }}>
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Developing Skills */}
                  {skillGapData.developingSkills.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#0369a1', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                        ⚡ Developing ({skillGapData.developingSkills.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {skillGapData.developingSkills.map((s, idx) => (
                          <span key={idx} style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', background: 'rgba(3, 105, 161, 0.08)', color: '#0369a1', border: '1px solid rgba(3, 105, 161, 0.2)', fontWeight: 500 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#b45309', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      🎯 Growth Skills to Acquire ({skillGapData.missingSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {skillGapData.missingSkills.map((s, idx) => (
                        <span key={idx} style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem', background: 'rgba(180, 83, 9, 0.08)', color: '#b45309', border: '1px solid rgba(180, 83, 9, 0.2)', fontWeight: 500 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Courses to bridge gaps */}
                  {skillGapData.recommendedCourses.length > 0 && (
                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(17, 17, 17, 0.08)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111111', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recommended Courses:
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
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: '#FAF9F6',
                              border: '1px solid rgba(17, 17, 17, 0.08)',
                              color: '#111111',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{c.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#66645F', fontWeight: 600 }}>Explore →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Structured Learning Path Roadmap */}
                <div 
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid rgba(17, 17, 17, 0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#111111', margin: 0, fontWeight: 600 }}>
                      Structured Learning Roadmap
                    </h3>
                    {learningPathData && (
                      <span style={{ fontSize: '0.8rem', color: '#66645F', fontWeight: 500 }}>
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
                            gap: '0.85rem',
                            position: 'relative',
                          }}
                        >
                          <div 
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: '#050505',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {step.step}
                          </div>

                          <div style={{ flex: 1, background: '#FAF9F6', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid rgba(17, 17, 17, 0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#111111', fontWeight: 600 }}>{step.title}</h4>
                              {step.courseId && (
                                <Link 
                                  to={`/courses/${step.courseId}`}
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#111111',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  Course <ExternalLink size={10} />
                                </Link>
                              )}
                            </div>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#66645F', lineHeight: 1.5 }}>
                              {step.description}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {step.targetSkills.map((sk, sIdx) => (
                                <span key={sIdx} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(17, 17, 17, 0.06)', color: '#111111', fontWeight: 500 }}>
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
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(17, 17, 17, 0.08)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#111111', fontWeight: 600 }}>
                Multi-Domain Knowledge Search
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#66645F' }}>
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
                  padding: '0.75rem 1.15rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(17, 17, 17, 0.15)',
                  background: '#FFFFFF',
                  color: '#111111',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#050505',
                  color: '#FFFFFF',
                  fontWeight: 500,
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
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#66645F', fontSize: '0.875rem' }}>
                Querying platform domains...
              </div>
            )}

            {searchResults && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                {/* Courses */}
                <div style={{ background: '#FAF9F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(17, 17, 17, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#111111', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <BookOpen size={16} />
                    <span>Courses ({searchResults.filter(r => r.type === 'COURSE').length})</span>
                  </div>
                  {searchResults.filter(r => r.type === 'COURSE').length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#92908A' }}>No matching courses</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchResults.filter(r => r.type === 'COURSE').map(c => (
                        <Link 
                          key={c.id} 
                          to={c.url}
                          style={{ padding: '0.65rem', borderRadius: '8px', background: '#FFFFFF', color: '#111111', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid rgba(17, 17, 17, 0.06)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#66645F' }}>{c.snippet}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Events */}
                <div style={{ background: '#FAF9F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(17, 17, 17, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#111111', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <Calendar size={16} />
                    <span>Events ({searchResults.filter(r => r.type === 'EVENT').length})</span>
                  </div>
                  {searchResults.filter(r => r.type === 'EVENT').length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#92908A' }}>No matching events</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchResults.filter(r => r.type === 'EVENT').map(e => (
                        <Link 
                          key={e.id} 
                          to={e.url}
                          style={{ padding: '0.65rem', borderRadius: '8px', background: '#FFFFFF', color: '#111111', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid rgba(17, 17, 17, 0.06)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{e.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#66645F' }}>{e.snippet}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects */}
                <div style={{ background: '#FAF9F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(17, 17, 17, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#111111', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    <FolderGit2 size={16} />
                    <span>Projects ({searchResults.filter(r => r.type === 'PROJECT').length})</span>
                  </div>
                  {searchResults.filter(r => r.type === 'PROJECT').length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#92908A' }}>No matching projects</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {searchResults.filter(r => r.type === 'PROJECT').map(p => (
                        <Link 
                          key={p.id} 
                          to={p.url}
                          style={{ padding: '0.65rem', borderRadius: '8px', background: '#FFFFFF', color: '#111111', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid rgba(17, 17, 17, 0.06)' }}
                        >
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#66645F' }}>{p.snippet}</div>
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
