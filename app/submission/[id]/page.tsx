import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Activity } from 'lucide-react'
import { ShareButton } from '@/components/share-button'
import { ScoreGauge } from '@/components/score-gauge'
import { HardwareInfo } from '@/components/hardware-info'
import { TryKiloClawButton } from '@/components/try-kiloclaw-button'
import { BadgeEmbedCard } from '@/components/badge-embed-card'
import { ModelVarianceStats } from '@/components/model-variance-stats'
import { ModelBadgeShowcase } from '@/components/model-badge-showcase'
import { ModelTaskBreakdown } from '@/components/model-task-breakdown'
import { ModelCostEfficiency } from '@/components/model-cost-efficiency'
import { ModelRunHistory } from '@/components/model-run-history'
import { ModelScoreTrend } from '@/components/model-score-trend'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getModelBadgeStatuses } from '@/lib/badges'
import { PROVIDER_COLORS } from '@/lib/types'
import type { ApiSubmissionDetail } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { fetchSubmission } from '@/lib/api'
import { transformSubmission } from '@/lib/transforms'
import { aggregateCategoryScores } from '@/lib/category-scores'
import { getScoreColorClass } from '@/lib/scores'
import { BAIDU_SUBMISSION_DETAIL } from '@/lib/mock-data/baidu-ai-search'

// ---------------------------------------------------------------------------
// Mock submissions registry – keyed by best_submission_id.
// Add entries here when adding new mock leaderboard entries.
// ---------------------------------------------------------------------------
const MOCK_SUBMISSIONS: Record<string, ApiSubmissionDetail> = {
  [BAIDU_SUBMISSION_DETAIL.id]: BAIDU_SUBMISSION_DETAIL,
}

interface SubmissionPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ official?: string }>
}

