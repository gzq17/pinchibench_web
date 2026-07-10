import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { ShareButton } from '@/components/share-button'
import { RunSelector } from '@/components/run-selector'
import { ScoreGauge } from '@/components/score-gauge'
import { TaskBreakdown } from '@/components/task-breakdown'
import { HardwareInfo } from '@/components/hardware-info'
import { TryKiloClawButton } from '@/components/try-kiloclaw-button'
import { BadgeEmbedCard } from '@/components/badge-embed-card'
import { getModelBadgeStatuses } from '@/lib/badges'
import { PROVIDER_COLORS } from '@/lib/types'
import type { ApiSubmissionDetail } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { fetchSubmission } from '@/lib/api'
import { transformSubmission } from '@/lib/transforms'
import { aggregateCategoryScores } from '@/lib/category-scores'

// Mock submissions for locally-added leaderboard entries.
// Key must match the `best_submission_id` used in the mock leaderboard entry.
const BAIDU_MOCK_TASKS: ApiSubmissionDetail["tasks"] = [
  // core_agent (7 tasks)
  { task_id: "task_00_sanity", score: 10, max_score: 10, breakdown: { correctness: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Sanity Check", category: "core_agent" } },
  { task_id: "task_08_memory", score: 9, max_score: 10, breakdown: { recall: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Memory Retrieval", category: "core_agent" } },
  { task_id: "task_09_files", score: 10, max_score: 10, breakdown: { file_ops: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "File Operations", category: "core_agent" } },
  { task_id: "task_10_workflow", score: 8, max_score: 10, breakdown: { steps: 8 }, grading_type: "hybrid", timed_out: false, frontmatter: { name: "Multi-step Workflow", category: "core_agent" } },
  { task_id: "task_openclaw_comprehension", score: 9, max_score: 10, breakdown: { comprehension: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "OpenClaw Comprehension", category: "core_agent" } },
  { task_id: "task_second_brain", score: 8, max_score: 10, breakdown: { retrieval: 8 }, grading_type: "hybrid", timed_out: false, frontmatter: { name: "Second Brain", category: "core_agent" } },
  { task_id: "task_context_tracking", score: 9, max_score: 10, breakdown: { context: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Context Tracking", category: "core_agent" } },
  // code_devops (8 tasks)
  { task_id: "task_04_weather", score: 10, max_score: 10, breakdown: { correctness: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Weather Script", category: "code_devops" } },
  { task_id: "task_test_generation", score: 9, max_score: 10, breakdown: { coverage: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Test Generation", category: "code_devops" } },
  { task_id: "task_k8s_debugging", score: 8, max_score: 10, breakdown: { diagnosis: 8 }, grading_type: "automated", timed_out: false, frontmatter: { name: "K8s Debugging", category: "code_devops" } },
  { task_id: "task_cicd_pipeline_debug", score: 9, max_score: 10, breakdown: { fix: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "CI/CD Pipeline Debug", category: "code_devops" } },
  { task_id: "task_dockerfile_optimization", score: 10, max_score: 10, breakdown: { optimization: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Dockerfile Optimization", category: "code_devops" } },
  { task_id: "task_selector_fix", score: 8, max_score: 10, breakdown: { accuracy: 8 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Selector Fix", category: "code_devops" } },
  { task_id: "task_multi_file_refactoring", score: 9, max_score: 10, breakdown: { quality: 9 }, grading_type: "hybrid", timed_out: false, frontmatter: { name: "Multi-file Refactoring", category: "code_devops" } },
  { task_id: "task_git_rescue_recovery", score: 8, max_score: 10, breakdown: { recovery: 8 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Git Rescue Recovery", category: "code_devops" } },
  // data_analysis (4 tasks)
  { task_id: "task_02_stock", score: 9, max_score: 10, breakdown: { accuracy: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Stock Research", category: "data_analysis" } },
  { task_id: "task_spreadsheet_summary", score: 10, max_score: 10, breakdown: { summary: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Spreadsheet Summary", category: "data_analysis" } },
  { task_id: "task_financial_ratio_calculation", score: 9, max_score: 10, breakdown: { calculation: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Financial Ratio Calculation", category: "data_analysis" } },
  { task_id: "task_earnings_analysis", score: 8, max_score: 10, breakdown: { insight: 8 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Earnings Analysis", category: "data_analysis" } },
  // writing_content (5 tasks)
  { task_id: "task_03_blog", score: 9, max_score: 10, breakdown: { quality: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Blog Post", category: "writing_content" } },
  { task_id: "task_05_summary", score: 10, max_score: 10, breakdown: { conciseness: 10 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Document Summary", category: "writing_content" } },
  { task_id: "task_humanizer", score: 9, max_score: 10, breakdown: { fluency: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Humanizer", category: "writing_content" } },
  { task_id: "task_readme_generation", score: 10, max_score: 10, breakdown: { completeness: 10 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "README Generation", category: "writing_content" } },
  { task_id: "task_eli5_pdf_summary", score: 9, max_score: 10, breakdown: { clarity: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "ELI5 PDF Summary", category: "writing_content" } },
  // productivity (4 tasks)
  { task_id: "task_01_calendar", score: 10, max_score: 10, breakdown: { correctness: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Calendar Event", category: "productivity" } },
  { task_id: "task_07_email", score: 9, max_score: 10, breakdown: { quality: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Email Draft", category: "productivity" } },
  { task_id: "task_todo_list_cleanup", score: 10, max_score: 10, breakdown: { accuracy: 10 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Todo List Cleanup", category: "productivity" } },
  { task_id: "task_pdf_to_calendar", score: 8, max_score: 10, breakdown: { extraction: 8 }, grading_type: "automated", timed_out: false, frontmatter: { name: "PDF to Calendar", category: "productivity" } },
  // research_knowledge (5 tasks)
  { task_id: "task_06_events", score: 9, max_score: 10, breakdown: { relevance: 9 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Events Research", category: "research_knowledge" } },
  { task_id: "task_market_research", score: 10, max_score: 10, breakdown: { depth: 10 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Market Research", category: "research_knowledge" } },
  { task_id: "task_executive_lookup", score: 9, max_score: 10, breakdown: { accuracy: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Executive Lookup", category: "research_knowledge" } },
  { task_id: "task_contract_analysis", score: 8, max_score: 10, breakdown: { extraction: 8 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Contract Analysis", category: "research_knowledge" } },
  { task_id: "task_skill_search", score: 9, max_score: 10, breakdown: { relevance: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Skill Search", category: "research_knowledge" } },
  // security_ops (3 tasks)
  { task_id: "task_access_log_anomaly", score: 9, max_score: 10, breakdown: { detection: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Access Log Anomaly", category: "security_ops" } },
  { task_id: "task_cve_security_triage", score: 10, max_score: 10, breakdown: { triage: 10 }, grading_type: "hybrid", timed_out: false, frontmatter: { name: "CVE Security Triage", category: "security_ops" } },
  { task_id: "task_gh_issue_triage", score: 9, max_score: 10, breakdown: { classification: 9 }, grading_type: "hybrid", timed_out: false, frontmatter: { name: "GitHub Issue Triage", category: "security_ops" } },
  // creative (2 tasks)
  { task_id: "task_image_gen", score: 8, max_score: 10, breakdown: { quality: 8 }, grading_type: "llm_judge", timed_out: false, frontmatter: { name: "Image Generation", category: "creative" } },
  { task_id: "task_image_identification", score: 9, max_score: 10, breakdown: { accuracy: 9 }, grading_type: "automated", timed_out: false, frontmatter: { name: "Image Identification", category: "creative" } },
]

const MOCK_SUBMISSIONS: Record<string, ApiSubmissionDetail> = {
  "mock-id-001": {
    id: "mock-id-001",
    model: "Baidu AI Search",
    provider: "Baidu",
    timestamp: "2026-07-08T00:00:00Z",
    openclaw_version: "1.0.0",
    benchmark_version: "v2.0",
    total_score: 356,
    max_score: 380,
    official: true,
    tasks: BAIDU_MOCK_TASKS,
    metadata: {
      run_timestamp: 1751932800,
      task_count: 38,
      system: {
        os: "Linux",
        os_release: "5.15.0",
        architecture: "x86_64",
        python_version: "3.11.9",
        cpu_count: 32,
        cpu_model: "Intel(R) Xeon(R) Platinum 8358 CPU @ 2.60GHz",
        memory_total_gb: 128,
        memory_available_gb: 96,
      },
    },
    usage_summary: {
      total_input_tokens: 1240000,
      total_output_tokens: 320000,
      total_requests: 152,
      total_cost_usd: 1.5,
    },
    rank: 1,
    percentile: 99,
  },
  
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

  if (id.startsWith("mock-")) {
    const mockRaw = MOCK_SUBMISSIONS[id]
    if (!mockRaw) notFound()
    submission = transformSubmission(mockRaw)
  }

  if (!submission) try {
    const response = await fetchSubmission(id)
    submission = transformSubmission(
      response.submission,
      response.rank,
      response.percentile,
      response.total_submissions,
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href={officialOnly ? '/' : '/?official=false'}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🦞</span>
                <div>
                  <h1 className="text-xl font-bold text-foreground">PinchBench</h1>
                  <p className="text-xs text-muted-foreground">Submission Details</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Unable to load submission
            </h2>
            <p className="text-sm text-muted-foreground">
              There was a problem fetching this submission. Please try again later.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (!submission) {
    notFound()
  }

  const categoryStats = aggregateCategoryScores(submission.task_results)

  const badgeStatuses = await getModelBadgeStatuses(submission.model, {
    officialOnly,
    version: submission.benchmark_version !== 'unknown' ? submission.benchmark_version : undefined,
  })
  const earnedBadges = badgeStatuses.filter((badge) => badge.awarded)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href={officialOnly ? '/' : '/?official=false'}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦞</span>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  PinchBench
                </h1>
                <p className="text-xs text-muted-foreground">
                  Submission Details
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Model Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <code className="text-3xl font-mono font-bold text-foreground">
                  {submission.model}
                </code>
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    borderColor:
                      PROVIDER_COLORS[submission.provider.toLowerCase()] ||
                      '#666',
                    color:
                      PROVIDER_COLORS[submission.provider.toLowerCase()] ||
                      '#666',
                  }}
                >
                  {submission.provider}
                </Badge>
                {submission.official && (
                  <Badge
                    variant="outline"
                    className="text-sm border-green-500 text-green-500"
                  >
                    🎖️ Official
                  </Badge>
                )}
                {submission.rank && (
                  <Badge
                    variant="outline"
                    className={`text-sm ${
                      submission.rank <= 3
                        ? "border-yellow-500 text-yellow-500"
                        : submission.rank <= 10
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                    aria-label={`Rank ${submission.rank} out of all submissions`}
                  >
                    {submission.rank <= 3
                      ? submission.rank === 1
                        ? "🥇"
                        : submission.rank === 2
                        ? "🥈"
                        : "🥉"
                      : "🏅"}{" "}
                    #{submission.rank}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  Submitted{' '}
                  {formatDistanceToNow(new Date(submission.timestamp), {
                    addSuffix: true,
                  })}
                </p>
                <RunSelector
                  model={submission.model}
                  currentSubmissionId={submission.submission_id}
                  officialOnly={officialOnly}
                />
              </div>
              {earnedBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {earnedBadges.map((badge) => (
                    <a
                      key={`${badge.metric}-${badge.period}`}
                      href={badge.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                        🏅 {badge.shortLabel}
                      </Badge>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TryKiloClawButton model={submission.model} />
              <ShareButton />
            </div>
          </div>
          {!officialOnly && (
            <div className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Showing official + unofficial runs for this model
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">OpenClaw Version: </span>
              <code className="font-mono text-foreground">
                {submission.openclaw_version}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Benchmark Version: </span>
              <code className="font-mono text-foreground">
                {submission.benchmark_version}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Submission ID: </span>
              <code className="font-mono text-foreground text-xs">
                {submission.submission_id}
              </code>
            </div>
          </div>

          <div className="mt-6">
            <BadgeEmbedCard model={submission.model} badges={badgeStatuses} />
          </div>


        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ScoreGauge
              score={submission.total_score}
              maxScore={submission.max_score}
            />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryStats.map((stats) => {
              const percentage = stats.percentage
              const getColor = () => {
                if (percentage >= 85) return 'text-green-500'
                if (percentage >= 70) return 'text-yellow-500'
                return 'text-red-500'
              }

              return (
                <Card
                  key={stats.category}
                  className="p-4 bg-card border-border flex flex-col"
                >
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {stats.icon} {stats.label}
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-2xl font-bold ${getColor()}`}>
                      {percentage.toFixed(0)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({stats.count} tasks)
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {stats.total.toFixed(1)} / {stats.max.toFixed(1)}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Task Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              Task Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              {submission.task_results.length} tasks completed
            </p>
          </div>
          <TaskBreakdown tasks={submission.task_results} />
          {/* Hardware Info */}
          {submission.metadata.system && (
            <div className="mt-6">
              <HardwareInfo system={submission.metadata.system} />
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8 p-6 bg-muted/30 border-border">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🦀</div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Understanding the Scores
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Automated:</strong> Deterministic checks (file
                  existence, API calls, format validation)
                </p>
                <p>
                  <strong>LLM Judge:</strong> Quality assessment by another LLM
                  (coherence, grammar, engagement)
                </p>
                <p>
                  <strong>Hybrid:</strong> Combination of automated checks and
                  LLM evaluation
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>


    </div>
  )
}
