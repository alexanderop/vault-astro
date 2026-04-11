---
title: "Building an AI Code Review Bot with Claude and GitHub Actions"
type: source
source_type: article
source_id: "https://vadimall.com/posts/AI-code-review-bot-claude-github-actions"
captured_at: 2026-04-11
publish: false
---

# Building an AI Code Review Bot with Claude and GitHub Actions

Tuesday 17/02/2026

·8 min readYou open a pull request and wait. Your team is busy, the reviewer is in a different timezone, and your PR sits there for two days collecting dust. Meanwhile, the obvious bug on line 47 could've been caught instantly. An AI code review bot won't replace your human reviewers, but it can give you fast, consistent first-pass feedback on every PR — catching bugs, style issues, and security problems before a human even looks at it.

Here's how to build one with Claude and GitHub Actions. By the end, you'll have a working action that posts review comments directly on your PRs.

## How the AI code review bot works

The flow is straightforward:

- A PR is opened or updated
- GitHub Actions triggers our workflow
- A TypeScript script fetches the PR diff
- Claude analyzes the diff and returns review comments
- The script posts those comments back on the PR

```
pnpm add @anthropic-ai/sdk @octokit/rest
```

## The TypeScript review script

This is the core of the bot — it fetches the PR diff, sends it to Claude, and posts the review:

```typescript
// scripts/review-pr.ts
import Anthropic from "@anthropic-ai/sdk";
import { Octokit } from "@octokit/rest";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
interface ReviewComment {
  path: string;
  line: number;
  body: string;
}
async function getPRDiff(owner: string, repo: string, prNumber: number): Promise<string> {
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: { format: "diff" },
  });
  // The response is a string when requesting diff format
  return data as unknown as string;
}
async function getPRFiles(owner: string, repo: string, prNumber: number) {
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });
  return data;
}
async function reviewWithClaude(diff: string, files: string[]): Promise<ReviewComment[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a senior code reviewer. Review this pull request diff and provide specific, actionable feedback.
Focus on:
- Bugs and logic errors
- Security vulnerabilities (injection, XSS, exposed secrets)
- Performance issues
- Error handling gaps
- TypeScript type safety issues
Do NOT comment on:
- Formatting or style preferences
- Minor naming suggestions
- Things that are clearly intentional design choices
Files changed: ${files.join(", ")}
Diff:
\`\`\`diff
${diff}
\`\`\`
Respond with a JSON array of review comments. Each comment must have:
- "path": the file path exactly as shown in the diff
- "line": the line number in the new file (the + side of the diff)
- "body": your review comment (be specific, suggest a fix when possible)
If the code looks good and you have no significant issues to flag, respond with an empty array: []
Respond ONLY with the JSON array, no other text.`,
      },
    ],
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as ReviewComment[];
  } catch (err) {
    console.error("Failed to parse Claude response:", text);
    return [];
  }
}
async function postReview(
  owner: string,
  repo: string,
  prNumber: number,
  comments: ReviewComment[],
  commitSha: string,
) {
  if (comments.length === 0) {
    // Post a simple approval comment
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: "🤖 **AI Review:** Code looks good — no significant issues found.",
    });
    return;
  }
  // Post as a pull request review with inline comments
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: commitSha,
    event: "COMMENT",
    body: `🤖 **AI Review:** Found ${comments.length} item${comments.length === 1 ? "" : "s"} to look at.`,
    comments: comments.map((c) => ({
      path: c.path,
      line: c.line,
      body: c.body,
    })),
  });
}
async function main() {
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const prNumber = parseInt(process.env.PR_NUMBER || "0", 10);
  if (!owner || !repo || !prNumber) {
    console.error("Missing required env vars: REPO_OWNER, REPO_NAME, PR_NUMBER");
    process.exit(1);
  }
  console.log(`Reviewing PR #${prNumber} in ${owner}/${repo}...`);
  // Get PR details
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  // Get the diff and file list
  const [diff, files] = await Promise.all([
    getPRDiff(owner, repo, prNumber),
    getPRFiles(owner, repo, prNumber),
  ]);
  const filePaths = files.map((f) => f.filename);
  console.log(`Files changed: ${filePaths.join(", ")}`);
  // Skip if the diff is too large (Claude has a context limit)
  if (diff.length > 100_000) {
    console.log("Diff too large for review — skipping.");
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: "🤖 **AI Review:** This PR is too large for automated review. Please request a human review.",
    });
    return;
  }
  // Run the review
  const comments = await reviewWithClaude(diff, filePaths);
  console.log(`Claude found ${comments.length} issues.`);
  // Post the review
  await postReview(owner, repo, prNumber, comments, pr.head.sha);
  console.log("Review posted.");
}
main().catch((err) => {
  console.error("Review failed:", err);
  process.exit(1);
});
```

A few things to note here. The diff size check at 100k characters is important — you don't want to blow Claude's context window on a massive refactor PR. The JSON parsing is defensive because LLMs occasionally wrap their output in markdown code blocks even when you tell them not to. And we're using `claude-sonnet-4-5-20250929` because it's fast and cheap enough for CI — you don't need Opus for code review.

## The GitHub Actions workflow

Now wire it up as a GitHub Action that triggers on pull requests:

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review
on:
pull_request:
types: [opened, synchronize]
permissions:
contents: read
pull-requests: write
jobs:
review:
runs-on: ubuntu-latest
# Don't review PRs from bots (like Dependabot)
if: github.actor != 'dependabot[bot]'
steps:
- name: Checkout
uses: actions/checkout@v4
- name: Setup Node.js
uses: actions/setup-node@v4
with:
node-version: '20'
- name: Install dependencies
run: npm install @anthropic-ai/sdk @octokit/rest tsx
- name: Run AI review
env:
ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
REPO_OWNER: ${{ github.repository_owner }}
REPO_NAME: ${{ github.event.repository.name }}
PR_NUMBER: ${{ github.event.pull_request.number }}
run: npx tsx scripts/review-pr.ts
```

