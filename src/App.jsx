import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Flame,
  Headphones,
  Home,
  Lightbulb,
  LockKeyhole,
  Menu,
  Mic,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Volume2,
  X,
} from "lucide-react";
import { skills, localLesson, writingDiagnostic } from "./content.mjs";
import {
  addActivity,
  dayKey,
  emptyProfile,
  makePlacement,
  practiceFeedback,
  scorePlacement,
  streak,
  validProfile,
  wordCount,
} from "./domain.mjs";
import { validateResult } from "./api-contract.mjs";
const icons = {
  reading: BookOpen,
  writing: PenLine,
  listening: Headphones,
  speaking: Mic,
};
const names = {
  overview: "My learning space",
  placement: "Placement test",
  mission: "Today’s mission",
  reading: "Reading lab",
  writing: "Writing studio",
  listening: "Listening hub",
  speaking: "Speaking coach",
  progress: "My progress",
};
const storageKey = "engly-v1";
function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    if (data && validProfile(data.profile))
      return {
        profile: data.profile,
        name: typeof data.name === "string" ? data.name.slice(0, 40) : "",
        drafts:
          data.drafts && typeof data.drafts === "object" ? data.drafts : {},
      };
  } catch {
    /* An unreadable saved profile starts safely without unlocking lessons. */
  }
  return { profile: emptyProfile(), name: "", drafts: {} };
}
function Button({ children, secondary = false, className = "", ...props }) {
  return (
    <button
      className={`button ${secondary ? "secondary" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
function Tag({ children, color = "" }) {
  return <span className={`tag ${color}`}>{children}</span>;
}
function Dialog({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "wide-dialog" : ""}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Brand({ small = false }) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <span className="brand-symbol">
        e<span />
      </span>
      {!small && (
        <span>
          engly<span className="brand-dot">.</span>
        </span>
      )}
    </div>
  );
}
function PlantArt() {
  return (
    <svg viewBox="0 0 310 230" className="plant-art" aria-hidden="true">
      <defs>
        <pattern
          id="lines"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(20)"
        >
          <path d="M0 0V9" stroke="#ded4ff" strokeWidth="2" />
        </pattern>
      </defs>
      <ellipse cx="168" cy="205" rx="94" ry="12" fill="#6241bb" />
      <path d="M71 78l94-24 83 29-91 30z" fill="#e9ddff" />
      <path d="M71 78v104l86 28V113z" fill="#faf6ff" />
      <path d="M157 113l91-30v101l-91 26z" fill="#bca4ee" />
      <path d="M82 94v76l59 19V113z" fill="url(#lines)" />
      <path d="M171 123l59-19v65l-59 20z" fill="#d4c3f4" />
      <path
        d="M155 109V44"
        stroke="#d5e9af"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M155 77c-39 2-61-17-61-43 34-3 61 11 61 43" fill="#d5e9af" />
      <path d="M156 59c4-31 27-44 52-38-2 27-23 44-52 38" fill="#f5eba6" />
      <path d="M156 47c-20-11-25-28-17-44 24 7 30 24 17 44" fill="#b6d39a" />
      <path
        d="M217 42l5-10m1 11l8-3M64 132l-8-3m10-6l-2-8"
        stroke="#d7c7ff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="257" cy="129" r="5" fill="#f3d69c" />
      <circle cx="58" cy="64" r="3" fill="#d7c7ff" />
      <path
        d="M262 55v12m-6-6h12"
        stroke="#e9ddff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M109 147l9 4m-9 3l17 6"
        stroke="#ae96d7"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
const missionItems = [
  {
    skill: "reading",
    title: "A fresh perspective",
    description: "Read a short story and discover new words.",
    minutes: 8,
  },
  {
    skill: "writing",
    title: "Make yourself understood",
    description: "Put your English to work in a real-life email.",
    minutes: 8,
  },
  {
    skill: "speaking",
    title: "Let’s talk about it",
    description: "Find your voice in a friendly café roleplay.",
    minutes: 9,
  },
];
export default function App() {
  const [saved] = useState(loadSaved);
  const [profile, setProfile] = useState(saved.profile);
  const [name, setName] = useState(saved.name);
  const [drafts, setDrafts] = useState(saved.drafts);
  const [route, setRoute] = useState("overview");
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const [ai, setAi] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [demo, setDemo] = useState(null);
  const [timer, setTimer] = useState(25 * 60);
  const [deadline, setDeadline] = useState(null);
  const liveProfile = demo || profile;
  const today = dayKey();
  const todayActivities = liveProfile.activities.filter(
    (a) => a.date === today,
  );
  const completed = missionItems.filter((item) =>
    todayActivities.some((a) => a.skill === item.skill),
  ).length;
  const fileInput = useRef(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setAi(d.ai === true))
      .catch(() => {});
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ profile, name, drafts }),
      );
    } catch {
      setNotice(
        "Your browser could not save progress. Export your progress before closing this page.",
      );
    }
  }, [profile, name, drafts]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 6500);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimer(remaining);
      if (!remaining) {
        setDeadline(null);
        setNotice(
          "Your 25-minute session is complete. Take a well-earned break.",
        );
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setMobile(false);
  }, [route]);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement;
    const sidebar = document.querySelector(".sidebar");
    const controls = [...sidebar.querySelectorAll("a, button")];
    controls[0]?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") setMobile(false);
      if (event.key !== "Tab") return;
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    sidebar.addEventListener("keydown", onKey);
    return () => {
      sidebar.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [mobile]);
  function navigate(next) {
    if (!liveProfile.assessed && !["overview", "placement"].includes(next)) {
      setDialog("gate");
      return;
    }
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function ask(action, input = "", learner = liveProfile) {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        input,
        profile: {
          level: learner.level || "A1",
          weaknesses: learner.weaknesses.slice(0, 20),
        },
      }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.error || "The tutor could not respond. Please try again.",
      );
    if (!validateResult(action, data))
      throw new Error(
        "The tutor returned an incomplete response. Please try again.",
      );
    return data;
  }
  function updateProfile(updater) {
    if (demo) setDemo(updater);
    else setProfile(updater);
  }
  function record(
    skill,
    title,
    id,
    score,
    startedAt,
    weaknesses = [],
    strengths = [],
  ) {
    updateProfile((p) => {
      const updated = addActivity(p, {
        id,
        skill,
        title,
        score: score ?? null,
        date: dayKey(),
        minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
      });
      return {
        ...updated,
        weaknesses: [...new Set([...p.weaknesses, ...weaknesses])].slice(-20),
        strengths: [...new Set([...p.strengths, ...strengths])].slice(-20),
      };
    });
    setNotice("Practice complete. Your progress has been updated.");
  }
  function toggleDemo() {
    if (demo) {
      setDemo(null);
      setRoute("overview");
      setNotice("Back to your own learning profile.");
    } else {
      setDemo({ ...emptyProfile(), assessed: true, level: "B1" });
      setNotice(
        "Demo unlocked at B1. Demo activity is kept separate from your saved progress.",
      );
    }
    setDeadline(null);
    setTimer(1500);
  }
  function exportProgress() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, profile, name }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engly-progress-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importProgress(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 500000)
        throw new Error("The progress file is too large.");
      const data = JSON.parse(await file.text());
      if (!validProfile(data.profile))
        throw new Error("This is not a valid Engly progress file.");
      setProfile(data.profile);
      setName(typeof data.name === "string" ? data.name.slice(0, 40) : "");
      setDemo(null);
      setRoute("overview");
      setNotice("Your saved progress has been restored.");
    } catch (err) {
      setNotice(err.message || "Could not import this progress file.");
    }
  }
  const navGroups = [
    {
      label: "Your space",
      items: [
        ["overview", Home],
        ["placement", Target],
        ["mission", Sparkles],
      ],
    },
    {
      label: "Build your skills",
      items: skills.map((s) => [s.id, icons[s.id]]),
    },
    { label: "Keep growing", items: [["progress", TrendingUp]] },
  ];
  const pageProps = {
    profile: liveProfile,
    navigate,
    ai,
    ask,
    notify: setNotice,
  };
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobile && (
        <button
          aria-label="Close navigation"
          className="nav-backdrop"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="learning-navigation"
        className={`sidebar ${mobile ? "open" : ""}`}
      >
        <a
          href="#"
          className="brand-link"
          aria-label="Engly home"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <Brand />
        </a>
        <p className="brand-subtitle">A little better, every day.</p>
        <nav aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-label">{group.label}</p>
              {group.items.map(([id, Icon]) => (
                <button
                  key={id}
                  className={`nav-item ${route === id ? "active" : ""}`}
                  onClick={() => navigate(id)}
                  aria-current={route === id ? "page" : undefined}
                >
                  <Icon size={19} />
                  <span>{id === "overview" ? "Overview" : names[id]}</span>
                  {!liveProfile.assessed &&
                  !["overview", "placement"].includes(id) ? (
                    <LockKeyhole size={13} className="nav-end" />
                  ) : id === "mission" ? (
                    <span className="nav-count">{3 - completed}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="safe-space">
            <span className="safe-icon">
              <Sprout size={22} />
            </span>
            <strong>Your safe space to grow</strong>
            <p>
              No judgement. Just progress.
              <br />
              You’ve got this.
            </p>
          </div>
          <button className="nav-item" onClick={() => setDialog("help")}>
            <CircleHelp size={19} />
            <span>A little help</span>
            <ArrowUpRight size={15} className="nav-end" />
          </button>
          <button className="nav-item" onClick={() => setDialog("settings")}>
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <div className="sidebar-foot">
            Made for your next chapter <span>✳</span>
          </div>
        </div>
      </aside>
      <div className="workspace" inert={mobile}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobile}
              aria-controls="learning-navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span>Your learning journey</span>
            <ChevronRight size={14} />
            <strong>{names[route]}</strong>
          </div>
          <div className="top-actions">
            <button
              className={`demo-button ${demo ? "is-demo" : ""}`}
              onClick={toggleDemo}
            >
              <Sparkles size={15} />
              <span>{demo ? "Exit demo" : "Explore demo"}</span>
            </button>
            <div className="top-divider" />
            <button
              className="user-menu"
              aria-label="Open profile settings"
              onClick={() => setDialog("settings")}
            >
              <span className="avatar">
                {name ? name[0].toUpperCase() : "Y"}
              </span>
              <span>{name || "Your space"}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className={route === "overview" ? "main overview-main" : "main"}
        >
          {demo && (
            <div className="demo-banner">
              <Sparkles size={15} /> You’re exploring a B1 demo. Your personal
              progress stays separate.
              <button onClick={toggleDemo}>Exit demo</button>
            </div>
          )}
          {route === "overview" && (
            <Overview
              {...pageProps}
              name={name}
              todayActivities={todayActivities}
              completed={completed}
              setDialog={setDialog}
            />
          )}
          {route === "placement" && (
            <Placement
              {...pageProps}
              onFinish={(result) => {
                setDemo(null);
                setProfile((p) => ({
                  ...p,
                  assessed: true,
                  level: result.level,
                  scores: result.scores,
                  weaknesses: result.weaknesses,
                  strengths: result.strengths,
                  report: { summary: result.summary, arabic: result.arabic },
                }));
              }}
            />
          )}
          {route === "mission" && (
            <Mission
              {...pageProps}
              completed={completed}
              todayActivities={todayActivities}
              timer={timer}
              running={!!deadline}
              onTimer={() =>
                setDeadline(deadline ? null : Date.now() + timer * 1000)
              }
              onReset={() => {
                setDeadline(null);
                setTimer(1500);
              }}
            />
          )}
          {skills.some((s) => s.id === route) && (
            <Lesson
              key={`${route}-${liveProfile.level}-${!!demo}`}
              {...pageProps}
              skill={route}
              record={record}
              draft={typeof drafts[route] === "string" ? drafts[route] : ""}
              saveDraft={(text) => setDrafts((d) => ({ ...d, [route]: text }))}
            />
          )}
          {route === "progress" && (
            <Progress {...pageProps} onExport={exportProgress} />
          )}
        </main>
        <footer className="page-footer">
          <span>Small steps. Real confidence.</span>
          <span>
            <ShieldCheck size={13} /> Your progress stays in this browser
          </span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCheck size={19} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {dialog === "gate" && (
        <Dialog
          title="First, let’s find your starting point."
          onClose={() => setDialog(null)}
        >
          <div className="dialog-feature lavender">
            <Target size={30} />
          </div>
          <p>
            Your best learning happens just beyond what you already know. A
            short placement test helps us choose practice that feels
            challenging, but never overwhelming.
          </p>
          <p className="arabic" lang="ar" dir="rtl">
            ابدأ باختبار تحديد المستوى لنختار لك تدريبًا يناسبك. لا توجد درجات
            للنجاح أو الفشل، بل نقطة بداية لرحلتك.
          </p>
          <div className="dialog-buttons">
            <Button
              onClick={() => {
                setDialog(null);
                navigate("placement");
              }}
            >
              Find my level <ArrowRight size={16} />
            </Button>
            <Button secondary onClick={() => setDialog(null)}>
              Maybe later
            </Button>
          </div>
        </Dialog>
      )}
      {dialog === "settings" && (
        <Dialog title="Make this space yours" onClose={() => setDialog(null)}>
          <label className="field-label" htmlFor="name">
            What should we call you?
          </label>
          <input
            id="name"
            maxLength={40}
            placeholder="Your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="setting-row">
            <div>
              <strong>
                {ai ? "AI tutor connected" : "Built-in practice mode"}
              </strong>
              <p>
                {ai
                  ? "Lessons and feedback are powered by Gemini."
                  : "Enjoy ready-to-use exercises and basic writing checks."}
              </p>
            </div>
            <span className={`status-dot ${ai ? "connected" : ""}`} />
          </div>
          {!ai && (
            <p className="muted small-text">
              To enable AI lessons and detailed Arabic feedback, add a Gemini
              API key to the server’s .env file and restart the app. Keys are
              never stored in your browser.
            </p>
          )}
          <div className="setting-row">
            <div>
              <strong>Your learning data</strong>
              <p>Saved on this device. Export it to keep a backup.</p>
            </div>
          </div>
          <div className="dialog-buttons">
            <Button secondary onClick={exportProgress}>
              <Download size={16} /> Export progress
            </Button>
            <Button secondary onClick={() => fileInput.current.click()}>
              Restore backup
            </Button>
          </div>
          <button className="danger-link" onClick={() => setDialog("reset")}>
            Reset my learning progress
          </button>
          <Button className="full-width" onClick={() => setDialog(null)}>
            Done <Check size={16} />
          </Button>
        </Dialog>
      )}
      {dialog === "reset" && (
        <Dialog
          title="Start a new learning journey?"
          onClose={() => setDialog("settings")}
        >
          <p>
            This removes your placement result, practice history, and drafts
            from this browser. Export a backup first if you want to keep them.
          </p>
          <div className="dialog-buttons">
            <Button secondary onClick={() => setDialog("settings")}>
              Keep my progress
            </Button>
            <Button
              onClick={() => {
                setProfile(emptyProfile());
                setDemo(null);
                setDrafts({});
                setRoute("overview");
                setDeadline(null);
                setTimer(1500);
                setDialog(null);
                setNotice("Your learning space is ready for a fresh start.");
              }}
            >
              Reset progress
            </Button>
          </div>
        </Dialog>
      )}
      {dialog === "help" && (
        <Dialog
          title="A little guidance goes a long way"
          onClose={() => setDialog(null)}
        >
          <div className="help-steps">
            <div>
              <span>1</span>
              <p>
                <strong>Find your starting point.</strong>
                <br />
                Take the placement test. Your estimated level helps keep
                practice at the right difficulty.
              </p>
            </div>
            <div>
              <span>2</span>
              <p>
                <strong>Show up for 25 minutes.</strong>
                <br />
                Your daily mission gives you three focused tasks. A little,
                often, is the goal.
              </p>
            </div>
            <div>
              <span>3</span>
              <p>
                <strong>Make mistakes. Learn. Repeat.</strong>
                <br />
                Try all four skills and follow your progress. AI feedback can
                explain corrections in English and Arabic.
              </p>
            </div>
          </div>
          <p className="muted small-text">
            Al-Mu’allem is your bilingual English coach. Voice features depend
            on browser support; you can always type or paste a transcript. In AI
            mode, your submitted work is sent to Google Gemini for feedback.
          </p>
          <Button onClick={() => setDialog(null)}>
            Got it <Check size={16} />
          </Button>
        </Dialog>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        aria-label="Import progress backup"
        onChange={importProgress}
      />
    </div>
  );
}
function Overview({
  profile,
  navigate,
  name,
  todayActivities,
  completed,
  setDialog,
  ai,
}) {
  const assessed = profile.assessed;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="date-line">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            <span className="date-dot" /> A good day to grow
          </div>
          <h1>
            {name ? `Welcome back, ${name}.` : "Your next chapter starts here."}
            <span className="greeting-spark">✳</span>
          </h1>
          <p>A little practice today. A little more confidence tomorrow.</p>
        </div>
        <div className="streak-badge">
          <Flame size={20} />
          <strong>{streak(profile.activities)}</strong>
          <span>day streak</span>
        </div>
      </div>
      <div className="dashboard-layout">
        <div className="dashboard-primary">
          <section className="welcome-card">
            <div className="welcome-copy">
              <span className="hero-label">
                <span className="tiny-spark">✦</span>{" "}
                {assessed
                  ? "Your English. Your pace."
                  : "A beginning made just for you"}
              </span>
              <h2>
                {assessed ? (
                  <>
                    A little practice.
                    <br />A world of possibility.
                  </>
                ) : (
                  <>
                    Big possibilities.
                    <br />
                    One small first step.
                  </>
                )}
              </h2>
              <p>
                {assessed
                  ? `You’re learning at ${profile.level}. Let’s turn what you know into the confidence to use it.`
                  : "Let’s find where you are, so we can help you get where you want to be."}
              </p>
              <Button
                className="hero-button"
                onClick={() => navigate(assessed ? "mission" : "placement")}
              >
                {assessed ? "Start today’s mission" : "Find my English level"}
                <ArrowRight size={17} />
              </Button>
              <span className="hero-footnote">
                <Clock3 size={13} />
                {assessed ? "25 minutes, just for you" : "About 10 minutes"}
                <span>•</span>
                {assessed ? "Small steps add up" : "No pressure. No judgement."}
              </span>
            </div>
            <PlantArt />
          </section>
          <div className="section-heading">
            <div>
              <h2>A little of everything</h2>
              <p>Four skills. One more confident you.</p>
            </div>
            {!assessed && (
              <Tag>
                <LockKeyhole size={12} /> Unlock after placement
              </Tag>
            )}
          </div>
          <div className="skill-grid">
            {skills.map((s) => {
              const Icon = icons[s.id];
              return (
                <button
                  key={s.id}
                  className="skill-card"
                  onClick={() => navigate(s.id)}
                >
                  <div className="skill-top">
                    <span className={`skill-icon ${s.color}`}>
                      <Icon size={22} strokeWidth={1.7} />
                    </span>
                    {assessed ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <LockKeyhole size={15} />
                    )}
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.subtitle}</p>
                  <div className="skill-bottom">
                    <span>
                      {assessed ? "Ready when you are" : "Your journey awaits"}
                    </span>
                    <span>{s.minutes} min</span>
                  </div>
                </button>
              );
            })}
          </div>
          <section className="mission-preview">
            <div className="section-heading">
              <div>
                <h2>
                  Your small steps for today{" "}
                  <span className="inline-spark">✧</span>
                </h2>
                <p>A focused plan. A fresh start, every day.</p>
              </div>
              <button
                className="text-button"
                onClick={() => navigate("mission")}
              >
                View mission <ArrowRight size={15} />
              </button>
            </div>
            {missionItems.map((item, i) => {
              const done = todayActivities.some((a) => a.skill === item.skill);
              return (
                <button
                  className="mission-row"
                  key={item.skill}
                  onClick={() => navigate(item.skill)}
                >
                  <span className={`task-number ${done ? "done" : ""}`}>
                    {done ? <Check size={16} /> : `0${i + 1}`}
                  </span>
                  <span className="task-info">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </span>
                  <span className="task-duration">
                    <Clock3 size={13} />
                    {item.minutes} min
                  </span>
                  {!assessed ? (
                    <LockKeyhole size={14} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </button>
              );
            })}
          </section>
          <div className="reassurance">
            <ShieldCheck size={17} />
            <p>This is your space. Mistakes are welcome here.</p>
            <button onClick={() => setDialog("help")}>
              Meet your learning approach <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <aside className="dashboard-rail" aria-label="Learning snapshot">
          <section className="level-card">
            <div className="rail-heading">
              <h2>Your starting point</h2>
              <Sprout size={19} />
            </div>
            <div className={`level-orbit ${assessed ? "assessed" : ""}`}>
              <div>
                <span>{assessed ? profile.level : "?"}</span>
                <small>
                  {assessed ? "Your current level" : "Let’s discover it"}
                </small>
              </div>
              <span className="orbit-leaf">✦</span>
            </div>
            <h3>
              {assessed
                ? "Room to grow. Always."
                : "Every expert was a beginner."}
            </h3>
            <p>
              {assessed
                ? "Practice that meets you where you are, then takes you a little further."
                : "A quick check-in helps us build a learning path that feels right for you."}
            </p>
            <button
              className="text-button"
              onClick={() => navigate("placement")}
            >
              {assessed ? "View my assessment" : "Take the placement test"}
              <ArrowRight size={14} />
            </button>
          </section>
          <section className="week-card">
            <div className="rail-heading">
              <h2>A little, often</h2>
              <span>This week</span>
            </div>
            <div className="week-days">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + i);
                const active = profile.activities.some(
                  (a) => a.date === dayKey(date),
                );
                const isToday = dayKey(date) === dayKey();
                return (
                  <div key={i} className={`week-day ${isToday ? "today" : ""}`}>
                    <span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                    <div className={active ? "finished" : ""}>
                      {active ? (
                        <Check size={14} />
                      ) : isToday ? (
                        <span className="day-dot" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="week-note">
              <span className="little-dot" />
              <span>
                {todayActivities.length
                  ? "You showed up today. That counts."
                  : "Your next streak starts with today."}
              </span>
            </div>
          </section>
          <section className="quote-card">
            <span className="quote-mark">“</span>
            <blockquote>
              You don’t have to be great to start. But you have to start to be
              great.
            </blockquote>
            <span className="quote-author">A little reminder for today</span>
          </section>
          <div className="coach-note">
            <span className="coach-mark">
              <Sparkles size={17} />
            </span>
            <div>
              <strong>Your personal English coach</strong>
              <p>
                {ai
                  ? "AI-powered. Human-paced."
                  : "Ready-to-use practice. Your pace."}
                <br />
                English & العربية
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
function PageIntro({ label, title, description, action }) {
  return (
    <div className="page-heading module-heading">
      <div>
        <span className="date-line">{label}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Placement({ profile, ai, ask, notify, onFinish, navigate }) {
  const [busy, setBusy] = useState(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const [stage, setStage] = useState(profile.assessed ? "result" : "intro");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [writing, setWriting] = useState("");
  const [result, setResult] = useState(
    profile.report
      ? {
          ...profile.report,
          level: profile.level,
          scores: profile.scores,
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
        }
      : null,
  );
  const [error, setError] = useState("");
  const [source, setSource] = useState("built-in");
  async function start(useAi = false) {
    setError("");
    setBusy(true);
    try {
      const next = useAi
        ? (
            await ask(
              "placement",
              `Avoid these previous prompts: ${questions.map((q) => q.prompt).join(" | ")}`,
            )
          ).questions
        : makePlacement(questions.map((q) => q.prompt));
      if (!active.current) return;
      setQuestions(next);
      setAnswers([]);
      setWriting("");
      setIndex(0);
      setSource(useAi ? "AI-generated" : "built-in");
      setStage("test");
    } catch (err) {
      if (active.current) setError(err.message);
    } finally {
      if (active.current) setBusy(false);
    }
  }
  async function finish() {
    setBusy(true);
    setError("");
    try {
      let report = scorePlacement(questions, answers);
      if (ai)
        report = await ask(
          "diagnostic",
          JSON.stringify({
            questions: questions.map((q, i) => ({
              ...q,
              learnerAnswer: answers[i],
            })),
            writingPrompt: writingDiagnostic,
            writing,
          }),
          { level: report.level, weaknesses: report.weaknesses },
        );
      if (!active.current) return;
      setResult(report);
      onFinish(report);
      setStage("result");
      notify(
        "Your starting point is ready. All learning modules are now unlocked.",
      );
    } catch (err) {
      if (active.current) setError(err.message);
    } finally {
      if (active.current) setBusy(false);
    }
  }
  const current = questions[index];
  return (
    <>
      <PageIntro
        label="A beginning made just for you"
        title="Let’s find your starting point."
        description="A short check-in, so your practice fits you. No pass. No fail."
      />
      {stage === "intro" && (
        <div className="placement-intro">
          <section className="paper-card placement-main">
            <span className="large-feature lavender">
              <Target size={34} />
            </span>
            <h2>
              Your journey is unique.
              <br />
              Your learning should be, too.
            </h2>
            <p>
              We’ll explore your grammar, vocabulary, reading, and writing to
              suggest the right starting level.
            </p>
            <div className="test-details">
              <span>
                <Clock3 size={18} /> About 10 minutes
              </span>
              <span>
                <PenLine size={18} /> 12 questions + a short response
              </span>
              <span>
                <ShieldCheck size={18} /> Private, pressure-free practice
              </span>
            </div>
            <div className="dialog-buttons">
              <Button disabled={busy} onClick={() => start(false)}>
                {busy ? "Preparing…" : "Start placement test"}
                <ArrowRight size={17} />
              </Button>
              {ai && (
                <Button secondary disabled={busy} onClick={() => start(true)}>
                  <Sparkles size={16} /> Generate AI questions
                </Button>
              )}
            </div>
            <p className="muted small-text">
              {ai
                ? "Includes a bilingual AI diagnostic report."
                : "Built-in questions give a provisional result. Detailed writing evaluation becomes available when AI is connected."}
            </p>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </section>
          <section className="placement-aside">
            <Sprout size={36} />
            <h3>
              A little challenge.
              <br />
              The right kind of growth.
            </h3>
            <p>
              The best practice sits just beyond what you already know. That’s
              why we start here.
            </p>
            <p lang="ar" dir="rtl" className="arabic">
              خذ وقتك وأجب بطريقتك. الأخطاء تساعدنا على اختيار التدريب المناسب
              لك.
            </p>
          </section>
        </div>
      )}
      {stage === "test" && current && (
        <section className="paper-card test-card">
          <div className="test-top">
            <Tag color="lavender">{current.skill}</Tag>
            <span>
              Question {index + 1} of {questions.length + 1}
            </span>
          </div>
          <progress value={index} max={questions.length + 1} />
          <h2>{current.prompt}</h2>
          <fieldset className="answer-options">
            <legend className="visually-hidden">Choose an answer</legend>
            {current.options.map((option, i) => (
              <label
                key={i}
                className={`answer-option ${answers[index] === i ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  checked={answers[index] === i}
                  onChange={() =>
                    setAnswers((a) => {
                      const n = [...a];
                      n[index] = i;
                      return n;
                    })
                  }
                />
                <span className="answer-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {answers[index] === i && <Check size={18} />}
              </label>
            ))}
          </fieldset>
          <div className="test-controls">
            <button
              className="text-button"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <span className="muted small-text">{source} questions</span>
            <Button
              disabled={answers[index] === undefined}
              onClick={() =>
                index === questions.length - 1
                  ? setStage("writing")
                  : setIndex((i) => i + 1)
              }
            >
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        </section>
      )}
      {stage === "writing" && (
        <section className="paper-card test-card">
          <div className="test-top">
            <Tag color="lavender">Your own words</Tag>
            <span>Final question</span>
          </div>
          <progress value={questions.length} max={questions.length + 1} />
          <h2>One last thing. Tell us what you think.</h2>
          <p>{writingDiagnostic}</p>
          <label className="visually-hidden" htmlFor="placement-writing">
            Your writing response
          </label>
          <textarea
            id="placement-writing"
            rows={9}
            value={writing}
            maxLength={6000}
            onChange={(e) => setWriting(e.target.value)}
            placeholder="I prefer to learn…"
          />
          <div className="editor-footer">
            <span>{wordCount(writing)} words</span>
            <span>40 words minimum</span>
          </div>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="test-controls">
            <button
              className="text-button"
              disabled={busy}
              onClick={() => setStage("test")}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <Button disabled={busy || wordCount(writing) < 40} onClick={finish}>
              {busy ? "Finding your starting point…" : "See my results"}
              <Sparkles size={16} />
            </Button>
          </div>
        </section>
      )}
      {stage === "result" && (
        <section className="paper-card result-card">
          <div className="result-heading">
            <div className="result-level">{result?.level || profile.level}</div>
            <div>
              <Tag color="mint">
                <Check size={12} /> All skills unlocked
              </Tag>
              <h2>Your next chapter is ready.</h2>
              <p>
                Your estimated CEFR starting level. A guide for practice, not a
                certification.
              </p>
            </div>
          </div>
          {result ? (
            <>
              <p>{result.summary}</p>
              <p className="arabic diagnostic-arabic" lang="ar" dir="rtl">
                {result.arabic}
              </p>
              <div className="score-grid">
                {Object.entries(result.scores).map(([skill, score]) => (
                  <div key={skill}>
                    <span>{skill}</span>
                    <strong>
                      {score}
                      <small>/100</small>
                    </strong>
                    <progress max={100} value={score} />
                  </div>
                ))}
              </div>
              <div className="feedback-columns">
                <div>
                  <h3>
                    <Sprout size={17} /> Build on these
                  </h3>
                  {result.strengths.length ? (
                    <ul>
                      {result.strengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      You’ve taken the first step. Regular practice will help
                      reveal your strengths.
                    </p>
                  )}
                </div>
                <div>
                  <h3>
                    <Target size={17} /> Give these a little attention
                  </h3>
                  {result.weaknesses.length ? (
                    <ul>
                      {result.weaknesses.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      Try longer tasks and practise using your English in new
                      situations.
                    </p>
                  )}
                </div>
              </div>
              {questions.length > 0 && (
                <details className="answer-review">
                  <summary>Review your answers</summary>
                  {questions.map((q, i) => (
                    <div key={q.prompt}>
                      <strong
                        className={
                          q.answer === answers[i]
                            ? "correct-text"
                            : "incorrect-text"
                        }
                      >
                        {q.answer === answers[i] ? "✓" : "○"} {q.prompt}
                      </strong>
                      <p>
                        Your answer: {q.options[answers[i]]}. Correct answer:{" "}
                        {q.options[q.answer]}.
                      </p>
                      <p>{q.explanation}</p>
                    </div>
                  ))}
                </details>
              )}
            </>
          ) : (
            <p>
              You’re exploring a B1 demo profile. Take the placement test for
              your own result.
            </p>
          )}
          <div className="dialog-buttons">
            <Button onClick={() => navigate("mission")}>
              Start my first mission <ArrowRight size={16} />
            </Button>
            <Button secondary disabled={busy} onClick={() => start(false)}>
              <RotateCcw size={15} /> Retake with new questions
            </Button>
            {ai && (
              <Button secondary disabled={busy} onClick={() => start(true)}>
                <Sparkles size={15} /> New AI test
              </Button>
            )}
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
    </>
  );
}
function Mission({
  profile,
  navigate,
  completed,
  todayActivities,
  timer,
  running,
  onTimer,
  onReset,
}) {
  return (
    <>
      <PageIntro
        label="A little, often"
        title="25 minutes. All yours."
        description="Three small steps to make English a little more natural."
      />
      <section className="mission-timer-card">
        <div>
          <Tag color="lavender">
            <Sparkles size={12} /> Today’s mission
          </Tag>
          <h2>
            {completed === 3
              ? "You showed up. You grew."
              : "Small steps make a big difference."}
          </h2>
          <p>
            {completed === 3
              ? "Your mission is complete. Come back tomorrow for a fresh start."
              : "Focus on one thing at a time. Your progress will take care of itself."}
          </p>
        </div>
        <div className="timer-area">
          <div className="timer-digits" aria-label="Session time remaining">
            {String(Math.floor(timer / 60)).padStart(2, "0")}
            <span>:</span>
            {String(timer % 60).padStart(2, "0")}
          </div>
          <div className="timer-buttons">
            <Button secondary disabled={timer === 0} onClick={onTimer}>
              {running ? <Pause size={15} /> : <Play size={15} />}{" "}
              {running ? "Pause" : "Start focus timer"}
            </Button>
            <button
              className="icon-button"
              aria-label="Reset timer"
              onClick={onReset}
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <h2>Your plan for today</h2>
        <span className="muted">{completed} of 3 completed</span>
      </div>
      <div className="mission-task-grid">
        {missionItems.map((item, i) => {
          const Icon = icons[item.skill];
          const done = todayActivities.some((a) => a.skill === item.skill);
          return (
            <section className="paper-card mission-task" key={item.skill}>
              <div className="skill-top">
                <span
                  className={`skill-icon ${skills.find((s) => s.id === item.skill).color}`}
                >
                  <Icon size={23} />
                </span>
                <Tag color={done ? "mint" : ""}>
                  {done ? (
                    <>
                      <Check size={12} /> Complete
                    </>
                  ) : (
                    `${item.minutes} minutes`
                  )}
                </Tag>
              </div>
              <span className="step-label">Step {i + 1}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Button secondary onClick={() => navigate(item.skill)}>
                {done ? "Practise again" : "Let’s begin"}
                <ArrowRight size={16} />
              </Button>
            </section>
          );
        })}
      </div>
      <div className="tip-box">
        <Lightbulb size={21} />
        <div>
          <strong>Consistency beats intensity.</strong>
          <p>
            You don’t need a perfect session. You just need to begin. Your
            lessons target{" "}
            {profile.weaknesses.length
              ? profile.weaknesses.slice(0, 2).join(" and ")
              : "balanced skill development"}{" "}
            at {profile.level}.
          </p>
        </div>
      </div>
    </>
  );
}
function useVoice(onTranscript, notify) {
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognition = useRef(null);
  const utterance = useRef(null);
  const transcriptCallback = useRef(onTranscript);
  transcriptCallback.current = onTranscript;
  const canSpeak = "speechSynthesis" in window;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      if (recognition.current) {
        recognition.current.onresult = null;
        recognition.current.onerror = null;
        recognition.current.onend = null;
        recognition.current.abort();
      }
    },
    [],
  );
  function speak(text, rate = 1) {
    if (!canSpeak) {
      notify(
        "Audio playback is unavailable in this browser. Try Chrome, Edge, or Safari.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-GB";
    speech.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    speech.voice =
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null;
    speech.onstart = () => setPlaying(true);
    speech.onend = () => setPlaying(false);
    speech.onerror = (e) => {
      setPlaying(false);
      if (!["canceled", "interrupted"].includes(e.error))
        notify(
          "Audio could not play. Please try again or read the transcript.",
        );
    };
    utterance.current = speech;
    window.speechSynthesis.speak(speech);
  }
  function stop() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }
  function startMic(base) {
    if (!SpeechRecognition) {
      notify(
        "Speech recognition is unavailable here. You can type or paste your transcript below.",
      );
      return;
    }
    if (recording) {
      recognition.current?.stop();
      return;
    }
    try {
      const instance = new SpeechRecognition();
      instance.lang = "en-GB";
      instance.continuous = true;
      instance.interimResults = true;
      instance.onstart = () => setRecording(true);
      instance.onend = () => setRecording(false);
      instance.onresult = (e) => {
        const text = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(" ");
        transcriptCallback.current(`${base}${base ? " " : ""}${text}`);
      };
      instance.onerror = (e) => {
        setRecording(false);
        notify(
          e.error === "not-allowed"
            ? "Microphone access was blocked. Allow it in your browser settings, or type your transcript."
            : e.error === "no-speech"
              ? "No speech was detected. Try again or type your response."
              : "Speech recognition stopped. Your transcript is still here; you can continue typing.",
        );
      };
      recognition.current = instance;
      instance.start();
    } catch {
      notify(
        "The microphone could not start. You can still type or paste a transcript.",
      );
    }
  }
  return {
    speak,
    stop,
    playing,
    recording,
    startMic,
    canSpeak,
    canRecord: !!SpeechRecognition,
  };
}
function Lesson({ skill, profile, ai, ask, notify, record, draft, saveDraft }) {
  const [lesson, setLesson] = useState(() => localLesson(skill, profile.level));
  const [selectedWord, setSelectedWord] = useState(null);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [response, setResponse] = useState(draft);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [session, setSession] = useState(() => ({
    id: crypto.randomUUID(),
    startedAt: Date.now(),
  }));
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const voice = useVoice((text) => {
    setResponse(text);
    saveDraft(text);
  }, notify);
  const info = skills.find((s) => s.id === skill);
  const Icon = icons[skill];
  function edit(text) {
    setResponse(text);
    saveDraft(text);
  }
  async function generate() {
    if (
      (response.trim() || Object.keys(answers).length) &&
      !window.confirm(
        "Start a new lesson? Your current response will be cleared.",
      )
    )
      return;
    voice.stop();
    setBusy(true);
    setError("");
    try {
      const next = await ask(
        skill,
        `Create a different exercise from: ${lesson.title}`,
      );
      if (!active.current) return;
      setLesson(next);
      setSelectedWord(null);
      setAnswers({});
      setChecked(false);
      edit("");
      setFeedback(null);
      setShowTranscript(false);
      setSession({ id: crypto.randomUUID(), startedAt: Date.now() });
    } catch (err) {
      if (active.current) setError(err.message);
    } finally {
      if (active.current) setBusy(false);
    }
  }
  async function submit() {
    voice.stop();
    if (voice.recording) voice.startMic(response);
    setError("");
    setBusy(true);
    try {
      const result = ai
        ? await ask(
            "feedback",
            JSON.stringify({
              skill,
              task: lesson.prompt || lesson.question,
              source: lesson.text || "",
              response,
            }),
          )
        : practiceFeedback(response);
      if (!active.current) return;
      setFeedback(result);
      record(
        skill,
        lesson.title,
        session.id,
        result.score,
        session.startedAt,
        result.weaknesses,
        result.strengths,
      );
    } catch (err) {
      if (active.current) setError(err.message);
    } finally {
      if (active.current) setBusy(false);
    }
  }
  const minimum =
    skill === "writing" ? (["A1", "A2"].includes(profile.level) ? 20 : 40) : 10;
  const selected = selectedWord || lesson.words?.[0];
  const readingSentenceValid =
    skill !== "reading" ||
    (wordCount(response) >= 5 &&
      lesson.words.some((w) =>
        response.toLowerCase().includes(w.word.toLowerCase()),
      ));
  return (
    <>
      <PageIntro
        label={`${profile.level} practice · One small step further`}
        title={names[skill]}
        description={info.subtitle}
        action={
          ai ? (
            <Button secondary disabled={busy} onClick={generate}>
              <Sparkles size={16} />
              {busy ? "Preparing…" : "New AI lesson"}
            </Button>
          ) : (
            <Tag>Built-in practice</Tag>
          )
        }
      />
      {error && (
        <div role="alert" className="error-message">
          {error}
        </div>
      )}
      <div
        className={`lesson-layout ${skill === "reading" ? "reading-layout" : ""}`}
      >
        <section className="paper-card lesson-paper">
          <div className="lesson-title">
            <span className={`skill-icon ${info.color}`}>
              <Icon size={22} />
            </span>
            <div>
              <span className="muted small-text">
                {skill === "reading"
                  ? "A story to grow with"
                  : skill === "listening"
                    ? "Listen for the little details"
                    : skill === "writing"
                      ? "Real words for real life"
                      : "Your voice belongs here"}
              </span>
              <h2>{lesson.title}</h2>
            </div>
          </div>
          {skill === "reading" ? (
            <>
              <p className="reading-passage">
                {lesson.text
                  .split(
                    new RegExp(
                      `(${lesson.words.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
                      "gi",
                    ),
                  )
                  .map((part, i) => {
                    const word = lesson.words.find(
                      (w) => w.word.toLowerCase() === part.toLowerCase(),
                    );
                    return word ? (
                      <button
                        key={i}
                        className={`vocabulary-word ${selected?.word === word.word ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedWord(word);
                          voice.speak(word.word);
                        }}
                      >
                        {part}
                      </button>
                    ) : (
                      <React.Fragment key={i}>{part}</React.Fragment>
                    );
                  })}
              </p>
              <div className="reading-tip">
                <Volume2 size={16} /> Tap a highlighted word to hear it and
                discover its meaning.
              </div>
              <div className="comprehension">
                <h3>A quick check-in</h3>
                <p className="muted">Let’s see what stayed with you.</p>
                {lesson.questions.map((q, i) => (
                  <fieldset key={q.prompt} className="quiz-question">
                    <legend>
                      {i + 1}. {q.prompt}
                    </legend>
                    {q.options.map((option, n) => (
                      <label
                        key={option}
                        className={`quiz-option ${checked && q.answer === n ? "correct" : ""} ${checked && answers[i] === n && q.answer !== n ? "incorrect" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`reading-${i}`}
                          checked={answers[i] === n}
                          disabled={checked}
                          onChange={() => setAnswers((a) => ({ ...a, [i]: n }))}
                        />
                        {option}
                        {checked && q.answer === n && <Check size={15} />}
                      </label>
                    ))}
                    {checked && (
                      <p className="quiz-explanation">{q.explanation}</p>
                    )}
                  </fieldset>
                ))}
                <label htmlFor="reading-sentence" className="field-label">
                  Make a word your own
                </label>
                <p className="muted small-text">
                  Write a sentence of at least five words using one highlighted
                  word.
                </p>
                <textarea
                  id="reading-sentence"
                  rows={3}
                  maxLength={2000}
                  value={response}
                  disabled={checked}
                  onChange={(e) => edit(e.target.value)}
                  placeholder={`Try using “${lesson.words[0].word}” in your own sentence…`}
                />
                {checked ? (
                  <div className="completion-message">
                    <CheckCheck size={20} />
                    <div>
                      <strong>
                        {
                          lesson.questions.filter(
                            (q, i) => answers[i] === q.answer,
                          ).length
                        }{" "}
                        of {lesson.questions.length} correct. A small step
                        forward.
                      </strong>
                      <p>
                        Your comprehension score is saved. Your original
                        sentence is for practice and has not been graded.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    disabled={
                      Object.keys(answers).length !== lesson.questions.length ||
                      !readingSentenceValid
                    }
                    onClick={() => {
                      setChecked(true);
                      record(
                        skill,
                        lesson.title,
                        session.id,
                        Math.round(
                          (lesson.questions.filter(
                            (q, i) => answers[i] === q.answer,
                          ).length /
                            lesson.questions.length) *
                            100,
                        ),
                        session.startedAt,
                      );
                    }}
                  >
                    Check my understanding <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {skill === "listening" ? (
                <>
                  <div className="tip-box compact">
                    <Lightbulb size={20} />
                    <p>{lesson.tip}</p>
                  </div>
                  <div className="audio-player">
                    <div
                      className={`audio-cover ${voice.playing ? "is-playing" : ""}`}
                    >
                      <AudioLines size={34} />
                    </div>
                    <div className="audio-info">
                      <strong>{lesson.title}</strong>
                      <span>English · Short audio story</span>
                      <div
                        className={`audio-wave ${voice.playing ? "animated" : ""}`}
                        aria-hidden="true"
                      >
                        {Array.from({ length: 38 }, (_, i) => (
                          <i
                            key={i}
                            style={{
                              height: `${8 + (Math.sin(i * 1.9) + 1) * 12}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      className="audio-play"
                      onClick={() =>
                        voice.playing
                          ? voice.stop()
                          : voice.speak(lesson.text, speed)
                      }
                      aria-label={voice.playing ? "Stop audio" : "Play audio"}
                    >
                      {voice.playing ? <Pause size={22} /> : <Play size={22} />}
                    </button>
                  </div>
                  <div className="audio-options">
                    <label>
                      Playback speed{" "}
                      <select
                        aria-label="Playback speed"
                        value={speed}
                        onChange={(e) => {
                          setSpeed(Number(e.target.value));
                          voice.stop();
                        }}
                      >
                        <option value={0.75}>0.75×</option>
                        <option value={1}>1×</option>
                        <option value={1.25}>1.25×</option>
                      </select>
                    </label>
                    <button
                      className="text-button"
                      onClick={() => setShowTranscript((s) => !s)}
                    >
                      {showTranscript ? "Hide transcript" : "Reveal transcript"}
                    </button>
                  </div>
                  {!voice.canSpeak && (
                    <p className="error-message">
                      Audio isn’t supported in this browser. Open the transcript
                      or try Chrome, Edge, or Safari.
                    </p>
                  )}
                  {showTranscript && (
                    <div className="transcript">
                      <h3>Audio transcript</h3>
                      <p>{lesson.text}</p>
                    </div>
                  )}
                  <h3>What did you hear?</h3>
                  <p>{lesson.question}</p>
                </>
              ) : (
                <>
                  <div className="prompt-box">
                    <Tag color={info.color}>
                      {skill === "writing"
                        ? "Your writing brief"
                        : "Your conversation"}
                    </Tag>
                    <p>{lesson.prompt}</p>
                  </div>
                  {skill === "speaking" && (
                    <div className="microphone-area">
                      <button
                        className={`mic-button ${voice.recording ? "recording" : ""}`}
                        onClick={() => voice.startMic(response)}
                        disabled={busy || !!feedback}
                        aria-label={
                          voice.recording ? "Stop recording" : "Start recording"
                        }
                      >
                        {voice.recording ? (
                          <Pause size={28} />
                        ) : (
                          <Mic size={28} />
                        )}
                      </button>
                      <strong>
                        {voice.recording
                          ? "Listening… take your time."
                          : voice.canRecord
                            ? "Ready when you are."
                            : "Your words still count."}
                      </strong>
                      <p>
                        {voice.recording
                          ? "Tap the microphone to finish."
                          : voice.canRecord
                            ? "Tap to speak, or type your response below."
                            : "Type or paste a speech-to-text transcript below."}
                      </p>
                    </div>
                  )}
                </>
              )}
              <label htmlFor="practice-response" className="field-label">
                {skill === "writing"
                  ? "Your draft"
                  : skill === "speaking"
                    ? "Your unedited transcript"
                    : "Your listening summary"}
              </label>
              <textarea
                id="practice-response"
                rows={skill === "speaking" ? 6 : 9}
                value={response}
                maxLength={6000}
                disabled={!!feedback || busy}
                onChange={(e) => edit(e.target.value)}
                placeholder={
                  skill === "writing"
                    ? "Start with a simple hello…"
                    : skill === "speaking"
                      ? "Your spoken words will appear here. You can also type or paste them."
                      : "In my own words, the speaker said…"
                }
              />
              <div className="editor-footer">
                <span>
                  {wordCount(response)} words <span className="save-dot" />{" "}
                  Draft saved on this device
                </span>
                <span>{minimum} words minimum</span>
              </div>
              {!feedback && (
                <div className="submit-row">
                  <span className="muted small-text">
                    {ai ? (
                      <>
                        <Sparkles size={13} /> Feedback in English & العربية
                      </>
                    ) : (
                      "Basic practice checks · No AI score"
                    )}
                  </span>
                  <Button
                    disabled={
                      busy || voice.recording || wordCount(response) < minimum
                    }
                    onClick={submit}
                  >
                    {busy
                      ? "Taking a thoughtful look…"
                      : ai
                        ? "Get my feedback"
                        : "Complete practice"}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
              {feedback && (
                <Feedback
                  feedback={feedback}
                  ai={ai}
                  onRevise={() => {
                    setFeedback(null);
                    setSession({
                      id: crypto.randomUUID(),
                      startedAt: Date.now(),
                    });
                  }}
                />
              )}
            </>
          )}
        </section>
        <aside className="lesson-aside">
          {skill === "reading" && selected ? (
            <section className="dictionary-card">
              <span className="date-line">
                <BookOpen size={14} /> Your pocket dictionary
              </span>
              <div className="dictionary-heading">
                <h3>{selected.word}</h3>
                <button
                  className="icon-button"
                  aria-label={`Pronounce ${selected.word}`}
                  onClick={() => voice.speak(selected.word)}
                >
                  <Volume2 size={19} />
                </button>
              </div>
              <span className="arabic dictionary-arabic" lang="ar" dir="rtl">
                {selected.arabic}
              </span>
              <p>{selected.definition}</p>
              <div className="word-example">
                <span>In a sentence</span>
                <p>“{selected.example}”</p>
              </div>
              <div className="vocabulary-tags">
                {lesson.words.map((w) => (
                  <button
                    key={w.word}
                    className={selected.word === w.word ? "active" : ""}
                    onClick={() => setSelectedWord(w)}
                  >
                    {w.word}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="dictionary-card">
              <span className="large-feature butter">
                <Lightbulb size={25} />
              </span>
              <h3>A little guidance</h3>
              <p>{lesson.tip}</p>
              <p lang="ar" dir="rtl" className="arabic">
                لا تبحث عن الكمال. حاول التعبير عن فكرتك بوضوح، ثم تعلّم خطوة
                جديدة من كل محاولة.
              </p>
            </section>
          )}
          <div className="learning-note">
            <Sprout size={23} />
            <h3>Just beyond your comfort zone.</h3>
            <p>
              This practice is matched to {profile.level}. A little challenge is
              how you grow.
            </p>
            {profile.weaknesses.length > 0 && (
              <>
                <span className="small-text muted">Your current focus</span>
                <div className="focus-tags">
                  {profile.weaknesses.slice(0, 3).map((w) => (
                    <Tag key={w}>{w}</Tag>
                  ))}
                </div>
              </>
            )}
          </div>
          {skill === "listening" && (
            <section className="resource-card">
              <h3>Keep your ears curious</h3>
              <p>Explore more listening practice from trusted sources.</p>
              <a
                href="https://learnenglish.britishcouncil.org/skills/listening"
                target="_blank"
                rel="noreferrer"
              >
                British Council <ArrowUpRight size={15} />
              </a>
              <a
                href="https://www.bbc.co.uk/learningenglish"
                target="_blank"
                rel="noreferrer"
              >
                BBC Learning English <ArrowUpRight size={15} />
              </a>
              <span className="small-text muted">
                Choose the {profile.level} section where available.
              </span>
            </section>
          )}
          {skill === "speaking" && (
            <p className="privacy-note">
              <ShieldCheck size={15} /> Your browser may use its speech service
              for recognition. Feedback evaluates your transcript, not your
              pronunciation.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
function Feedback({ feedback, ai, onRevise }) {
  return (
    <section className="feedback-panel" aria-label="Your feedback">
      <div className="feedback-title">
        <div>
          <span className="date-line">A little reflection</span>
          <h3>{ai ? "Here’s how you can grow." : "Your practice check-in."}</h3>
        </div>
        {feedback.score != null && (
          <div className="feedback-score">
            {feedback.score}
            <small>/100</small>
          </div>
        )}
      </div>
      <p>{feedback.summary}</p>
      <p className="arabic diagnostic-arabic" lang="ar" dir="rtl">
        {feedback.arabic}
      </p>
      {feedback.corrections.length > 0 && (
        <>
          <h4>Small changes, clearer English</h4>
          {feedback.corrections.map((c, i) => (
            <div className="correction" key={i}>
              <div>
                <del>{c.original}</del>
                <ArrowRight size={14} />
                <strong>{c.replacement}</strong>
              </div>
              <p>{c.reason}</p>
            </div>
          ))}
        </>
      )}
      {feedback.strengths.length > 0 && (
        <>
          <h4>Keep doing this</h4>
          <ul>
            {feedback.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {feedback.improved && (
        <details className="answer-review">
          <summary>
            {ai
              ? "See a polished version"
              : "See your response with basic corrections"}
          </summary>
          <p className="improved-text">{feedback.improved}</p>
        </details>
      )}
      <h4>For your next attempt</h4>
      <ul>
        {feedback.nextSteps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <Button secondary onClick={onRevise}>
        <PenLine size={15} /> Give it another try
      </Button>
    </section>
  );
}
function Progress({ profile, navigate, onExport }) {
  const activities = profile.activities;
  const minutes = activities.reduce((n, a) => n + a.minutes, 0);
  const days = new Set(activities.map((a) => a.date)).size;
  return (
    <>
      <PageIntro
        label="Look how far you’re coming"
        title="Every small step counts."
        description="Your effort adds up. Here’s the story so far."
        action={
          <Button secondary onClick={onExport}>
            <Download size={16} /> Export progress
          </Button>
        }
      />
      <div className="progress-stats">
        <div>
          <span className="stat-icon lavender">
            <Target size={21} />
          </span>
          <span>Current starting level</span>
          <strong>{profile.level}</strong>
        </div>
        <div>
          <span className="stat-icon peach">
            <Flame size={21} />
          </span>
          <span>Current streak</span>
          <strong>
            {streak(activities)}
            <small> days</small>
          </strong>
        </div>
        <div>
          <span className="stat-icon mint">
            <CheckCheck size={21} />
          </span>
          <span>Practice sessions</span>
          <strong>{activities.length}</strong>
        </div>
        <div>
          <span className="stat-icon butter">
            <Clock3 size={21} />
          </span>
          <span>Time in practice</span>
          <strong>
            {minutes}
            <small> min</small>
          </strong>
        </div>
      </div>
      <div className="progress-layout">
        <section className="paper-card">
          <h2>Your skills, taking shape</h2>
          <p className="muted">
            Practice scores and placement estimates. Transcript scores do not
            measure pronunciation.
          </p>
          <div className="skill-bars">
            {[...skills.map((s) => s.id), "grammar", "vocabulary"].map((s) => {
              const Icon = icons[s] || Target;
              return (
                <div key={s}>
                  <span>
                    <Icon size={17} />
                    {s}
                  </span>
                  <progress
                    max={100}
                    value={profile.scores[s] ?? 0}
                    aria-label={`${s} score`}
                  />
                  <strong>
                    {profile.scores[s] ?? "—"}
                    {profile.scores[s] != null && <small>/100</small>}
                  </strong>
                </div>
              );
            })}
          </div>
          <span className="muted small-text">
            A dash means this skill hasn’t been assessed yet.
          </span>
        </section>
        <section className="paper-card growth-card">
          <Sprout size={30} />
          <h2>
            {days
              ? "Keep the good habit growing."
              : "Your first step is waiting."}
          </h2>
          <p>
            {days
              ? `You’ve made room for English on ${days} ${days === 1 ? "day" : "days"}. That’s something to build on.`
              : "Complete a practice task to start your activity history. A little is enough."}
          </p>
          <Button onClick={() => navigate("mission")}>
            Go to today’s mission <ArrowRight size={16} />
          </Button>
        </section>
      </div>
      <section className="paper-card activity-card">
        <div className="section-heading">
          <h2>Your learning journal</h2>
          <Tag>{activities.length} sessions</Tag>
        </div>
        {activities.length ? (
          <div className="activity-list">
            {[...activities]
              .reverse()
              .slice(0, 30)
              .map((a) => {
                const Icon = icons[a.skill];
                return (
                  <div className="activity-row" key={a.id}>
                    <span
                      className={`skill-icon ${skills.find((s) => s.id === a.skill).color}`}
                    >
                      <Icon size={19} />
                    </span>
                    <div>
                      <strong>{a.title}</strong>
                      <span>
                        {a.skill} ·{" "}
                        {new Date(`${a.date}T12:00:00`).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}{" "}
                        · {a.minutes} min
                      </span>
                    </div>
                    <Tag color="mint">
                      {a.score != null ? `${a.score}/100` : "Completed"}
                    </Tag>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="empty-activity">
            <BookOpen size={30} />
            <h3>Your story starts with a little practice.</h3>
            <p>
              Reading, writing, listening, or speaking. Choose what feels right
              today.
            </p>
            <button className="text-button" onClick={() => navigate("reading")}>
              Try a reading lesson <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>
      {profile.weaknesses.length > 0 && (
        <div className="tip-box">
          <Lightbulb size={21} />
          <div>
            <strong>A direction for your next step</strong>
            <p>
              Give a little extra attention to {profile.weaknesses.join(", ")}.
              Your future AI lessons will focus on these areas.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
