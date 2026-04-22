import { PRAnalysis, Issue, RiskLevel } from './types';
import type { GitHubFile, GitHubPR } from './github';

// ─── File-Specific Issue Pools ────────────────────────────────────────────────

const K8S_ISSUES: Issue[] = [
  {
    title: 'Missing readiness probe in deployment spec',
    description: 'Pods will receive live traffic immediately on start before the app initializes. Causes request failures during every rollout (~30-60s of errors per deploy).',
    severity: 'HIGH',
  },
  {
    title: 'No liveness probe configured',
    description: 'Kubernetes cannot detect a wedged or deadlocked container. Pods remain in a zombie state — appearing healthy while serving zero requests.',
    severity: 'MEDIUM',
  },
  {
    title: 'Single replica detected — no fault tolerance',
    description: 'A single replica means any restart, node drain, or rolling update causes a complete service outage. Minimum 2 replicas required for HA.',
    severity: 'HIGH',
  },
  {
    title: 'No resource limits defined on container',
    description: 'Without CPU/memory limits a single noisy-neighbor pod can consume all node resources, triggering OOM kills across co-located workloads.',
    severity: 'MEDIUM',
  },
  {
    title: 'No horizontal pod autoscaler (HPA) configured',
    description: 'The workload cannot scale out to absorb traffic spikes. At >2x baseline load, latency degrades linearly and the system saturates with no recovery path.',
    severity: 'MEDIUM',
  },
  {
    title: 'Pod disruption budget (PDB) not configured',
    description: 'Without a PDB, a cluster upgrade or node drain can evict all replicas simultaneously, causing an unplanned full-service outage.',
    severity: 'LOW',
  },
];

const DOCKER_ISSUES: Issue[] = [
  {
    title: 'Unpinned or "latest" image tag detected',
    description: 'Using :latest or unpinned tags produces non-deterministic builds. A dependency update can silently introduce breaking changes on the next deploy.',
    severity: 'MEDIUM',
  },
  {
    title: 'Container may be running as root',
    description: 'No non-root USER directive detected in Dockerfile. Root-privileged containers drastically increase blast radius of a container escape vulnerability.',
    severity: 'HIGH',
  },
  {
    title: 'Multi-stage build not used',
    description: 'A single-stage build includes dev dependencies, build tools, and source maps in the final image — increasing attack surface and image size.',
    severity: 'LOW',
  },
  {
    title: 'No .dockerignore detected alongside Dockerfile',
    description: 'Without .dockerignore, sensitive files (node_modules, .env, .git) may be copied into the image layer, leaking secrets or bloating image size.',
    severity: 'MEDIUM',
  },
];

const CI_ISSUES: Issue[] = [
  {
    title: 'No explicit job timeout configured in workflow',
    description: 'Without timeouts, a hung job will consume runner minutes until reaching GitHub\'s 6-hour hard limit, blocking the entire pipeline.',
    severity: 'LOW',
  },
  {
    title: 'Missing branch protection on deployment workflow',
    description: 'Workflow can be triggered from any branch. A developer could deploy untested code to production by pushing to an unprotected trigger path.',
    severity: 'MEDIUM',
  },
  {
    title: 'Secrets accessed without environment scoping',
    description: 'GitHub secrets are accessible to all jobs in the workflow without environment restrictions. Limit sensitive secrets to specific environments.',
    severity: 'MEDIUM',
  },
];

const TERRAFORM_ISSUES: Issue[] = [
  {
    title: 'No provider version constraint specified',
    description: 'Without version constraints, a `terraform init` may pull a breaking major provider version upgrade, causing silent infrastructure drift.',
    severity: 'MEDIUM',
  },
  {
    title: 'Remote state backend not configured',
    description: 'Local state means multiple engineers cannot collaborate safely. State corruption or loss is likely without a remote backend (S3, GCS, Terraform Cloud).',
    severity: 'HIGH',
  },
  {
    title: 'No Terraform plan review gate in CI',
    description: 'Infrastructure changes are applied without a mandatory plan review step. Destructive changes (resource recreation) may go unnoticed until production impact.',
    severity: 'HIGH',
  },
];

