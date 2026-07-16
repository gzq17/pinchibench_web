/**
 * Mock data for Orion-Mission-Mode on PinchBench leaderboard.
 *
 * Replace the placeholder values below with real benchmark results.
 * This file is the single source of truth consumed by:
 *   - app/page.tsx                 (leaderboard entry)
 *   - app/model/[...slug]/page.tsx (model overview page)
 *   - app/submission/[id]/page.tsx (submission detail page)
 */

import type {
  ApiLeaderboardEntry,
  ApiSubmissionDetail,
  ApiSubmissionListItem,
  ModelSubmissionsResponse,
} from '@/lib/types'
import tasks from '../../all_task.json';

// ---------------------------------------------------------------------------
// 1. Basic identity – edit these when you have the real values
// ---------------------------------------------------------------------------

export const BAIDU_MODEL_NAME = 'Orion-Mission-Mode'
export const BAIDU_PROVIDER = 'Baidu'
export const BAIDU_SUBMISSION_ID = 'mock-id-001'
export const BAIDU_TIMESTAMP = '2026-07-08T00:00:00Z'
export const BAIDU_OPENCLAW_VERSION = '1.0.0'
export const BAIDU_BENCHMARK_VERSION = 'v2.0'

// ---------------------------------------------------------------------------
// 2. Scores
// ---------------------------------------------------------------------------

export const BAIDU_TOTAL_SCORE = 0.9412
export const BAIDU_MAX_SCORE = 0.9464
export const BAIDU_AVE_SCORE = 0.9436
export const BAIDU_MEDIAN_SCORE = 0.9432
export const BAIDU_BEST_SCORE = 0.9464

/** 0-1 range, e.g. 0.947 = 94.7 % */
export const BAIDU_BEST_SCORE_PERCENTAGE = 0.9464
export const BAIDU_AVERAGE_SCORE_PERCENTAGE = 0.9436

// ---------------------------------------------------------------------------
// 3. Cost & speed
// ---------------------------------------------------------------------------

export const BAIDU_BEST_COST_USD: number | null = null          // replace with actual cost per run
export const BAIDU_AVERAGE_COST_USD: number | null = null
export const BAIDU_BEST_EXECUTION_TIME_SECONDS: number | null = null
export const BAIDU_AVERAGE_EXECUTION_TIME_SECONDS: number | null = null

// ---------------------------------------------------------------------------
// 4. Usage summary (token-level)
// ---------------------------------------------------------------------------

export const BAIDU_USAGE_SUMMARY = {
  total_input_tokens: 1_240_000,   // replace with actual values
  total_output_tokens: 320_000,
  total_requests: 152,
  total_cost_usd: BAIDU_BEST_COST_USD,
}

// ---------------------------------------------------------------------------
// 5. Hardware / system info (fill in actual runner environment)
// ---------------------------------------------------------------------------

export const BAIDU_SYSTEM_INFO = {
  os: 'Linux',
  os_release: '5.15.0',
  architecture: 'x86_64',
  python_version: '3.11.9',
  cpu_count: 32,
  cpu_model: 'Intel(R) Xeon(R) Platinum 8358 CPU @ 2.60GHz',
  memory_total_gb: 128,
  memory_available_gb: 96,
}

