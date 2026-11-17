
import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const demoIssues = [
  {
    repo: "good-first-issue",
    title: "Improve documentation for new contributors",
    language: "JavaScript",
    label: "good first issue",
    description:
      "Help new contributors understand the project setup and contribution workflow.",
    stars: "2.4k",
    url: "https://github.com/topics/good-first-issue",
  },
  {
    repo: "fastapi",
    title: "Add examples for API error handling",
    language: "Python",
    label: "documentation",
    description:
      "Contribute practical examples that make API error handling easier to understand.",
    stars: "90k+",
    url: "https://github.com/fastapi/fastapi/issues",
  },
  {
    repo: "freeCodeCamp",
    title: "Improve beginner learning resources",
    language: "JavaScript",
    label: "help wanted",
    description:
      "Make learning resources more approachable for people starting out.",
    stars: "430k+",
    url: "https://github.com/freeCodeCamp/freeCodeCamp/issues",
  },
];

const demoProjects = [
  {
    name: "FastAPI",
    language: "Python",
    stars: "90k+",
    description: "A modern framework for building APIs with Python.",
    url: "https://github.com/fastapi/fastapi",
  },
  {
    name: "freeCodeCamp",
    language: "JavaScript",
    stars: "430k+",
    description: "An open-source platform for learning programming.",
    url: "https://github.com/freeCodeCamp/freeCodeCamp",
  },
  {
    name: "Appwrite",
    language: "TypeScript",
    stars: "50k+",
    description: "Open-source backend services for application developers.",
    url: "https://github.com/appwrite/appwrite",
  },
];

function App() {
  const [page, setPage] = useState("Overview");
  const [skills, setSkills] = useState("JavaScript, Python");
  const [interest, setInterest] = useState("Backend development");
  const [idea, setIdea] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [codebase, setCodebase] = useState(null);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");

  function navigate(nextPage) {
    setPage(nextPage);
    setResults([]);
    setSearched(false);
    setNotice("");
  }


  async function findIssues(event) {
    event.preventDefault();
    setSearched(false);
    setResults([]);
    setNotice("Searching GitHub for matching issues...");
  
    try {
      const params = new URLSearchParams({
        languages: skills,
        interest: interest,
        limit: "10",
      });
  
      const response = await fetch(
        `http://127.0.0.1:8000/api/issues?${params.toString()}`
      );
  
      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }
  
      const data = await response.json();
  
      const formattedIssues = data.issues.map((issue) => ({
        ...issue,
        language: issue.language || "Language not provided",
        label: issue.labels?.[0] || "open issue",
      }));
  
      setResults(formattedIssues);
      setSearched(true);
      setNotice(
        `Successfully fetched ${data.count} real issues from GitHub.`
      );
    } catch (error) {
      setSearched(true);
      setNotice(
        `Could not fetch issues: ${error.message}. Check that FastAPI is running.`
      );
    }
  }
  

  
