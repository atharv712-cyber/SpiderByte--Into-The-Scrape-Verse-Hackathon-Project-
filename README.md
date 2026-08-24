# SpiderByte--Into-The-Scrape-Verse-Hackathon-Project-

SpiderByte
With great data, comes great scalability.
Scraper health monitoring and competitive intelligence, built for Into the Scrape-Verse.

SpiderByte is a dashboard that replaces the fragmented way developers currently track their web scrapers — scattered cron logs, Slack pings, spreadsheets, and manual checks — with one place to create, run, monitor, and self-heal scrapers, powered end to end by Bright Data Scraper Studio.


The flow:

Create — a user types a target URL and a plain-English description of what to extract (for example, "Extract the driver standings table or leaderboard" against formula1.com). SpiderByte's backend calls the Bright Data CLI (bdata scraper create) with that input. Bright Data's AI Agent analyzes the page and generates a working scraper, returning a Collector ID (c_*).
Store — that Collector ID is saved against the scraper's row in Supabase, so it is now a permanent, addressable part of the user's dashboard, not a one-off terminal command.
Run — clicking "Run" on any scraper card calls bdata scraper run <collector_id> <url>, executing the real scraper on Bright Data's infrastructure and returning live extracted data directly into the dashboard.
Heal — if a scraper's extraction breaks or drifts (for example, a site changes its layout), clicking "Heal" and describing what's wrong calls bdata scraper heal <collector_id> "<description>". Bright Data's AI re-analyzes and repairs the existing collector rather than starting over, then requires bdata scraper approve to commit the fix.
Proven collector IDs from this build (verifiable, real, publicly scrapeable targets, none from Bright Data's pre-built library):

Collector ID	Target	Extracts
c_msykyg3q2gwjgzcwsr	news.ycombinator.com	Story title, url, points, author, comment count (created, healed, and approved during development — see proof log below)
c_mt02akbq22ofowvmeq	en.wikipedia.org (largest tech companies by revenue)	Company name, revenue, industry
c_mt034ppxqyovw3oe7	formula1.com	Driver standings / leaderboard
Self-healing proof: the Hacker News collector (c_msykyg3q2gwjgzcwsr) was initially generated with a broken schema (empty stories array, an unrelated product_page_url). Rather than discarding it, bdata scraper heal was used with a corrective prompt describing the actual page structure, followed by bdata scraper approve to commit the fix. Full terminal transcript of this create → heal → approve cycle is included in PROOF.md (or paste your saved Notepad log there).

SpiderByte's backend never re-implements scraping logic itself — parsing, anti-bot handling, and extraction all happen inside Bright Data Scraper Studio. The app's job is to give that capability a real product surface: a dashboard, a database, and a history, instead of a one-off CLI command.

Example Structured JSON Output
Real output from bdata scraper run, called through SpiderByte's /api/scrapers/{collector_id}/run endpoint:

[
  {
    "standings": [
      {
        "position": "1",
        "driver_name": "Kimi Antonelli",
        "team_name": "Mercedes",
        "points": "219"
      },
      {
        "position": "2",
        "driver_name": "Lewis Hamilton",
        "team_name": "Ferrari",
        "points": "169"
      },
      {
        "position": "3",
        "driver_name": "George Russell",
        "team_name": "Mercedes",
        "points": "160"
      },
      {
        "position": "4",
        "driver_name": "Charles Leclerc",
        "team_name": "Ferrari",
        "points": "138"
      },
      {
        "position": "5",
        "driver_name": "Lando Norris",
        "team_name": "McLaren",
        "points": "128"
      },
      {
        "position": "6",
        "driver_name": "Max Verstappen",
        "team_name": "Red Bull Racing",
        "points": "109"
      }
    ],
    "input": {
      "url": "https://www.formula1.com/"
    }
  }
]

Tech Stack
Frontend: Next.js (App Router), React, plain CSS (no Tailwind)
Backend: FastAPI (Python)
Database: Supabase (Postgres), with Row Level Security enabled
Scraping engine: Bright Data Scraper Studio (via the bdata CLI)
Design system: monochrome dark theme — Space Grotesk, Inter, and JetBrains Mono, shared across the landing page and dashboard

Architecture
Browser
  |
  v
Next.js dashboard (localhost:3000)
  |  fetch()
  v
FastAPI backend (localhost:8000)
  |            |
  v            v
Supabase     Bright Data Scraper Studio
(Postgres)   (via bdata CLI: create / run / heal)
A scraper's lifecycle: created via prompt -> Collector ID stored in Supabase -> run on demand -> results shown live in the dashboard -> healed and re-approved if it breaks.

Project Structure
spiderbyte/
  frontend/           Next.js app
    app/
      page.tsx         dashboard UI
      globals.css       shared design system
  backend/
    main.py            FastAPI app: Supabase + Bright Data integration
    .env               Supabase and Bright Data credentials (not committed)
  index.html            standalone landing page
  README.md

Database Schema
Two tables in Supabase, RLS enabled.

create table scrapers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_url text,
  status text default 'unknown',
  last_checked_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  collector_id text
);

