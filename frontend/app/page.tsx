"use client";

import { useEffect, useState } from "react";

interface Scraper {
  id: string;
  name: string;
  target_url: string;
  status: string;
  last_checked_at: string | null;
  created_at: string;
}

export default function Home() {
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/scrapers")
      .then((res) => res.json())
      .then((data) => {
        setScrapers(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <main style={{ padding: "40px" }}>Loading scrapers...</main>;
  }

  if (error) {
    return <main style={{ padding: "40px" }}>Error: {error}</main>;
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>SpiderByte Scrapers</h1>
      {scrapers.length === 0 ? (
        <p>No scrapers found.</p>
      ) : (
        <ul>
          {scrapers.map((scraper) => (
            <li key={scraper.id}>
              {scraper.name} — {scraper.status} — {scraper.target_url}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}