async function findProjects(event) {
  event.preventDefault();
  setSearched(false);
  setResults([]);
  setNotice("Searching GitHub repositories...");

  try {
    const params = new URLSearchParams({
      idea: idea,
      limit: "10",
    });

    const response = await fetch(
      `http://127.0.0.1:8000/api/projects?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    setResults(data.projects);
    setSearched(true);
    setNotice(`Successfully fetched ${data.count} repositories from GitHub.`);
  } catch (error) {
    setSearched(true);
    setNotice(`Could not fetch projects: ${error.message}`);
  }
}


  
async function exploreRepo(event) {
  event.preventDefault();
  setCodebase(null);
  setSearched(false);
  setNotice("Loading repository README and file tree...");

  try {
    const params = new URLSearchParams({ url: repoUrl.trim() });

    const response = await fetch(
      `http://127.0.0.1:8000/api/codebase?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Request failed (${response.status})`);
    }

    const data = await response.json();
    setCodebase(data);
    setSearched(true);
    setNotice("Repository loaded successfully.");
  } catch (error) {
    setSearched(true);
    setNotice(`Could not load repository: ${error.message}`);
  }
}


  const navItems = [
    { name: "Overview", icon: "⌂" },
    { name: "Find Issues", icon: "⌕" },
    { name: "Similar Projects", icon: "◇" },
    { name: "Codebase Guide", icon: "▤" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => navigate("Overview")}>
          <span className="brand-mark">R</span>
          <span>Repo<span className="brand-light">Compass</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => navigate(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Find Issues" && (
                <span className="nav-count">01</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="github-note">
            <span className="github-symbol">⌘</span>
            <div>
              <strong>Built for open source</strong>
              <p>Find your next contribution.</p>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">RC</div>
            <div className="profile-text">
              <strong>Developer workspace</strong>
              <span>Local preview</span>
            </div>
            <span className="profile-dots">···</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>
          <div className="topbar-right">
            <span className="status-dot" />
            <span>Prototype mode</span>
            <div className="top-avatar">D</div>
          </div>
        </header>

        <div className="page-content">
          {page === "Overview" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span /> YOUR OPEN-SOURCE COMPANION</div>
                  <h1>Find your place in <span>open source.</span></h1>
                  <p className="page-subtitle">
                    Discover projects that match your skills, find issues worth
                    solving, and understand codebases faster.
                  </p>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="hero-core">R<span>↗</span></div>
                  <div className="float-chip chip-one">{"{ }"}</div>
                  <div className="float-chip chip-two">⌘</div>
                  <div className="float-chip chip-three">✳</div>
                </div>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top"><span>Discovery tools</span><span className="stat-icon purple">⌕</span></div>
                  <div className="stat-number">03</div>
                  <p>One workspace, three ways to explore</p>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><span>Skill matching</span><span className="stat-icon green">⌁</span></div>
                  <div className="stat-number">01 <small>step</small></div>
                  <p>Start with the languages you know</p>
                </div>
                <div className="stat-card">
                  <div className="stat-top"><span>Getting started</span><span className="stat-icon orange">↗</span></div>
                  <div className="stat-number">∞</div>
                  <p>Open-source projects to explore</p>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Where do you want to start?</h2>
                  <p>Choose a tool and start exploring.</p>
                </div>
                <span className="section-caption">YOUR TOOLKIT</span>
              </div>

              <section className="tools-grid">
                <button className="tool-card" onClick={() => navigate("Find Issues")}>
                  <div className="tool-icon issue-icon">⌕</div>
                  <span className="tool-tag">CONTRIBUTE</span>
                  <h3>Find Issues</h3>
                  <p>Discover open-source issues based on your skills and interests.</p>
                  <span className="tool-link">Explore issues <b>↗</b></span>
                  <span className="tool-decoration">01</span>
                </button>
                <button className="tool-card" onClick={() => navigate("Similar Projects")}>
                  <div className="tool-icon project-icon">◇</div>
                  <span className="tool-tag">DISCOVER</span>
                  <h3>Similar Projects</h3>
                  <p>Turn a product idea into a starting point for GitHub discovery.</p>
                  <span className="tool-link">Find projects <b>↗</b></span>
                  <span className="tool-decoration">02</span>
                </button>
                <button className="tool-card" onClick={() => navigate("Codebase Guide")}>
                  <div className="tool-icon guide-icon">▤</div>
                  <span className="tool-tag">UNDERSTAND</span>
                  <h3>Codebase Guide</h3>
                  <p>Start exploring a repository's documentation and structure.</p>
                  <span className="tool-link">Explore a codebase <b>↗</b></span>
                  <span className="tool-decoration">03</span>
                </button>
              </section>

              <section className="bottom-banner">
                <div className="banner-symbol">✳</div>
                <div>
                  <h3>Your next contribution starts here.</h3>
                  <p>Tell RepoCompass what you know. We'll help you find where to begin.</p>
                </div>
                <button className="primary-button" onClick={() => navigate("Find Issues")}>
                  Get started <span>→</span>
                </button>
              </section>
            </>
          )}

          {page === "Find Issues" && (
            <section className="feature-page">
              <div className="eyebrow"><span /> CONTRIBUTION FINDER</div>
              <h1>Find your next <span>contribution.</span></h1>
              <p className="page-subtitle">Tell us what you know and what you'd like to work on.</p>

              <form className="search-panel" onSubmit={findIssues}>
                <label>Programming languages</label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Python, JavaScript, Java" />
                <small>Separate multiple languages with commas.</small>
                <label>What are you interested in?</label>
                <input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="e.g. backend, AI, developer tools" />
                <button className="primary-button" type="submit">Find matching issues <span>→</span></button>
              </form>

              {searched && (
                <ResultSection notice={notice} results={results} type="issue" />
              )}
            </section>
          )}

          {page === "Similar Projects" && (
            <section className="feature-page">
              <div className="eyebrow"><span /> PROJECT DISCOVERY</div>
              <h1>Ideas lead to <span>great projects.</span></h1>
              <p className="page-subtitle">Describe what you want to build to explore related open-source projects.</p>
              <form className="search-panel" onSubmit={findProjects}>
                <label>Your product idea</label>
                <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. A platform that helps developers discover open-source issues matched to their skills..." rows={5} required />
                <button className="primary-button" type="submit">Discover projects <span>→</span></button>
              </form>
              {searched && <ResultSection notice={notice} results={results} type="project" />}
            </section>
          )}

          {page === "Codebase Guide" && (
            <section className="feature-page">
              <div className="eyebrow"><span /> CODEBASE EXPLORER</div>
              <h1>Make any codebase <span>less confusing.</span></h1>
              <p className="page-subtitle">Start with a public GitHub repository and build your understanding step by step.</p>
              <form className="search-panel" onSubmit={exploreRepo}>
                <label>GitHub repository URL</label>
                <div className="input-with-icon"><span>↗</span><input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repository" /></div>
                <div className="guide-checklist">
                  <div><span>01</span><div><strong>Repository overview</strong><p>Identify the project's purpose and technologies.</p></div></div>
                  <div><span>02</span><div><strong>Understand the structure</strong><p>Explore folders and important files.</p></div></div>
                  <div><span>03</span><div><strong>Plan your first steps</strong><p>Know what to read before making a change.</p></div></div>
                </div>
                <button className="primary-button" type="submit">Explore codebase <span>→</span></button>
              </form>
              
{notice && <div className="notice">{notice}</div>}

{codebase && (
  <section className="results-section">
    <div className="results-heading">
      <div>
        <h2>{codebase.name}</h2>
        <p>{codebase.description || "No repository description provided."}</p>
      </div>
      <a
        className="result-open"
        href={codebase.url}
        target="_blank"
        rel="noreferrer"
      >
        ↗
      </a>
    </div>

    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-top">Primary language</div>
        <div className="stat-number" style={{ fontSize: 20 }}>
          {codebase.language || "Not specified"}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-top">GitHub stars</div>
        <div className="stat-number">
          {Number(codebase.stars || 0).toLocaleString()}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-top">Files listed</div>
        <div className="stat-number">{codebase.files?.length || 0}</div>
      </div>
    </div>

    <div className="search-panel">
      <h2>README preview</h2>
      <div className="readme-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {codebase.readme || "This repository has no readable README."}
        </ReactMarkdown>
      </div>
    </div>

    <div className="search-panel">
      <h2>Repository file tree</h2>
      {codebase.files?.length ? (
        <div className="guide-checklist">
          {codebase.files.map((file) => (
            <div key={file}>
              <span>↳</span>
              <div>
                <code>{file}</code>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No files were returned.</p>
      )}
      {codebase.truncated && (
        <p className="notice">
          GitHub truncated the repository tree. Only the returned files are shown.
        </p>
      )}
    </div>
  </section>
)}

            </section>
          )}
          <footer className="footer"><span>RepoCompass</span><span>Built to make open source more approachable.</span></footer>
        </div>
      </main>
    </div>
  );
}

function ResultSection({ notice, results, type }) {
  return (
    <section className="results-section">
      <div className="results-heading">
        <div><h2>Explore results</h2><p>
  {type === "issue"
    ? `${results.length} issues returned by GitHub`
    : `${results.length} sample results in this preview`}
</p></div>
      <span className="demo-badge">
        {type === "issue" ? "LIVE GITHUB" : "DEMO DATA"}
      </span>
      </div>
      {notice && <div className="notice">{notice}</div>}
      {results.length === 0 ? (
        <div className="empty-state">No sample issues matched those languages. Try Python or JavaScript.</div>
      ) : (
        <div className="results-list">
          {results.map((item, index) => (
            <article className="result-card" key={item.title || item.name}>
              <div className="result-number">0{index + 1}</div>
              <div className="result-body">
              <div className="result-repo">{item.repo || item.name}</div>
                <h3>{item.title || item.name}</h3>
                <p>{item.description}</p>
                <div className="result-tags">
                  <span>{item.language}</span>
                  {item.label && <span className="label-tag">{item.label}</span>}
                  {item.stars && <span>★ {item.stars}</span>}
                </div>
              </div>
              <a className="result-open" href={item.url} target="_blank" rel="noreferrer" aria-label="Open GitHub">↗</a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default App;
