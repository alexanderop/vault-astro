---
title: "The Future of MCP — David Soria Parra, Anthropic (AI Engineer Keynote)"
type: source
source_type: youtube
source_id: "v3Fr2JR47KA"
captured_at: 2026-04-19
url: "https://www.youtube.com/watch?v=v3Fr2JR47KA"
channel: "AI Engineer"
duration: "18:45"
publish: false
---

## Metadata

- **Speaker:** David Soria Parra (Anthropic, MCP co-creator)
- **Title:** The Future of MCP
- **Event:** AI Engineer Summit / Code Summit keynote
- **Channel:** AI Engineer (YouTube)
- **URL:** https://www.youtube.com/watch?v=v3Fr2JR47KA
- **Uploaded:** 2026-04-19
- **Duration:** ~18 minutes 45 seconds

### Speaker links

- X/Twitter: https://x.com/dsp_
- LinkedIn: https://www.linkedin.com/in/david-soria-parra-4a78b3a/
- GitHub: https://github.com/dsp

### Stated purpose

> In this Keynote, I will lay out what I believe will be true for agents in 2026 and how MCP plays a part in this. Let's take a look what connectivity for agents might look like.

## Transcript (auto-generated, lightly cleaned)

Well, welcome. Let's get started. This is an MCP application. That's an agent shipping its own interface, not through like a plug-in, not through an SDK, not rendered on the fly by the model on the client side or hardcoded into the product. That is something that is served over an MCP server. And you can take the server, put it into cloud, you can put it into ChatGPT, you can put it into VS Code, Cursor and it will just [__] work.

And that I think is kind of cool because for doing that you need something that a lot of things that we want in the ecosystem do not offer. You need semantics. You need to have both sides the client and the server to understand what each side is talking to, to understand how you render this, to understand that there's a UI coming. And for that you need a protocol. And the best part about this — an MCP server doesn't just ship an app, or can ship an app. It can also ship tools with it, and so you can interact with it as a human and you can have the model interact with it through tools, which is I think a very unique thing that I think we have not explored much just yet.

Okay, but let's quickly rewind a little bit from this what I think is a really cool glimpse into the future of MCP into over a year ago — 18 months, an eternity in AI life cycle. All of this did not exist. There was just a little spec document, a few SDKs mostly written by Claude, local only, with little more than just tools. And in that last 18 or 12 months, you guys have been absolutely crazy building stuff — building servers and crazy ecosystem around this. And we on our side have been busy busy taking this local-only thing, added remote capabilities, added centralized authorization, added new primitives like elicitation and tasks, and last but not least added new experimental features to the protocol like the MCP applications that you've just seen.

And in the meantime, we have reached I think a really cool milestone because again all of you have been absolutely crazy building and building — of course luckily with the help of a bunch of agents. We're now like at **110 million monthly downloads** and that's of course not just us and our clients and servers. That's OpenAI's Agents SDK, it's Google's ADK, it's LangChain, thousands of frameworks and tools that you might have never even heard of pulling it as a dependency, which means there's one common standard that all of us have at our disposal to speak to each other. Just a bit for context, React, one of the most successful open-source projects probably of the last decades, took roughly double the amount of time to reach that download volume.

And in the meantime of course you all have been building really really cool servers from little toy projects of WhatsApp servers and Blender servers, to building SaaS integrations like Linear, Slack and Notion that are really powering what everyone does every day when they use MCPs. But most importantly, the vast majority of MCP servers most of us have built are behind closed doors, connecting company systems to agents and AI applications.

But I still think this is just the absolute beginning of where we are, because I think 2025 was all about exploring, and 2026 is all about putting these agents into production. Because if you really think about it in my mind, 2024 we just built a bunch of demos and showed cool stuff to people and there was a little bit of a buzz there. 2025 was really all about coding agents. Coding agents, if you really think about it, are the most ideal scenario for an agent. It's local, it's verifiable, you can call a compiler, you have a developer who can fix [__] if it goes wrong in front of the computer. And you can display a TUI interface and the user is quite happy.

But I think now with the capabilities of the model increasing, we are going into a new era which I think this year will we will see this start, where we're not just doing coding agents. We're going to have general agents that will do real knowledge-worker stuff — like things a financial analyst wants to do, a marketing person wants to do. And they need one thing in particular. They don't need a local agent that calls a compiler. What they need is something that could connect to like five SaaS applications and a shared drive. Because the most important part for them for an agent is connectivity.