// ---------------------------------------------------------------------------
// 6. Task results – one entry per task
//    Fields: task_id, score, max_score, breakdown, grading_type, timed_out
//    Replace score values with real results.
// ---------------------------------------------------------------------------
export const BAIDU_TASKS: ApiSubmissionDetail['tasks'] = tasks
// export const BAIDU_TASKS: ApiSubmissionDetail['tasks'] = [
//   // ── core_agent (7 tasks) ────────────────────────────────────────────────
//   { task_id: 'task_00_sanity',            score: 10, max_score: 10, breakdown: { correctness: 10 }, grading_type: 'automated', timed_out: false, frontmatter: { name: 'Sanity Check',           category: 'core_agent' } },
//   { task_id: 'task_08_memory',            score:  9, max_score: 10, breakdown: { recall: 9 },        grading_type: 'automated', timed_out: false, frontmatter: { name: 'Memory Retrieval',       category: 'core_agent' } },
//   { task_id: 'task_09_files',             score: 10, max_score: 10, breakdown: { file_ops: 10 },     grading_type: 'automated', timed_out: false, frontmatter: { name: 'File Operations',        category: 'core_agent' } },
//   { task_id: 'task_10_workflow',          score:  8, max_score: 10, breakdown: { steps: 8 },          grading_type: 'hybrid',    timed_out: false, frontmatter: { name: 'Multi-step Workflow',    category: 'core_agent' } },
//   { task_id: 'task_openclaw_comprehension', score: 9, max_score: 10, breakdown: { comprehension: 9 }, grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'OpenClaw Comprehension', category: 'core_agent' } },
//   { task_id: 'task_second_brain',         score:  8, max_score: 10, breakdown: { retrieval: 8 },     grading_type: 'hybrid',    timed_out: false, frontmatter: { name: 'Second Brain',           category: 'core_agent' } },
//   { task_id: 'task_context_tracking',     score:  9, max_score: 10, breakdown: { context: 9 },       grading_type: 'automated', timed_out: false, frontmatter: { name: 'Context Tracking',       category: 'core_agent' } },

//   // ── code_devops (8 tasks) ───────────────────────────────────────────────
//   { task_id: 'task_04_weather',              score: 10, max_score: 10, breakdown: { correctness: 10 },  grading_type: 'automated', timed_out: false, frontmatter: { name: 'Weather Script',          category: 'code_devops' } },
//   { task_id: 'task_test_generation',         score:  9, max_score: 10, breakdown: { coverage: 9 },      grading_type: 'automated', timed_out: false, frontmatter: { name: 'Test Generation',         category: 'code_devops' } },
//   { task_id: 'task_k8s_debugging',           score:  8, max_score: 10, breakdown: { diagnosis: 8 },     grading_type: 'automated', timed_out: false, frontmatter: { name: 'K8s Debugging',           category: 'code_devops' } },
//   { task_id: 'task_cicd_pipeline_debug',     score:  9, max_score: 10, breakdown: { fix: 9 },           grading_type: 'automated', timed_out: false, frontmatter: { name: 'CI/CD Pipeline Debug',    category: 'code_devops' } },
//   { task_id: 'task_dockerfile_optimization', score: 10, max_score: 10, breakdown: { optimization: 10 }, grading_type: 'automated', timed_out: false, frontmatter: { name: 'Dockerfile Optimization', category: 'code_devops' } },
//   { task_id: 'task_selector_fix',            score:  8, max_score: 10, breakdown: { accuracy: 8 },      grading_type: 'automated', timed_out: false, frontmatter: { name: 'Selector Fix',            category: 'code_devops' } },
//   { task_id: 'task_multi_file_refactoring',  score:  9, max_score: 10, breakdown: { quality: 9 },       grading_type: 'hybrid',    timed_out: false, frontmatter: { name: 'Multi-file Refactoring',  category: 'code_devops' } },
//   { task_id: 'task_git_rescue_recovery',     score:  8, max_score: 10, breakdown: { recovery: 8 },      grading_type: 'automated', timed_out: false, frontmatter: { name: 'Git Rescue Recovery',     category: 'code_devops' } },

//   // ── data_analysis (4 tasks) ─────────────────────────────────────────────
//   { task_id: 'task_02_stock',                     score:  9, max_score: 10, breakdown: { accuracy: 9 },     grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Stock Research',              category: 'data_analysis' } },
//   { task_id: 'task_spreadsheet_summary',          score: 10, max_score: 10, breakdown: { summary: 10 },     grading_type: 'automated', timed_out: false, frontmatter: { name: 'Spreadsheet Summary',         category: 'data_analysis' } },
//   { task_id: 'task_financial_ratio_calculation',  score:  9, max_score: 10, breakdown: { calculation: 9 },  grading_type: 'automated', timed_out: false, frontmatter: { name: 'Financial Ratio Calculation', category: 'data_analysis' } },
//   { task_id: 'task_earnings_analysis',            score:  8, max_score: 10, breakdown: { insight: 8 },      grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Earnings Analysis',           category: 'data_analysis' } },

