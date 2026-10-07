import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Code2,
  Cpu,
  Network,
  Menu,
  X,
} from "lucide-react";
import { API_URL } from "../services/apiConfig";
import "../home.css";

type Highlight = {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  eventType?: string;
  start_at?: string;
  event_type?: string;
  startAt?: string;
  location?: string;
};
type Feed = { items: Highlight[]; loading: boolean; error: string };
function useHighlights(endpoint: string) {
  const [feed, setFeed] = useState<Feed>({
    items: [],
    loading: true,
    error: "",
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/${endpoint}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Content is temporarily unavailable.");
        const result = await response.json();
        const items = result.data;
        if (!Array.isArray(items))
          throw new Error("Content is temporarily unavailable.");
        const normalized = items.map((item) => ({
          ...item,
          startAt: item.startAt || item.start_at,
          eventType: item.eventType || item.event_type,
          shortDescription: item.shortDescription || item.short_description,
        }));
        setFeed({ items: normalized, loading: false, error: "" });
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setFeed({
            items: [],
            loading: false,
            error: "Content is temporarily unavailable.",
          });
      });
    return () => controller.abort();
  }, [endpoint, attempt]);
  return {
    ...feed,
    retry: () => {
      setFeed({ items: [], loading: true, error: "" });
      setAttempt((value) => value + 1);
    },
  };
}

function FeedStatus({
  feed,
  empty,
}: {
  feed: Feed & { retry: () => void };
  empty: string;
}) {
  if (feed.loading)
    return (
      <p className="home-feed-status" role="status">
        Loading club activity…
      </p>
    );
  if (feed.error)
    return (
      <div className="home-feed-status" role="status">
        <p>{feed.error}</p>
        <button onClick={feed.retry}>
          Try again <ArrowRight size={15} />
        </button>
      </div>
    );
  if (!feed.items.length) return <p className="home-feed-status">{empty}</p>;
  return null;
}