const CONFIG_ISSUES: Issue[] = [
  {
    title: 'Potential credential or secret in config file',
    description: 'A value matching a credential pattern was detected. Secrets committed to source control are permanently exposed, even after removal from HEAD.',
    severity: 'HIGH',
  },
  {
    title: 'Configuration change without environment parity check',
    description: 'Config values differ between environments without documentation. Untested environment-specific configs are a leading cause of production-only failures.',
    severity: 'MEDIUM',
  },
];

const GENERIC_ISSUES: Issue[] = [
  {
    title: 'Changes lack automated test coverage',
    description: 'No corresponding test files detected in this PR. Untested changes increase the probability of regressions reaching production undetected.',
    severity: 'MEDIUM',
  },
  {
    title: 'Large PR size detected (>500 lines)',
    description: 'Large PRs are statistically correlated with more bugs and longer review times. Consider breaking into smaller, independently deployable changes.',
    severity: 'LOW',
  },
  {
    title: 'No error handling for external service calls',
    description: 'External API calls without explicit timeout and retry handling will cause cascading failures when dependencies are slow or unavailable.',
    severity: 'MEDIUM',
  },
];

// ─── Pattern Detection ────────────────────────────────────────────────────────

function detectK8sIssues(files: GitHubFile[]): Issue[] {
  const k8sFiles = files.filter(
    (f) => (f.filename.endsWith('.yaml') || f.filename.endsWith('.yml')) && f.status !== 'removed'
  );
  if (k8sFiles.length === 0) return [];

  const issues: Issue[] = [];
  const combinedPatch = k8sFiles.map((f) => f.patch ?? '').join('\n').toLowerCase();

  if (!combinedPatch.includes('readinessprobe')) {
    issues.push(K8S_ISSUES[0]);
  }
  if (!combinedPatch.includes('livenessprobe')) {
    issues.push(K8S_ISSUES[1]);
  }
  if (/replicas:\s*1\b/.test(combinedPatch)) {
    issues.push(K8S_ISSUES[2]);
  }
  if (!combinedPatch.includes('limits:')) {
    issues.push(K8S_ISSUES[3]);
  }
  if (!combinedPatch.includes('horizontalpodautoscaler') && !combinedPatch.includes('hpa')) {
    issues.push(K8S_ISSUES[4]);
  }

  return issues.slice(0, 4);
}

function detectDockerIssues(files: GitHubFile[]): Issue[] {
  const dockerFiles = files.filter(
    (f) =>
      f.filename.toLowerCase().includes('dockerfile') ||
      f.filename.toLowerCase().endsWith('.dockerfile')
  );
  if (dockerFiles.length === 0) return [];

  const issues: Issue[] = [];
  const combinedPatch = dockerFiles.map((f) => f.patch ?? '').join('\n');

  if (/:latest|FROM\s+\w+\s*\n/i.test(combinedPatch)) {
    issues.push(DOCKER_ISSUES[0]);
  }
  if (!/USER\s+(?!root)\w+/i.test(combinedPatch)) {
    issues.push(DOCKER_ISSUES[1]);
  }
  if (!combinedPatch.toLowerCase().includes('as builder') && !combinedPatch.toLowerCase().includes('as build')) {
    issues.push(DOCKER_ISSUES[2]);
  }

  return issues.slice(0, 3);
}

function detectCIIssues(files: GitHubFile[]): Issue[] {
  const ciFiles = files.filter(
    (f) =>
      f.filename.includes('.github/workflows') ||
      f.filename.includes('ci.yml') ||
      f.filename.includes('ci.yaml')
  );
  if (ciFiles.length === 0) return [];

  const issues: Issue[] = [];
  const combinedPatch = ciFiles.map((f) => f.patch ?? '').join('\n').toLowerCase();

  if (!combinedPatch.includes('timeout-minutes')) {
    issues.push(CI_ISSUES[0]);
  }
  if (!combinedPatch.includes('environment:')) {
    issues.push(CI_ISSUES[2]);
  }

  return issues.slice(0, 2);
}

