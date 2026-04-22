import { Request, Response, Router } from 'express';
import { generateAnalysis } from './analyzer';
import { storeAnalysis, getLatestAnalysis, getAllAnalyses } from './store';
import { fetchPRFiles, fetchPRDetails } from './github';
import { generateFileAwareAnalysis } from './fileAnalyzer';

const router = Router();

// ─── POST /webhook ─────────────────────────────────────────────────────────────

router.post('/webhook', (req: Request, res: Response) => {
  const githubEvent = req.headers['x-github-event'] as string | undefined;
  const body = req.body;

  console.log(`[Webhook] Received event: "${githubEvent ?? 'unknown'}"`);

  if (githubEvent === 'ping') {
    console.log('[Webhook] GitHub ping received ✅');
    return res.status(200).json({ message: 'pong' });
  }

  if (githubEvent !== 'pull_request') {
    return res.status(200).json({ message: `Event "${githubEvent}" ignored` });
  }

  if (!body?.action || !body?.pull_request || !body?.repository) {
    return res.status(400).json({ error: 'Invalid GitHub PR payload structure' });
  }

  const pr = body.pull_request;
  const repo = body.repository;

  const analysis = generateAnalysis(
    repo.name,
    pr.number,
    pr.title ?? 'Untitled PR',
    body.action,
    body.sender?.login ?? 'unknown',
    pr.head?.ref ?? 'feature-branch',
    pr.base?.ref ?? 'main',
    pr.html_url ?? ''
  );

  storeAnalysis(analysis);
  console.log(`[Webhook] PR #${analysis.pr} → Risk: ${analysis.riskLevel}`);
  return res.status(200).json({ message: 'Analysis complete', analysis });
});

// ─── GET /analyze?repo=owner/repo&pr=number ────────────────────────────────────

router.get('/analyze', async (req: Request, res: Response) => {
  const { repo, pr: prStr } = req.query;

  if (!repo || typeof repo !== 'string') {
    return res.status(400).json({ error: 'repo query param required (format: owner/repo)' });
  }
  if (!prStr || typeof prStr !== 'string') {
    return res.status(400).json({ error: 'pr query param required (format: number)' });
  }

  const parts = repo.trim().split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return res.status(400).json({ error: 'repo must be in "owner/repo" format' });
  }

  const [owner, repoName] = parts;
  const pr = parseInt(prStr, 10);
  if (isNaN(pr) || pr < 1) {
    return res.status(400).json({ error: 'pr must be a positive integer' });
  }

  try {
    console.log(`[Analyze] Fetching PR #${pr} from ${owner}/${repoName}…`);

    const [files, prDetails] = await Promise.all([
      fetchPRFiles(owner, repoName, pr),
      fetchPRDetails(owner, repoName, pr),
    ]);

    console.log(`[Analyze] Fetched ${files.length} files from PR #${pr}`);

    const analysis = generateFileAwareAnalysis(owner, repoName, pr, prDetails, files);
    storeAnalysis(analysis);

    console.log(
      `[Analyze] ✅ ${owner}/${repoName}#${pr} → Risk: ${analysis.riskLevel} | Issues: ${analysis.issues.length}`
    );

    return res.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Analyze] ❌ ${message}`);

    if (message.startsWith('404')) {
      return res.status(404).json({ error: 'PR or repository not found. Ensure the repo is public and the PR number is correct.' });
    }
    if (message.startsWith('429') || message.includes('rate limit')) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded. Add GITHUB_TOKEN to backend/.env file.' });
    }
    return res.status(500).json({ error: `GitHub API error: ${message}` });
  }
});

// ─── GET /analysis ─────────────────────────────────────────────────────────────

router.get('/analysis', (_req: Request, res: Response) => {
  const latest = getLatestAnalysis();
  const all = getAllAnalyses();
  return res.json({ latest, total: all.length, history: all });
});

// ─── GET /health ──────────────────────────────────────────────────────────────

router.get('/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'VigOps Intelligence Backend',
    version: '3.0.0',
    githubTokenSet: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token_here'),
    timestamp: new Date().toISOString(),
  });
});

export default router;