//   // ── writing_content (5 tasks) ───────────────────────────────────────────
//   { task_id: 'task_03_blog',          score:  9, max_score: 10, breakdown: { quality: 9 },      grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Blog Post',         category: 'writing_content' } },
//   { task_id: 'task_05_summary',       score: 10, max_score: 10, breakdown: { conciseness: 10 }, grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Document Summary',  category: 'writing_content' } },
//   { task_id: 'task_humanizer',        score:  9, max_score: 10, breakdown: { fluency: 9 },      grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Humanizer',         category: 'writing_content' } },
//   { task_id: 'task_readme_generation', score: 10, max_score: 10, breakdown: { completeness: 10 }, grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'README Generation', category: 'writing_content' } },
//   { task_id: 'task_eli5_pdf_summary', score:  9, max_score: 10, breakdown: { clarity: 9 },      grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'ELI5 PDF Summary', category: 'writing_content' } },

//   // ── productivity (4 tasks) ──────────────────────────────────────────────
//   { task_id: 'task_01_calendar',       score: 10, max_score: 10, breakdown: { correctness: 10 }, grading_type: 'automated', timed_out: false, frontmatter: { name: 'Calendar Event',    category: 'productivity' } },
//   { task_id: 'task_07_email',          score:  9, max_score: 10, breakdown: { quality: 9 },      grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Email Draft',       category: 'productivity' } },
//   { task_id: 'task_todo_list_cleanup', score: 10, max_score: 10, breakdown: { accuracy: 10 },    grading_type: 'automated', timed_out: false, frontmatter: { name: 'Todo List Cleanup', category: 'productivity' } },
//   { task_id: 'task_pdf_to_calendar',   score:  8, max_score: 10, breakdown: { extraction: 8 },   grading_type: 'automated', timed_out: false, frontmatter: { name: 'PDF to Calendar',   category: 'productivity' } },

//   // ── research_knowledge (5 tasks) ────────────────────────────────────────
//   { task_id: 'task_06_events',        score:  9, max_score: 10, breakdown: { relevance: 9 },  grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Events Research',    category: 'research_knowledge' } },
//   { task_id: 'task_market_research',  score: 10, max_score: 10, breakdown: { depth: 10 },     grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Market Research',    category: 'research_knowledge' } },
//   { task_id: 'task_executive_lookup', score:  9, max_score: 10, breakdown: { accuracy: 9 },   grading_type: 'automated', timed_out: false, frontmatter: { name: 'Executive Lookup',   category: 'research_knowledge' } },
//   { task_id: 'task_contract_analysis', score: 8, max_score: 10, breakdown: { extraction: 8 }, grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Contract Analysis',  category: 'research_knowledge' } },
//   { task_id: 'task_skill_search',     score:  9, max_score: 10, breakdown: { relevance: 9 },  grading_type: 'automated', timed_out: false, frontmatter: { name: 'Skill Search',       category: 'research_knowledge' } },

//   // ── security_ops (3 tasks) ──────────────────────────────────────────────
//   { task_id: 'task_access_log_anomaly', score:  9, max_score: 10, breakdown: { detection: 9 },       grading_type: 'automated', timed_out: false, frontmatter: { name: 'Access Log Anomaly', category: 'security_ops' } },
//   { task_id: 'task_cve_security_triage', score: 10, max_score: 10, breakdown: { triage: 10 },        grading_type: 'hybrid',    timed_out: false, frontmatter: { name: 'CVE Security Triage', category: 'security_ops' } },
//   { task_id: 'task_gh_issue_triage',    score:  9, max_score: 10, breakdown: { classification: 9 },  grading_type: 'hybrid',    timed_out: false, frontmatter: { name: 'GitHub Issue Triage', category: 'security_ops' } },

//   // ── creative (2 tasks) ──────────────────────────────────────────────────
//   { task_id: 'task_image_gen',            score: 8, max_score: 10, breakdown: { quality: 8 },   grading_type: 'llm_judge', timed_out: false, frontmatter: { name: 'Image Generation',   category: 'creative' } },
//   { task_id: 'task_image_identification', score: 9, max_score: 10, breakdown: { accuracy: 9 },  grading_type: 'automated', timed_out: false, frontmatter: { name: 'Image Identification', category: 'creative' } },
// ]

// ---------------------------------------------------------------------------
// 7. Derived objects consumed by page files – do not edit these directly;
//    edit the constants above and these will stay in sync.
// ---------------------------------------------------------------------------

