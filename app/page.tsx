import type { Metadata } from 'next'
import type { ApiLeaderboardEntry } from '@/lib/types'
import { fetchLeaderboard, fetchBenchmarkVersions, fetchTransformedBestSubmissions, fetchSubmissions } from '@/lib/api'
import { calculateRanks, transformLeaderboardEntry, transformSubmission } from '@/lib/transforms'
import { enrichEntriesWithSubmissions, getCategoryChampionBadges, getQuickRecommendations } from '@/lib/recommendations'
import { LeaderboardView } from '@/components/leaderboard-view'
import { BAIDU_LEADERBOARD_ENTRY, BAIDU_SUBMISSION_DETAIL } from '@/lib/mock-data/baidu-ai-search'

interface HomeProps {
  searchParams: Promise<{ version?: string; view?: string; official?: string }>
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { version, view, official } = await searchParams
  const ogParams = new URLSearchParams()
  if (view) ogParams.set('view', view)
  if (version) ogParams.set('version', version)
  if (official === 'false') ogParams.set('official', 'false')
  // Cache-bust with benchmark version so social platforms re-fetch on new releases
  ogParams.set('v', '2.0')
  const ogUrl = `/api/og${ogParams.toString() ? `?${ogParams.toString()}` : ''}`

  const viewTitles: Record<string, string> = {
    success: 'Best Models by Success Rate',
    speed: 'Fastest Models',
    cost: 'Most Cost-Effective Models',
    value: 'Best Value Models',
    graphs: 'Model Comparison Graphs',
  }
  const title = viewTitles[view ?? 'success'] ?? 'Best AI Models for OpenClaw'
  const description = 'Find the best AI model for your OpenClaw agent. Compare success rates, speed, and cost across 100+ LLMs on real coding tasks.'

  return {
    title: `${title} | PinchBench - OpenClaw Benchmark`,
    description,
    openGraph: {
      title: `${title} | PinchBench`,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PinchBench`,
      description,
      images: [ogUrl],
    },
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const { version, official } = await searchParams
  const officialOnly = official !== 'false'
  const [response, versionsResponse, submissionsResponse] = await Promise.all([
    fetchLeaderboard(version, { officialOnly }),
    fetchBenchmarkVersions(),
    // Fetch the full submissions list on the server so the Score Distribution
    // graph does not depend on a client-side fetch (blocked by CORS in many
    // environments). Tolerate failure so the page still renders.
    fetchSubmissions(version, 500, 0, { officialOnly }).catch(() => null),
  ])
  const mockEntry: ApiLeaderboardEntry = {
  model: "Orion-Mission-Mode",
  provider: "Baidu",
  best_score_percentage: 0.9464,     // 92%
  latest_submission: "2026-07-08T00:00:00Z",//new Date().toISOString(),
  best_submission_id: "mock-id-001",
  submission_count: 3,
  official: true,
  // 可选字段
  best_cost_usd: null,
  average_cost_usd: null,
  average_score_percentage: 0.9436,
  best_execution_time_seconds: null,
  average_execution_time_seconds: null,
  weights: null,
  hf_link: null,
}
  const entries = calculateRanks([...response.leaderboard.map(transformLeaderboardEntry), transformLeaderboardEntry(mockEntry)])
  // Fetch task-level data for enough top entries that every model shown in the
  // category sub-leaderboards is scored from real task data (seeded into the
  // client below) rather than falling back to its overall score.
  const topCandidateIds = entries.slice(0, 100).map((entry) => entry.submission_id)
  const apiTopSubmissions = await fetchTransformedBestSubmissions(topCandidateIds)
  // Merge mock submissions so category-level scores (and category-champion crowns)
  // include entries that don't exist in the real API.
  const topSubmissions = [...apiTopSubmissions, transformSubmission(BAIDU_SUBMISSION_DETAIL)]
  const enrichedEntries = enrichEntriesWithSubmissions(entries, topSubmissions)
  const quickPicks = getQuickRecommendations(enrichedEntries)
  const championBadges = Object.fromEntries(getCategoryChampionBadges(enrichedEntries))
  // Seed client-side category scoring with the task data already fetched on the
  // server. The browser cannot fetch per-submission details directly (CORS), so
  // without this the category sub-leaderboards fall back to overall scores.
  const initialTaskData = Object.fromEntries(
    topSubmissions.map((submission) => [submission.submission_id, submission.task_results])
  )
  const maxTaskCount = topSubmissions.length > 0
    ? Math.max(...topSubmissions.map((s) => s.metadata.task_count))
    : 0
  const latestTimestamp = entries.reduce((latest, entry) => {
    const current = new Date(entry.timestamp).getTime()
    return Number.isNaN(current) ? latest : Math.max(latest, current)
  }, 0)
  const lastUpdated = latestTimestamp
    ? new Date(latestTimestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    : 'Unknown'

  return (
    <LeaderboardView
      entries={entries}
      lastUpdated={lastUpdated}
      versions={versionsResponse.versions}
      currentVersion={version ?? null}
      officialOnly={officialOnly}
      quickPicks={quickPicks}
      championBadges={championBadges}
      maxTaskCount={maxTaskCount}
      initialTaskData={initialTaskData}
      initialSubmissions={submissionsResponse?.submissions ?? []}
    />
  )
}