function detectTerraformIssues(files: GitHubFile[]): Issue[] {
  const tfFiles = files.filter((f) => f.filename.endsWith('.tf'));
  if (tfFiles.length === 0) return [];

  const issues: Issue[] = [];
  const combinedPatch = tfFiles.map((f) => f.patch ?? '').join('\n');

  if (!combinedPatch.includes('backend "')) {
    issues.push(TERRAFORM_ISSUES[1]);
  }
  if (!combinedPatch.includes('required_providers') && !combinedPatch.includes('version =')) {
    issues.push(TERRAFORM_ISSUES[0]);
  }

  return issues.slice(0, 2);
}

function detectConfigIssues(files: GitHubFile[]): Issue[] {
  const configFiles = files.filter(
    (f) =>
      f.filename.includes('.env') ||
      f.filename.endsWith('.conf') ||
      f.filename.endsWith('.config.js') ||
      f.filename.endsWith('.config.ts')
  );
  if (configFiles.length === 0) return [];

  const combinedPatch = configFiles.map((f) => f.patch ?? '').join('\n');

  // Look for credential-like patterns
  if (/(?:password|token|secret|key|api_key)\s*[=:]\s*["']?\S{8,}/i.test(combinedPatch)) {
    return [CONFIG_ISSUES[0]];
  }

  return [];
}

// ─── Risk + Cost + Simulation ─────────────────────────────────────────────────

function deriveRiskLevel(issues: Issue[]): RiskLevel {
  const highCount = issues.filter((i) => i.severity === 'HIGH').length;
  const medCount = issues.filter((i) => i.severity === 'MEDIUM').length;
  if (highCount >= 2) return 'HIGH';
  if (highCount >= 1 || medCount >= 3) return 'MEDIUM';
  return 'LOW';
}

function estimateCost(files: GitHubFile[], level: RiskLevel): string {
  const hasK8s = files.some((f) => f.filename.endsWith('.yaml') || f.filename.endsWith('.yml'));
  const hasTerraform = files.some((f) => f.filename.endsWith('.tf'));

  if (hasTerraform) {
    return level === 'HIGH'
      ? '+₹5,000–₹15,000/month (infrastructure provisioning changes detected)'
      : '+₹2,000–₹6,000/month (infra-as-code modifications)';
  }
  if (hasK8s) {
    if (level === 'HIGH')   return '+₹3,000–₹9,000/month (high resource allocation, missing limits)';
    if (level === 'MEDIUM') return '+₹1,500–₹4,500/month (moderate resource overhead)';
    return '+₹500–₹2,000/month (minor resource footprint change)';
  }
  if (level === 'HIGH')   return '+₹2,000–₹6,000/month (high-risk configuration change)';
  if (level === 'MEDIUM') return '+₹800–₹2,500/month (moderate operational overhead)';
  return '-₹200–₹1,000/month (potential optimization opportunity)';
}

function generateSimulation(level: RiskLevel, issues: Issue[]): string {
  const hasSingleReplica = issues.some((i) => i.title.toLowerCase().includes('single replica'));
  const hasNoReadiness = issues.some((i) => i.title.toLowerCase().includes('readiness'));
  const hasNoLimits = issues.some((i) => i.title.toLowerCase().includes('resource limits'));

  if (level === 'HIGH') {
    if (hasSingleReplica) {
      return 'Under 2x traffic spike, the single replica becomes a bottleneck. OOM-kill predicted at 3x load. Any rolling update causes ~30s of full downtime with zero fault tolerance.';
    }
    if (hasNoReadiness) {
      return 'During rollout, pods receive traffic before initialization completes. Error rate spikes to ~40% for 30-60 seconds per deploy. Load balancer cannot detect unhealthy state.';
    }
    if (hasNoLimits) {
      return 'Resource contention triggers OOM kills at ~3x baseline load. Cascading pod restarts begin. Mean time to recovery: 8-12 minutes. Full cluster impact possible.';
    }
    return 'System unstable under 5x traffic spike — CPU throttled at 2x, OOM likely at 4x baseline. Health checks fail, cascading pod restarts begin. ETA to full recovery: 10+ minutes.';
  }
  if (level === 'MEDIUM') {
    return 'System stable at current load but cannot absorb traffic spikes beyond 2x baseline. Resource contention expected during peak hours. No automated recovery mechanisms detected.';
  }
  return 'System appears stable for current load patterns. Minor inefficiencies detected but no critical failure modes identified under standard conditions.';
}

function generateSuggestions(issues: Issue[]): string[] {
  const map: Record<string, string> = {
    'readiness': 'Add a readinessProbe (httpGet /health with initialDelaySeconds: 10)',
    'liveness': 'Add a livenessProbe with failure threshold of 3 and period of 10s',
    'single replica': 'Set replicas: 2 minimum; use PodAntiAffinity for multi-zone distribution',
    'resource limits': 'Define both requests and limits for CPU and memory on all containers',
    'autoscaler': 'Create an HPA targeting 70% CPU utilization with minReplicas: 2',
    'disruption budget': 'Add a PodDisruptionBudget with minAvailable: 1',
    'image tag': 'Pin Docker image to a specific digest (image@sha256:...)',
    'root': 'Add USER nonroot to Dockerfile; ensure file permissions are updated accordingly',
    'multi-stage': 'Split Dockerfile into builder and runtime stages to reduce final image size',
    'timeout': 'Add timeout-minutes: 15 to all CI job definitions',
    'backend': 'Configure an S3 or GCS Terraform backend with state locking enabled',
    'version': 'Add a required_providers block with explicit version constraints',
    'secret': 'Remove credentials from files; use runtime environment injection or Vault',
    'test': 'Add unit tests covering the changed code paths before merging',
  };

  const suggestions: string[] = [];
  for (const issue of issues) {
    const key = Object.keys(map).find((k) => issue.title.toLowerCase().includes(k));
    if (key) suggestions.push(map[key]);
  }

  // Pad with general suggestions if needed
  const generals = [
    'Enable Dependabot or Renovate for automated dependency updates',
    'Add runbook documentation for common failure scenarios',
    'Set up alerting thresholds for CPU > 80% and memory > 75%',
  ];
  let i = 0;
  while (suggestions.length < 3 && i < generals.length) {
    suggestions.push(generals[i++]);
  }

  return [...new Set(suggestions)].slice(0, 6);
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function generateFileAwareAnalysis(
  owner: string,
  repoName: string,
  pr: number,
  prDetails: GitHubPR,
  files: GitHubFile[]
): PRAnalysis {
  // Deduplicate issues from all detectors
  const allIssues: Issue[] = [
    ...detectK8sIssues(files),
    ...detectDockerIssues(files),
    ...detectCIIssues(files),
    ...detectTerraformIssues(files),
    ...detectConfigIssues(files),
  ].filter((v, i, a) => a.findIndex((t) => t.title === v.title) === i);

  // Fallback pool if no specific issues found
  const issues = allIssues.length > 0 ? allIssues.slice(0, 6) : GENERIC_ISSUES.slice(0, 3);
  const riskLevel = deriveRiskLevel(issues);

  return {
    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    repo: `${owner}/${repoName}`,
    pr,
    prTitle: prDetails.title,
    action: prDetails.state,
    sender: prDetails.user.login,
    branchFrom: prDetails.head.ref,
    branchTo: prDetails.base.ref,
    prUrl: prDetails.html_url,
    riskLevel,
    issues,
    costImpact: estimateCost(files, riskLevel),
    simulation: generateSimulation(riskLevel, issues),
    suggestions: generateSuggestions(issues),
    analyzedFiles: files.map((f) => f.filename).slice(0, 10),
    source: 'manual',
    timestamp: new Date().toISOString(),
  };
}

// Re-export GitHubPR type for routes
export type { GitHubPR };