And in my mind, connectivity is not one thing. If someone tells you there's one solution to all your connectivity problem — be it computer use, be it MCP — they are probably pretty wrong. Because the right thing of course is that it always means it depends and there's a real big connectivity stack and there's the right tool for the right job. And in my mind there are three major things that you want to consider building an agent in 2026. It's **skills, MCP, and of course CLI or computer use** depending on your use case.

And they have three very distinct things that they can do and three different things you want to consider when you build your agent. Number one, skills of course is just like domain knowledge. It's just like captured specific capabilities put into a very simple file and it's mostly reusable. There's some minor differences between the different platforms. Of course, CLI is very popular when local coding agents — it's an amazing tool to get simply started, to have something that you can compose in a bash, that you — that the model can automatically discover what the CLI is capable of. And most importantly, if you have things that are like CLIs — like GitHub, Git, and other things that are in pre-training — CLI is an amazing solution for your connectivity part. And they're particularly good when you have a local agent where you can assume a sandbox, where you can assume a code execution environment.

But if you don't have this, if you need rich semantics, when you need a UI that can display long-running tasks, when you need things like resources, when you need to build something that is fully decoupled and needs platform independence, or you don't have a sandbox, when you need things like authorization, governance policies — or short to say, boring but important enterprise stuff — or if you want to have experiments like MCP applications or what comes soon, skills over MCP, then I think MCP is this additional connective tissue that is just yet another tool in the toolbox for you to build an amazing agent.

And so this is all to say that I think in 2026 we're going to start building agents that use all of it. They don't use one thing, they use all of it and they use them quite seamlessly together. But I don't think we're quite there just yet because we need to build a lot of stuff. Partially because our agents kind of still suck, and partially because I think we just haven't talked enough about some of the techniques you can do to really put this connective tissue together.

### Client-side: progressive discovery

The number one thing that we need to go and start building is on the client side, on the agent harness side, on the things that powers the connective parts, be it Claude Code, be it Pi, be it whatever application you're going to build. And the number one thing we're going to do there and what we all have to do and something I want to really get across today is that we need to go and start building something called **progressive discovery**.

Most people when they think about MCP, they think about context bloat. But if you really consider what a protocol does, a protocol just puts information across the wire, but the client is responsible for dealing with that information. And what everybody so far has done because we're in this very early experimentation phase is to simply put all the tools into the context window and then be quite surprised that maybe the context window gets large. But what you can do instead and what you should do instead — you should start using this progressive discovery pattern, which is to say use something like **tool search** to defer the loading of the tools and start loading the tools when the model needs it.

And we have this in the Anthropic product and the API. People can use this on competitors' APIs as well. But also you can just build this in yourself where you just download the tool directly. And the moment you give the model a tool-loading tool basically, and the model goes like "ah maybe I need a tool now, and let me look up what tools I need" and then you load them on demand. And here in this example, what you're seeing is on the left side is Claude Code before we added this to Claude Code and then after it to Claude Code. So you see a massive reduction in tool context usage.

### Client-side: programmatic tool calling (code mode)

The second part to that is something called **programmatic tool calling**, or what other people usually refer to as **code mode**. This is the idea that one thing that you really want to do is you want to compose things together. You don't want the model to go call a tool, take the result, then go and call another tool, take the result, call another tool — because what you're effectively doing is letting the model orchestrate things together. And in that orchestration, you're using inference. It's latency sensitive and all of its stuff could be done way more effective if you would instead write a script.

And in fact that's actually what you constantly do and what you constantly see things like Claude Code do when it writes the bash command. But you can of course do this with everything and you can do this with MCP and you should do this with MCP. So what does this mean? Instead of having one tool after another, you want to give the model a REPL tool — provide an execution environment like a V8 isolate or a Monty or something like that or a Lua interpreter, and just have the model write the code for you and the model just executes that code and then composes them together.

And there's a neat little feature in MCP called **structured output** that tells you what the return value of the output will be. And the model can use this information to figure out type information which then means it can really nicely compose these things together. And in this example here, instead of doing two different calls, you do one call and you can filter that. The model will automatically remove things from JSON and just continue. Of course, if you don't have structured output, you can always just ask the model to give you structured output by just extracting it and saying "Hey, call a cheap model and say I want this expected type, give it back to me." And bam, you have a type. The model can compose things together. And I think this is something we're just not doing enough yet. And this is I think something where we can improve our agent harnesses. And then last but not least, of course, you can just compose these things together with executables, with CLIs, with other components, with APIs as well.

### Server-side: stop converting REST 1:1