create table scraper_logs (
  id uuid primary key default gen_random_uuid(),
  scraper_id uuid references scrapers(id) on delete cascade,
  status text not null,
  response_time_ms integer,
  error_message text,
  checked_at timestamp with time zone default now()
);
API Endpoints
Method	Path	Purpose
GET	/health	Health check
GET	/api/scrapers	List all scrapers
POST	/api/scrapers	Manually add a scraper row
POST	/api/scrapers/generate	Create a new scraper from a prompt via Bright Data AI
POST	/api/scrapers/{collector_id}/run	Run a scraper against a target URL
POST	/api/scrapers/{collector_id}/heal	Self-heal a broken scraper
POST	/api/logs	Record an execution log entry
Full interactive docs available at /docs once the backend is running (FastAPI's built-in Swagger UI).


Proof that the scraper can heal itself:- (Real terminal history of the time when it was healing)

"product_page_url": "https://responsiblestatecraft.org/israel-influence-chatgpt/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://current.org/2026/08/judge-sets-framework-for-nine-pbs-to-retrieve-archival-data/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://blog.roboflow.com/openai-gpt-5-6/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://openrouter.ai/openai/gpt-5.6-sol",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.newyorker.com/culture/photo-booth/the-lonely-men-at-the-end-of-the-world",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.repaircafe.org/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.theregister.com/ai-and-ml/2026/08/18/google-buys-crashed-airline-spirits-data-at-auction-because-ai/5288962",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://arxiv.org/abs/2608.13759",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://timmarinin.net/2026/bluesky-screenshots/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://en.andros.dev/blog/54572bc7/finger-the-1971-social-network-that-never-died/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://duckdb.org/2026/08/17/duckdb-20-highlights",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.science.org/content/article/shattered-skeleton-scottish-castle-first-confirmed-death-trebuchet",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://moddedbear.com/an-update-on-leaving-gmail-for-fastmail/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://sunclock.net/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://irz.fr/en/articles/openclimbing-open-guide-en/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://scapplications.com/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.fast.ai/posts/2026-08-18-returning-to-AI/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://blog.roboflow.com/roboflow-playground/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://devblogs.microsoft.com/oldnewthing/20260817-40/?p=112617",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.desktoponfire.com/haiku_inc/969/25-years-of-haiku/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.librarian.net/notoai/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://engineering.myhoai.com/posts/a-simple-fix-for-llm-tail-latency/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.rainydaygc.com/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://en.wikipedia.org/wiki/Olo_(color)",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://acadia.engineering/blog/rethinking-database-programming",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://pixelcluster.dev/VRAM-Overcommit/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://arstechnica.com/tech-policy/2026/08/as-wisconsin-cities-flee-flock-its-shared-camera-network-loses-value/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://danluu.com/benchpocalypse/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://nemanjatrifunovic.substack.com/p/the-road-to-ms-dos-2",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://fabiensanglard.net/quake_shareware_cd/index.html",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://moultano.wordpress.com/2026/08/14/fairly-ranking-the-most-brilliant-birds/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.wiz.io/blog/red-agent-snowflake-copilot-cicd-bug",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://daringfireball.net/2026/08/anthropics_watermark_text_adulteration_in_claude_is_a_perversion_of_writing",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://arstechnica.com/information-technology/2026/08/nvidia-discloses-21b-stake-in-spacex/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://thenewcuriosityshop.substack.com/p/ghosts-of-the-past-and-devils-of",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.nature.com/articles/d41586-026-02498-1",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://desktopcolors.com/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://artificialanalysis.ai/models/qwen3-8-27b",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.storagereview.com/news/micron-and-sk-hynix-commit-billions-to-memory-capacity-but-almost-nothing-lands-before-2028",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://linear.axler.net/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://status.cursor.com/incidents/l9h9vrd726jv",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://simonwillison.net/2026/Aug/16/qwen-38-27b/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.businessinsider.com/oldest-bar-every-state",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://signoregalilei.com/2026/08/02/how-to-put-170-atoms-in-an-atom/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.axios.com/2026/08/17/google-spirit-airlines-bankruptcy",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.bbc.com/news/articles/c8xnwqe00v1o",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://thenextweb.com/news/openai-preparedness-team-disbanded-ipo-streamlining",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.404media.co/show-how-3m-is-0-at-fault-expert-witness-used-chatgpt-to-write-report-defending-company-in-deadly-explosion-lawsuit/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://56k.rip/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://twitter.com/DarioAmodei/status/2088758816376807762",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://speko.ai/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.cell.com/cell-reports-medicine/fulltext/S2666-3791%2826%2900405-2?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS2666379126004052%3Fshowall%3Dtrue",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  }
]
(venv) PS C:\Users\ATHARV\OneDrive\Desktop\SpiderByte--Into-The-Scrape-Verse-Hackathon-Project-> bdata scraper heal c_msykyg3q2gwjgzcwsr "The stories array is empty and product_page_url is wrong. This page lists 30 news stories, each with a title, a link, a points count, an author username, and a comment count. Extract all 30 as an array called stories, not a single product page."
⠹ Healing scraper...Step: planner — polling (attempt 1/600)
⠦ Healing scraper...Step: planner — polling (attempt 2/600)
⠙ Healing scraper...Step: planner — polling (attempt 3/600)
⠴ Healing scraper...Step: planner — polling (attempt 4/600)
⠏ Healing scraper...Step: planner — polling (attempt 5/600)
⠼ Healing scraper...Step: control_preview_runner — polling (attempt 6/600)
⠏ Healing scraper...Step: control_preview_runner — polling (attempt 7/600)
⠸ Healing scraper...Step: code_fixer — polling (attempt 8/600)
⠧ Healing scraper...Step: code_fixer — polling (attempt 9/600)
⠹ Healing scraper...Step: code_fixer — polling (attempt 10/600)
⠦ Healing scraper...Step: code_fixer — polling (attempt 11/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 12/600)
⠴ Healing scraper...Step: code_fixer — polling (attempt 13/600)
⠋ Healing scraper...Step: code_fixer — polling (attempt 14/600)
⠼ Healing scraper...Step: code_fixer — polling (attempt 15/600)
⠏ Healing scraper...Step: code_fixer — polling (attempt 16/600)
⠸ Healing scraper...Step: code_fixer — polling (attempt 17/600)
⠇ Healing scraper...Step: code_fixer — polling (attempt 18/600)
⠹ Healing scraper...Step: code_fixer — polling (attempt 19/600)
⠦ Healing scraper...Step: code_fixer — polling (attempt 20/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 21/600)
⠴ Healing scraper...Step: code_fixer — polling (attempt 22/600)
⠏ Healing scraper...Step: code_fixer — polling (attempt 23/600)
⠼ Healing scraper...Step: code_fixer — polling (attempt 24/600)
⠇ Healing scraper...Step: code_fixer — polling (attempt 25/600)
⠸ Healing scraper...Step: code_fixer — polling (attempt 26/600)
⠧ Healing scraper...Step: code_fixer — polling (attempt 27/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 28/600)
⠴ Healing scraper...Step: code_fixer — polling (attempt 29/600)
⠋ Healing scraper...Step: code_fixer — polling (attempt 30/600)
⠼ Healing scraper...Step: code_fixer — polling (attempt 31/600)
⠇ Healing scraper...Step: code_fixer — polling (attempt 32/600)
⠸ Healing scraper...Step: code_fixer — polling (attempt 33/600)
⠧ Healing scraper...Step: code_fixer — polling (attempt 34/600)
⠹ Healing scraper...Step: code_fixer — polling (attempt 35/600)
⠦ Healing scraper...Step: code_fixer — polling (attempt 36/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 37/600)
⠴ Healing scraper...Step: code_fixer — polling (attempt 38/600)
⠏ Healing scraper...Step: code_fixer — polling (attempt 39/600)
⠸ Healing scraper...Step: code_fixer — polling (attempt 40/600)
⠇ Healing scraper...Step: code_fixer — polling (attempt 41/600)
⠹ Healing scraper...Step: code_fixer — polling (attempt 42/600)
⠦ Healing scraper...Step: code_fixer — polling (attempt 43/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 44/600)
⠴ Healing scraper...Step: code_fixer — polling (attempt 45/600)
⠋ Healing scraper...Step: code_fixer — polling (attempt 46/600)
⠼ Healing scraper...Step: code_fixer — polling (attempt 47/600)
⠇ Healing scraper...Step: code_fixer — polling (attempt 48/600)
⠹ Healing scraper...Step: code_fixer — polling (attempt 49/600)
⠧ Healing scraper...Step: code_fixer — polling (attempt 50/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 51/600)
⠦ Healing scraper...Step: code_fixer — polling (attempt 52/600)
⠋ Healing scraper...Step: code_fixer — polling (attempt 53/600)
⠼ Healing scraper...Step: code_fixer — polling (attempt 54/600)
⠇ Healing scraper...Step: code_fixer — polling (attempt 55/600)
⠸ Healing scraper...Step: code_fixer — polling (attempt 56/600)
⠧ Healing scraper...Step: code_fixer — polling (attempt 57/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 58/600)
⠦ Healing scraper...Step: code_fixer — polling (attempt 59/600)
⠙ Healing scraper...Step: code_fixer — polling (attempt 60/600)
⠴ Healing scraper...Step: code_fixer — polling (attempt 61/600)
⠋ Healing scraper...Step: step_preview_runner — polling (attempt 62/600)
⠼ Healing scraper...Step: step_preview_runner — polling (attempt 63/600)
⠏ Healing scraper...Step: step_preview_runner — polling (attempt 64/600)
⠴ Healing scraper...Step: step_preview_runner — polling (attempt 65/600)
⠏ Healing scraper...Step: step_preview_runner — polling (attempt 66/600)
⠼ Healing scraper...Step: step_preview_runner — polling (attempt 67/600)
⠏ Healing scraper...Step: step_preview_runner — polling (attempt 68/600)
⠼ Healing scraper...Step: request_fulfillment_validator — polling (attempt 69/600)
⠇ Healing scraper...Step: request_fulfillment_validator — polling (attempt 70/600)
⠸ Healing scraper...Step: request_fulfillment_validator — polling (attempt 71/600)
⠧ Healing scraper...Step: request_fulfillment_validator — polling (attempt 72/600)
⠹ Healing scraper...Step: request_fulfillment_validator — polling (attempt 73/600)
⠧ Healing scraper...Step: request_fulfillment_validator — polling (attempt 74/600)
⠙ Healing scraper...Step: request_fulfillment_validator — polling (attempt 75/600)
⠴ Healing scraper...Step: request_fulfillment_validator — polling (attempt 76/600)
Done in 77 poll attempts.
Heal ready — awaiting approval (collector c_msykyg3q2gwjgzcwsr).
✓ Scraper healed: c_msykyg3q2gwjgzcwsr
  Prompt: The stories array is empty and product_page_url is wrong. This page lists 30 news stories, each with a title, a link, a points count, an author username, and a comment count. Extract all 30 as an array called stories, not a single product page.
  Completed steps: 6
  Next: re-run to verify the fix → bdata scraper approve c_msykyg3q2gwjgzcwsr
