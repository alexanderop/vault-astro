---
title: "MCP vs CLI Is the Wrong Fight"
type: source
source_type: article
source_id: "https://smithery.ai/blog/mcp-vs-cli-is-the-wrong-fight"
captured_at: 2026-04-13
publish: false
---

# MCP vs CLI Is the Wrong Fight

_We ran 756 benchmarks across raw APIs, MCP, and CLI to see what actually makes agents succeed at API tasks. We found that agents do best when APIs are well-described and exposed through the harness's native tool interface — the pattern MCP packages best today._

Last week, X erupted into a heated debate over CLI vs MCP. [One camp declared MCP dead](https://x.com/levelsio/status/2031943074151104634) and said models should just use the APIs and CLIs they already know. [Others argued MCP is essential](https://x.com/jeffzwang/status/2032533039746822540) for selective exposure, standard auth, and agent-friendly context. [Some say the whole thing is a harness problem](https://x.com/RhysSullivan/status/2031928761369931981).

We started [Smithery](https://smithery.ai/) because we believe in the [potential of an agent economy](/blog/tool-calls-are-the-new-clicks) built on AI-native services. So we wanted to get to the bottom of this fight — not just vibes.

## What each camp says

Let's steelman both sides for a second.

MCP vs CLI debate

If you're in the **API/CLI camp**, the argument is pretty straightforward: official APIs are already the source of truth. Vendors maintain them well and their CLIs are [easy](https://x.com/MeredithCheng22/status/2031856523895275838) to install, inspect, and debug. Asking every company to also maintain an MCP server is extra work, and many servers today feel like overly complex slop.

**The MCP camp** argues that agents perform better when API surfaces are typed, named and self-describing, especially for [internal enterprise APIs](https://x.com/fatih/status/2031995183831634101) where models have zero training priors. MCP also [standardizes auth](https://x.com/dsp_/status/2032047284230209579) so agents don't need bespoke credential plumbing and it's easy to audit.

The frustrating thing is that people are conflating three separate questions:

- how agents discover and use capabilities (agent experience/
  **AX**) - the user experience of installing and using MCP/CLIs (
  **UX**) - how auth, approvals, and governance work (standardization)

Most people argue about one and claim victory over the others.

A lot of the debate is driven by anecdotes or involve category errors. People try a bloated MCP server and conclude MCP is bad. Or they try to compare MCP to CLI when one is a protocol and the other is an interface. In reality, you can use both and deliver [MCP through a CLI](https://smithery.ai/docs/use/connect).

To get clarity, we narrowed the question:

_If you hold the backend and tasks fixed, what kind of interface gives agents the best chance of succeeding today?_

## Our benchmark

We designed a benchmark that held the API surface and tasks fixed, and varied only the surface the agent sees — measuring success rate and token efficiency.

### Experimental setting

Our benchmark suite consists of **756 isolated runs** across 8 experiment families. Every run started in a fresh container with access to only one API at a time.

We tested **3 models + harnesses**: Claude Haiku 4.5 and GPT 5.4 (Codex, default thinking level) for the main suite, Claude Sonnet 4.6 for the large-catalog GitHub experiments. We used the default settings for each harness. In Claude Code, [Sonnet 4.6](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) used MCP tool search by default, while Haiku 4.5 does not support tool search. In Codex CLI, we did not pass an explicit thinking level for GPT 5.4, so it ran at the CLI default.

We tested them against **3 APIs**, chosen to span different levels of model familiarity:

**GitHub REST**— two variants: 24 curated operations, and the full 826-tool GitHub MCP catalog. Popular API, well-represented in training data.**Linear GraphQL**— live read-only workspace, rerun against the real API on March 15, 2026. Popular, but GraphQL introduces query-construction complexity.**Singapore Bus REST**— 8 operations. We wanted to test a niche, region-specific API (where half of our team lives!) that is unlikely to be well represented during model pre-training.

## Why Singapore Bus?

Singapore Bus API comes from Singapore's LTA DataMall. The current API user guide is version 6.2 dated November 21, 2024, the dynamic-data site was updated February 6, 2026, and several bus datasets are real-time or ad hoc.

So even if the domain appears in training, the current API surface and live data can drift quickly relative to model cutoffs. For reference, Claude Sonnet 4.6 lists an August 2025 reliable knowledge cutoff, Claude Haiku 4.5 lists February 2025, and GPT-5.4 lists an August 31, 2025 knowledge cutoff.

**All tasks require at least two dependent API calls** — search for something, extract an identifier, then fetch something using that identifier.

We measure **success** by whether the agent completes the full ordered chain of correct tool calls with valid arguments, propagating data between steps — for example, searching for a repo and then fetching its README using identifiers from the search result. **Efficiency** is the total billed token cost over successful runs. Claude code runs were capped at 10 turns. Codex CLI did not expose a comparable max-turn flag in our setup.

In order to perform this experiment, we translated APIs to different form factors (CLI/MCP). For **MCP**, we translated each REST endpoint or GraphQL operation into a thin 1:1 native MCP tool (e.g. `search.code.list`, `repos.readme.get`) injected into the harness via its MCP config. For **CLI**, the same operations are auto-generated into a generic `benchctl` command with `list`, `describe`, and `call` subcommands. Every condition shares the same backing service and task — only the interface changes.

### How good are models at blind API calling?

Our first experiment strips away all help. The agent only gets a local authenticated endpoint and `curl` without docs or a schema. It has to guess the API shape.

```
# This is all the agent can guess and call
curl -s 'http://127.0.0.1:4010/search/code?q=auth%20helper%20language%3Apython'
```

Models achieve a 53% success rate despite being blind, but results vary wildly by API.

| API                   | Runs | Success rate | Median tokens on success | Median latency |
| --------------------- | ---- | ------------ | ------------------------ | -------------- |
| GitHub                | 24   | 91.7%        | 46,402                   | 14.1s          |
| Linear (live GraphQL) | 24   | 16.7%        | 157,116                  | 53.1s          |
| Singapore Bus         | 12   | 41.7%        | 99,484                   | 33.7s          |

GitHub, well-represented in pre-training data, held up fine even without docs. Linear's poor showing likely reflects models' unfamiliarity with its GraphQL query shapes. Singapore Bus struggled for the more obvious reason of not appearing much in training data.

Model priors help, but they're unreliable for anything the model hasn't seen extensively in training.

### Does providing specs help?

Next, we gave agents the same endpoints plus API specs — OpenAPI JSON for REST, GraphQL introspection spec for Linear.

```
# Same curl, but now the agent can also read:
cat ./specs/openapi.json
```

| Condition         | Success rate | Median tokens on success | Median latency |
| ----------------- | ------------ | ------------------------ | -------------- |
| Raw API (no docs) | 53.0%        | 69,736                   | 19.4s          |
| Raw API + specs   | 75.8%        | 92,716                   | 16.5s          |

Providing specs lifted success from 53% to 76%, but models spent tokens reading and navigating documentation.

Specs buy correctness but can consume a significant number of tokens.

### Optimizing CLI design

Before comparing native MCP tool integration and CLI head-to-head, we investigated the best way to present APIs as CLIs to agents. The central principle here is [progressive disclosure](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#progressive-disclosure-patterns) — presenting only specs that the agent needs a given point in time.

We tested three layouts (`flat` `tree` `descriptions`) on the full 826-tool GitHub catalog with Sonnet 4.6 and Codex:

```
# Flat: every endpoint in one list
./benchctl list --json
# → [{ "id": "repos.actions.runs.get" }, { "id": "repos.actions.runs.jobs.list" }, ...]
# Tree: endpoints organized hierarchically
./benchctl list repos --json
# → [{ "type": "node", "name": "actions" }, { "type": "node", "name": "branches" }, ...]
./benchctl list repos.actions --json
# → [{ "type": "node", "name": "runs" }, { "type": "node", "name": "workflows" }, ...]
# Tree + descriptions: hierarchy with semantic context
./benchctl list --json
# → [{ "name": "search",
#      "description": "Search across code and repository metadata." },
#    { "name": "repos",
#      "description": "Repository operations including content, branches, and CI." }]
```

| Condition                  | Success | Median tokens | Median actions |
| -------------------------- | ------- | ------------- | -------------- |
| CLI flat                   | 45.8%   | 124,632       | 18.0           |
| CLI tree (no descriptions) | 45.8%   | 127,037       | 14.0           |
| CLI tree + descriptions    | 79.2%   | 107,049       | 12.0           |

Tree without descriptions performed identically to flat (both 45.8%). The model wasted turns navigating branches with no descriptive context. Adding descriptions and aliases raised success to 79% and cut median actions from 18 to 12. This suggests that structure helps only when it came with descriptions that made operation easy to find.

We also tested adding a search primitive:

```
# Search across all 826 tools by keyword
./benchctl search 'workflow run' --json
```

The search experiment was a separate run with its own baseline. Adding search to CLI tree+descriptions lifted success from 75% to 87.5% while cutting median actions from 10 to 6. (_The baseline here is 75%, not the 79.2% from the topology experiment above — these are different experiment families with different runs._)

| Model           | CLI + descriptions     | CLI + search          |
| --------------- | ---------------------- | --------------------- |
| Sonnet 4.6      | 66.7% / 159,928 tokens | 91.7% / 81,160 tokens |
| Codex (GPT 5.4) | 83.3% / 88,176 tokens  | 83.3% / 64,916 tokens |

Sonnet jumped from 67% to 92% with search. Codex's success stayed the same but runs got significantly cheaper. At scale, descriptions and search together matter more than structure alone.

### CLI vs Native MCP

With our best CLI configuration established, we now compare CLI vs MCP exposed through the harness natively.

```
# Instead of curl or CLI, the agent sees tools in the format
# their harness injects into context
Tool: search.code.list
Arguments: { q: string }
Tool: repos.readme.get
Arguments: { owner: string, repo: string }
# Example of injecting a native MCP config into a Claude Code harness
claude -p \
  --model claude-haiku-4-5-20251001 \
  --dangerously-skip-permissions \
  --max-turns 10 \
  --verbose \
  --output-format stream-json \
  --mcp-config /home/bench/workspace/mcp-config.json
```

| Condition               | Success | Median tokens | Median latency |
| ----------------------- | ------- | ------------- | -------------- |
| Native MCP              | 91.7%   | 28,838        | 10.4s          |
| CLI tree + descriptions | 83.3%   | 82,942        | 24.9s          |

We ran Claude Haiku 4.5 and Codex GPT-5.4 across the three small benchmark slices for GitHub, Linear, and Singapore Bus, and found that native MCP tool integration achieved 91.7% success versus 83.3% for CLI. On successful runs, CLI used 2.9× more billed tokens and took 2.4× longer.

The cost gap appears to come from interaction overhead rather than payload size alone. On CLI, the agent typically had to browse with `list` or `describe`, parse JSON, serialize arguments back through the shell, and then call the operation. Native MCP collapsed most of that into fewer structured interactions, which is why successful CLI runs used more actions and more billed tokens even when they ultimately reached the same backend.

On the full 826-tool GitHub catalog, the gap widened — even when comparing against our best CLI design with search:

| Condition                               | Success | Median tokens | Median latency |
| --------------------------------------- | ------- | ------------- | -------------- |
| Native MCP (826 tools)                  | 100.0%  | 76,101        | 21.4s          |
| CLI + descriptions + search (826 tools) | 87.5%   | 79,375        | 26.1s          |

It's worth noting that on billed tokens alone, Codex's CLI+search runs were actually cheaper than its native MCP runs (64,916 vs 94,823). Native tool integration doesn't always win on every metric for every model — but it wins on task success.

### GraphQL: expressive ≠ cheap to navigate

As a final exploration, we tested whether GraphQL would be a better interface than the RPC-style setups. GraphQL lets you specify exactly which fields you need and resolve nested relationships in a single request — in theory, more context-efficient for compound tasks.

We setup GraphQL by letting the model discover the schema incrementally through standard introspection queries, rather than dumping a massive spec file:

```
# The model discovers the API shape through introspection:
query { __schema { queryType { name } } }
query { __type(name: "Query") { fields { name } } }
# Then constructs queries like:
query { searchIssues(term: "GitHub permissions", first: 1) {
  nodes { identifier title } } }
```

| Condition | Success | Median tokens |
| --------- | ------- | ------------- |
| GraphQL   | 16.7%   | 174,532       |
| MCP       | 87.5%   | 33,149        |

GraphQL managed only 16.7% success at 5× the token cost of MCP tools. The models could often discover root types and fields, but couldn't synthesize the right Linear-specific query shapes for compound tasks. Linear's API shapes aren't guessable from generic GraphQL intuition — the search root is `searchIssues`, not `search`; issue lookup uses `issue(id: ...)`; comments and relations use Linear-specific connection patterns.

We also tried other GraphQL variants, including raw schema-based access and a single generic `graphql.query` tool, which also underperformed MCP operations in our live Linear rerun. While GraphQL introspection gives self-description, our shell-based setup was expensive for agents to navigate under the benchmark's turn and action budgets.

The bottleneck in agents is using the right operations and arguments rather than query expressiveness.

## Benchmark Takeaways

In summary:

**Specs buy correctness, native MCP tools buy efficiency.** 53% → 76% with specs, then up to 92% with native tool integration.
**Descriptions matter more than hierarchy.** A tree without descriptions performed no better than a flat list (both 45.8%). Hierarchy needs to be descriptive.
**Descriptions and search help CLIs at scale.** Adding descriptions raised success from 46% to 79%; adding search lifted it further to 88% while cutting interaction cost.
**API familiarity changes the equation.** GitHub succeeded at 92% with raw priors. Linear managed 17%. The less familiar your API, the more discoverable surfaces matter.
**Query expressiveness ≠ agent-friendly.** A single GraphQL tool that can do anything was worse than ten specific tools that each do one thing well.

What this does _not_ settle is whether a hand-crafted, agent-first CLI could close the remaining gap. Our CLI was auto-generated from API specs. It also doesn't tell us what happens as models improve — the interaction cost disadvantage of CLI could matter less as tokens get cheaper.

It also does not test the "distractor tools" problem. Every task in this benchmark was intentionally a tool-using task, so we did not measure whether loading MCPs hurts unrelated work or causes false-positive tool use.

## On UX and Standardization

Our experiments answer the AX question, but the MCP-vs-CLI debate also involves UX and standardization.

### CLI has a maturity and UX advantage

CLI tools are often easier to install, debug, and reason about than MCP servers. Their quality is more consistent because CLIs have a proven track record refined for humans over many years. Importantly, CLIs can be dynamically loaded — agents can install new ones on the fly when needed. MCP servers, by contrast, hinges on harness quality, which only recently became usable.

Another advantage is CLI developers can hand-design their CLIs and guarantee how agents will end up using them. CLIs as an LLM interface are also valuable for harnesses that don't yet have strong native MCP support — if your harness can't orchestrate MCP tools well, a well-designed CLI may be the more practical choice today.

### MCP's advantage is as much social as technical

MCP's most valuable property is ecosystem coordination. The protocol is opinionated about what a harness should accept and how auth works for remote integrations. Standards force convergence in a way that a collection of good ideas doesn't.

The clearest example is auth. For HTTP-based transports, MCP gives the ecosystem a standardized contract around OAuth, including support for [CIMD (Client ID Metadata Documents)](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document) — a way for clients to prove their identity without pre-registration. Security, access control, and the auditability of standards, is a need when organizations grow large.

You could DIY all of the above by combining raw APIs with skills, prompting agents to read docs, or installing a CLI with its own auth layer — but that's not portable. If you implement proper CIMD for your CLI, you've [reinvented much of MCP's auth layer anyway](https://x.com/yenkel/status/2032098351567487037).

### Let the Harness Rip

A central question MCP raises is: **who should own context engineering?**

In early 2025, MCP builders hand-crafted their servers to compensate for weak models by creating custom tools, carefully shaped outputs, prompty descriptions — tricks to coax brittle agents through tasks. Much of that got steamrolled as models and harnesses improved.

If we assume that harness vendors — Anthropic for Claude, OpenAI for Codex — know best how to expose MCP tools to their own models, then using their native interface is the right default.

**Harness should own context engineering** because it knows its own model best. The server's job is to expose legible operations with typed schemas and useful descriptions.

The recent fashion for "agent-first CLIs" risks repeating the same mistake in a different form. Once you start building [agent-only CLIs, custom shell search, and output formats](https://joelclaw.com/cli-design-for-ai-agents) tuned to current model behavior, you're overfitting the interface to today's weaknesses.

The bitter lesson is the same in both cases: **don't over-optimize the interface**.

### What about skills and codemode?

One fair question is where [Skills](https://agentskills.io/) and [codemode](https://blog.cloudflare.com/code-mode/) (e.g., [executor](https://executor.sh/)) fit into this picture.

**Skills are for user-bespoke behavior.** They inject reusable instructions and domain-specific behavior into the model or subagents. That makes skills a better home for workflow-specific customization, while MCP should carry what is general to the tool itself. The general rule is: if it is bespoke to your team, it should probably be a skill. If it should be maintained by the vendor, it should live in the MCP. Private = Skill. Public = MCP.

Codemode sits somewhere in between a harness and a server. It adds a programmable layer around tool calls, often by running code in a sandbox and dispatching tools through that runtime. That is useful when the harness does not already give the model strong native code execution. But once the harness already has bash or code execution plus its own context-management loop, it's unclear if we need a separate executor.

### Great APIs first, derived surfaces second

If you've read this far, you might be motivated to handcraft better MCPs to [build something agents want](https://x.com/Calclavia/status/1982870423315546516).

But the key takeaway here is not MCP or CLI. Rather, developers should build their foundation upon a **high quality API**.

That's hard because building great APIs is about deciding what product surface you're selling, what the right abstractions are, and how to make them intuitive to both humans and machines. Stripe built a company on the principle that [APIs are products](https://stripe.com/blog/payment-api-design). When that design work is done well, the MCP layer is just packaging.

The best thing to happen to any protocol isn't for it to be the focus, it's _to be boring and forgotten_, like how HTTP silently runs our internet in the background.

## Wrapping up

So, why do we need MCP?

Because raw APIs and shell commands leave too much unspecified. Our benchmark showed a clear ladder where discoverable API docs, schemas and search improves CLI performance, but ultimately, MCP allows harnesses to provide the most optimized agent experience.

MCP is far from perfect. The user experience is rougher than CLI. The protocol has a lot of bloat for simple use cases. That criticism is fair, but standards do not win because they are elegant — they win because they are adopted. The [Dvorak keyboard](https://en.wikipedia.org/wiki/Dvorak_keyboard_layout) is probably more efficient than QWERTY, but it didn't matter.

MCP is not valuable because it is magical. It is valuable because it moves burden out of the model loop and into a reusable contract the harness can optimize around. It standardizes auth so it can scale as an organization grows.

In practice, MCP vs CLI is the wrong fight because they solve different problems. For **local tools** like git, docker, or ffmpeg, CLI is the native surface and MCP has no business replacing it. But for **remote services**, especially **large internal APIs** with zero training priors, or for **security-sensitive workflows**, a typed agent contract beats forcing every model through raw shell syntax.

So if you are using agents, prefer **CLIs for local tools** and **MCP integrations for remote services**, internal APIs, and security-sensitive workflows. If you are building for agents, design a good API first, then expose a simple MCP adapter on top. Let the harness do the rest.

_This research was conducted by the Smithery team. All data in this post is from the March 15–16, 2026 benchmark run. Code: smithery-ai/mcp-vs-cli-bench._