Next, what we need to do besides the client work, which is progressive discovery and programmatic tool calling, we need to go and start building properly for agents. And that means **we all need to stop taking REST APIs and putting them one to one into an MCP server**. Every time I see someone building another REST-to-MCP server conversion tool, it's a bit cringe because I think it just results in horrible things.

And what you should do instead — you should design for an agent. Basically, you can start designing for you as a human how you would want to interact with this, because that's actually a very very good start for an agent. If you want to orchestrate things together, you should reach of course for programmatic tool calling and you can do this on the client side as I said before. But you can also do this on the server side. The Cloudflare MCP server and others like that are great examples of how you can — instead of providing tools — provide an execution environment to the model and then just have them orchestrate things together, which again cuts on token usages, cuts on latency, and is way more powerful in its composition.

And then last but not least, you should start and we should start as server authors to use this rich semantics that MCP offers over alternatives. This means shipping MCP applications. It means shipping skills over MCP. It means using things like tasks and other aspects that the protocol offers that are currently slightly underused, or things like elicitations — things that only MCP can do for you.

### Protocol roadmap

And of course that's all the work you all need to do and maybe some of our product people need to do. We also need to do a lot of work on MCP itself. And there's a few things down the line that we're going to have to go and solve. The number one thing is we need to improve the core. There's a few things that as we have developed the protocol over the last year that are just not in a good shape.

Number one is that the current streamable HTTP is very hard to scale if you're a large hyperscaler. And so we have a proposal from our friends at Google who are working on something called a **stateless transport protocol** which makes it significantly easier to just treat MCP servers like another stateless REST server or something like that — we used to know how to deploy to cloud runs or Kubernetes and so on. So that's coming down in June and hopefully landing in the SDKs very soon.

In addition, we need to improve our **asynchronous task primitive**, which basically is a very fancy way to say we just want to have agent-to-agent communication. We have a very experimental version of the protocol that very few clients support. So we're going to start building more clients out like that. And most importantly, we are improving some of the little semantics that we need to do.

We're going to ship a **TypeScript SDK v2 and Python SDK v2** based on a lot of the lessons learned over the last year. There's a SDK called FastMCP. Who's using FastMCP? Yeah, it's just way [__] better than the Python SDK that we ship. Right. And that's on me because I wrote the Python SDK. And so I have a bunch of people who are way better Python developers than me help me write it better.

The second part is we need to start integrating everywhere. We're going to ship for particularly for enterprises something called **cross-app access**. It's a new thing that we're working closely together with identity providers — it just allows you — it's a very fancy way to say — once you log in once with your local company identity provider be it a Google, be it an Okta, you will be able to just use MCP servers without having to relog in. So it's a bit more smoothness.

In addition, we're going to add something called **server discovery** by specifying how you can discover servers on well-known URLs automatically. So crawlers, browsers, agents can just go to a website and say "Oh, instead of just parsing the website, is there also an MCP server I can use?" And we will be able to automatically discover this. This is a really cool thing that will come down also in June when we launch the next specification and will be supported there.

And then last but not least, we are starting to use our extension mechanisms in MCP which means that some clients will support this — like for example MCP applications will only be supported by web-based interfaces because if you're a CLI you just have a hard time rendering HTML, right? And we do more of these extensions. One of the most exciting extensions that I think is cool — we're just going to ship **skills over MCP** because it's very obvious that if you have a large MCP server with tons and tons of tools, you just want to ship domain knowledge with it and say "Oh, this is how you're supposed to use this." And it allows you as a server author to continuously ship updated skills without having to rely on plug-in mechanisms and registries and other stuff. So that's coming down. There's a lot of experimentation from people already in that space. You can already do some of that today if you just give the model a load-skills tool. You can build primitives or versions of this today without having to rely on the semantics. But of course, we're going to define the semantics.

### Wrap-up

Okay, so that's for me a long-winded way to say that I think MCP is actually in a really good shape and I think in this year we're going to push agents to full connectivity. MCP will continue to play a major major major role and we want of course your feedback. We are very open community. We just have created a foundation. We're mostly running as an open-source community with a Discord, with issues. Just come to us and tell us where we are wrong, what are we getting right, so that we can improve this on a continuous basis.

So 2026 I think is all about connectivity and the best agents use every available method. They will use computer use, they will use CLIs, they will use MCPs, and they will use skills because they want to have a wide variety of things they can do, and then they can ship cool stuff like this — which is one of the product features we shipped recently, under the hood it's nothing but an MCP application that renders stuff. Right? Cool. So we can now look at the model writing graphs. Anyway, thank you.
