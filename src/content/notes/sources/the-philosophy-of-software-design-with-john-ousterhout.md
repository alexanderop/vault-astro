---
title: "The Philosophy of Software Design – with John Ousterhout (The Pragmatic Engineer)"
type: source
source_type: youtube
source_id: "lz451zUlF-k"
url: "https://www.youtube.com/watch?v=lz451zUlF-k"
captured_at: 2026-04-18
publish: false
tags:
  - software-design
  - ai
  - complexity
authors:
  - john-ousterhout
  - gergely-orosz
podcast: pragmatic-engineer-podcast
---

## Metadata

- **Title:** The Philosophy of Software Design – with John Ousterhout
- **Channel:** The Pragmatic Engineer
- **URL:** https://www.youtube.com/watch?v=lz451zUlF-k
- **Host:** Gergely Orosz
- **Guest:** John Ousterhout (Stanford, author of _A Philosophy of Software Design_, creator of Tcl/Tk, inventor of Raft)
- **Captured:** 2026-04-18

## Full Transcript

Right now there's a huge explosion of AI and LLM tools.
How might this change software engineering?
There's things that seem relatively clear and things that seem less clear.
I think on the relatively clear side is that the AI tools will make it easier to churn out low-level code as you call it autocomplete.
Autocomplete will get better and better.
Could actually be reasonably high quality code that gets turned out.
So it seems like that will probably happen.
Then the big question is to what degree can the AI tools actually replace the higher level design tasks?
I don't know the answer to that.
So far, I don't see anything in the current tools that makes me think they're going to do that.
But what's interesting about this, I think, is that by handling more and more of the low-level programming tasks, what software designers do is going to be more and more design.
I think software design is going to become more and more important.
That'll be a larger and larger fraction of where developers spend their time, which makes it even more sad that we don't really teach software design in our universities at all.
John also is the author of a philosophy of software design and currently a professor of computer science at Stanford.
John co founded two tech companies worked at some micros systemystems created a TCL scripting language and invented the raft consensus algorithm that is used across databases and systems like MongoDB, Cockroach DB, Cafka and others.
In our conversation, we cover the impact of AI on software engineering and why software design could become more important than before.
the concept of deep and shallow modules and why deep modules are so important to deal with complexity in software.
John's advice on error handling commenting and why he suggests avoiding test-driven development and many more topics.
If you're interested in practical software design tactics and strategies and want to take a step back from tactical coding, this episode is for you.
If you enjoy the show, please subscribe to the podcast on any podcast platform and on YouTube.
Welcome to the podcast.
Thank you.
I'm excited to be here.
You have been working in academia at Stanford for quite a while but you were in the industry beforehand.
What made you change from working at tech companies from founding your own companies to to academia and you know why did you do it?
I've always wanted to do both academia and industry.
When I got my PhD I I debated what to do because I love the creative freedom of academia and I love teaching also but I also love building real software.
For me, coding is one of the passions that I I live for in my life.
And so, I always kind of figured I'd probably do both over my career.
But when I got my PhD, the advice I was given was if you're going to do both, it's always better to do academia first because it's easier to switch from academia to industry than the other way around.
So, I went to Berkeley, had a fabulous 14 years there.
But over time, the this nagging feel for wanting to build commercial software had had built up.
And so, I finally decided to take the plunge.
I gave up my position at Berkeley, moved to Silicon Valley, worked at Sun for a few years, started a couple of only moderately successful companies and and had a great time doing that.
Just learned a ton of stuff doing startups.
Uh but over time, the the nagging of sort of the call of industry kind of built up in me and I gradually realized although I liked doing startups that I think being a professor is my that's my real sort of true passion in life.
So after doing startups for 14 years, I was fortunate enough to get a position at Stanford and I've had another 14 or 15 years back at Stanford where I've been really happy.
So it's been really fun.
Really fun getting to see both sides.
And honestly, I think you know doing both has actually made me better at both.
What what do you see I talk with a lot of people obviously who are only in the industry and maybe they're thinking of at one day doing academia.
I I at some point thought of this myself.
My my my dad is a university teacher or was a university teacher and obviously there's people in academia.
Having done both, what what are big differences between you know as we call the tech world which is industry and an academia.
Well, first it wasn't as different as I thought it was going to be when I went to industry because in both cases you're well particularly doing startups because in both cases you're working with a relatively small team.
You're trying to do something relatively new uh you know trying to build software that really works.
So even when I was in academia, we tried to build stuff that really works, not just sort of throwaway research prototypes.
So in many ways it wasn't that different, but in other ways it was.
And that you deal with a much broader spectrum of people, you know, salespeople and marketing people and financers and venture capitalists.
That was one of the fun things about it is seeing a much greater diversity of people.
I would say the difference that contributed to my going back to academia.
I would say one of the downsides of industry is that there's tremendous pressure in startups particularly to make yourself look bigger and better than you are.
You know, you're trying to survive and get funding and so there's a lot of pressure to spin your company and exaggerate and market yourself.
I mean, everybody does it to some degrees.
Some people do it in ways so extreme it's illegal.
They get in trouble.
But that kind of bothered me and within my companies know of course we had to market ourselves externally but internally we tried to be very honest and we're not going to I don't want to hear lies and spinning internally because that puts our company at risk if you do that but nonetheless the thing I like about academia is you do a project some of them work some of them don't.
If a project doesn't work you just say oops okay that wasn't a good idea here's why and you go on to the next thing.
in a company if it's not working you can't really say oops that didn't work sorry everybody we're shutting down tomorrow you try and somehow figure some way around it so so I think that was the thing the one thing about industry that I liked least this episode is brought to you by code rabbit the AI code review platform transforming how engineering teams ship faster without sacrificing code quality code reviews are critical but timeconuming code rabbit acts as your AI co-pilot providing instant code review comments and potential impacts of every poll request request.
Beyond just flagging issues, code driver provides one-click fix solutions and lets you define custom code quality rules using a graph patterns, catching sub issues that traditional static analysis tools might miss.
Code Rabbit has so far reviewed more than 5 million pull requests, is installed on 1 million repositories, and is used by 50,000 open source projects.
Try Code Rabbit free for one month at rabbit.ai using the code pragmatic.
That is code rabbit.ai and use the code pragmatic.
This episode is brought to you by modal, the cloud platform that makes AI development simple.
Need GPUs without the headache.
With modal, just add one line of code to any Python function and boom, it's running in the cloud on your choice of CPU or GPU.
And the best part, you only pay for what you use.
With sub-second container start and instant scaling to thousands of GPUs, it's no wonder companies like Sunno, RAMP, and Substack already trust Modal for their AI applications.
Getting an H100 is just a PIP install away.
Go to modal.com/pragmatic to get $30 in free credits every month.
That is m o d.com/pragmatic.
Now, you know, thanks to you having worked in academia as well and and and you taught a course which which we'll later talk about, but which you wrote this book, The Philosophy of Software Design.
And a lot of people in the tech world who I talk with point to this book as one of the best books that that gives them specific actionable things, ways to think about software design.
And I just want to go go into some of the things into the book.
uh people who've read it will find this refreshing and people who haven't mind it as new ideas.
In the very beginning of the book in chapter I think two or three in in in the first like 10 or 15 pages you write about something called tactical tornadoes and let me just quote a little bit from from from this uh you wrote a tactical tornado is a prolific programmer who who pumps out code faster than others works but does it in totally tactical fashion.
When it comes to implementing a quick feature, nobody gets it done faster than a tactical tornado.
In some organizations, management treats tactical tornadoes as heroes.
However, tactical tornadoes leave a wave of destruction behind, and typically other engineers must clean up the messes left by this tactical tornado.
So, I I wanted to ask you first of all, how did you come across your first tactical tornado?
And why do you think these types of folks are still around in most companies?
because I I had an aha moment when I was like, "Oh, yeah.
I I I know the tactical tornadoes as well." I I can't point to a specific incident or person and I wouldn't want to identify them anyway, but but I've encountered them over my career.
I bet everybody who has significant software development experience has encountered these people over your career and just kind of observing them uh and the frustration with that, you know, I think it's just a particular personality type.
There are people who are very uh very detail focused and sort of closers want to get absolutely everything right and they finish everything and there's people who are they love getting started on projects and doing the first 80 or 90% but that last 10 or 20% doesn't matter to them so much and they're not you know there's just like there's there's neater people and there's sloppier people in the world so the technical is just sort of sloppy they don't care about you know leaving croft behind it doesn't really bother them at all it's it's just a personality type.
So I I suspect they'll always be there, particularly because some organizations value speed above all else, especially startups, right?
Yeah.
Yeah.
A lot of Right.
Right.
There are startups that are probably completely staffed by tactical tornadoes.
You call them tactical tornadoes, but like some of the synonyms that came into my mind as I was thinking of of what people use, sometimes they use a 10x engineer, especially when management sees, oh, they just get things faster.
Sometimes it you know like it's a hacky way of doing things or someone who just hacks quickly or at some point maybe a decade ago people called it a hacker but in in a way of working fast but I I don't think we have that anymore but there are a lot of lot of cases it is a a positive thing uh indeed well I would positive initially when I think of 10x engineers and the way Google define it I don't think of this as technical tornadoes I think of these are people who come up with the really clean designs that can be implemented in very small amounts of code.
And so they might actually write less code per day than other people, but the functionality that they implement is way higher and it comes with higher stability and evolvability and so on.
So to me at least that's the 10X engineer.
I agree with you.
I'll just add the note that I think the 10x engineer is so ambiguous that it means different for every person and like and especially so when I've when I've seen it was mostly less technical CEOs refer to my 10x engineer who was a tactical tornado because what they saw is oh I'm getting output they're not saying no they're building it but of course they had trouble understanding the tech depth that is going into there how it's slowing others down and you know some of the people that you talked about in this environment might have not been perceived as a 10x engineer by uh this person who didn't really who is not that close to the code and I I totally agree with you by the way on but this is probably a good reminder of you you know like everything's relative right like it everything is based on your vantage point if if you are close to the code you're technical you will value other things you should value other things than than you know I think a lot of this comes down to strategic versus tactical again there are people who value all the short-term stuff and there are people who value place more emphas design is all about the long-term stuff, but as you've said, there are many people who think of it all in terms of short-term stuff.
And so, I can see how they would have a different idea of what a 10x engineer is.
And speaking of long long-term versus short-term, one thing that came to my mind reading rereading this tactical tornado part is right now there's a huge explosion of of AI and LLM tools, which are as as as you're probably seeing it, they are really good at generating code rapidly.
A little bit like the tactical tornado to be honest.
You can prompt them.
They can do short, they can do long, they can do autocomplete, they can do all skeletons.
I was wondering so far what you've observed.
What do you think the long-term impact of these tools?
If we assume that this is how they're going to stay, let's just assume that, you know, will every engineer will have tactical tornadoes at their fingertips and who do not say no and they they will, you know, turn out code.
How might this change software engineering?
That's a really interesting question and I wish I knew the answer.
I don't.
I can only I can only guess.
I think, you know, I think we're going to see big changes over the next 5 to 10 years and it's really hard to predict what direction they're going to go.
What seems there's things that seem relatively clear and things that seem less clear.
I think on the relatively clear side is that the the AI tools will make it easier to churn out low-level code.
As you call it, autocomplete.
Autocomplete will get better and better.
And I think it won't necessarily be be sort of tactical tornado stuff.
It could actually be reasonably high quality code that gets turned out.
So it seems like that will probably happen.
Then the big question is to what degree can the AI tools actually replace the higher level design tasks.
And you know I don't know the answer to that.
So far I don't see anything in the current tools that makes me think they're going to do that.
But, you know, never underestimate what could happen to this.
But, but what's interesting about this, I think, is that by by handling more and more of the low-level programming tasks, what software designers do is going to be more and more design.
So, software I think software design is going to become more and more important.
that'll be a larger and larger fraction of where developers spend their time, which makes it even more sort of sad that we don't really teach software design in our universities at all.
So, the skills we're teaching students may actually be the skills that are going to be replaced by the AI tools.
Can we just double click on software design?
How do you see software design?
What is it and and why is it important?
And the reason I'm asking the question, it's a it's it might seem like a naive question, but these days you really can get started building an application by, you know, create taking a template uh using it, you know, you you will soon be able to prompt an AI tool that will generate things for you.
How do you think about software design?
You know, it's abstract, right, by by nature.
So, well, I think of it as it's a decomposition problem.
It's how do you take a large complicated system and divide it up into smaller units that you can implement relatively independently.
And by the way to me I often when I give talks I often ask people what do you think is the most important idea in all of computer science and ask the audience to me I think decomposition that's the key thing that threads through everything we do in computer science.
How do you take large complicated problems and break them up and that's design and then implementation is when you go about the individual pieces but again you may do more design of those to break them up into still smaller pieces but that's the way I think about software design.
Now an interesting thing that I've noticed over the past few decades is about 20 years or so maybe a little bit more there was a lot of focus on on architectural practices that felt closer to software design things like TDD testdriven development architecture approaches like architecture patterns I think they were called design patterns a gang of four different like factory etc patterns however the focus seems to be moving away at least at least in the industry for there's fewer people referencing the the these models, these ideas.
From your observation both in academia and industry like why do you think this this might have been why did we have such a big focus on architecture design topics 10 or 20 years ago and may maybe just were talking about it less or maybe even been thinking about it less.
Well, you know this of course there's always fads that everybody gets excited about and they gradually fade away.
So maybe maybe that's part of it.
Now to me the things you mentioned TDD and patterns I don't think of those as design uh certainly not TDD in fact I I would argue if you want to get into a TDD discussion we could have that but I would argue it actually works against design patterns that's an alternative to design that is rather than designing something you pull something off the shelf and I think I think where it works it works certainly there's areas where of course if a pattern works you should just use it but to me that only addresses a tiny tiny fraction of what I think of as software design.
There there's so much more to design than just picking one of a half a dozen patterns.
When you're starting to when you're building new software and you're saying, "Okay, I'm I'm going to start to design like how how do you start designing?
Is it a sitting down pen and paper?" And if if if we can talk about something specific, I I think that could be even useful if there was a project that that you did because I'm just really curious about your you know thinking.
I I can't give a recipe for design.
I wish I could kind you know follow these steps in this order and you'll get a great design.
Uh I wish I could but you know there's two general approaches each of which has its pitfalls is the top down approach and the bottom up approach.
I think what people tend to use particularly uh less experienced engineers or people who are in a domain that they're not familiar with is you do bottom up.
You just say okay I'm going to need this functionality of this system.
I have no idea what the overall system is going to look like, but I need this piece.
So, I'll just build this piece.
And then you pick another piece and you build it.
You pick then you start trying to put the pieces together and you gradually layer in your design.
The so that's the bottom up approach.
The top down approach is you start at the top and you try and break the system up into what you think are relatively independent components and then decompose those until you eventually get something that that you can design.
My personal and by the way in the 1970s back when I was in graduate school there was a big discussion about should you do design top down or bottom up and people argued about it.
My personal opinion is that it's hard to do either one pure that the actual process design is some combination where you think about big pieces and then you start thinking about some little pieces and you build some stuff and you discover actually didn't work very well.
you throw it away and you build some more stuff and it's this iterative kind of back and forth process.
And it's it's interesting that you mentioned the two the two ways because in the book the book itself starts with you you're writing how design is all about managing complexity and then you bring these two approaches.
Well, what are the two approaches to complexity?
So one is that there are certain things you can do with design that simply eliminate complexity completely.
Yeah.
eliminating working on special cases and things like that.
So those are the best most powerful approaches but you can't eliminate all complexity.
So then the second approach is where you use modular design where you basically try and hide the complexity that is you take things that are relatively complicated and put them off to the side where you where somebody can solve this problem and deal with this complexity and nobody else in the system has to be aware of that complexity.
So those were the those were the two overall ways of of dealing with complexity.
Yeah.
And and good software design will help us deal like wrangle complexity, right?
Do do I sense that?
That's that's one of the it'll do with both of those.
It will both give you ideas for how to eliminate it and also for how to again modularize it so most people don't have to be aware of most of the complexity.
One interesting idea that I it resonated with the book is is you wrote uh about how it's worth designing things twice.
In fact, this is a whole chapter in the book, chapter 11.
It's it's called designing it twice.
And you wrote, I'll quote from you.
Unfortunately, I often see smart people who insist implementing the first idea that comes to mind, and this causes them to underperform their true potential.
It also makes them frustrating to work with.
Uh how did you come across this this observation?
And one more thing that you added is it doesn't take more time to design uh twice than what most people think.
Yeah.
So first the way I came across this is because I've been a professor at both Stanford and Berkeley which are you know two of the the top universities in the world and both places get brilliant graduate students and I've noticed it's common for students at both places to have bad work habits and the reason is all their lives everything's always been easy for them.
They've always been the best at everything they did in high school they were smarter than their teachers in college perhaps as smart as their professors top of their class.
their first ideas, just the first thing that come off their mind was always good enough to get great grades.
And so there's never been any real incentive for them to think twice.
And they and I think they start kind of latching on to the idea that whatever comes to my mind is going to be good.
But, you know, as you get into harder and harder problems, that characteristic goes away.
And and particularly when we're doing research at top universities, honestly, we're working on really hard problems.
Nobody's first idea is going to be the best idea.
And so it's I often have to work with students to force them to think about things.
And so for example, a common technique I will use is I will say, suppose I told you that you may not implement this thing you just suggested.
And if you try and do it, I'm going to stop funding you and have you thrown out as a grad student.
What would be your second approach?
Would you come up with something or would you say, "Okay, I better look for a new adviser." And the interesting thing is, and by the way, I say this typically when I think there's a better way of doing it.
And when I force them and they go away and come back, the second idea is always better.
It's better.
And I've seen this myself.
Um the the best example I can think of over my whole career was when I was designing the TK toolkit, which is a part of the Tickle TK system.
And I was trying to figure out what should be the API for programming graphical widgets.
And I spent actually like a I think it was mostly a long airplane ride and I basically did two designs for this.
I did kind of the first idea that came to mind and then I said, "Okay, suppose I'm going to throw that out.
What would what would be something that's really different that I could do?" I did a second one.
And after comparing them, I ended up choosing the second idea.
And honestly, that was one of the best ideas I've had in my professional career.
the the one of the things that made Tickle TK popular was the the API for TK was just a very sweet, simple, powerful API and it was my second choice.
It was the second thing that came to my mind.
So I have that example that always motivates me and when I'm doing new things, I usually try and force myself to think of two ways.
Even if I think one of them is really bad, even come up with a what you think is a bad alternative and compare it to what you did.
You'll learn something from that and you may discover the bad thing wasn't as bad as you thought it was.
I'm actually starting to realize when when I worked at Uber, we had this concept of design docs, RFC's where you were expected to just, you know, like write down why you're doing something, how you're doing it, etc.
And after a while, we start to add a thing called trade-offs or alter no alternatives considered.
And we were asking people like write down at least one ideally multiple arts alternatives considered and and we we did it because we it just like we got better, you know, designs, ideas, plans, etc.
And better discussions as well because it was clear why why you wouldn't do it.
And now I'm just reflecting on what you said on like yeah well we were kind of doing a little bit of what what you were saying forcing people to not stop either not get their first idea or put put down others as well and compare them.
But what you said often times it will be people just doing you know okay here's some things that will surely not work and usually fair enough it doesn't work but then sometimes like oh actually that's a simple thing and we could just use that instead or maybe we combine these two things together.
Yeah.
Yeah.
And you know you asked about does this take a lot of time and slow down the process.
Well it will take some extra time of course nothing is free but honestly the design at this level is a very high level design.
This is not it's not like we're completely building a second alternative.
It's I kind of think at the high level.
So with tickle and TK this TK design I might have spent maybe a few days on the design thinking about these two alternatives and comparing them but then it took a year you know to implement TK or more than that.
So we're talking something on the order of one or 2% of the total time to to build a system.
It's just it's not that big of a deal.
And if it gives you a better design, you get back way more than one or two percent.
Yeah, I I feel this is a lesson that people, teams, engineers learn again and again.
You know, first there's always a point where you jump into coding, I'm faster, and then when it's complex enough, you learn, oh, we probably should have planned a little bit better.
I would have saved myself time.
And then after a while, the the cycle goes into like too much planning or people feels too much planning and then it starts again.
So I I feel there's a little bit of never- ending cycle you know there people still talk about waterfall which which used to be a thing like 20 or 30 years ago it's not really a thing but like there is some disdain especially for fastmoving teams in planning too much because it's seen as you know too much talking not enough doing so well and and I get that too.
So, you know, the I think the fundamental thing about design is it always involves tradeoffs.
And if you take any one idea and you push it too far, you're probably end up in a bad place.
So, this idea about, you know, doing multiple designs and you could certainly take that too far also.
And I I think one of the things that that separates the really good designers from the not as good ones is they kind of know how to make those trade-offs and how to combine these different ideas and different phases and balance them off.
And that's the kind of thing probably you just have to learn from experience.
You know, you try you try both approaches and see the the bad problems with them and then you eventually get a gut feel for what the trade-offs are.
Now in in the book, one idea that stuck with me is this concept of deep modules and shallow modules.
And you introduce this concept that a deep module is something a piece of code or or functionality or well a module that has a pretty simple interface but it has a lot of depth to it.
It has a lot of functionality complexity.
And then a shallow module is something that has a you know wide interface but it it doesn't do too much.
So it it kind of it almost it might be even transparent in in some points that it it it it doesn't do much hiding.
And in the book you you emphasize how deep modules are are important for good software design.
Why is this so?
And how did you again like come across this realization?
Well, it all comes back to complexity and and everything in the book really derives from this idea about how do we uh eliminate or manage complexity.
And so a deep module is what gives us leverage against complexity.
And this the way it does that is it provides this very simple interface.
So people using the module have almost no cognitive load very easy to learn.
But inside the module there's a tremendous amount of functionality and and complexity that is hidden from everybody else.
And so that's I in the deep notion I was trying to capture capture the tradeoffs.
And basically it's this trade-off between two things.
The the complexity of the interface and how much functionality you have in the module.
And so what you want to do is have get the you know the most functionality you can for the simplest possible interface on top.
In the book you have a chapter titled defining errors out of existence and and in this one you talk about error handling.
What is your take on error handling and how to design for you know sensible error handling?
Right.
So again, this comes back to the the complexity issue and and anybody who's built a lot of software knows that error handling is a huge source of complexity by basically it's you know it's all the special cases all these weird special cases you have to deal with and so it's easy for the for error handling to impose tremendous complexity on software.
So then the question I I'm constantly asking myself is how can we reduce the impact?
I mean we do have some situations we have to deal with.
there's there's some you know there's many exceptions you simply can't be avoided they're fundamental to the system so you have to deal with them other cases where they're not so important so in that chapter what I was trying to argue is that exceptions having more exceptions is not better it is sometimes necessary but I I sometimes think that designers think that the more exceptions I throw from a class the better a programmer I'm being I'm being a more cautious careful programmer and and I would No, the problem is every exception you throw is imposing complexity on the users of your class.
And so if you can if you can reduce the number of exceptions you throw, the number of special cases you generate that will reduce system complexity and I gave a bunch of examples in that chapter where in fact by just a slight change in the design of the system whole classes of errors simply disappear.
They can't happen.
then there is no error to deal with.
But but I will say this is something that this happens occasionally but you have to be very careful about this.
And in the in the class I teach on software design students have virtually every class there are people that that misunderstand this.
And in the first project they have essentially zero exception handling.
They're building a distributed server where machines can crash and they have they don't even check for errors in the network.
And I say, 'You have no error checks here.
What happens if a system crashes?
And they say, 'Oh, we just defined those errors out of existence.
And I said, 'Well, uh, no, the errors are still there.
You're just ignoring them.
You can't do that.
Yeah.
So, anyhow, I think this this is a chapter I have to warn people about.
It's really easy to take this one in in in bad directions.
Be very It's kind of like a spice.
You know, you use tiny amounts of it in your cooking and you get a good result, but if you use very much, you end up with a mess.
Yeah.
But I I I feel errors, exceptions, things going wrong, they're they're one of the things that are we don't really talk to enough about it when we think about design.
When I look at outages, I I remember a lot of outages that we had specifically at at Uber, but even at other companies, a lot of the times when we looked into what caused it, it was, you know, like a mishandling of of an error.
it came from one system, we mapped it incorrectly as a success.
And there was a lot of these edge cases which were we we misunderstood either errors or unexpected responses.
You know, they're all the same thing.
It it was something with errors.
And I think we struggled to put a finger on it.
You know, we we we looked at ways of like, okay, let's map map responses better.
Let's have white list.
Let's have blacklist.
But during the planning phase, I don't really remember.
I I feel for planning people tend to be optimistic of here's how it work here's how the the these things will communicate and I rarely recall planning sessions where we thought okay what what could go bad what will how will we catch it how will we will we cover so it's it's just I think you make a good point in that I I think people don't they I don't think exception handling is top of people's mind when they are doing the overall system design it just sort happens tactically as people discover potential problems.
The Yes, this this is I think you're you're putting what I'm trying to to put as this observation.
It's just a very interesting one.
So the one general piece of advice I have for people is that when you're building a module and thinking about what kinds of special cases and exceptions you're going to export through your interface, you should think about how you think the callers are going to deal with these and try and put yourself in the mindset of the user as you're thinking through these and and see rather than having 10 different exceptions kind of is that actually there's only really two different ways people are going to handle this and so I can boil it all down into two kinds of exceptions rather than 10 kinds of exceptions for example.
Uh so I I think the key thing is to think about it from the caller standpoint.
By the way that that brings me to I think what what I think is one of the most important attributes of a really good designer which is what is it?
they can change their mindset and think about things from very different point of views.
So when I'm designing a module, you know, I'm I'm thinking about all of the details of that module, but then I can change my mindset to think about the user of this module and realize I don't want to be have any awareness of those details.
And in particular, you know, when I'm using a module, I don't want to take advantage of how things I might know about the insides of that module.
I only want to use things in the interface.
And so being able to shift your mindset and think about things at one point, but then completely put those out of your mind and take a totally different view some other time.
That's really powerful.
That's how you come up with good designs, I think, is again is you're when you're designing something, you can also think about it from the standpoint of somebody that's going to be using it.
Interesting.
So are you saying that having empathy and having be being able to you know put yourself in the shoes of another role may that be a customer another developer you know the another developer who will be working on this that will that could make us a better software engineer.
I was about to say the word empathy.
Yes.
What I was going to say is I think this skill set has tremendous value in social context as well as an engineering context.
the ability to think about things from some other person's viewpoint.
By the way, one of the things I love about computer science, people, you know, people think of us as these sort of geeky, nerdy people, but but many of the ideas that we use in computer systems actually have interesting analogies in social systems as well.
Yeah, it's it's just interesting because when I you know I I sort of off like you as a on a software engineering journey you know start to learn to code go to college get my first job etc.
Initially I thought the hard part is the coding and every developer I talk to or every engineer I talk to above a certain certain years we always have this discussion that the hardest part in in software engineering computers and programming it's the people you know when we think back of after your first few years once you get the syntax and and you learn how to debug and those things you think about what was the hardest project I was what was the biggest problem what caused me the most headache and it's often times miscommunication you know like we misunderstood each the spec was off etc.
Uh, of course there's outages as well, but what usually the root cause is we did not expect this to happen.
We didn't have the empathy for the the user and and yeah, it it usually and the biggest one is is conflicts with with teammates with with people that that you work with.
It's all human things.
It's it so it's it's it's interesting.
You know, there's this joke that the hardest thing in computer science are, I think, caching and naming things, but I will add people as well.
Yeah, that sounds interesting.
Yep.
One one thing that in your book you don't touch on.
Uh, of course, you know, the book cannot touch on anything, but it's a practice that a lot of teams and and tech companies use is these things called design reviews and discussions.
The idea is that someone before building a system will write down a plan.
Um, people will either have a meeting.
Uh, Amazon famously has this writing culture where people get get into a room and they they read the plan and then they discuss.
In other places it's done with Google Docs uh and and even some others like like Figma they use their own tools to kind of like draw visuals and comment on it.
What what is your take of building a system explaining a plan either whiteboarding or other ways and then kind of criticizing each other's plans?
Have have you either done this to some of the things that you do?
Do you encourage students in your class on design classes to do this?
Oh yeah, we do this.
Certainly all the projects I work on and certainly when I was doing startups, we would do design reviews.
They were relatively informal.
We didn't have Oh yeah.
You know, lengthy written documents, but we get together and talk about ideas.
And this is where again, you get the multiple designs and you talk about the trade-offs.
And you know, it's just if you can get multiple minds to think about a topic, it's pretty clear you're going to come up with better ideas than if just one person does it.
Again, this is how this is an area where smart spark people sometimes have to to get past their history because they've been for much of their life in environments where they weren't they couldn't expect to get a lot of useful input from other people.
But when you're working at the very highest level with very very smart people, you know, two two minds are better than one clearly.
So I'm all for it.
Again, you know, it's you don't want to get caught in analysis paralysis and so trying to figure out what's the right place to do it, how much time to spend on it.
a certain art to getting just the right level, but I'm all for that.
And I think this might have changed in the last few years because of remote work.
You know, we've had an explosion of remote work and now it's a bit of a contraction.
But I remember before 2020, some of the most innovative companies when you went into their thing or startups who were gaining momentum, what they had is whiteboards and and these erasable whiteboards everywhere.
And what would happen in these places actually I even had at one of my older teams where we actually requested a whiteboard is people you know you're just doing your thing someone says something you're like hold on and then you go to the whiteboard you start whiteboarding and you know you can erase it sometimes you leave it there sometimes you photograph it basically it it's just like on on demand when there's a it could be any trigger it could be just mishering it can be doing you just have people come together do their ideas and there's something special about uh there haven't startups have who tried to replicate this digitally.
But there's something special about in in person just you know like doing just getting your ideas out there especially when we're talking about something like software where you do you know boxes and arrows do help.
I totally agree.
I love whiteboards and I like having meetings that are in person.
I've also over my career developed a technique for using whiteboards to resolve complex issues which may or may not even be technical other kinds of management issues in a company.
And what I found is that often times people get in meetings and they just kind of talk past each other, repeat the same account arguments and counter arguments and it just goes round and round and round and never reaches a conclusion.
So what I do in these situations is I stand at the whiteboard and basically I list typically we're arguing for or against something just list all the arguments for and all the arguments against.
And the rule of the discussion is you can make any argument you think is reasonable.
No one is allowed to tell you your argument has to be removed.
That's a bad argument.
Every argument goes on the board.
But you are not allowed to repeat an argument that is already on the board.
And this is really important.
So having the arguments up so everybody can see everybody's argument is valid.
You know, everyone's allowed to contribute.
No one can stop you from putting your argument on the board.
So everybody's arguments goes up and then the discussion just naturally reaches a point where nobody has anything more to say.
And so this shortens the discussion and then what I do after that is I take a straw poll.
And what's amazing to me and you should try this sometime because it's really it's quite shocking is that people will be arguing violently on both sides and you'll think there's total disagreement and then at the end and then we do straw poll.
We tell everybody, you get to weight these arguments in any way that you think is appropriate.
You decide which ones you value, which ones you don't value.
Should we do A or B?
We almost always end up with a really really strong consensus.
It's it's shocking.
Like I'll be in these in these meetings where I think we have total disagreement here and then we do the vote and it's unanimous.
Well, it sounds I have not done it.
So it's it's you know it sounds one of those things where I don't believe I wouldn't believe you.
I'm sorry.
I I do believe you.
But yeah, as as you said, I think, you know, I'm I'm going to try to try this out.
That's at white on that whiteboard, I think.
Yeah.
And and I think anyone listening or watching just like this is this is why I love these discussions is just like getting a tactic that you can try out, you know, and and now that more and more companies are are doing at least a few days in the office, you get a whiteboard, try it out.
By the way, this works best in environments where people are first generally pretty smart and reasonable and goal aligned like you know in a startup for example or an engineering team.
You're typically goal aligned.
You all want to achieve the same result.
You know would this work in Congress with uh with opposing political parties?
No.
No.
Not in political environments.
Yeah.
Fortunately, we don't operate mostly in those environments.
Well, yeah.
And and I I think you know one nice thing about how the tech industry seems to be evolving from my perspective is it's more and more common and accepted even at large companies that you do want teams to have clear goals like h have those goals because if you don't have it you know everyone's going to go in different directions.
So I I think it's becoming more common also companies that don't do it they they fizzle out pretty quickly.
So similar question uh on design there's two schools of of thoughts when it comes to design.
One is let's design up front and the other one is let's not let's not design up front.
let's just do prototyping or just, you know, build something and let let the code decide.
Do you subscribe to either of these approaches?
You know, taking time upfront or or just dropping into and prototyping or or you have you seen times or types of projects where one just works better than the other?
My personal belief is that design permeates the entire development process.
you do it up front, you do it while you're coding, you do it while you're testing, you do it while you're fixing bugs, that you should constantly be thinking about design.
Uh I I think I think you should always do at least a little bit of design up front.
Again, you know, not waterfall method.
You you it's important to realize that our software systems are so complicated that we are not able to predict the consequences of our design decisions.
We simply can't.
But it's I think it's really important to do some design and to have some hypotheses to work from and then you start implementing and of course you know once you get in battle all your plans kind of fall apart and you'll discover lots of problems with it and so you have to be prepared to revise as soon as you discover problems.
But if you don't do any design up front I think you're wasting your time on code that is that's just very unlikely to be useful.
The only the only time I'd argue for coding without design is if you're so young and inexperienced you really have no clue how to do design.
Yeah.
Then you know you may just have to write some code and and start learning from it.
But in any case, absolutely be prepared to redesign you know as you discover problems.
Yeah.
Like I had one of my colleagues a long time ago many years ago.
He said something super interesting because we were talking about why software is hard and we were experienced engineers at this point.
like why do some projects take a lot longer even if we do proper planning up front?
Why are some projects actually, you know, they're they're pretty easy?
And he says something interesting.
He's like software like building software is a little bit like like we're in a terrain uh you know like and we need to march to that location.
We we we see that we see the target but we the terrain is unknown.
And sometimes you just walk there and it's exactly how you'd expect.
Other times you're walking and oh suddenly there's a big kind of boulder appears out of nowhere and you kind of climb over it.
Then another one comes.
Sometimes you walk and like a mine explodes right in front of you and suddenly you have this massive hole and you you didn't know this this was a minefield.
And and he said and this analogy kind of resonated with me because I realized a lot of it is about like how how much unknowns are are unknowns and the approach is just very different right like if you're building a tech stack or product that you've done before versus something that is completely new.
if are using new technology, are using a beta version of a framework that could have issues, but maybe it'll work and so on.
Yeah, I I think a lot of it has to do whether you're in a domain you've been in before or not.
It's not that you got lucky and there was a flat field.
I think it's more that oh, I've actually I've actually walked through this mountain range before and so I know the right paths.
And so, you know, if you're building your if you're building a a driver for a new device and you've built drivers for five devices before that, you kind of know what the main problems are.
And the process is much more predictable and smooth.
If you're in a new environment, well, I don't know, maybe maybe I'm just unlucky, but I don't think I've ever had a smooth experience when I'm in a new environment.
There's just it's just too hard to predict.
Neither have I.
like the only kind of new environment.
Well, it's not really a new environment like a new version of the framework and it's not not a big change or you know the a new language release which is backwards compatible with all the important stuff and you're not using the new features that kind of stuff but it's kind of fake right like you're it's kind of the same as before.
One one thing I'd like to get into is is the writing of this book because again like like this book it it feels to me it has just a lot of really kind of practical insights.
Now first of all it I haven't seen many books written about software design or software architecture specifically.
How did you get the idea to even start writing a book about this?
You know like pretty hard to hard to tangle uh domain.
It's kind of a long process but the path leads through the course I taught at Stanford.
So the the the background for this is as I mentioned earlier I love coding.
I'm one of few professors that still writes large amounts of code.
You know, I try to write five or 10,000 lines of code a year at least.
It's been significant fraction of my time coding.
And I love design.
I think design is one of the most amazing creative forms that has ever existed in in the history of humankind.
It's just really fascinating, beautiful, challenging domain.
And so I' I've often I thought think about it and I try and think what is a good design and how do I get to how do I design software that's good?
What what are the techniques for that?
But over time, I noticed to my shock, nobody teaches it.
Literally, other than the course I eventually started at Stanford, I don't think there's a single course anywhere in the world where software design, not tools or processes, but the act of software design is the primary element of the course.
And so this just kind of graded on me for I don't know a decade or more.
And once I got back to academia at Stanford, I now would have had this experience in industry.
I'd had a lot more software development experience and more ideas myself.
I started thinking about this and I finally decided I'm just going to who knows what's going to happen but I'm just going to try teaching a course see what I can do.
And so that forced me to start thinking about my ideas and try and capture them in sort of simple principles.
You said no one teaches design and you know the I'll tell you the perspective from like someone working at a tech company like usually we don't interview new grads or people with a few years experience on this on software architecture topics usually interviews coding and then software architecture or design a complex system and the reason being well you need to work in the industry for several years to start to get a sense for for for this thing but I have a feeling you kind of you know you turned this upside down you're you're you've kind of proven or well you're attempting to to to do with the class that design can be taught even for students who have recently learned to code.
What what was your approach and and what what has the response been from from the people who've done it especially now that you know some of those folks are have been out the industry for years and I'm sure they're coming back with some of their experience because they now have a skill set that you know a lot of their peers do not.
Yeah.
So I so I decided to teach this class and then the question is well how do I teach it?
And the model I used was my English writing classes from high school.
I don't know if this is the way it's still done today but back when I took English the way you learn to write is you would get an assignment you'd write something your teacher would mark it up and then you would rewrite it and submit it again and you might do a several iterations on it.
And the I think the key elements are first getting feedback so you have somebody that can criticize your work and then second redoing to incorporate that feedback and it's the process of redoing something I think where you really internalize the feedback and the concepts.
So that's the way the class is taught.
It's over a course of a quarter people do basically three stages where they build something significant and then we do extensive code reviews.
For example, I read every line of code for all the teams on the class, which means that what what do people build?
What is the project or what was one of the projects?
So the actually the first two projects happen to be the raft consensus protocol divided up into two phase and that's actually turns out to have some really interesting design problems that that confound students and lead to lots of mistakes.
So it's this process of they and when they start off I give them no clues, no hints, no structure.
They have to do it completely from scratch.
This is the first time in their lives they've ever done anything like that.
So it it's actually it's both very fun and very scary for the students.
And then and then we do this extensive code review where they review it in class and other students read their projects and give feedback.
And then I read every line of code and I spend about an hour with each team.
They typically get 50 to 100 comments from me on their so two to three thousand lines of code they've written.
And then they go back and they rework.
And I think that's when the aha moments come from students when they get the feedback from me where I can point out code is complicated.
People generally know that code is complicated.
But then I can point out here's why it's complicated because you didn't follow this principle that we've been talking about and here's how if you apply the principle you can make it simpler.
And then they come back with their second projects and the second projects are so much better.
And and you could tell the students the students are really excited because they can kind of feel their power.
They can feel that I was able to make this a lot better.
And so um you know I was worried about how the students would react to the class.
So it's an extremely positive experience for the students.
You can tell over the course of the quarter the way they think about software has changed really in significant ways.
And and actually I warned them at the end of the quarter I say you know I just want to warn you when you go into companies you're going to find you know a lot of stuff that people in the companies don't know even much more senior engineers.
So and then we talk about how do you deal with that because as a junior employee you may not have much ability to change the company but anyhow uh so I I totally totally believe design can be taught.
Now, you still need experience.
You know, it's not like you're gonna you're not gonna be a world-class programmer after one quarter in my course, but I think that's they can start the process in motion and give you a new way of thinking about software that you've never thought about in your classes up until now.
Yeah.
And I think you can probably like my sense is that the students who go through this this class and and you know they they build up their experience.
They also learn about themselves.
They they learn how they can challenge themselves, how they can talk about it.
other software developers take, you know, like in when you enter the industry, like in the first few years, you're just going to like learn the hard way.
Like I I remember that when I was a a new grad or a junior developer, you know, start out of college or I was actually still doing college, but I was working at a workplace and a senior developer told me, I need to do this, you know, the planning, we're going to use this technology, you need to implement this and this.
And I just had a bad feeling about it, but I did it.
And it it it just became worse and worse and more and more complicated.
And it the the solution that it was some some in-house database and it had performance issues and it got bad.
It got really bad and you know the developers the senior developers stepped away and in the end like weeks into the project the the customer was frustrated because like a page load took 15 seconds which is like it's it's not it was not okay.
And then I I just like over a weekend I I I worked I must have worked for like I don't know 20 plus hours.
I just rewrote the whole thing the way I I would have done it and it all of the things were fixed etc.
But it it felt to me like I I was kind of like I was thinking like am I being crazy like like this experienced person told me to do this?
I just didn't really have the vocabulary.
I didn't have the the faith in in myself as well that that I I can do this.
And everyone goes through these things eventually, right?
Like you you kind of learn, you burn yourself, but I feel you might be giving those students a bit of a shortcut uh to to maybe avoid some of these pitfalls.
I suspect that experience was really good for you.
Oh, it was really good.
Totally.
To do it the wrong way.
Yes.
And see and see your your gut feeling validated.
Yep.
So next time around, you know, you can probably kind of put some words to that and talk more with more authority about why that's a problem and then going back and doing it the right way and seeing how much better it is.
I mean that that must have been a really great experience for you.
It like the nice the cool thing is that I think all these things are like really good learnings.
It's like I wouldn't have any other suffering maybe but yeah but I I feel that's sometimes that's the most memorable learning.
No.
Uh honestly I think almost all learning is about making mistakes.
Yeah.
that the way you learn, the most powerful ways to learn are to make mistakes, see, understand why there are mistakes and then fix them.
And to me, education is it's about basically creating a safe space where people can make mistakes and learn from them.
And I tell the students in the class about this.
I tell them, you know, you're going to get a tremendous amount of criticism.
I tell them, I am going to pick every single knit with your code.
You're going to think there you're gonna probably be mad at me for things I'm picking, but I'm going to show you every single thing that's wrong because I want you to be aware of that.
And I one of the things I hope students get out of the class is realizing that's a really productive experience.
It's actually good for me to have people come in and challenge me, scrutinize my code, and give me feedback because I think a lot of developers out there are kind of sensitive.
Maybe maybe they worry that if somebody criticizes their code, maybe that means they weren't such a good coder.
Or maybe they think if I have to come up with a second idea, maybe I'm not that smart.
Only only dumb people have to do things twice.
Smart people always get things right the first time.
And so then you you latch on to this.
I can't ever admit that my first idea isn't great.
And so I think it's really important that the whole idea of making mistakes is so important and so constructive.
We need to, you know, we need to honor that, I think, as engineers.
slightly different topic, but you and Uncle Bob, Robert Martin, had an interesting discussion about his book Clean Code Online where you you both like wrote uh your your thoughts on on different parts and there were a few parts where you your opinions diverged and I I was interested in getting into some of these.
So, f first was on short methods and the methods doing just one thing.
You know, Robert Martin is is a big fan of of doing so.
He's saying this will lead to cleaner code, clear responsibilities and so on.
And you had a slightly different take on this.
Boy, I sure do.
So I mentioned earlier on that design is about tradeoffs and if you take any idea and take it to the extreme, you end up in a bad place.
And so I think clean code has done that in many places.
And this is this was my my biggest overall concern.
And so method size is one of them.
So, of course, I think we agree that really long methods are probably harder to understand and deal with than shorter methods.
So, there's there's some value in shortness, but it isn't the method length per se that's most important to me.
It's this notion of depth.
Are we hiding complexity?
And so, what happened in clean code is that is that shortness was taken as an absolute good with no limits on it.
The more you shorter the better.
And so a threeline method is better than a fiveline method according to clean code.
And the problem with that is that well maybe that one method is a little bit easier to understand but by having shorter methods you now have a lot more methods and so you have a lot more interfaces and now the complexity of the interfaces ends up actually making the system more complicated than it was before.
And in particular his style uh he is comfortable if uh if methods are entangled having multiple short methods where in fact they're so entangled that you can't understand one method without actually looking at the code of the other methods at the same time.
Yeah.
So it was might as well to me I see no benefit of that.
I think to me that has made things worse not better that if things are really related you're better off pulling them together.
So, so the thing about the the notion of depth is it kind of captures the trade-offs that we want to have a lot of functionality, but it needs to have a relatively simple interface.
And so, I think that notion will keep you from going astray in either one direction or the other.
Whereas this, for example, the uh the single responsibility principle, the do one thing principle that just pushes you relentlessly in one direction without any bounds and you get in trouble that way.
And it's interesting how you know you talked about methods you being short doing one thing and you can have a lot of them or you can like group them and have bigger methods that do do more thing but they're more sensible.
I was thinking as you're talking about this in the industry we've had a similar thing with microservices.
So I I happened to work at Uber at the time where it was popularized that the company had more than 5,000 microservices and we had a lot of really small microservices and what happened over the years is at least in my I cannot speak for the whole company but I can talk about the domain I was which was in in the payments domain we we had a lot of small services because they were easy to spin up.
They did like one thing or two things or a few things and after a while we realized like huh it's it's just really tough to maintain to know which lives there.
A lot of communication back and forth.
So we started to just pull them together and create like mids I would say like midsize services that kind of had a domain responsibility and it wasn't either extreme but like I think we saw that one extreme it it sounds good it it sounded really good by the way initially and it has benefits but over time it just wasn't as practical.
So it's somewhat similar to to to what to what you say like extremes on one end are not great.
It's not great to have like one massive service that does everything.
You know, we Uber used to have that.
It was called API and it did everything and then it got broken into smaller things and then it came back into like kind of domains or or reasonably sized ones.
So, so you could actually keep track in your head.
You could understand here are the different parts that are there.
Okay, you can go inside and then you can understand the part.
So, there's I think there's a level of when does it make sense?
How can you follow those kind of things as well?
I think there's a you know again you can air on both sides but I I think these days people often er on the side of over decomposing and I think so it's think and clean code for example advocates that what I consider to be over decomposing that causes problems and so one of the things I tell my students is often you can make something deeper by actually combining things together if they're if they were closely related you may discover that if you bring them together into one class or one method or one module or one subsystem, you end up with the combined functionality but with a simpler overall API and without having two separate things with a lot of dependencies between them, which is really bad.
Again, you can overdo this, you know, so everything is trade-offs, but but you could often make things better by making the units a little bit larger.
Another area of the screen was was test-driven development and we touched on a little bit and Robert Martin is a big fan of of using TDD as a way to write code.
Write the test first then write the code that that makes it pass.
This method was also pretty popular in the two early 2000s.
It's kind of gotten a little bit out of style.
Your take was was different as well.
Yeah, I'm not a fan of TDD.
Y uh because I think it works against design.
So again, to me, software, so tests are important.
I love unit tests.
I write them for everything I do.
They're essential.
If you're a if you're a responsible developer, you write unit tests with very high coverage.
So let's let's agree on that.
But but we want the development process to be focused on design.
I think that should be the center of everything we do in development should be organized towards getting the best possible design.
And I think TDD works against that because it encourages you to do a little tiny increment of design.
I write one test and then I implement the functionality to make that test pass.
Then I write one more test and write the functionality to make that test pass.
And so there's no point in the process where you're encouraged to step back and think about the overall task, the big picture.
How do all these pieces fit together?
what's the most pleasing simple clean architecture that will handle that will solve 10 problems rather than coming up with 10 point solutions to individual problems and so it results in what I believe the risk is you you end up in an extremely tactical style of development that produces just a horrible mess so that's my concern and we had this long back and forth about it and I think the main reason that that Bob likes TDD is it in it it ensures that the tests get written because you have to write the test before the code and so I agree the test should be written but I don't think there's anything he was not able to convince me that there's any particular advantage in writing the test before the code other than ensuring that the tests get written it does not I I can't see any reason that makes the design better and I can see a lot of reasons why it might make the design a lot worse I think an interesting question is what should be your units of development you know you're going to do development is always in chunks of work what should those chunks be and I would argue those chunks should be abstractions not individual tests.
That's too small of a chunk.
Again, you want to think in a big enough chunk that you can consider tradeoffs and try and come up with a fairly generalpurpose solution that will solve many problems.
By the way, one of the one of the most important elements of design, I think, is pushing yourself towards general purpose to avoid specialization as much as you possibly can.
And so the the TDD approach encourages you to do something very specialized to pass each test rather than thinking about the general purpose thing that solves many problems in one place.
Oh, all right.
Yeah, that is true.
That that is true.
In fact, like I I remember like at at some point when we did we did some TDD mobbing where we would pass the keyboards around and someone would write a test, someone would make it pass.
We would try to it felt a bit artificial because when you wrote more code that you needed to come, they're like, "Huh, no, no, don't write that.
That doesn't make just just make the test pass." So it almost felt a little bit of artificial and again like I've I'm sure there are times and cases where it it could be useful may maybe in a more formal way maybe where it's more about adding extending additional code where it's like very heavy in business logic maybe maybe that could be a good good fit but there might be a reason that it kind of slowly you know became less popular and we're not talking about it too much these days at least.
The one place where I would recommend writing the test first is when you're fixing a bug.
I would I would argue write the test that will detect the bug and then fix it.
Although actually what I typically do is I honestly I kind of cheat on this one.
I I write the fix and then I write the test for the fix and then I back out the fix and make sure the test fails so I know that.
But anyhow, that that's one place where I think doing the tests early can be useful.
Now, one more area that you disagree is comments.
Uh so, Uncle Uncle Bob uh says unsurprisingly that you should have as few comments in the code, the code should speak for itself.
You also did not fully subscribe to this one.
If the code could fully speak for itself, that would be wonderful.
I would have no objection, but it can't and it never will as as far as I'm concerned.
There's just so much stuff that can't be described in the code itself.
And and we ended up discussing examples where he said, "Look at this code.
It needs no comments, right?" And I and then I well here's five questions people have that I don't see answered in this code.
And and then he kind of hedged about that.
And so I don't know, he's very very biased against comments.
I I'm not sure why if he had some scarring experience and he he argues that he I believe he basically said he thinks that people lose more time by being misled by comments that are out of date than than time lost because you haven't had adequate comments.
And that certainly is not my experience.
You know, occasionally there are comments that are out of date but rarely and even usually useful information.
And then he also made the he argued that well if you're working on a project that you and other developers were you don't need any comments because everybody's got it all loaded into their minds.
And I again I just don't agree with that.
Now maybe his mind is better than my mind but you know I can't keep everything in my mind and I forget code within a few weeks of when I've written it.
So I need those comments.
So the bottom line is there's just a lot of stuff that you can't get from the code.
And then what what is your kind of approach on like how do you do comments?
What do you like to put into comments or is it just like whenever you feel like it just put there because it's going to be additional information that could help later?
Well, again, the the number one rule is comments should tell you things that aren't obvious from the code.
And so, you know, a lot there are a lot of bad comments out there where people are basically just duplicating stuff that's obvious from the code.
So, no need for comments in those situations.
And you know in my student projects in my class I often take comments out tell students this comment just repeats the code you don't need it.
I think where comments are most important is for interfaces.
This is where they're really really important because this the assumption of interfaces.
You don't want people to have to read the code of the thing that you're that you're communicating with talking with.
You just want to look at the interface.
And there's simply it is impossible in the the functional signatures of a module to provide all the information people need to use that module.
And so that's where comments are most important there.
To me to me that's the most important.
The second most important thing is documenting the members of member variables of classes.
That needs really extensive documentation.
And then I tend to find that inside methods, I don't tend to need a lot of comments because if you know what the the method's trying to do, the code typically speaks for itself pretty well there.
I tend to have comments where things are tricky or where there was unexpected stuff that I only discovered, you know, when there were bugs and things like that.
But but often my methods won't have any internal comments.
They'll just be the interface comment.
it.
I think comments are going to have a bit of a resurgence this this debate potentially because AI tools increasingly generate more code.
They often generate whole methods.
You know, you can ask and what I've noticing is when I when I'm telling, you know, one of these AI assistants like generate something that does this for me, it generates the code, but it often adds inline methods which explains what it does.
And actually in that case because it's just coming something quickly.
It actually kind of helps me because I'm I know these tools hallucinate uh and I actually want to make sure what it does.
So it kind of helps me understand.
At the same time it's a good question of why it's doing it.
You know these are trained on typically code that's out there either either open source or who knows what kind of licensing.
So it it probably is uh copying however it's it's seen it.
But uh this this this you know usually I would agree with you but in this case maybe comments are not a bad thing.
Who knows?
It's an interesting area.
Yeah.
So I I'm a little hesitant to say this because I'm a fearing a fearing I may be justifying bad habits.
But one thing I found is that AI tools can to some degree compensate for the lack of comments.
So I've been working in the Linux kernel building a new network transport and you know overall actually Linux kernel is not a bad piece of software but but it's pretty significantly under commented in my view and I spent a lot of my time just trying to figure out what is going on in Linux.
What are the interfaces?
How do I hook into this chat GPT has become my very best friend.
It's amazingly capable at answering questions about the Linux kernel that I can't answer via Google search or any other way.
It's not always correct.
Sometimes it hallucinates, but but it's often right.
And even when it's wrong, it typically gets me in the right vicinity and helps me to figure out where to look to figure out how to answer my questions.
So I I I think the AI tools may be able to help, but even saying that if the Linux developers had just spent a little a tiny amount of time putting comments in, it would have made things so much easier than using chat GPT to try and figure it out.
So I don't think the need for comments is going to go away completely.
And I we shouldn't use AI tools as an excuse for people not to write comments.
Yeah.
At least not yet.
So before the podcast, one interesting thing that you mentioned is you are actively writing code.
In fact, after this podcast, I think you're going to be getting back to to writing code.
What what are you working on right now?
You mentioned something with the Linux kernel.
Yeah.
So uh one of my PhD students, Ben Montazeri, as his PhD dissertation uh six or eight years ago, developed a new transport protocol called Homa, Hom, which is intended for use in data centers.
And the results he got in his dissertation are really fabulous.
It's 10 to 100 times faster than TCP for a whole lot of interesting cases.
Wow.
And so rather than let this just come and go as a you know PhD project that nobody ever cares about, I've taken as as my own personal project to see if it is actually possible to bring this into widespread use and and displace some of the TCP traffic and data centers.
So I have developed a Linux kernel implementation of that which I'm continuing to enhance and I'm now in the process of upstreaming that into the kernel.
And so actually what I'm currently dealing with is a whole bunch of comments I've gotten from the Linux kernel developers about this and trying to fix all the problems they pointed out.
Another example of code reviews and you know the benefits of all of that and indeed this afternoon I'm I'm getting ready to submit my next round of patches to the uh the net.
How how are you finding is this your first contribution to a Linux kernel or have you previously worked on it?
Yeah, this is my first involvement with the Linux kernel and I have not.
How are you finding the process?
Because we we just had a an episode on with one of the main uh Linux kernel ma maintainers and I'm curious is it is it overwhelming?
Is it easier?
Is it harder than what you thought?
So, I'd been warned that it might be difficult and painful and take a long time.
Um, it's it's taking a fair amount of time.
I think it's been boy, we may be coming up on six months since I made my first submission of this, but I have to say that the people have been very reasonable and the feedback I've gotten has been high quality feedback.
So, I've had to fix a lot of things, but these were all things where either I misunderstood something about the kernel or they they showed me better ways to do it or pointed out complexities in my design, which there were plenty of.
And so I have no objection to the process so far and uh I I'm actually pretty happy with it and home is getting a lot better because of this.
You know, I hope we'll eventually reach closure and it'll find its way into the kernel, but but it has seemed pretty reasonable to me so far.
Yeah, this this is really encouraging to hear and you know, good luck with that.
So what are ideas from the history of software design or or even software engineering that you think might make a renaissance in the near future as as we're looking at you know focus on tooling distributed systems of obviously AI AI tooling.
I'm not I'm not sure I can think of any idea that has come and gone and is going to come back again.
Uh so I uh I think you know I think there are ideas that have come and gone because we've learned how to do things better.
Uh but and hopefully we're we're getting better and better at this.
We're not just oscillating from good to bad, good to bad, back and forth.
So I I can't think of there's no no idea I can think of, you know, that people have forgotten about once a new and forgot about this going to come back into play again.
And then the the book you this was first published in in 2018, so that's coming up seven seven years now.
If if you were to write this book today, are there parts that you would add to it that you would rewrite or or even remove?
Yeah.
So, first I never actually finished the explanation of the book.
So, the book came about after the class when I started giving talks about the class.
People said you should write a book about this and so I had a sbatical and whenever it was 2017 2018 I used my sbatical to write the book.
So, uh so feedback on those.
So, first of all, there have been some things that I' where I've adjusted my opinion since writing the book, but there's already been a second edition of the book where I've fixed most of those and the and hopefully the book you have is actually the second edition.
In fact, if you've gotten it in the last couple of years, it is first edition.
I need to update the book.
Okay.
It has not changed dramatically, but the the biggest change is more emphasis on this notion of being general purpose and eliminating specializations.
And that's something I learned actually not from the book but from the class.
From observing student projects in the class over a period of years, I realized this idea is really fundamental to to teaching students how to write less complicated code.
So, so that's already in the book.
Uh there's no there's no big thing that I would want to change right now.
The as I mentioned earlier, I think the um the part of the book that is most dangerous is this part of exception handling which as I mentioned is easy for people to misinterpret and apply in ways that that I actually wouldn't agree with.
So if I were rewriting the book from scratch, I I would I might think about that more carefully to make sure I choose my wording more carefully to help people avoid uh misinterpretation of that.
I think now one thing I hoped when I when I wrote the book, one thing I I was hoping was that people would come to me with new ideas that I hadn't thought of and that I would learn from that and then get more ideas and gradually, you know, I'd be adding more and more stuff to the book.
So that has not happened very much so far.
There's not I would have been delighted to have more I'd love for people to come and say you are totally wrong.
This idea here, the book is totally wrong.
Here's why.
Here's how you should do it instead.
And there's not actually been as much of that as I had actually hoped for when I wrote the book.
I I I have a theory about why this might happen, which is that your your class is so unique.
So software design in in the wild is typically you have a problem, you build a solution, you might explore some different trade-offs on on a whiteboard, but then you build it and then you move on and then you might go back and fix it.
You might have to maintain it.
You're going to learn about it.
But what you don't have is you don't have this ideal situation where let's say you have like two or three different teams building different things and then you compare it because in in you know in the industry or in tech companies you just don't have that luxury.
And even if it it's it's a bit wasteful.
So you never really have the situation where you can repeat something.
And my sense was that with your class you actually could do this.
You could you know have a group of students go through well actually in the class you know the same problem people solve it different ways.
you can now see the differences.
They can see the differences.
And I'm wondering if if it's just a thing that it it maybe this setup needs to happen in some level of either academia or or nonprofit or or somewhere where it is doable.
I I'm not sure because I I have been thinking of because this this makes this book really special like your observation was not just like a lot of software architecture BS are like oh here's stuff that I found over working on these projects which are all one-offs but I learned these things and you're saying I've seen this thing work better across the students and those who did it you know had had better outcome repeatedly.
Yeah, that that's something we can do in academia, I think, better than industry because in industry you don't have time.
Yeah.
For the revision.
And and you're right.
One of the things about the class I think that is really good is there are nine teams, nine twoperson teams in the course.
They all do the same projects and then they review each other's projects.
So in during the code reviews, each student will read not the whole project, but a big chunk of two other projects and then review them in class.
And so the students and so your partner is reviewing two different projects also.
So between the two of you, you've seen basically half of the rest of the work in class.
And I think that's also a really great source of learning from students.
They really enjoy looking at each other's code and thinking about it.
And then they after the first project they ask me, they say, "Am I allowed to use ideas from this other project when I revise my project?" Because I mean, normally in classes, you can't use anybody else's ideas in your work.
And I say, "Oh, absolutely.
you are encouraged to steal and cannibalize all the best ideas.
So it's that's something I think yeah where I think actually doing it in academia we can probably do a better job in industry than industry you don't have enough time you know you can't let a student a person spend whatever it is 15 hours a week for 10 weeks going through an exercise like this you have too much other stuff for them to do but the outcome has been has been really nice so as as closing what what are one or two books you'd recommend for software engineers to get better at their craft while obviously you we have your book but outside of these.
So, unfortunately, there's not a lot of other stuff out there that I really like.
Um, there are a couple of things.
Unfortunately, I don't remember the names of them, but if people go to my homepage on the web and look, there's a link from there that will take you to the software design book and there's a short web page there and that has some other recommendations at the bottom of that people could look at.
We're going to link this in the show show notes below.
And how could listeners be helpful to you or help you?
Well, I'm I'm always interested in constructive criticism.
You know, I don't claim to have all of the answers.
I I have my experiences and things I think I've learned, but um we're not done with software design yet.
I'm sure there's a lot more to learn about that.
So, I' I'd love to hear if people have ideas or if you think something I say is wrong, I'd like to hear about it.
I'd love to hear what you think is wrong and why you think that's wrong.
The main thing, you know, both in the class and in the book, what I've what I'm hoping to do is to encourage more awareness and consciousness about software design in the developer community, get people thinking and talking about it.
And if we do that, I'm hoping that we can raise the overall level of design in the software that we build.
Yeah.
And I I I'm I'm thinking especially now that we're going to see more code generated just by nature as as you mentioned design will be more important at at all levels not not just like the senior engineer level but as you're like creating your own thing.
So hopefully we we'll see more of this.
Well John this was really nice and and really interesting discussion and thank you so much for spending the time on this.
Thank you for inviting me.
I really enjoyed the discussion as well.
I hope you enjoyed this conversation as much as I did.
Thanks very much to John for sitting down with us.
If you've not read his book, a Philadelphia software design, I can very much recommend it.
For more in-depth reading on software design, design docs and related topics, check out the pragmatic engineer deep dives which are linked in the show notes below.
If you enjoy this podcast, please do subscribe on your favorite podcast platform and on YouTube.
A special thank you if you also leave a rating.
Thanks and see you in the next one.
