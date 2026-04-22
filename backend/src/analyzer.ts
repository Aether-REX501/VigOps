import { PRAnalysis, RiskLevel, Issue } from './types';

// ─── Issue Pool with Descriptions ─────────────────────────────────────────────

const ISSUE_POOL: Issue[] = [
  {
    title: 'Missing readiness probe in deployment spec',
    description: 'Pods will receive live traffic immediately on start, before the application is fully initialized. This causes request failures during every rollout.',
    severity: 'HIGH',
  },
  {
    title: 'High CPU allocation detected (>80% threshold)',
    description: 'CPU requests exceed 80% of the node limit. Under any spike, the pod will be throttled, degrading response times significantly.',
    severity: 'HIGH',
  },
  {
    title: 'Single point of failure — no replica redundancy',
    description: 'A single replica means any restart, node failure, or rolling update causes a full service outage with no failover path.',
    severity: 'HIGH',
  },
  {
    title: 'Hardcoded secrets detected in environment variables',
    description: 'Credentials embedded in config files are exposed in source control and container image layers. Migrate to a secrets manager.',
    severity: 'HIGH',
  },
  {
    title: 'No liveness probe configured',
    description: 'Kubernetes cannot detect a deadlocked or crashed container. Pods will remain in a zombie state, appearing healthy while serving no requests.',
    severity: 'MEDIUM',
  },
  {
    title: 'Image tag uses "latest" — non-deterministic deploys',
    description: 'Latest tags make builds non-reproducible. A dependency update can silently introduce breaking changes on the next deployment.',
    severity: 'MEDIUM',
  },
  {
    title: 'No resource limits set on container',
    description: 'Without limits, a single pod can consume all node CPU and memory, causing cascading failures across co-located workloads.',
    severity: 'MEDIUM',
  },
  {
    title: 'Missing network policy for pod isolation',
    description: 'All pods in the namespace can communicate freely. A compromised pod has unrestricted lateral movement across workloads.',
    severity: 'MEDIUM',
  },
  {
    title: 'No horizontal pod autoscaler (HPA) configured',
    description: 'Traffic spikes cannot be absorbed by scaling out. At >2x baseline load, latency will degrade linearly until the system saturates.',
    severity: 'MEDIUM',
  },
  {
    title: 'Dockerfile runs as root user',
    description: 'Root-privileged containers dramatically increase blast radius of a container escape. Add a non-root USER directive to the Dockerfile.',
    severity: 'MEDIUM',
  },
  {
    title: 'Health check endpoint not defined',
    description: 'Without /health or /ready endpoints, load balancers cannot exclude unhealthy instances from the rotation during incidents.',
    severity: 'LOW',
  },
  {
    title: 'Service exposed without ingress validation',
    description: 'No ingress rules or annotations detected. The service may be reachable without authentication or rate limiting from the internet.',
    severity: 'LOW',
  },
  {
    title: 'Pod disruption budget (PDB) not configured',
    description: 'Without a PDB, cluster maintenance events may evict all replicas simultaneously, causing unexpected full-service downtime.',
    severity: 'LOW',
  },
];

const SUGGESTION_POOL: string[] = [
  'Enable horizontal pod autoscaling (HPA) with CPU/memory targets at 70% threshold',
  'Add minimum 2 replicas for high availability and zero-downtime rollouts',
  'Pin Docker image to a specific digest or versioned semver tag',
  'Rotate secrets and migrate to a secrets manager (HashiCorp Vault or AWS SSM)',
  'Add readiness and liveness probes to all containers',
  'Define explicit CPU and memory resource requests and limits',
  'Run containers as a non-root user — add USER directive to Dockerfile',
  'Configure network policies to restrict pod-to-pod communication',
  'Add a /health or /ready endpoint for load balancer health checks',
  'Set up pod disruption budgets (PDB) to protect against maintenance evictions',
  'Use blue/green or canary deployment strategy to reduce rollout risk',
  'Add horizontal scaling rules with proper cooldown and stabilization windows',
];

const SIMULATION_POOL: string[] = [
  'System unstable under 5x traffic spike — latency exceeds 2000ms, CPU throttled at 2x',
  'Memory pressure detected — OOM likely at 3x baseline load. Pod restart loop begins.',
  'Single replica creates full outage during rolling update (~30s downtime per deploy)',
  'Pod crash-loop predicted within 15 minutes under sustained stress',
  'Network saturation at 80% capacity — request queue grows unbounded under peak load',
  'Database connection pool exhausted at 4x request rate — cascading 503 errors',
  'Readiness check failures cause traffic to be dropped by load balancer for 45-60s per rollout',
  'Health checks fail after pod restart — 2-3 minutes before system self-heals',
];

const COST_POOL: string[] = [
  '+₹800–₹2,000/month (minor resource overhead)',
  '+₹1,500–₹4,000/month (moderate scaling costs)',
  '+₹3,000–₹8,000/month (significant infra expansion needed)',
  '-₹500–₹1,500/month (optimization opportunity detected)',
  '+₹5,000–₹12,000/month (high-risk unoptimized resource allocation)',
  '+₹200–₹800/month (negligible impact)',
  '+₹2,000–₹6,000/month (HA redundancy overhead)',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function getOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deriveRiskLevel(action: string, branchFrom: string, issueCount: number): RiskLevel {
  const hotKeywords = ['hotfix', 'infra', 'deploy', 'config', 'k8s', 'prod', 'release'];
  const isDanger = hotKeywords.some((k) => branchFrom.toLowerCase().includes(k));
  if (action === 'closed') return 'LOW';
  if (isDanger || issueCount >= 5) return 'HIGH';
  if (issueCount >= 3) return 'MEDIUM';
  return 'LOW';
}

// ─── Webhook Analysis (randomized) ───────────────────────────────────────────

export function generateAnalysis(
  repo: string,
  pr: number,
  prTitle: string,
  action: string,
  sender: string,
  branchFrom: string,
  branchTo: string,
  prUrl: string
): PRAnalysis {
  const issueCount = Math.floor(Math.random() * 4) + 2;
  const issues = pickRandom(ISSUE_POOL, issueCount);
  const suggestions = pickRandom(SUGGESTION_POOL, issueCount);
  const riskLevel = deriveRiskLevel(action, branchFrom, issueCount);

  return {
    id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    repo,
    pr,
    prTitle,
    action,
    sender,
    branchFrom,
    branchTo,
    prUrl,
    riskLevel,
    issues,
    costImpact: getOne(COST_POOL),
    simulation: getOne(SIMULATION_POOL),
    suggestions,
    analyzedFiles: [],
    source: 'webhook',
    timestamp: new Date().toISOString(),
  };
}