(venv) PS C:\Users\ATHARV\OneDrive\Desktop\SpiderByte--Into-The-Scrape-Verse-Hackathon-Project-> bdata scraper approve c_msykyg3q2gwjgzcwsr
✓ Scraper healed: c_msykyg3q2gwjgzcwsr
  Completed steps: 7
  Next: re-run to verify the fix → bdata scraper run c_msykyg3q2gwjgzcwsr <url>
(venv) PS C:\Users\ATHARV\OneDrive\Desktop\SpiderByte--Into-The-Scrape-Verse-Hackathon-Project-> bdata scraper run c_msykyg3q2gwjgzcwsr https://news.ycombinator.com --pretty
Triggered (response_id: d2t1787053779051rcmf9p88lelo)
⠹ Waiting for results...Polling (attempt 1/600)
⠦ Waiting for results...Polling (attempt 2/600)
⠙ Waiting for results...Polling (attempt 3/600)
⠴ Waiting for results...Polling (attempt 4/600)
⠏ Waiting for results...Polling (attempt 5/600)
⠼ Waiting for results...Polling (attempt 6/600)
⠇ Waiting for results...Polling (attempt 7/600)
⠸ Waiting for results...Polling (attempt 8/600)
⠧ Waiting for results...Polling (attempt 9/600)
⠴ Waiting for results...Polling (attempt 10/600)
⠏ Waiting for results...Polling (attempt 11/600)
⠼ Waiting for results...Polling (attempt 12/600)
⠇ Waiting for results...Polling (attempt 13/600)
⠸ Waiting for results...Polling (attempt 14/600)
⠧ Waiting for results...Polling (attempt 15/600)
⠹ Waiting for results...Polling (attempt 16/600)
⠧ Waiting for results...Polling (attempt 17/600)
⠙ Waiting for results...Polling (attempt 18/600)
⠴ Waiting for results...Polling (attempt 19/600)
⠋ Waiting for results...Polling (attempt 20/600)
⠼ Waiting for results...Polling (attempt 21/600)
⠏ Waiting for results...Polling (attempt 22/600)
⠸ Waiting for results...Polling (attempt 23/600)
⠧ Waiting for results...Polling (attempt 24/600)
⠙ Waiting for results...Polling (attempt 25/600)
⠧ Waiting for results...Polling (attempt 26/600)
⠙ Waiting for results...Polling (attempt 27/600)
⠴ Waiting for results...Polling (attempt 28/600)
⠏ Waiting for results...Polling (attempt 29/600)
⠼ Waiting for results...Polling (attempt 30/600)
⠏ Waiting for results...Polling (attempt 31/600)
⠸ Waiting for results...Polling (attempt 32/600)
⠇ Waiting for results...Polling (attempt 33/600)
⠹ Waiting for results...Polling (attempt 34/600)
⠦ Waiting for results...Polling (attempt 35/600)
⠙ Waiting for results...Polling (attempt 36/600)
⠴ Waiting for results...Polling (attempt 37/600)
⠋ Waiting for results...Polling (attempt 38/600)
⠼ Waiting for results...Polling (attempt 39/600)
⠏ Waiting for results...Polling (attempt 40/600)
⠸ Waiting for results...Polling (attempt 41/600)
⠇ Waiting for results...Polling (attempt 42/600)
⠹ Waiting for results...Polling (attempt 43/600)
⠇ Waiting for results...Polling (attempt 44/600)
⠹ Waiting for results...Polling (attempt 45/600)
⠧ Waiting for results...Polling (attempt 46/600)
⠹ Waiting for results...Polling (attempt 47/600)
⠦ Waiting for results...Polling (attempt 48/600)
⠋ Waiting for results...Polling (attempt 49/600)
⠴ Waiting for results...Polling (attempt 50/600)
⠏ Waiting for results...Polling (attempt 51/600)
⠼ Waiting for results...Polling (attempt 52/600)
⠇ Waiting for results...Polling (attempt 53/600)
⠸ Waiting for results...Polling (attempt 54/600)
⠧ Waiting for results...Polling (attempt 55/600)
⠹ Waiting for results...Polling (attempt 56/600)
⠦ Waiting for results...Polling (attempt 57/600)
⠙ Waiting for results...Polling (attempt 58/600)
⠴ Waiting for results...Polling (attempt 59/600)
⠋ Waiting for results...Polling (attempt 60/600)
⠼ Waiting for results...Polling (attempt 61/600)
⠏ Waiting for results...Polling (attempt 62/600)
⠸ Waiting for results...Polling (attempt 63/600)
⠧ Waiting for results...Polling (attempt 64/600)
⠹ Waiting for results...Polling (attempt 65/600)
⠧ Waiting for results...Polling (attempt 66/600)
⠹ Waiting for results...Polling (attempt 67/600)
⠧ Waiting for results...Polling (attempt 68/600)
⠙ Waiting for results...Polling (attempt 69/600)
⠦ Waiting for results...Polling (attempt 70/600)
⠋ Waiting for results...Polling (attempt 71/600)
⠼ Waiting for results...Polling (attempt 72/600)
⠏ Waiting for results...Polling (attempt 73/600)
⠸ Waiting for results...Polling (attempt 74/600)
⠇ Waiting for results...Polling (attempt 75/600)
⠹ Waiting for results...Polling (attempt 76/600)
⠦ Waiting for results...Polling (attempt 77/600)
⠋ Waiting for results...Polling (attempt 78/600)
⠼ Waiting for results...Polling (attempt 79/600)
⠏ Waiting for results...Polling (attempt 80/600)
⠸ Waiting for results...Polling (attempt 81/600)
⠇ Waiting for results...Polling (attempt 82/600)
⠸ Waiting for results...Polling (attempt 83/600)
⠧ Waiting for results...Polling (attempt 84/600)
⠙ Waiting for results...Polling (attempt 85/600)
⠦ Waiting for results...Polling (attempt 86/600)
⠋ Waiting for results...Polling (attempt 87/600)
⠴ Waiting for results...Polling (attempt 88/600)
⠋ Waiting for results...Polling (attempt 89/600)
⠼ Waiting for results...Polling (attempt 90/600)
⠏ Waiting for results...Polling (attempt 91/600)
⠸ Waiting for results...Polling (attempt 92/600)
⠧ Waiting for results...Polling (attempt 93/600)
⠙ Waiting for results...Polling (attempt 94/600)
⠦ Waiting for results...Polling (attempt 95/600)
⠋ Waiting for results...Polling (attempt 96/600)
⠼ Waiting for results...Polling (attempt 97/600)
⠏ Waiting for results...Polling (attempt 98/600)
⠼ Waiting for results...Polling (attempt 99/600)
⠇ Waiting for results...Polling (attempt 100/600)
⠸ Waiting for results...Polling (attempt 101/600)
⠧ Waiting for results...Polling (attempt 102/600)
⠹ Waiting for results...Polling (attempt 103/600)
⠦ Waiting for results...Polling (attempt 104/600)
⠋ Waiting for results...Polling (attempt 105/600)
⠼ Waiting for results...Polling (attempt 106/600)
⠏ Waiting for results...Polling (attempt 107/600)
⠸ Waiting for results...Polling (attempt 108/600)
⠧ Waiting for results...Polling (attempt 109/600)
⠹ Waiting for results...Polling (attempt 110/600)
⠦ Waiting for results...Polling (attempt 111/600)
⠋ Waiting for results...Polling (attempt 112/600)
⠼ Waiting for results...Polling (attempt 113/600)
⠇ Waiting for results...Polling (attempt 114/600)
⠸ Waiting for results...Polling (attempt 115/600)
⠧ Waiting for results...Polling (attempt 116/600)
⠸ Waiting for results...Polling (attempt 117/600)
⠧ Waiting for results...Polling (attempt 118/600)
⠙ Waiting for results...Polling (attempt 119/600)
⠧ Waiting for results...Polling (attempt 120/600)
⠹ Waiting for results...Polling (attempt 121/600)
⠴ Waiting for results...Polling (attempt 122/600)
fetch failed (response_id d2t1787053779051rcmf9p88lelo)
(venv) PS C:\Users\ATHARV\OneDrive\Desktop\SpiderByte--Into-The-Scrape-Verse-Hackathon-Project-> bdata scraper run c_msykyg3q2gwjgzcwsr https://news.ycombinator.com --pretty
Triggered (response_id: d2t1787054168369r1hnctjri94g)
⠹ Waiting for results...Polling (attempt 1/600)
⠦ Waiting for results...Polling (attempt 2/600)
⠙ Waiting for results...Polling (attempt 3/600)
⠴ Waiting for results...Polling (attempt 4/600)
⠋ Waiting for results...Polling (attempt 5/600)
⠼ Waiting for results...Polling (attempt 6/600)
⠏ Waiting for results...Polling (attempt 7/600)
⠸ Waiting for results...Polling (attempt 8/600)
⠇ Waiting for results...Polling (attempt 9/600)
⠹ Waiting for results...Polling (attempt 10/600)
Realtime page limit exceeded — switching to batch mode...
Batch job: j_msylx5f7mqi2epmi4 (ETA: 2026-08-18T11:56:24.252Z)
⠹ Collecting (batch)...Polling batch (attempt 1/3600)
⠼ Collecting (batch)...Polling batch (attempt 2/3600)
⠦ Collecting (batch)...Polling batch (attempt 3/3600)
⠇ Collecting (batch)...Polling batch (attempt 4/3600)
⠋ Collecting (batch)...Polling batch (attempt 5/3600)
⠹ Collecting (batch)...Polling batch (attempt 6/3600)
⠼ Collecting (batch)...Polling batch (attempt 7/3600)
⠏ Collecting (batch)...Polling batch (attempt 8/3600)
⠋ Collecting (batch)...Polling batch (attempt 9/3600)
⠙ Collecting (batch)...Polling batch (attempt 10/3600)
⠼ Collecting (batch)...Polling batch (attempt 11/3600)
⠹ Collecting (batch)...Polling batch (attempt 12/3600)
⠹ Collecting (batch)...Polling batch (attempt 13/3600)
⠧ Collecting (batch)...Polling batch (attempt 14/3600)
⠙ Collecting (batch)...Polling batch (attempt 15/3600)
⠹ Collecting (batch)...Polling batch (attempt 16/3600)
⠼ Collecting (batch)...Polling batch (attempt 17/3600)
⠦ Collecting (batch)...Polling batch (attempt 18/3600)
⠇ Collecting (batch)...Polling batch (attempt 19/3600)
⠙ Collecting (batch)...Polling batch (attempt 20/3600)
⠹ Collecting (batch)...Polling batch (attempt 21/3600)
⠼ Collecting (batch)...Polling batch (attempt 22/3600)
⠴ Collecting (batch)...Polling batch (attempt 23/3600)
[
  {
    "stories": [],
    "product_page_url": "https://fabiensanglard.net/quake_shareware_cd/index.html",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://danluu.com/benchpocalypse/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://pixelcluster.dev/VRAM-Overcommit/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://nemanjatrifunovic.substack.com/p/the-road-to-ms-dos-2",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://arxiv.org/abs/2608.13759",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://en.andros.dev/blog/54572bc7/finger-the-1971-social-network-that-never-died/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.librarian.net/notoai/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://moultano.wordpress.com/2026/08/14/fairly-ranking-the-most-brilliant-birds/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://arstechnica.com/tech-policy/2026/08/as-wisconsin-cities-flee-flock-its-shared-camera-network-loses-value/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://current.org/2026/08/judge-sets-framework-for-nine-pbs-to-retrieve-archival-data/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://en.wikipedia.org/wiki/Olo_(color)",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.bbc.com/news/articles/c8xnwqe00v1o",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://responsiblestatecraft.org/israel-influence-chatgpt/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.wiz.io/blog/red-agent-snowflake-copilot-cicd-bug",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://irz.fr/en/articles/openclimbing-open-guide-en/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://moddedbear.com/an-update-on-leaving-gmail-for-fastmail/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://sunclock.net/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://blog.roboflow.com/openai-gpt-5-6/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.theregister.com/ai-and-ml/2026/08/18/google-buys-crashed-airline-spirits-data-at-auction-because-ai/5288962",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://timmarinin.net/2026/bluesky-screenshots/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.repaircafe.org/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://duckdb.org/2026/08/17/duckdb-20-highlights",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.newyorker.com/culture/photo-booth/the-lonely-men-at-the-end-of-the-world",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://scapplications.com/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://secretspec.dev/blog/we-are-forking-dotenvy-into-dotenv-ng/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://simonwillison.net/2026/Aug/16/qwen-38-27b/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://daringfireball.net/2026/08/anthropics_watermark_text_adulteration_in_claude_is_a_perversion_of_writing",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://signoregalilei.com/2026/08/02/how-to-put-170-atoms-in-an-atom/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://56k.rip/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.rainydaygc.com/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://blog.roboflow.com/roboflow-playground/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://arstechnica.com/information-technology/2026/08/nvidia-discloses-21b-stake-in-spacex/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://devblogs.microsoft.com/oldnewthing/20260817-40/?p=112617",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.storagereview.com/news/micron-and-sk-hynix-commit-billions-to-memory-capacity-but-almost-nothing-lands-before-2028",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://thenewcuriosityshop.substack.com/p/ghosts-of-the-past-and-devils-of",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://linear.axler.net/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.404media.co/show-how-3m-is-0-at-fault-expert-witness-used-chatgpt-to-write-report-defending-company-in-deadly-explosion-lawsuit/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://speko.ai/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://desktopcolors.com/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.businessinsider.com/oldest-bar-every-state",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://engineering.myhoai.com/posts/a-simple-fix-for-llm-tail-latency/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.fast.ai/posts/2026-08-18-returning-to-AI/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://artificialanalysis.ai/models/qwen3-8-27b",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://thenextweb.com/news/openai-preparedness-team-disbanded-ipo-streamlining",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://status.cursor.com/incidents/l9h9vrd726jv",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.cell.com/cell-reports-medicine/fulltext/S2666-3791%2826%2900405-2?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS2666379126004052%3Fshowall%3Dtrue",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://twitter.com/DarioAmodei/status/2088758816376807762",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.desktoponfire.com/haiku_inc/969/25-years-of-haiku/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.nature.com/articles/d41586-026-02498-1",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://acadia.engineering/blog/rethinking-database-programming",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://openrouter.ai/openai/gpt-5.6-sol",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "stories": [],
    "product_page_url": "https://www.science.org/content/article/shattered-skeleton-scottish-castle-first-confirmed-death-trebuchet",
    "input": {
      "url": "https://news.ycombinator.com"
    }
  }
]
(venv) PS C:\Users\ATHARV\OneDrive\Desktop\SpiderByte--Into-The-Scrape-Verse-Hackathon-Project-> bdata scraper run c_msykyg3q2gwjgzcwsr https://news.ycombinator.com --pretty                                                                                                                                                                                                                  