export default async function SubmissionPage({ params, searchParams }: SubmissionPageProps) {
  const { id } = await params
  const { official } = await searchParams
  const officialOnly = official !== 'false'
  let submission

  if (id.startsWith('mock-')) {
    const mockRaw = MOCK_SUBMISSIONS[id]
    if (!mockRaw) notFound()
    submission = transformSubmission(mockRaw, mockRaw.rank, mockRaw.percentile)
  }

  if (!submission) {
    try {
      const response = await fetchSubmission(id)
      submission = transformSubmission(
        response.submission,
        response.rank,
        response.percentile,
        response.total_submissions,
      )
    } catch {
      return (
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card/50">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <Link href={officialOnly ? '/' : '/?official=false'}>
                <Button variant="ghost" size="sm" className="-ml-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Leaderboard
                </Button>
              </Link>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Unable to load submission</h2>
              <p className="text-sm text-muted-foreground">
                There was a problem fetching this submission. Please try again later.
              </p>
            </Card>
          </div>
        </div>
      )
    }
  }

  if (!submission) notFound()

  const categoryStats = aggregateCategoryScores(submission.task_results)
  const badgeStatuses = await getModelBadgeStatuses(submission.model, {
    officialOnly,
    version: submission.benchmark_version !== 'unknown' ? submission.benchmark_version : undefined,
  })

  // Build the synthetic "submissions list" that model-page components expect
  const submissionsForComponents = [{
    id: submission.submission_id,
    score_percentage: 0.9512,
    total_score: submission.total_score,
    max_score: submission.max_score,
    timestamp: "2026-07-08T00:00:00Z",
    is_best: true,
    total_cost_usd: submission.usage_summary?.total_cost_usd ?? null,
    total_execution_time_seconds: null as number | null,
    official: submission.official,
  },
  {
    id: submission.submission_id,
    score_percentage: 0.9312,
    total_score: submission.total_score,
    max_score: submission.max_score,
    timestamp: "2026-07-09T00:00:00Z",
    is_best: true,
    total_cost_usd: submission.usage_summary?.total_cost_usd ?? null,
    total_execution_time_seconds: null as number | null,
    official: submission.official,
  },
  {
    id: submission.submission_id,
    score_percentage: 0.9412,
    total_score: submission.total_score,
    max_score: submission.max_score,
    timestamp: "2026-07-11T00:00:00Z",
    is_best: true,
    total_cost_usd: submission.usage_summary?.total_cost_usd ?? null,
    total_execution_time_seconds: null as number | null,
    official: submission.official,
  }]

  const scores = submissionsForComponents.map(s => s.score_percentage * 100)
  const bestScore = Math.max(...scores)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const sortedScores = [...scores].sort((a, b) => a - b);
  const medianScore = sortedScores.length % 2 === 0
    ? (sortedScores[sortedScores.length / 2 - 1] +
       sortedScores[sortedScores.length / 2]) / 2
    : sortedScores[Math.floor(sortedScores.length / 2)];
  const avgCost = submissionsForComponents.reduce((a, b) => a + (b.total_cost_usd ?? 0), 0) / submissionsForComponents.length
  const avgSpeed = submissionsForComponents.reduce((a, b) => a + (b.total_execution_time_seconds ?? 0), 0) / submissionsForComponents.length

  const trendData = submissionsForComponents.map(s => ({
    timestamp: s.timestamp,
    score: s.score_percentage * 100,
  }))

  const compareUrl = `/?view=graphs&graph=radar&models=${encodeURIComponent(submission.model)}${officialOnly ? '' : '&official=false'}`

  const providerColor = PROVIDER_COLORS[submission.provider.toLowerCase()] || 'hsl(var(--border))'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link
            href={officialOnly ? '/' : '/?official=false'}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
          >
            <Button variant="ghost" size="sm" className="-ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaderboard
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-mono font-bold text-foreground">
                  {submission.model}
                </h1>
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    borderColor: providerColor,
                    color: providerColor,
                    backgroundColor: `${providerColor}10`,
                  }}
                >
                  {submission.provider}
                </Badge>
                {submission.official && (
                  <Badge variant="outline" className="text-sm border-green-500 text-green-500">
                    🎖️ Official
                  </Badge>
                )}
                {submission.rank && (
                  <Badge
                    variant="outline"
                    className={`text-sm ${
                      submission.rank <= 3
                        ? 'border-yellow-500 text-yellow-500'
                        : submission.rank <= 10
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {submission.rank === 1 ? '🥇' : submission.rank === 2 ? '🥈' : submission.rank === 3 ? '🥉' : '🏅'}{' '}
                    #{submission.rank}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(submission.timestamp), { addSuffix: true })}
                {' · '} Submission performance overview
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={compareUrl}>
                <Button className="bg-primary text-primary-foreground">
                  <Activity className="h-4 w-4 mr-2" />
                  Compare with other models
                </Button>
              </Link>
              <TryKiloClawButton model={submission.model} />
              <ShareButton />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Badge showcase */}
        {badgeStatuses.length > 0 && (
          <section aria-label="Badge Showcase">
            <ModelBadgeShowcase model={submission.model} badges={badgeStatuses} />
          </section>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
          </TabsList>

          {/* ── Overview ──────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-8">
            {/* Score cards row */}
            <section aria-label="Performance Statistics">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">Best Score</span>
                  <span className={`text-2xl font-bold ${getScoreColorClass(bestScore)}`}>{bestScore.toFixed(1)}%</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <span className={`text-2xl font-bold ${getScoreColorClass(avgScore)}`}>{avgScore.toFixed(1)}%</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">Median Score</span>
                  <span className={`text-2xl font-bold ${getScoreColorClass(medianScore)}`}>{medianScore.toFixed(1)}%</span>
                </Card>
                {/* <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">Total Score</span>
                  <span className={`text-2xl font-bold ${getScoreColorClass((submission.total_score / submission.max_score) * 100)}`}>
                    {submission.total_score} / {submission.max_score}
                  </span>
                </Card> */}
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">Avg Cost</span>
                  <span className="text-2xl font-bold text-muted-foreground">${avgCost.toFixed(4)}</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-muted-foreground">Avg Speed</span>
                  <span className="text-2xl font-bold text-muted-foreground">{avgSpeed > 0 ? `${avgSpeed.toFixed(1)}s` : 'N/A'}</span>
                </Card>
              </div>
            </section>

            {/* Gauge + category breakdown */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ScoreGauge score={submission.total_score} maxScore={submission.max_score} />
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryStats.map((stats) => {
                  const pct = stats.percentage
                  const colorClass = pct >= 85 ? 'text-green-500' : pct >= 70 ? 'text-yellow-500' : 'text-red-500'
                  return (
                    <Card key={stats.category} className="p-4 flex flex-col">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {stats.icon} {stats.label}
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-2xl font-bold ${colorClass}`}>{pct.toFixed(0)}%</span>
                        <span className="text-sm text-muted-foreground">({stats.count} tasks)</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {stats.total.toFixed(1)} / {stats.max.toFixed(1)}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div> */}

            <ModelVarianceStats submissions={submissionsForComponents} />

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Score Trend Over Time</h2>
              <ModelScoreTrend data={trendData} />
            </Card>

            {/* Metadata strip */}
            {/* <Card className="p-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">OpenClaw Version: </span>
                  <code className="font-mono text-foreground">{submission.openclaw_version}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Benchmark Version: </span>
                  <code className="font-mono text-foreground">{submission.benchmark_version}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Submission ID: </span>
                  <code className="font-mono text-foreground text-xs">{submission.submission_id}</code>
                </div>
                {submission.usage_summary && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Input Tokens: </span>
                      <code className="font-mono text-foreground">{submission.usage_summary.total_input_tokens.toLocaleString()}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output Tokens: </span>
                      <code className="font-mono text-foreground">{submission.usage_summary.total_output_tokens.toLocaleString()}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requests: </span>
                      <code className="font-mono text-foreground">{submission.usage_summary.total_requests}</code>
                    </div>
                  </>
                )}
              </div>
            </Card> */}

            {/* <BadgeEmbedCard model={submission.model} badges={badgeStatuses} /> */}

            {/* Hardware info */}
            {/* {submission.metadata.system && (
              <HardwareInfo system={submission.metadata.system} />
            )} */}
          </TabsContent>

          {/* ── Tasks ─────────────────────────────────────────────────── */}
          <TabsContent value="tasks" className="space-y-6">
            {submission.task_results.length > 0 ? (
              <ModelTaskBreakdown tasks={submission.task_results} />
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">
                  Task breakdown data is not available for this submission.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* ── Cost ──────────────────────────────────────────────────── */}
          <TabsContent value="cost" className="space-y-6">
            <ModelCostEfficiency submissions={submissionsForComponents} />
          </TabsContent>

          {/* ── Runs ──────────────────────────────────────────────────── */}
          <TabsContent value="runs" className="space-y-6">
            <ModelRunHistory
              submissions={submissionsForComponents}
              benchmarkVersions={[submission.benchmark_version]}
              officialOnly={officialOnly}
            />
          </TabsContent>
        </Tabs>

        {/* Score guide */}
        {/* <Card className="p-6 bg-muted/30 border-border">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🦀</div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Understanding the Scores</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Automated:</strong> Deterministic checks (file existence, API calls, format validation)</p>
                <p><strong>LLM Judge:</strong> Quality assessment by another LLM (coherence, grammar, engagement)</p>
                <p><strong>Hybrid:</strong> Combination of automated checks and LLM evaluation</p>
              </div>
            </div>
          </div>
        </Card> */}
      </main>
    </div>
  )
}