Add your Anthropic API key as a repository secret (`Settings > Secrets > Actions > New repository secret > ANTHROPIC_API_KEY`). The `GITHUB_TOKEN` is automatically provided by GitHub Actions — no setup needed.

**Gotcha:** The `permissions` block is critical. Without `pull-requests: write`, the bot can't post review comments and you'll get a cryptic 403 error. I burned 30 minutes debugging this the first time.

## Filtering files to save tokens (and money)

You probably don't want Claude reviewing your lock file or auto-generated code. Add a filter step:

```typescript
// Add this before the reviewWithClaude call
const SKIP_PATTERNS = [
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.min\.(js|css)$/,
  /\.generated\./,
  /\/dist\//,
  /\/\.next\//,
];
function shouldReviewFile(filename: string): boolean {
  return !SKIP_PATTERNS.some((pattern) => pattern.test(filename));
}
// Filter the files
const reviewableFiles = files.filter((f) => shouldReviewFile(f.filename));
const reviewablePaths = reviewableFiles.map((f) => f.filename);
// Build a filtered diff — only include hunks for files we care about
function filterDiff(fullDiff: string, allowedFiles: Set<string>): string {
  const lines = fullDiff.split("\n");
  const filtered: string[] = [];
  let include = false;
  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      // Extract filename from "diff --git a/path b/path"
      const match = line.match(/b\/(.+)$/);
      include = match ? allowedFiles.has(match[1]) : false;
    }
    if (include) filtered.push(line);
  }
  return filtered.join("\n");
}
const filteredDiff = filterDiff(diff, new Set(reviewablePaths));
```

This cuts your token usage significantly. A typical PR with a lock file change might have a 50k-character diff, but only 2k characters of actual code changes.

## Cost breakdown

Claude Sonnet costs $3/million input tokens and $15/million output tokens. For a typical PR:

**Average diff size:** ~2,000 tokens (after filtering)
**System prompt + instructions:** ~500 tokens
**Output (3-5 comments):** ~300 tokens
**Cost per review:** ~$0.01

At 100 PRs per month, you're looking at about $1/month. That's less than a single cup of coffee for always-on code review.

## Making the reviews actually useful

The quality of the review depends almost entirely on your system prompt. Here's what I learned after running this on a real repo for a few weeks:

**Be specific about what to ignore.** Without the "do NOT comment on" section, Claude will nitpick every variable name and suggest adding semicolons to your semi-free codebase. It gets annoying fast and people start ignoring the bot entirely.

**Ask for fixes, not just problems.** "This could be a security issue" is useless. "This is vulnerable to SQL injection — use parameterized queries like `db.query('SELECT * FROM users WHERE id = $1', [userId])`" is actionable. The prompt explicitly asks Claude to suggest fixes.

**Keep the context focused.** Sending the entire repo's context alongside the diff would give Claude more information, but in practice it makes reviews slower and more expensive without much quality improvement. The diff alone is usually enough for catching bugs.

**Handle the "no issues" case gracefully.** Early versions of my bot would just stay silent when the code was fine, which made people wonder if it was broken. The approval comment makes it clear the bot ran and found nothing.

## What's next

This bot handles the easy wins — obvious bugs, missing error handling, security red flags. But what about rate limits and API errors when Claude is having a bad day? You don't want your CI pipeline to fail just because an AI API timed out.

If you want the bot to understand your codebase more deeply — knowing about your custom conventions, internal APIs, and architecture — you could combine this with a RAG pipeline to feed relevant documentation into the review prompt.