Setup Instructions
Prerequisites
Node.js and npm
Python 3.10+
A Supabase account and project
A Bright Data account with Scraper Studio access
The Bright Data CLI: npm install -g @brightdata/cli

1. Clone the repo
git clone <your-repo-url>
cd spiderbyte

2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate        (Windows)
source venv/bin/activate     (Mac/Linux)
pip install fastapi uvicorn python-dotenv supabase --break-system-packages
Create backend/.env:

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
BRIGHT_DATA_API_KEY=your_bright_data_api_key
Authenticate the Bright Data CLI once:

bdata login
Run the database schema (SQL above) in the Supabase SQL Editor, then start the backend:

uvicorn main:app --reload --port 8000
3. Frontend setup
cd frontend
npm install
npm run dev
Visit http://localhost:3000.

4. Verify
http://localhost:8000/health should return {"status":"ok"}
http://localhost:8000/docs should list all endpoints
The dashboard should load and show any scrapers already in Supabase
Known Limitations
Scraper creation and healing each take 5-10 minutes (Bright Data's AI generation time); the dashboard shows a loading state during this but does not currently poll in the background, so the tab must stay open.
The "Cancel" action on a running scrape stops the browser from waiting on the result, but does not stop the underlying job on Bright Data's servers.

NOTE:- The scraper *may* not work as we claim since we encountered a syntax error right on the last day (19 August 2026, Wednesday) before we decided to finish creating this project because of our exams coming up, due to which the UI doesn't load, for that reason we have provided all the proof that it did/does work. If it works, that's nice.. But if it doesn't, we apologise in advance for our mistakes. No authentication is implemented yet;

Team Aurelius 
[Advait and Atharv]

Built for Into the Scrape-Verse, presented by WeMakeDevs, using Bright Data Scraper Studio.