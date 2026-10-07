import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '../components/layout/PublicNav';
import { OrganicTerrainCanvas } from '../components/common/OrganicTerrainCanvas';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { eventService } from '../services/content/eventService';
import { courseService } from '../services/content/courseService';
import { projectService } from '../services/content/projectService';
import type { EventItem } from '../types/events';
import type { ExternalCourse } from '../data/courses';
import type { ProjectIdea } from '../data/projects';

export const LandingPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [projects, setProjects] = useState<ProjectIdea[]>([]);

  useEffect(() => {
    // Fetch live backend data for editorial showcases
    eventService.getEvents(1, 3)
      .then((res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          setEvents(res.data.slice(0, 3));
        } else if (Array.isArray(res)) {
          setEvents(res.slice(0, 3));
        }
      })
      .catch(() => {});

    courseService.fetchData()
      .then(() => {
        const c = courseService.getAll();
        if (Array.isArray(c)) setCourses(c.slice(0, 3));
      })
      .catch(() => {});

    projectService.fetchData()
      .then(() => {
        const p = projectService.getAll();
        if (Array.isArray(p)) setProjects(p.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#111111] overflow-x-hidden selection:bg-[#050505] selection:text-[#FFFFFF]">
      <PublicNav />

      {/* ========================================================
          1. HERO SECTION — Editorial Composition & Organic 3D Form
          ======================================================== */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="max-w-[1100px]">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 text-[13px] tracking-[0.06em] uppercase font-semibold text-[#66645F] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
            <span>AI Innovation Laboratory &middot; No. 112 Knowledge Quad</span>
          </div>

          {/* Hero Display Typography */}
          <h1 className="display-title mb-8 max-w-[16ch]">
            Where intelligence meets human curiosity.
          </h1>

          {/* Supporting Text */}
          <p className="editorial-sub mb-10 text-[18px] md:text-[22px] max-w-[52ch]">
            A community where students explore foundational artificial intelligence, build purposeful systems, and research what comes next.
          </p>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/register" className="pill-btn h-[48px] px-7 text-[15px]">
              Join AI CLUB <ArrowRight size={16} />
            </Link>
            <a href="#learn" className="pill-outline h-[48px] px-6 text-[15px]">
              Explore Curriculum &darr;
            </a>
          </div>
        </div>

        {/* Large-scale Organic 3D Terrain Visual */}
        <div className="mt-14 md:mt-20 relative w-full h-[380px] sm:h-[460px] md:h-[580px] rounded-[24px] md:rounded-[32px] overflow-hidden border border-[rgba(17,17,17,0.09)] shadow-[0_20px_60px_rgba(0,0,0,0.04)] bg-[#FAF9F6]">
          <OrganicTerrainCanvas className="w-full h-full" />
          
          {/* Floating Subtle Metadata Tag */}
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-[#FFFFFF]/85 backdrop-blur-md border border-[rgba(17,17,17,0.08)] rounded-full px-5 py-2 text-[12.5px] font-medium tracking-tight text-[#66645F] pointer-events-none">
            FIG 01. &middot; Autonomous Neural Landscape Simulation
          </div>
        </div>
      </section>

      {/* ========================================================
          2. MANIFESTO & NUMBERS — "What is AI CLUB?"
          ======================================================== */}
      <section id="manifesto" className="py-24 md:py-32 px-6 md:px-12 border-t border-[rgba(17,17,17,0.08)] bg-[#EBE9E3]/40">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-4">
              <span className="editorial-number">PHILOSOPHY</span>
              <h2 className="text-[28px] md:text-[38px] font-normal leading-[1.12] tracking-[-0.028em] text-[#111111]">
                Technology does not have to look mechanical. Intelligence can feel organic.
              </h2>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-8 text-[17px] md:text-[20px] text-[#66645F] leading-[1.65]">
              <p>
                We believe the future of AI belongs to creators who ground complex mathematics in genuine human utility. AI CLUB was formed to provide students with the compute, mentorship, and creative rigor required to build production-grade technology.
              </p>
              <p>
                From pre-training small language models on specialized datasets to developing autonomous computer vision systems for agriculture, our members work across the complete intelligence pipeline.
              </p>

              {/* Minimal Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-[rgba(17,17,17,0.1)]">
                <div>
                  <div className="text-[36px] md:text-[46px] font-normal tracking-[-0.03em] text-[#111111]">1,200+</div>
                  <div className="text-[13px] uppercase tracking-wider text-[#92908A] font-medium mt-1">Student Members</div>
                </div>
                <div>
                  <div className="text-[36px] md:text-[46px] font-normal tracking-[-0.03em] text-[#111111]">48</div>
                  <div className="text-[13px] uppercase tracking-wider text-[#92908A] font-medium mt-1">Systems Shipped</div>
                </div>
                <div>
                  <div className="text-[36px] md:text-[46px] font-normal tracking-[-0.03em] text-[#111111]">25+</div>
                  <div className="text-[13px] uppercase tracking-wider text-[#92908A] font-medium mt-1">Workshops & Labs</div>
                </div>
                <div>
                  <div className="text-[36px] md:text-[46px] font-normal tracking-[-0.03em] text-[#111111]">14</div>
                  <div className="text-[13px] uppercase tracking-wider text-[#92908A] font-medium mt-1">Research Papers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. 01 LEARN — Editorial Learning Chapters
          ======================================================== */}
      <section id="learn" className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="editorial-number">CHAPTER 01</span>
            <h2 className="section-heading">Learn from first principles.</h2>
          </div>
          <p className="editorial-sub max-w-[42ch]">
            Rigorous, project-driven curricula designed to cultivate deep intuition rather than superficial tutorial following.
          </p>
        </div>

        {/* Editorial Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course, idx) => (
              <div
                key={course.id}
                className="editorial-card group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A]">
                      COURSE 0{idx + 1}
                    </span>
                    <span className="text-[12px] px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#66645F]">
                      {course.difficulty || 'Intermediate'}
                    </span>
                  </div>
                  <h3 className="text-[22px] font-medium tracking-tight mb-3 group-hover:underline underline-offset-4">
                    {course.title}
                  </h3>
                  <p className="text-[14.5px] text-[#66645F] line-clamp-3 mb-6 leading-relaxed">
                    {course.description}
                  </p>
                </div>
                <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex items-center justify-between text-[13.5px]">
                  <span className="text-[#92908A]">{course.duration || '6 Weeks'}</span>
                  <Link to={`/courses/${course.id}`} className="font-medium text-[#111111] flex items-center gap-1">
                    Explore syllabus <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="editorial-card group flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-4 block">
                    TRACK 01
                  </span>
                  <h3 className="text-[24px] font-medium tracking-tight mb-3">
                    Generative AI &amp; Large Language Foundations
                  </h3>
                  <p className="text-[15px] text-[#66645F] leading-relaxed mb-6">
                    Attention mechanisms, RoPE embeddings, decoder architectures, instruction fine-tuning, and RLHF.
                  </p>
                </div>
                <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex justify-between text-[13.5px]">
                  <span className="text-[#92908A]">8 Weeks &middot; Lab Intensive</span>
                  <Link to="/courses" className="font-medium text-[#111111]">Details &rarr;</Link>
                </div>
              </div>

              <div className="editorial-card group flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-4 block">
                    TRACK 02
                  </span>
                  <h3 className="text-[24px] font-medium tracking-tight mb-3">
                    Computer Vision &amp; Spatial Intelligence
                  </h3>
                  <p className="text-[15px] text-[#66645F] leading-relaxed mb-6">
                    Convolutional features, vision transformers, semantic segmentation, NeRFs, and 3D Gaussian Splatting.
                  </p>
                </div>
                <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex justify-between text-[13.5px]">
                  <span className="text-[#92908A]">6 Weeks &middot; Hardware Accelerated</span>
                  <Link to="/courses" className="font-medium text-[#111111]">Details &rarr;</Link>
                </div>
              </div>

              <div className="editorial-card group flex flex-col justify-between">
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-4 block">
                    TRACK 03
                  </span>
                  <h3 className="text-[24px] font-medium tracking-tight mb-3">
                    Autonomous Multi-Agent Architecture
                  </h3>
                  <p className="text-[15px] text-[#66645F] leading-relaxed mb-6">
                    Tool calling, memory structures, planner-worker hierarchies, and verifiable execution loops.
                  </p>
                </div>
                <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex justify-between text-[13.5px]">
                  <span className="text-[#92908A]">6 Weeks &middot; Systems Focus</span>
                  <Link to="/courses" className="font-medium text-[#111111]">Details &rarr;</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ========================================================
          4. 02 BUILD — Featured Projects as Case Studies
          ======================================================== */}
      <section id="build" className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF9F6] border-y border-[rgba(17,17,17,0.08)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="editorial-number">CHAPTER 02</span>
              <h2 className="section-heading">Ideas become working systems.</h2>
            </div>
            <Link to="/projects" className="pill-outline text-[14px]">
              View All Projects ({projects.length || 12}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {projects.length > 0 ? (
              projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[20px] p-8 flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-[12px] text-[#92908A] mb-6">
                      <span>PROJECT 0{idx + 14}</span>
                      <span className="uppercase tracking-wider">{proj.status || 'Active'}</span>
                    </div>
                    <h3 className="text-[22px] font-medium tracking-tight mb-3">
                      {proj.title}
                    </h3>
                    <p className="text-[14.5px] text-[#66645F] leading-relaxed mb-6">
                      {proj.description}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex items-center justify-between text-[13.5px]">
                    <span className="text-[#66645F]">{proj.interestedCount || 4} Contributors</span>
                    <Link to={`/projects/${proj.id}`} className="font-medium text-[#111111] flex items-center gap-1">
                      Case study <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[20px] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[12px] text-[#92908A] block mb-6">CASE 01 &middot; HEALTHCARE</span>
                    <h3 className="text-[24px] font-medium tracking-tight mb-3">
                      OncoScan Deep Classifier
                    </h3>
                    <p className="text-[15px] text-[#66645F] leading-relaxed mb-6">
                      High-throughput histopathological slice analysis utilizing self-supervised visual encoders with clinical interpretability.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex justify-between text-[13.5px]">
                    <span className="text-[#66645F]">PyTorch &middot; ResNet-50</span>
                    <Link to="/projects" className="font-medium text-[#111111]">Explore &rarr;</Link>
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[20px] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[12px] text-[#92908A] block mb-6">CASE 02 &middot; SATELLITE</span>
                    <h3 className="text-[24px] font-medium tracking-tight mb-3">
                      GeoCrop Aerial Agriscan
                    </h3>
                    <p className="text-[15px] text-[#66645F] leading-relaxed mb-6">
                      Multispectral crop yield prediction models deployed across regional farmland drones for automated hydration management.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex justify-between text-[13.5px]">
                    <span className="text-[#66645F]">TensorFlow &middot; Edge TPU</span>
                    <Link to="/projects" className="font-medium text-[#111111]">Explore &rarr;</Link>
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[20px] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[12px] text-[#92908A] block mb-6">CASE 03 &middot; ROBOTICS</span>
                    <h3 className="text-[24px] font-medium tracking-tight mb-3">
                      Kinetix Quadruped Navigator
                    </h3>
                    <p className="text-[15px] text-[#66645F] leading-relaxed mb-6">
                      Reinforcement learning policies trained in NVIDIA Isaac Sim and deployed directly onto quadruped robotics hardware.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.07)] flex justify-between text-[13.5px]">
                    <span className="text-[#66645F]">Isaac Sim &middot; PPO</span>
                    <Link to="/projects" className="font-medium text-[#111111]">Explore &rarr;</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. 03 RESEARCH — Question Everything
          ======================================================== */}
      <section id="research" className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="max-w-[760px] mb-16">
          <span className="editorial-number">CHAPTER 03</span>
          <h2 className="section-heading mb-4">Question everything. Build what comes next.</h2>
          <p className="editorial-sub">
            Our research group investigates open theoretical questions, publishes peer-reviewed findings, and benchmarks novel model architectures.
          </p>
        </div>

        <div className="divide-y divide-[rgba(17,17,17,0.09)] border-y border-[rgba(17,17,17,0.09)]">
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-[#FAF9F6] px-4 transition-colors">
            <span className="md:col-span-2 text-[13px] font-mono text-[#92908A]">PAPER 2026.04</span>
            <h4 className="md:col-span-6 text-[20px] font-medium tracking-tight">
              Sparse Linear Attention Over Extreme Context Windows
            </h4>
            <span className="md:col-span-3 text-[14px] text-[#66645F]">Efficient Architecture Lab</span>
            <span className="md:col-span-1 text-right text-[13px] font-medium">&rarr;</span>
          </div>

          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-[#FAF9F6] px-4 transition-colors">
            <span className="md:col-span-2 text-[13px] font-mono text-[#92908A]">PAPER 2026.02</span>
            <h4 className="md:col-span-6 text-[20px] font-medium tracking-tight">
              Representational Alignment Across Cross-Lingual Code Encoders
            </h4>
            <span className="md:col-span-3 text-[14px] text-[#66645F]">NLP Foundations Working Group</span>
            <span className="md:col-span-1 text-right text-[13px] font-medium">&rarr;</span>
          </div>

          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-[#FAF9F6] px-4 transition-colors">
            <span className="md:col-span-2 text-[13px] font-mono text-[#92908A]">PAPER 2025.11</span>
            <h4 className="md:col-span-6 text-[20px] font-medium tracking-tight">
              Direct Preference Optimization Dynamics in Multi-Turn Reasoning
            </h4>
            <span className="md:col-span-3 text-[14px] text-[#66645F]">Safety &amp; Alignment Collective</span>
            <span className="md:col-span-1 text-right text-[13px] font-medium">&rarr;</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FEATURED EVENTS — Editorial Poster Style Cards
          ======================================================== */}
      <section id="events" className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF9F6] border-t border-[rgba(17,17,17,0.08)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="editorial-number">GATHERINGS</span>
              <h2 className="section-heading">Events &amp; Hackathons</h2>
            </div>
            <Link to="/events" className="pill-outline text-[14px]">
              Browse Calendar &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.length > 0 ? (
              events.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition-all"
                >
                  <div>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-8 block">
                      EVENT 0{idx + 1}
                    </span>
                    <div className="text-[34px] font-normal leading-tight tracking-[-0.03em] mb-4 text-[#111111]">
                      {evt.title}
                    </div>
                    <p className="text-[14.5px] text-[#66645F] line-clamp-3 mb-8">
                      {evt.description}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.08)] flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-semibold text-[#111111]">{evt.location || 'Campus Auditorium'}</div>
                      <div className="text-[12px] text-[#92908A]">{evt.start_at ? new Date(evt.start_at).toLocaleDateString() : 'Upcoming'}</div>
                    </div>
                    <Link to={`/events/${evt.id}`} className="pill-btn h-[38px] px-4 text-[13px]">
                      RSVP &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-8 block">
                      EVENT 01
                    </span>
                    <div className="text-[34px] font-normal leading-tight tracking-[-0.03em] mb-4 text-[#111111]">
                      AI HACKATHON 2026
                    </div>
                    <p className="text-[15px] text-[#66645F] mb-8">
                      48 hours of rapid prototyping with dedicated GPU clusters, industry judges, and cash bounties.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.08)] flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-semibold text-[#111111]">OCT 10 &middot; CHENNAI</div>
                      <div className="text-[12px] text-[#92908A]">200 Seats Capacity</div>
                    </div>
                    <Link to="/events" className="pill-btn h-[38px] px-4 text-[13px]">
                      RSVP &rarr;
                    </Link>
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-8 block">
                      EVENT 02
                    </span>
                    <div className="text-[34px] font-normal leading-tight tracking-[-0.03em] mb-4 text-[#111111]">
                      DIFFUSION LABS WORKSHOP
                    </div>
                    <p className="text-[15px] text-[#66645F] mb-8">
                      Hands-on session building latent diffusion models from scratch in JAX and PyTorch.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.08)] flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-semibold text-[#111111]">NOV 02 &middot; HYBRID</div>
                      <div className="text-[12px] text-[#92908A]">75 In-Person &middot; Live Stream</div>
                    </div>
                    <Link to="/events" className="pill-btn h-[38px] px-4 text-[13px]">
                      RSVP &rarr;
                    </Link>
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-8 block">
                      EVENT 03
                    </span>
                    <div className="text-[34px] font-normal leading-tight tracking-[-0.03em] mb-4 text-[#111111]">
                      RESEARCH DEMO NIGHT
                    </div>
                    <p className="text-[15px] text-[#66645F] mb-8">
                      Member presentations of term projects, working papers, and live interactive demonstrations.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[rgba(17,17,17,0.08)] flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-semibold text-[#111111]">NOV 28 &middot; MAIN HALL</div>
                      <div className="text-[12px] text-[#92908A]">Open to All Students</div>
                    </div>
                    <Link to="/events" className="pill-btn h-[38px] px-4 text-[13px]">
                      RSVP &rarr;
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. AI INTELLIGENCE LAYER — Calm Interactive Assistant
          ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="bg-[#050505] text-[#FFFFFF] rounded-[28px] md:rounded-[36px] p-8 sm:p-14 md:p-20 relative overflow-hidden">
          <div className="max-w-[720px] relative z-10">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#92908A] font-medium mb-4 block">
              ✦ EMBEDDED INTELLIGENCE
            </span>
            <h2 className="text-[36px] sm:text-[52px] md:text-[68px] font-normal leading-[1.04] tracking-[-0.03em] mb-6 text-[#FFFFFF]">
              Ask. Explore.<br />Understand. Build.
            </h2>
            <p className="text-[17px] md:text-[20px] text-[#92908A] leading-relaxed mb-10 max-w-[50ch]">
              Every member has access to the proprietary AI CLUB Assistant — tailored to our curriculum, research codebases, and ongoing hackathon teams.
            </p>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#050505] font-medium h-[48px] px-7 rounded-full text-[15px] hover:bg-[#EBE9E3] transition-colors"
            >
              Open AI Assistant <ArrowRight size={16} />
            </Link>
          </div>

          {/* Decorative Minimal Geometric Backdrop */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none hidden md:block">
            <div className="w-full h-full border-l border-white/20 flex flex-col justify-around px-8 font-mono text-[12px]">
              <div>// SPRINT 9 INTELLIGENCE ENGINE</div>
              <div>// ATTENTION WEIGHTS: NOMINAL</div>
              <div>// TOPOLOGY: DYNAMIC GRAPH</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FINAL CALL TO ACTION — Large Expressive Typography
          ======================================================== */}
      <section className="py-24 md:py-36 px-6 md:px-12 text-center max-w-[1200px] mx-auto">
        <span className="editorial-number">ADMISSIONS</span>
        <h2 className="hero-heading max-w-[16ch] mx-auto mb-8">
          Intelligence for the next generation.
        </h2>
        <p className="editorial-sub mx-auto mb-12 text-[18px] md:text-[22px]">
          Join an ambitious cohort of student engineers, researchers, and creators shaping modern technology.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="pill-btn h-[52px] px-9 text-[16px]">
            Join AI CLUB &rarr;
          </Link>
          <Link to="/login" className="pill-outline h-[52px] px-7 text-[16px]">
            Member Sign In
          </Link>
        </div>
      </section>

      {/* ========================================================
          9. EDITORIAL FOOTER — Minimalist & Architectural
          ======================================================== */}
      <footer className="border-t border-[rgba(17,17,17,0.08)] py-16 px-6 md:px-12 bg-[#FAF9F6] text-[#66645F] text-[14px]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <div className="text-[18px] font-semibold text-[#111111] mb-3 flex items-center gap-2">
              <span>✦</span> AI CLUB
            </div>
            <p className="max-w-[36ch] leading-relaxed mb-6">
              A university technology society dedicated to foundational artificial intelligence, engineering craftsmanship, and open research.
            </p>
            <div className="text-[12px] text-[#92908A]">
              112 Knowledge Quad &middot; Campus Center &middot; Tue–Sun, 9am till midnight
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[12px] uppercase font-semibold tracking-wider text-[#111111] mb-4">Explore</div>
            <ul className="space-y-2.5">
              <li><a href="#learn" className="hover:text-[#111111]">Courses</a></li>
              <li><a href="#build" className="hover:text-[#111111]">Projects</a></li>
              <li><a href="#research" className="hover:text-[#111111]">Research</a></li>
              <li><a href="#events" className="hover:text-[#111111]">Events</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-[12px] uppercase font-semibold tracking-wider text-[#111111] mb-4">Portal</div>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="hover:text-[#111111]">Student Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#111111]">Apply for Membership</Link></li>
              <li><Link to="/application" className="hover:text-[#111111]">Application Status</Link></li>
              <li><Link to="/admin/login" className="hover:text-[#111111]">Admin Control</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-[12px] uppercase font-semibold tracking-wider text-[#111111] mb-4">Colophon</div>
            <p className="text-[13px] leading-relaxed text-[#92908A] mb-4">
              Typeset in Inter Tight and Inter. Rendered in high-key off-white with procedural organic 3D simulations.
            </p>
            <div className="text-[12px] text-[#92908A]">
              &copy; {new Date().getFullYear()} AI CLUB. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