/** Used in app/page.tsx (leaderboard row) */
export const BAIDU_LEADERBOARD_ENTRY: ApiLeaderboardEntry = {
  model: BAIDU_MODEL_NAME,
  provider: BAIDU_PROVIDER,
  best_score_percentage: BAIDU_BEST_SCORE_PERCENTAGE,
  latest_submission: BAIDU_TIMESTAMP,
  best_submission_id: BAIDU_SUBMISSION_ID,
  submission_count: 1,
  official: true,
  best_cost_usd: BAIDU_BEST_COST_USD,
  average_cost_usd: BAIDU_AVERAGE_COST_USD,
  average_score_percentage: BAIDU_AVERAGE_SCORE_PERCENTAGE,
  best_execution_time_seconds: BAIDU_BEST_EXECUTION_TIME_SECONDS,
  average_execution_time_seconds: BAIDU_AVERAGE_EXECUTION_TIME_SECONDS,
  weights: null,
  hf_link: null,
}

/** Used in app/submission/[id]/page.tsx */
export const BAIDU_SUBMISSION_DETAIL: ApiSubmissionDetail = {
  id: BAIDU_SUBMISSION_ID,
  model: BAIDU_MODEL_NAME,
  provider: BAIDU_PROVIDER,
  timestamp: BAIDU_TIMESTAMP,
  openclaw_version: BAIDU_OPENCLAW_VERSION,
  benchmark_version: BAIDU_BENCHMARK_VERSION,
  total_score: BAIDU_TOTAL_SCORE,
  max_score: BAIDU_MAX_SCORE,
  ave_score: BAIDU_AVE_SCORE,
  median_score: BAIDU_MEDIAN_SCORE,
  best_score: BAIDU_BEST_SCORE,
  official: true,
  tasks: BAIDU_TASKS,
  metadata: {
    run_timestamp: new Date(BAIDU_TIMESTAMP).getTime() / 1000,
    task_count: BAIDU_TASKS.length,
    system: BAIDU_SYSTEM_INFO,
  },
  usage_summary: BAIDU_USAGE_SUMMARY,
  rank: 1,
  percentile: 99,
}

/**
 * Used by components/score-distribution.tsx (Graphs → Score Distribution).
 * The box plot needs at least 2 runs per model, so this models the 3 runs
 * reflected by submission_count. Edit the scores to match real results.
 */
export const BAIDU_DISTRIBUTION_SUBMISSIONS: ApiSubmissionListItem[] = [
  0.9412,
  0.9432,
  0.9464,
].map((score, i) => ({
  id: `${BAIDU_SUBMISSION_ID}-run-${i + 1}`,
  model: BAIDU_MODEL_NAME,
  provider: BAIDU_PROVIDER,
  score_percentage: score,
  total_score: score,
  max_score: 1,
  total_execution_time_seconds: 120,
  total_cost_usd: 0,
  timestamp: BAIDU_TIMESTAMP,
  created_at: BAIDU_TIMESTAMP,
  client_version: null,
  openclaw_version: BAIDU_OPENCLAW_VERSION,
  benchmark_version: BAIDU_BENCHMARK_VERSION,
  claimed: 1,
  official: true,
}))

/** Used in app/model/[...slug]/page.tsx */
export const BAIDU_MODEL_SUBMISSIONS: ModelSubmissionsResponse = {
  model: BAIDU_MODEL_NAME,
  benchmark_version: BAIDU_BENCHMARK_VERSION,
  benchmark_versions: [BAIDU_BENCHMARK_VERSION],
  official_only: true,
  submissions: [
    {
      id: BAIDU_SUBMISSION_ID,
      score_percentage: BAIDU_BEST_SCORE_PERCENTAGE,
      total_score: BAIDU_TOTAL_SCORE,
      max_score: BAIDU_MAX_SCORE,
      ave_score: BAIDU_AVE_SCORE,
      median_score: BAIDU_MEDIAN_SCORE,
      best_score: BAIDU_BEST_SCORE,
      timestamp: BAIDU_TIMESTAMP,
      is_best: true,
      total_cost_usd: BAIDU_BEST_COST_USD,
      total_execution_time_seconds: 120,   // replace with actual run duration in seconds
      official: true,
    },
  ],
}