// Approved direction: a public SIET club website with an existing member portal.
// Official advisor, team and contact details stay pending until supplied by the club.
export function Home() {
  const [now] = useState(() => Date.now());
  const [year] = useState(() => new Date().getFullYear());
  const [menuOpen, setMenuOpen] = useState(false);
  const projects = useHighlights("projects");
  const events = useHighlights("events?upcoming=true&limit=3");
  const achievements = useHighlights("achievements");
  const upcoming = {
    ...events,
    items: events.items
      .filter(
        (event) => event.startAt && new Date(event.startAt).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime(),
      ),
  };
  useEffect(() => {
    document.title = "AI CLUB · SIET — Learn. Build. Go further.";
  }, []);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="club-home">
      <a className="home-skip" href="#home-main">
        Skip to content
      </a>
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="AI Club SIET home">
          <span className="home-brand-mark">
            ai<span>_</span>
          </span>
          <span>
            AI CLUB<small>SIET / STUDENT COMMUNITY</small>
          </span>
        </Link>
        <button
          className="home-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="home-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          id="home-nav"
          className={`home-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <a href="#about" onClick={closeMenu}>
            The club
          </a>
          <a href="#projects" onClick={closeMenu}>
            Projects
          </a>
          <a href="#events" onClick={closeMenu}>
            Events
          </a>
          <Link to="/login" className="home-login">
            Member login <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main id="home-main">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow">
              <span /> A COMMUNITY FOR CURIOUS MINDS
            </p>
            <h1>
              Don’t just study AI.
              <br />
              <em>Build what’s next.</em>
            </h1>
            <p className="home-hero-description">
              A place at SIET to turn curiosity into code. Explore artificial
              intelligence, find your people, and make ideas real—one experiment
              at a time.
            </p>
            <div className="home-actions">
              <Link className="home-button home-button-primary" to="/register">
                Join the club <ArrowUpRight size={19} />
              </Link>
              <a className="home-button home-button-quiet" href="#projects">
                Explore our work <ArrowRight size={18} />
              </a>
            </div>
            <div className="home-hero-note">
              <span>ALL DEPARTMENTS.</span>
              <span>ALL EXPERIENCE LEVELS.</span>
              <span>ONE SHARED CURIOSITY.</span>
            </div>
          </div>
          <div
            className="home-lab"
            aria-label="Illustration of connected nodes in a neural network"
            role="img"
          >
            <div className="home-lab-top">
              <span>SIET / EXPERIMENTAL SPACE</span>
              <span className="home-live">● IDEAS IN MOTION</span>
            </div>
            <svg viewBox="0 0 500 380" aria-hidden="true">
              <defs>
                <radialGradient id="node-glow">
                  <stop stopColor="#d8ff7c" stopOpacity=".2" />
                  <stop offset="1" stopColor="#d8ff7c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="250" cy="190" r="170" fill="url(#node-glow)" />
              <g className="home-network-lines">
                {[90, 190, 290].flatMap((y, i) =>
                  [70, 150, 230, 310].map((v, j) => (
                    <line key={`a${i}${j}`} x1="85" y1={y} x2="250" y2={v} />
                  )),
                )}
                {[70, 150, 230, 310].flatMap((y, i) =>
                  [110, 270].map((v, j) => (
                    <line key={`b${i}${j}`} x1="250" y1={y} x2="420" y2={v} />
                  )),
                )}
              </g>
              <g className="home-network-nodes">
                {[90, 190, 290].map((y) => (
                  <circle key={`i${y}`} cx="85" cy={y} r="9" />
                ))}
                {[70, 150, 230, 310].map((y) => (
                  <circle key={`h${y}`} cx="250" cy={y} r="11" />
                ))}
                {[110, 270].map((y) => (
                  <circle key={`o${y}`} cx="420" cy={y} r="13" />
                ))}
              </g>
              <g className="home-network-labels">
                <text x="85" y="355">
                  CURIOSITY
                </text>
                <text x="250" y="355">
                  EXPERIMENT
                </text>
                <text x="420" y="355">
                  IMPACT
                </text>
              </g>
            </svg>
            <div className="home-lab-bottom">
              <code>input: your_idea</code>
              <span>→</span>
              <code>output: something_real</code>
            </div>
          </div>
        </section>
        <div className="home-strip">
          <span>LEARN BY DOING</span>
          <span>↗</span>
          <span>BUILD TOGETHER</span>
          <span>↗</span>
          <span>SHARE WHAT YOU DISCOVER</span>
          <a href="#about" aria-label="Discover the club">
            <ArrowDown size={20} />
          </a>
        </div>
        <section id="about" className="home-section home-about">
          <div>
            <p className="home-eyebrow">01 / THE CLUB</p>
            <h2>
              Big questions.
              <br />
              Hands-on answers.
            </h2>
          </div>
          <div className="home-about-copy">
            <p>
              AI is changing how we think, create, and solve problems. We’re
              here to understand it by getting our hands dirty.
            </p>
            <p>
              AI CLUB brings SIET students together to learn the foundations,
              experiment with new ideas, and collaborate on projects. Start with
              a question. Leave with something you built.
            </p>
            <a href="#join" className="home-text-link">
              Find your starting point <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
        <section
          className="home-pillars"
          aria-label="What you can do in the club"
        >
          {[
            {
              icon: Cpu,
              title: "Understand the fundamentals",
              text: "Explore machine learning, data, and the ideas behind intelligent systems.",
              tag: "01 / LEARN",
            },
            {
              icon: Code2,
              title: "Turn ideas into experiments",
              text: "Find project ideas, put your skills into practice, and build with a team.",
              tag: "02 / BUILD",
            },
            {
              icon: Network,
              title: "Find your collaborators",
              text: "Connect with students who share your interests and bring different perspectives.",
              tag: "03 / CONNECT",
            },
          ].map((item) => (
            <article key={item.tag}>
              <div className="home-pillar-top">
                <span>{item.tag}</span>
                <item.icon size={25} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
        <section id="projects" className="home-section home-feed">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">02 / IDEAS INTO ACTION</p>
              <h2>The building starts here.</h2>
            </div>
            <Link className="home-text-link" to="/login">
              Enter the project space <ArrowUpRight size={18} />
            </Link>
          </div>
          <FeedStatus
            feed={projects}
            empty="Our next project ideas will appear here as the club publishes them."
          />
          <div className="home-project-grid">
            {projects.items.slice(0, 3).map((project, i) => (
              <article key={project.id} className="home-project">
                <div className="home-project-art" aria-hidden="true">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <Code2 size={76} strokeWidth={1} />
                </div>
                <div className="home-project-copy">
                  <span className="home-tag">
                    {project.category || "CLUB PROJECT"}
                  </span>
                  <h3>{project.title}</h3>
                  <p>{project.shortDescription || project.description}</p>
                  <Link
                    to={`/projects/${project.id}`}
                    className="home-text-link"
                  >
                    Explore project <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="events" className="home-section home-feed">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">03 / COME GET INVOLVED</p>
              <h2>On the calendar.</h2>
            </div>
            <Link className="home-text-link" to="/events">
              Member event space <ArrowUpRight size={18} />
            </Link>
          </div>
          <FeedStatus
            feed={upcoming}
            empty="No upcoming events are published yet. Check back for the next club session."
          />
          <div className="home-event-list">
            {upcoming.items.slice(0, 3).map((event) => (
              <Link
                key={event.id}
                className="home-event"
                to={`/events/${event.id}`}
              >
                <time dateTime={event.startAt}>
                  <strong>
                    {new Date(event.startAt!).toLocaleDateString("en-IN", {
                      day: "2-digit",
                    })}
                  </strong>
                  <span>
                    {new Date(event.startAt!).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </time>
                <div>
                  <span className="home-tag">
                    {event.eventType || "CLUB EVENT"}
                  </span>
                  <h3>{event.title}</h3>
                  <p>
                    {event.location || "See event details"} ·{" "}
                    {new Date(event.startAt!).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ArrowUpRight size={24} />
              </Link>
            ))}
          </div>
        </section>
        <section className="home-section home-feed">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">04 / MOMENTS THAT MATTER</p>
              <h2>Work worth celebrating.</h2>
            </div>
          </div>
          <FeedStatus
            feed={achievements}
            empty="Club achievements will be shared here once published."
          />
          <div className="home-achievements">
            {achievements.items.slice(0, 3).map((item) => (
              <Link key={item.id} to={`/achievements/${item.id}`}>
                <span className="home-tag">
                  {item.category || "ACHIEVEMENT"}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
        </section>
        <section id="join" className="home-join">
          <p className="home-eyebrow">YOUR NEXT CHAPTER</p>
          <h2>
            Bring your curiosity.
            <br />
            We’ll build from there.
          </h2>
          <p>
            You don’t need to have it all figured out. Create your member
            account, explore the learning resources, and find a project that
            makes you curious.
          </p>
          <Link className="home-button home-button-primary" to="/register">
            Become a member <ArrowUpRight size={20} />
          </Link>
          <span className="home-join-note">
            Already part of the club? <Link to="/login">Sign in →</Link>
          </span>
        </section>
        <section className="home-section home-faq">
          <div>
            <p className="home-eyebrow">A FEW GOOD QUESTIONS</p>
            <h2>Before you jump in.</h2>
          </div>
          <div>
            {[
              {
                q: "Do I need to know AI already?",
                a: "You can start with the fundamentals. The member portal includes learning resources and project ideas at different difficulty levels.",
              },
              {
                q: "How do I get involved?",
                a: "Create an account using your college details, complete your profile, and explore published events, courses, and project teams.",
              },
              {
                q: "Where can I find the team and contact details?",
                a: "Faculty advisor, core team, and official contact details are awaiting confirmation from AI CLUB · SIET. They will be added here once provided.",
              },
            ].map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <Link className="home-brand" to="/">
          <span className="home-brand-mark">
            ai<span>_</span>
          </span>
          <span>
            AI CLUB<small>SIET</small>
          </span>
        </Link>
        <p>Learn. Build. Research. Innovate.</p>
        <div>
          <Link to="/login">Member login</Link>
          <Link to="/admin/login">Admin access</Link>
        </div>
        <span>© {year} AI CLUB · SIET</span>
      </footer>
    </div>
  );
}
