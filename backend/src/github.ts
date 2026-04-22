// ─── GitHub API Client ────────────────────────────────────────────────────────

export interface GitHubFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string };
  head: { ref: string };
  base: { ref: string };
}

function makeHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'VigOps-Analysis-Tool/2.0',
  };
  if (token && token !== 'your_github_token_here') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPRFiles(owner: string, repo: string, pr: number): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr}/files?per_page=100`;
  const res = await fetch(url, { headers: makeHeaders() });

  if (res.status === 404) {
    throw new Error('404: PR or repository not found (may be private)');
  }
  if (res.status === 403 || res.status === 429) {
    throw new Error('429: GitHub API rate limit exceeded — add GITHUB_TOKEN to .env');
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<GitHubFile[]>;
}

export async function fetchPRDetails(owner: string, repo: string, pr: number): Promise<GitHubPR> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr}`;
  const res = await fetch(url, { headers: makeHeaders() });

  if (res.status === 404) {
    throw new Error('404: PR or repository not found (may be private)');
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<GitHubPR>;
}
