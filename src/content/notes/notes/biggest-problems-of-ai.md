---
title: "Biggest Problems of AI"
type: wiki
wiki_role: synthesis
status: seed
source_ids:
  - ai-assistance-reduces-persistence-and-hurts-independent-performance
  - cognitive-debt
  - ex-google-officer-speaks-out-on-the-dangers-of-ai-mo-gawdat
  - ai-expert-we-have-2-years-before-everything-changes-tristan-harris
  - the-day-after-agi
  - the-ai-vampire
  - 90-of-my-skills-are-now-worth-0
  - detecting-ai-slop-with-distance-from-main-sequence
  - stop-slop
  - vulnerability-research-is-cooked
summary: "Synthesis of the biggest problems of AI as covered across the wiki — deskilling, cognitive debt, existential risk, job displacement, quality degradation, security threats, and geopolitical traps."
tags:
  - ai
  - ai-safety
  - future-of-work
  - philosophy
date: 2026-04-10
updated_at: 2026-04-10
---

## 1. Deskilling and Reduced Persistence

[[ai-assistance-reduces-persistence-and-hurts-independent-performance]] presents causal evidence that AI assistance optimized for instant completion measurably reduces persistence and weakens independent performance after just 10-15 minutes of use. People who used AI for direct answers performed worst when the AI was removed. The paper calls current assistants "short-sighted collaborators" that optimize immediate helpfulness over long-term autonomy. The distinction between answer-seeking and hint-seeking use is critical — hints preserve learning, answers erode it.

## 2. Cognitive Debt

[[cognitive-debt]] argues AI accelerates code production faster than human comprehension can follow. The resulting understanding gap is more dangerous than technical debt because it's invisible until the team hits a wall. Warning signs: change paralysis, knowledge silos, black-box syndrome. Teams generate a week's worth of code in an afternoon but lose the shared mental model needed to safely evolve the system. At least one human must fully understand every AI-generated change before it ships.

## 3. Existential and Safety Risks

- [[ex-google-officer-speaks-out-on-the-dangers-of-ai-mo-gawdat]] frames AI as humanity's greatest existential challenge with "three inevitables": AI will happen, it will become smarter than us, and bad things will follow.
- [[ai-expert-we-have-2-years-before-everything-changes-tristan-harris]] warns about the race to build a "digital god" — recursive self-improvement, emergent self-preservation behavior (the blackmail example), and AI that can "hack language" to hack civilization's infrastructure.
- [[the-day-after-agi]] captures Amodei and Hassabis identifying five risk categories: **control** of autonomous systems, **individual misuse** (bioterrorism), **state misuse** (authoritarian deployment), **economic disruption**, and **unknown unknowns**.

## 4. Job Displacement and Value Capture

- [[the-day-after-agi]]: Amodei predicts "half of entry-level white collar jobs could be gone within 1-5 years."
- [[the-ai-vampire]] identifies the value capture problem: if AI makes you 10x productive, the fight over who gets that surplus is destroying people on both sides. AI coding is addictive like a slot machine and creates unsustainable "unrealistic beauty standards" for productivity. Yegge's proposed solution: a 3-4 hour workday reflecting the real cognitive load.
- [[90-of-my-skills-are-now-worth-0]]: Kent Beck argues 90% of traditional skills have lost economic value; only the remaining 10% get a 1000x leverage boost. The question is identifying which 10% to double down on.

## 5. AI Slop and Quality Degradation

- [[detecting-ai-slop-with-distance-from-main-sequence]] shows AI-generated code fails architecturally in predictable ways — brute-force implementations, hallucinated complexity, missing cohesion. Code that compiles but rots. Normalized Distance from Main Sequence (D) is the best metric for catching this.
- [[stop-slop]] tackles the prose side: AI writing has a recognizable signature of throat-clearing, emphasis crutches, and false agency. The fix is prompt-level quality filters.

## 6. Security Threats

[[vulnerability-research-is-cooked]] describes how AI agents already generate validated zero-days with trivial bash scripts. The "attention scarcity shield" that protected unglamorous targets (routers, printers, IoT) is gone — when elite attention costs epsilon, everything gets targeted. The real danger isn't the exploits themselves but bad regulation coming in response, imposing asymmetric costs on defenders.

## 7. Geopolitical Trap

[[the-day-after-agi]] and [[ai-expert-we-have-2-years-before-everything-changes-tristan-harris]] both describe a competitive trap: no nation or company can unilaterally slow down without losing to competitors. Amodei compares chip exports to "selling nuclear weapons to North Korea." International minimum safety standards are needed but current geopolitics makes them unlikely.

## Gaps

- **Bias and fairness**: No dedicated notes on algorithmic discrimination or training data bias.
- **Hallucination**: Mentioned in passing but no deep treatment as a standalone problem.
- **Copyright and IP**: No coverage of training data legality or generated content ownership.
- **Energy and environment**: No notes on the environmental costs of AI training and inference.
- **Misinformation at scale**: No coverage of deepfakes or synthetic media campaigns.
