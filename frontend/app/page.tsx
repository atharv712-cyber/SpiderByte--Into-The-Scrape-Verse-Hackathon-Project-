"use client";

import { useEffect, useState } from "react";

interface Scraper {
  id: string;
  name: string;
  target_url: string;
  status: string;
  collector_id: string | null;
  created_at: string;
}

function ScraperCard({ scraper }: { scraper: Scraper }) {
  const [running, setRunning] = useState(false);
const [healing, setHealing] = useState(false);
const [healPrompt, setHealPrompt] = useState("");
const [showHealField, setShowHealField] = useState(false);
const [result, setResult] = useState<string | null>(null);
const [runController, setRunController] = useState<AbortController | null>(null);

async function handleRun() {
  setRunning(true);
  setResult(null);
  const controller = new AbortController();
  setRunController(controller);
  try {
    const res = await fetch(
      `http://localhost:8000/api/scrapers/${scraper.collector_id}/run?target_url=${encodeURIComponent(scraper.target_url)}`,
      { method: "POST", signal: controller.signal }
    );
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      setResult("Run cancelled.");
    } else {
      setResult("Run failed: " + (err as Error).message);
    }
  }
  setRunning(false);
  setRunController(null);
}

function handleCancelRun() {
  runController?.abort();
}

  async function handleHeal() {
    setHealing(true);
    setResult(null);
    try {
      const res = await fetch(
        `http://localhost:8000/api/scrapers/${scraper.collector_id}/heal?prompt=${encodeURIComponent(healPrompt)}`,
        { method: "POST" }
      );
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      setShowHealField(false);
    } catch (err) {
      setResult("Heal failed: " + (err as Error).message);
    }
    setHealing(false);
  }

  return (
    <div className="card">
      <div className="card-top">
        <div className="card-name">{scraper.name}</div>
        <span className={`badge ${scraper.status === "active" ? "badge-active" : ""}`}>
          <span className="badge-dot"></span>
          {scraper.status}
        </span>
      </div>

      <div className="card-field">
        <span className="card-label">URL</span>
        <div className="card-url">{scraper.target_url}</div>
      </div>

      {scraper.collector_id && (
        <div className="card-collector">{scraper.collector_id}</div>
      )}

      <div className="card-actions">
        {scraper.collector_id && (
          <>
            <button className="uiverse-button" onClick={handleRun} disabled={running}>
              <div className="uiverse-blob1"></div>
              <div className="uiverse-inner">{running ? "Running..." : "Run"}</div>
            </button>
            <button
              className="uiverse-button"
              onClick={() => setShowHealField(!showHealField)}
              disabled={healing}
            >
              <div className="uiverse-blob1"></div>
              <div className="uiverse-inner">{healing ? "Healing..." : "Heal"}</div>
            </button>
          </>
        )}
      </div>

      {showHealField && (
        <div className="heal-field">
          <div className="field">
            <label>Describe the fix</label>
            <textarea
              value={healPrompt}
              onChange={(e) => setHealPrompt(e.target.value)}
              placeholder="What is broken and what should it extract instead"
            />
          </div>
          <button className="btn-solid" onClick={handleHeal} disabled={healing}>
            {healing ? "Healing..." : "Submit Heal"}
          </button>
        </div>
      )}

      <div className="card-output">
        {(running || healing) && (
          <div className="generating-note">
            <span className="pulse-dot"></span>
            {running ? "Running scraper..." : "Healing scraper..."}
          </div>
        )}
        {!running && !healing && result && (
          <pre className="output-json">{result}</pre>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function loadScrapers() {
  try {
    const res = await fetch("http://localhost:8000/api/scrapers");
    const data = await res.json();

    // Check if data is directly an array
    if (Array.isArray(data)) {
      setScrapers(data);
    } 
    // Handle nested object response (e.g., { scrapers: [...] } or { data: [...] })
    else if (Array.isArray(data.scrapers)) {
      setScrapers(data.scrapers);
    } else if (Array.isArray(data.data)) {
      setScrapers(data.data);
    } else {
      console.error("API did not return an array:", data);
      setScrapers([]); // Fallback to empty array to prevent .map() crash
    }
  } catch (err) {
    console.error("Failed to load scrapers:", err);
    setScrapers([]); // Fallback on fetch error
  }
}

  useEffect(() => {
    loadScrapers();
  }, []);

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("http://localhost:8000/api/scrapers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, target_url: targetUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "generation failed");
      }
      setPrompt("");
      setTargetUrl("");
      setShowForm(false);
      loadScrapers();
    } catch (err) {
      setCreateError((err as Error).message);
    }
    setCreating(false);
  }

  return (
    <div>
      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <span className="dash-brand">SpiderByte</span>
          <span className="dash-status">
            <span className="dash-status-dot"></span>
            {scrapers.length} scrapers monitored
          </span>
        </div>
      </nav>

      <div className="dash-shell">
        <div className="dash-header">
          <div>
            <div className="dash-title">Scrapers</div>
            <div className="dash-subtitle">Every scraper you have built or generated, in one place.</div>
          </div>
          <button className="uiverse-button" onClick={() => setShowForm(!showForm)}>
            <div className="uiverse-blob1"></div>
            <div className="uiverse-inner">{showForm ? "Cancel" : "New Scraper"}</div>
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <div className="form-card-title">Describe your scraper</div>
            <div className="field">
              <label>Target URL</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="field">
              <label>What should it extract</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Extract the top 30 stories: title, url, points, author, comment count"
              />
            </div>
            <button className="btn-solid" onClick={handleCreate} disabled={creating}>
              {creating ? "Generating..." : "Generate Scraper"}
            </button>
            {creating && (
              <div className="generating-note">
                <span className="pulse-dot"></span>
                Hang tight! This uses Bright Data AI and may take 5 to 10 minutes. Do not close this tab.
              </div>
            )}
            {createError && <div className="generating-note">{createError}</div>}
          </div>
        )}

        {loading && <div className="empty-state">Loading scrapers...</div>}
        {error && <div className="error-state">Error: {error}</div>}
        {!loading && !error && scrapers.length === 0 && (
          <div className="empty-state">No scrapers yet. Create your first one above.</div>
        )}
        {!loading && !error && scrapers.length > 0 && (
          <div className="grid">
            {scrapers.map((s) => (
              <ScraperCard key={s.id} scraper={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}