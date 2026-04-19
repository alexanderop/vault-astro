---
title: "John Ousterhout and Robert 'Uncle Bob' Martin Discuss Their Software Philosophies"
type: source
source_type: youtube
source_id: "3Vlk6hCWBw0"
url: "https://www.youtube.com/watch?v=3Vlk6hCWBw0"
captured_at: 2026-04-18
publish: false
authors:
  - john-ousterhout
  - robert-martin
tags:
  - software-design
  - clean-code
  - testing
  - refactoring
---

## Metadata

- **Channel:** Book Overflow
- **Hosts:** Carter Morgan, Nathan Toups
- **Guests:** John Ousterhout, Robert "Uncle Bob" Martin
- **Context:** Episode covers the joint written debate Ousterhout and Martin published on Ousterhout's GitHub (also appearing as an appendix to the second edition of Clean Code). Three topics of disagreement: method length, commenting philosophy, test-driven development.

## Transcript

I tend to have pretty strong opinions at any given point in time, but I hope others will have to be the judge of whether this is really true.
I would hope that I would change my opinions when I encounter superior arguments.
And I like having I like having no holds barred arguments because I think that reasoned and informed disagreement is that's on the road to enlightenment.
[Music] Hey there.
Welcome to Book Overflows, the podcast for software engineers by software engineers, where every week we read one of the best technical books in the world in an effort to improve our craft.
I am Carter Morgan and I'm joined here as always by my co-host Nathan Tups.
How you doing, Nathan?
Doing great.
Hey everybody.
Well, we have something really special for you uh this week's folks.
We've hinted to it in past episodes.
Uh but we had on the podcast both John Osterhot and Robert Uncle Bob Martin.
uh we'll link it in the show notes.
But if you haven't seen recently about maybe a couple weeks ago, a month ago or so, they published a discussion between them analyzing the differences between their different phil philosophies.
John, a philosophy of software design and Bob uh clean code.
Now, we've had them both on the podcast separately and you'll find out in the interview.
That discussion kind of started with us and we introduced them and yeah, you'll hear the whole story throughout the podcast, but they were gracious enough after publishing the discussion to agree to come on to the podcast to talk about how it came to be, what it was like working together, and yeah, just really, really cool stuff.
I mean, Nathan, what can our audience expect?
Yeah, it it was great.
I I highly recommend reading the paper before you listen to the podcast.
Though don't let it stop you.
We do recap some of it.
Um both of them came to the table with uh well-reasoned arguments on three main areas on uh how you build methods and functions um commenting philosophy on commenting and then also on test-driven development.
So these are three topics that John Oster had strong opinions about in his approach to philosophy of software design and he was really happy to be able to debate um Uncle Bob.
They originally were going to do this uh on our podcast but we couldn't get to an agreement of the format and it turned out that I think this was actually a superior way.
I think John brings this up is that they got time to reason about this and type out code examples and really debate it and discuss it and then we got to review that with them.
Um it was really nice and I think the both of them came out of it uh really appreciating the other person's viewpoint even if they strongly disagree on some of the stuff.
I mean these two are absolute titans in the industry.
I think every one of us as software engineers have been affected by their opinions in one way or another.
So this is really a very very special moment and I believe the only as of this recording instance of the two of them talking together publicly.
So really this this is something special folks.
We really hope you enjoy it.
So please enjoy this discussion between uh Robert Uncle Bob Martin and John Osterhot as they reflect on their differences between their two competing coding philosophies.
Well, thank you so much for joining us today Bob and John.
It's a a pleasure to have you both back on again, but this time together.
How are you guys doing?
Doing great.
Good.
Good.
Good.
Well, like we're excited to have you guys back.
Um, this is kind of funny because back in September or so, we reached out to you guys and said, "Hey, would you guys like to come on the podcast and we we couldn't make it work out for various reasons?" But I was browsing Reddit like a couple weeks ago and I saw someone had posted something on John's GitHub and it was to my surprise a conversation between you two about the difference in your philosophies between clean code and a philosophy of software design and I was like and and just it said like these are conversations began in late 2024.
I'm like, "Wait a minute.
I think we introduced these guys." And so I was like, and so we reached back out and and we're happy to that you guys both agreed to come back on because we're just kind of so curious about um how all that went, what it was like working together.
Um I guess yeah, maybe just help us understand, you know, we we kind of left off with those last emails, but what motivated you guys to kind of keep the conversation going and, you know, to produce this document?
Well, you're right.
it is your fault.
So, we had this initial contact back whenever it was last fall and we were thinking we would do a kind of a an online debate with you all.
And then actually Bob said no to that.
He said, "I don't think that'll work out very well, but I'd be happy to do a written one where we can take more time and plan through it." And I was actually pretty disappointed at the time because I was looking forward to having the debate.
And then I I grudgingly agreed to follow Bob's lead and see how it turned out.
And it turned out he was completely right on the whole thing.
Actually, it worked, I think, way better in written form than it could possibly have worked if we tried to do it live in person because it gave us an opportunity to think through our ideas a little bit more, uh, to explore things.
Honestly, the the document that is published now, although it's still pretty long, uh is only a tiny fraction of our conversations.
So, and if you're curious, you can go back and look through all the various Git revisions to see how much material we have deleted, but we would kind of get in arguments and then just sort of go tit for tat, knit fornat, wandering off into the weeds, which of course would have happened if we' done this live as well.
Then we eventually realized actually there's really nothing interesting in this discussion we just had.
So we could delete that and think about what are the what are the things we really care about here?
What are the big issues and and you know what's Bob's opinion?
What's my opinion?
How are they different?
So this is an example where I I think the written format just worked out really well.
I just want to thank Bob for having refused the initial online discussion because I don't think it would have been as productive as what we ended up with.
It was it was a great experience for me.
Uh John is great to work with.
We we agree on a lot of things.
We disagree on a lot of things, but uh it was all extremely civil and you know, maybe a couple of pointed jabs here and there, but but all in good spirits, all in good fun.
Um and I look back on the process and think, well, that was extremely rewarding.
uh to the extent that I've taken the entire conversation and it's the uh it's published in the appendix of the second edition of clean coat.
So so you know I'm uh I'm very happy with the way things turned out.
Well, I think what surprises me um you you two are both very accomplished in your own rights.
Um you are, you know, older.
I I think some people might think you're set in your ways.
I kind of thought well I I kind of thought like I don't know you've both read in successful books you both are have followings within the software engineering community.
I I I might if it were me I might have just been like h whatever I'm happy with what I got here.
To me it was really inspiring to see you two still say well no let's let's figure it out.
Let's figure out where we differ.
Let's figure out you know um yeah just where everything lines up.
I guess my question is like why bother?
Why bother at your ages?
is I mean I don't know how how do you feel about that Bob?
What what motivates you to still at this point in your career want to hash these things out with you know fellow thinkers?
When I wrote the book initially, Clean Code, I was it was a an existential struggle, you know, who am I to write a book named Clean Code?
And and I I was like, "Oh, come on.
I can't do that.
I can't tell people what to do." And then at some point I thought, "Well, if not me, who?
If not now, when?" So I I went ahead and wrote wrote it and always with the idea that you know I could be really wrong about a lot of this stuff and and there have been plenty of people to tell me I'm wrong since then.
Um but John came out with this this book uh philosophy of software which I really like philosophy of software design really like that book.
uh and then with the opportunity to do this debate and to do a a written thing, I thought that could be really valuable for me just from a from the point of view of learning someone from someone who's got a a a a similar duration in experience that I do, although I think our our uh specific experiences are very different.
Uh, and so I looked at it as a a a great opportunity for me to learn a whole bunch of stuff and I did.
I learned a whole bunch of stuff.
I mean, how about you, John?
I mean, what motivates you to still be engaging like this?
Well, first of all, it I guess I hate to admit it, but I guess it's fair to call me old now.
Although even that thought fight a little bit irks him, but it's true.
I think Nathan's old, so you know, but but I hope people won't think of me as set in my ways.
That would be that would be a catastrophe to me.
I I hope I'm never so old that I become set in my ways.
I like to think of myself as serially opinionated.
That is, I I tend to have pretty strong opinions at any given point in time, but I hope others will have to be the judge of whether this is really true.
I would hope that I would change my opinions when I encounter superior arguments.
And I like having I like having no holds barred arguments because I think that reasoned and informed disagreement is that's on the road to enlightenment.
You know that if you can disagree with somebody but do it in a very reasonable informed way, not just sort of an insulting way, then you can learn from that.
And by the way, when I wrote a philosophy of software design, I had many of the same kinds of insecurities that Bob talked about with clean code and that uh I had my set of opinions that I had developed over my career which I I still feel fairly strongly about for the most part.
But I had no idea whether are these the right opinions.
I had I tried to have reasoning in the book.
If you read the book, you can see I try to justify all the opinions, but how do I know that I'm actually right?
And the answer I I I don't for sure.
I just I have my my evidence and that's all I work from.
But one of the reasons for writing the book was to try and attract differing views so I could see are these opinions right?
Do they actually stand up when somebody attacks these?
Can I actually defend them?
So I'm always interested in engaging with other people who have different points of views.
And you know one of the things I wondered when I wrote the book also is is it possible that in software design there can be multiple very different viewpoints maybe even conflicting approaches which are in fact both good ways to do software design.
Is it possible that there are uh so far all the evidence I've seen suggests no I I don't believe there I believe there is so far but you know but I'm still interested in hearing if somebody else has a different view I'd love to hear it.
So that was part of the the my motivation for wanting to have the discussion with Bob.
That's great.
Yeah.
I when I when I first read through it, I've I've read through it a couple of times now.
I read through it one more time yesterday um just to be ready for this um conversation and what really struck me is that you cover significant ground in this.
Um and even though it is both of you can have very strong opinions um it was very cordial and at least that was the tone that I read when I was reading it.
Um how did you settle on those three major topics uh that that are in the that are in the discussion?
And I guess for the listener, if you haven't read this or maybe you're a little rusty, the three major topics were um a conversation about method length and the appropriateness of method length, uh comments, and then a section on test-driven development.
Um I guess I'll ask John, you can go first and then and then I'd love to follow up.
Yeah.
So I think I picked those topics to start off the discussion.
There were three things I wanted to talk about because those are places where you I've read clean code and where I disagree fairly strongly with the advice given in clean code.
And so that's I I raised those because I wanted to try and talk through those conflicts.
Yeah.
So I wanted to uh do a follow-up with with Bob on the the three topics.
Were these three topics that you were happy to discuss as well or were there other topics that you wish you'd been able to explore?
So those three topics are the three topics and John picked them out and and set the outline of the discussion.
But if you go online and you look at uh criticisms of clean code, uh you will find those three topics scattered around the web everywhere.
You know, meth method length.
I like really short methods, other people don't.
Uh comments, you know, I don't like a lot of comments.
Other people like a lot of comments.
And then of course there's test-driven development which has been a controversial topic for the last 25 years.
So those are the three the big three.
I'm not sure there's any other topic that rises to the level of those three there.
I I actually had a longer list of topics where I disagree with clean code but those were the those were the three biggies.
and uh for sake of trying to manage the length of the document which is already pretty significant I decided probably not not worth bringing those up.
Although what was interesting is that if you look at the there was a discussion on on Reddit and then discussion on hacker news about the about our document.
What's interesting about that discussion is actually other people in the discussion raised all of the other issues that I thought about raising but didn't raise.
It was sort of interesting that that the collective kind of ideas of those groups actually cover everything we talked about and probably everything we've thought about.
Um you you mentioned right feeling a little self-conscious both of you when you set out to write you know clean code or a philosophy of software design.
Um, I think that's something we felt when we started the podcast, and both of you, by the way, were so generous coming on the podcast the first time.
I think we had like a hundred subscribers and both of you volunteered um when we reached out and we're over at 10,000 now.
So, it it's been going great.
as we've gained, you know, a little bit of uh, you know, notoriety.
Um, because we we kind of felt that way at the beginning, like who are we?
Who are we to like say we're going to read these books and talk about them or who are we to reach out to John Osterho or or Uncle Bob and ask him, hey, can we ask you some questions about your book?
Um I what what is it you think what is it that kind of got you over that hump right of thinking I I shouldn't do this some you know or I'm not qualified because I think a lot of software engineers can struggle with feeling similarly whether it might not be writing a book or starting a podcast but stepping up for a leadership role or applying to a new job or or anything like that.
I mean Bob what what are your thoughts on all of that?
It reminds me of the the biblical book of Judges, right?
The every everyone did what was right in his own sight.
That was the theme of that book.
And there was no king in Israel in those days.
And and people just kind of did whatever.
And that's software.
That's programming.
Especially programming um in the current uh century and the previous century for that matter.
Uh we all just kind of do whatever.
And for one person to tell another um you should do it this way was impolite because everybody was kind of a free agent.
Everybody everybody could do anything.
And as the years went by for me, I grew more and more frustrated looking at the code that I was seeing, especially when I became a consultant and had to look at lots of other code.
And I thought, now wait a minute, there have to be some basic rules here, some basic ideas, and I think I've got some kind of handle on that.
Um, and then it just came down to that famous statement, right?
If not me, who?
If not now, when?
Uh, and I at I just made the decision, okay, I'm going to write this and let the chips fall where they may.
I had no idea that it was going to be a really popular book.
I I had a a really good idea that most people would hate it and and you know, to some extent that's correct.
Great.
John, I'd love a followup on that too as well.
um like what what got you over the the um the hump to Well, so first of all, I'm not as polite as Uncle Bob and so I've you know I have never been shy about speaking my mind on things and again it's part of my part of my life philosophy.
I like engaging in you can call intellectual conflict if you will but sort of hard discussions.
So I like I like saying things that are a little bit outrageous to see how other people react to them to see does this hold up you know can this withstand scrutiny or not.
So so I there I had less inhibitions to start with but for me you know the book really followed on after I I taught a class and so the motivation for me was a lifelong love of writing software and doing software design and thinking about the right way to do it.
just it's always something that I've you know it's one of the things I live for is doing software design and what really bugged me is that we don't teach it in any of our classes.
There's basically no class anywhere in the world at any university except for the one I I developed at Stanford that teaches software design.
And that just kind of sat in my gut and and bothered me for a decade or more.
And then I started thinking about well who is going to teach this class?
Because the problem is most faculty don't code enough to even understand what software design because you have to learn it through your own personal experience if there's no classes.
So you know and most faculty don't know how to code.
Don't really don't code much.
Don't know much about software design.
But I' I've always written a lot of code.
So I started thinking well if anybody has a chance of doing this I probably have as good a chance as anybody who's teaching any university because I've written you know 300,000 lines of code in my career.
And so then I I just finally say what's the worst that could happen?
you know, I teach this class and I completely crash and burn.
The students hate it.
Uh, nobody learns anything.
And well, at least I tried.
So, I I just decided I'm going to try teaching the class.
So, I gave it a shot and the students loved it.
It was really this fabulous experience where you could see lights coming on and the students eyes over the course of the quarter.
They're changing how they they think about software design.
That was a really big success.
And then I I started giving talks about the class and people said, 'Well, you should write a book on this.
And then so finally I had a sbatical and I decided to write the book.
So my my path to the book was maybe a little bit less direct than Bob's.
But but I think it's the same idea that really feeling passionately about this topic and loving the topic and wanting people to do it right and thinking somebody's got to stand up and and say these things that need to be said.
So, I I'll just take a chance.
The worst that could happen is I embarrass myself.
That's great.
So, you you said u over over 300,000 lines of code.
If imagine traveling back in time, you're maybe 50,000 lines of code in.
Um were there conclusions that you had reached in your like philosophy of software at that point that you wish you could go back and say, "Hey, actually there's a better way of doing this." like what have you learned on your path that maybe you were doing a bunch of and then you changed um over time [Music] that's a tough one because I I you know I've occasionally thought when did my ideas about software design start to emerge in my programming career and I'm not sure they had really emerged very much when I was at the 50,000 line level that would have been back when I was still a graduate student I think uh you know working on my first and operating systems but not my third.
And uh and so I didn't have, you know, I didn't have much to go by then.
There we really didn't do code reviews back then.
Those just weren't done.
And so and there was nobody to teach me.
My adviser didn't really code.
I had two different adviserss in grad school.
Neither of them really coded much.
And so it was just figuring things out in myself having bad experiences and and thinking there's got to be a better way to write this.
But I I don't think you know I I'm not really sure when my opinions about coding start it might have it might have taken you know it could have taken 20 or 30 years really before I started having more concrete opinions about coding and I didn't didn't really all pull them together until the first time I taught the class which was 2015 so that was only about 10 years ago.
I'm curious I don't know about Bob over your career when did your ideas about design start to gel?
Can you identify a specific time?
Oh yeah.
Um I I think I wrote my first paper on software design in 1972.
Uh and that would have made me 20 years old.
Um and I was working at a company.
We were writing an assembly language and we had this um we were working IBM system 7 and the IBM system 7 had this interesting instruction that allowed you to spawn threads sort of it saved registers and it kind of squirreled things away.
So it made uh made it easy to uh create threads and that really started my brain going.
I well wait a minute if you've got threads like this and they can start to interle you could have really interesting problems.
This is long before I knew about re-entry or concurrent update issues and I started writing about it just just for myself just writing papers.
I never submitted the papers I just wrote about them.
Um then I would I I started reading the works of Dystra.
I read structured programming by Dystra and I read a bunch of articles about that and I thought that was so brilliant.
The idea of structuring software in these lovely little recursive blocks that didn't have go-tos, right?
Sequence selection and iteration.
And I started writing about that.
I designed a course still like 1973 or something.
I designed a course and I I gave it to the training director of our company and he was like ecstatic because nobody had ever given him a course before.
So So they flew me out to St.
Louis and I gave the course to a bunch of programmers out there.
I only taught it once.
Uh and uh um then my boss was very mad at me because I had taken the time to write a course instead of working on the project I was supposed to be working on.
Uh but that's kind of been the way it's been for me.
I I I stumble on ideas and then I write about them and I I teach them and I I get a bunch of people in a room and yell at them and then I get feedback.
And that's that's occurred many many times in my in my career over and over and over again.
I I have this compulsion to um to expound on my ideas and then get feedback.
And I have uh the the opinions that that are currently in the clean code book which is now 16 years old.
Um went through probably two revolutions.
Uh had I written that book 10 years earlier, it would have been a very different book.
Had I written it five years before that, it would have been a very different book then.
And the second edition is a very different book.
So, you know, been a lot of lot of turmoil, a lot of change.
Opinions shift.
Uh ideas get altered because of this constant exchange uh that John was talking about, right?
The the debate of intellectual ideas, a good rigorous debate where you're not quite at the point of hurting everybody's feelings, but you're getting close.
Bob, I'm curious.
You mentioned Dyra's work, which I also read as well.
Did you read David Parnes' paper on the criteria to be used in decomposing systems into modules which came out around it was early 1970s for me?
That was the paper that really opened my eyes to software design.
I would say if there was one thing that really triggered my thinking about software is it was that paper.
I still consider that to me one of the two most important papers in software engineering in the world.
So I'm curious if so I'm curious if you read that as well and if that impacted your thinking.
Yeah, I did read that, but I read it probably a decade later.
Um, you know, we didn't have an internet in those days.
So, you kind of stumbled upon these things instead of instead of getting them fed into your brain through the electronic media.
Uh, so yeah, I I I stumbled across Parnes probably in the 80s and started reading a lot of his work.
I think I've got a a whole volume of his stuff up on the shelf up there.
And and you know, there's a lot of other people, too.
One of the just aside here, one of the saddest things in our industry is that there is an enormous amount of extremely good work that most programmers have no knowledge of.
Actually, I'm curious.
So, you've you've we've mentioned Dystra and Parnis.
My view is that there isn't a lot out there on software design and that's one of the reasons I wrote APOSD.
But um I'm curious are there other things that you consider kind of seinal writings on software design at the same level as Dystra and Parnis?
Oh sure.
Um I was extremely uh influenced by uh Tom Demarco's work on on structured analysis data flow diagrams and the the decomposition functional decomposition top level down.
Uh there's a secondary book that goes along with that by Miler Page Jones where he talks about a way to take a a data flow diagram a large data flow diagram and recompose it as a set of modules.
That was a very important book for me.
B's work in the uh the '9s in an attempt to get some handle on this object stuff that was starting to to come out at the time.
That was very uh impactful for me.
Um then you get into Bertrren Meyer and and you know design by contract and and the way you can create interfaces that self-correct each other.
That was very impactful.
There's there's been um I could go on and on on this topic.
There's just been a wealth of of very good ideas that have been published in books that for the most part modern programmers don't know exist.
And that's that's sad to me.
I there if someone were if if I if I teach a computer science course, I would start at the atom and I would go all the way from Grace Hopper to to John Bakas to Dystra to to you know Ken Thompson and Dennis Richie.
would walk through all these decisions and how they were made so that the students had this continuity of thought and then could apply that continuity of thought to their own work.
I don't think that exists right now.
Well, you guys both bring up interesting points.
Hearing you reflect on some of these seminal works that you found really uh influential when when forming your kind of uh uh philosophies, but you're talking about like you said books, you're talking about papers these days.
I think you're right, Bob, that not as many people read books or papers.
A lot of us get, you know, a lot of our opinions and and synthesize our worldviews from social media, right?
I mean, there's tons and tons of people all they do is talk about code on, I guess, X these days, right?
Or Reddit or Hacker News or or, you know, anything like that.
Um, what are your guys' thoughts on that change?
What have we gained from entering a world like that?
What have we lost from maybe uh not reading the quote unquote classics more?
I'll start with you, John, and then Bob, I'd love to hear your opinion, too.
The old trade-off between breadth and depth.
You know, I think with the the Twitter world now, you can read information on a gazillion topics.
You know, you're 20 miles wide and a quarter of an inch deep.
uh uh I mostly I mostly lament that because I personally I really believe in the value of deep thinking taking something and really thinking hard and a long time about it.
It's one of the great things about I think about doing a PhD is this time in your life where you can explore one topic in excruciating detail and really become the world's expert.
It's a unique experience people have in their lives because you don't you know you won't have opportunities to do that.
So, I worry a little bit that, you know, that that we're becoming too shallow.
So, we're going to have too many opinions backed by too little meaningful data.
And what about you, Bob?
Maybe I'm just too old to appreciate this.
No, no.
What do you think, Bob?
Well, I agree with that viewpoint.
Um the the internet obviously gives us this this barrage of current information with no reflection on history at all.
No no no even concept of where the ideas came from or why they came from or how they evolved.
It's just current current.
This is how we do things right now.
Right now right now and everybody is all spun up into that into that mindset.
And by God, you can get a lot more done a lot faster if you take an hour and reflect back on, you know, the work from 20 years ago or 30 years ago or 40 years ago.
You can simplify an awful lot of stuff if you just go back there and and take the long view and go, you know, somebody else has solved this problem a long time ago.
The design patterns book.
This is a really this this is gets into my crop.
1995 these guys came up with the design patterns book which was the restatement of a bunch of problems that had been solved over the last 30 years.
And all they did was give them canonical names and canonical forms.
And the attitude in today's media is that it's archaic.
It's old.
It's all about uh workarounds for bad languages, which is just dumb.
It's just it's just the dumbest point of view you can take on that particular book.
But it's it's just the way that these the social media stuff is going.
It's right now.
It's got to be right now all the time.
Right now.
And you got to talk like this.
And it's got to be really loud.
And you better have something over here that's moving in the background because you can't focus on one thing.
And you have to be focusing on seven things all at the same time.
I'm such a stickler with TV.
I hate the idea of like people talk about like, oh, it's a second screen show.
I'm like, if it's a second screen show, it's not a show at all.
And like how I'm really big on like put your phone down, enjoy.
It's a visual medium.
Appre, you know, if you're not going to appreciate it, then don't watch it.
Um, I we're biased here on the podcast because that was our thought when starting the podcast, too.
I think it's even like our tagline on the website which is we live in a world of short form content you know and in in that world it's important to engage with long form ideas and we have been shocked doing the podcast how many books we read um I John well both of yours Bob we read clean coder which was more kind of about professional conduct and and John we read yours which is more about software design and I was shocked at how many things we would read in both of those books that like surface level I was kind like, "Yeah, yeah, I understand this concept." Like, you know, maybe I should skip this chapter or whatever.
But then the more time you spend with it.
And again, this is just reading through a couple chapters.
This isn't writing a book or like you said, John, like doing a PhD or something.
I was surprised how much I kind of had to interrogate my own assumptions.
And it's nice because you either realize maybe I didn't understand this as well as I thought I did, or you realize, well, actually, maybe I I don't support this idea as much.
or a lot of times the outcome is just I didn't change my mind, but I have a much better understanding of why I believe what I believe.
Um, and you can't get that from a tweet.
To get back to the to the debate, I think there's some there's some juicy stuff in here that I wanted to um follow up on.
So, let me uh one of them there seemed to be like an an aesthetic that I think both of you sort of danced around on.
Um, I think John, you mentioned Eye of the Reader.
uh when talking about mention like complexity.
Um I would I guess my question is like how should developers account for the different backgrounds that maybe the other engineers that they're collaborating with um might bring to the table when you're designing code?
Um and is that something that you should consider when you're designing code of like who's the audience that you're collaborating with?
Well, sort of.
But it it keys back into the whole issue of cognitive load.
So and and my view is that one of the most important things you're trying to do in designing the code is to reduce the amount of information somebody has to have in their mind in order to work with that code.
And so when you talk about different backgrounds, I think what you're saying is that some people are already experts in some area.
There's others are not experts.
That is they already have this information in their mind.
So what you'd like to do is to write your code such that you just don't need to have that in your mind to minimize that.
So if you're doing good design, I would argue that the code will be readable and workable by a large number of people with different backgrounds because you've reduced the number of assumptions and expectations that you've placed on the reader.
Yeah, that's great.
That makes sense.
Um, and I know that you the two of you have different approaches.
Bob, what was what would your philosophy or approach be to that as far as like thinking about um you know eye of the reader in in in your in your approach?
Well, sometimes you know exactly who is going to be reading your code.
I mean, you're working inside a team.
The uh the code is private.
It's not going to ever get out of the company.
There's maybe three or four people who are going to be interacting with this code.
And it even if one of them quits, another one's going to come in and absorb the same background.
In which case, you've got a fair bit of license.
Now, you can you can put into your head the mental model of the people who will be reading this code and then you can trust that they'll be able to understand what you're doing.
On the other hand, sometimes you're writing code that has a wide open audience and then the rules are really different, right?
and and you have to take a step way way back and say, "Okay, my my audience knows nothing.
They know the language." Um, and that's about it.
And I'm going to have to tread very carefully and and change my viewpoint from a uh professor to a third grade teacher.
And that's the way I would look at that.
Um now my career in my career I've been very fortunate to have um both of those situations um that I've had to deal with.
I've worked in extremely tight-knit teams where the technical knowledge was really you know well known in everybody's heads and and uh it's a very comfortable very comfortable situation to be in.
Uh, and I've also had to write software for an open audience that, you know, just wide open and then and then it's a little harder and it's a little little more thought you have to put into how you're going to get the message across.
In both cases, you are writing for other people.
You are not writing for the machine.
The machine is an observer, a bystander.
The machine has to understand what you're saying, but your job as a programmer is to make other programmers understand.
Now, this is an area where I think Bob and I disagreed and that Bob is more comfortable assuming more background on the part of readers, at least in some situations.
And one of the reasons why Bob argued he didn't need comments a lot of situations is because he thought, well, this code is only going to be looked at by a tight-knit team.
Everybody knows everything that's going on.
No need to describe it.
Whereas my opinion is that even in those groups, if you're working on a system of any size, people can't keep it all in their memory.
And now maybe this is a reflection of my age and infirmity, but I, you know, I find within a few months of writing something, I've forgotten what I wrote myself.
So that was an area.
So, so I my opinion is that you should if possible try to never assume any significant expertise on this on the part of the reader, but that's an area where I think we'd maybe disagree a bit.
Yeah, that was well specified in in the uh in the document.
We had that debate and neither of us moved ground on it.
I don't I've thought a lot about that.
I, you know, since reading your book, John, that idea of cognitive load, I think sometimes we as engineers think like that's the job, right?
Like the job is to get so good at storing all of this context in our head all of the time.
Um, and and then you don't realize like, well, there's maybe that's not the job.
Maybe the job is to to write code in such a way where you don't have to constantly store all that information in your head.
Um, I mean, when you guys, like you said, you have this comment or you have this discussion.
You don't really move ground either way.
Um, I get the impression neither of you are particularly bothered by that, right?
You both, you know, just agree to disagree.
That can be challenging for developers sometimes, right?
Sometimes developers feel like they want to win, right?
Or they, you know, they want their way to, you know, prevail.
Is that something you guys struggled with earlier in your careers?
Is that something you've always been good at?
And you know, just these days, how do you uh what what advice would you have to developers who maybe aren't able to kind of agree to disagree?
Well, I should start off by saying I'm a very competitive person.
I don't ever like to lose.
So, uh uh but you know, I I I recommend I recognize that disagreements exist.
The world I'm not going to convince everybody in the world that my opinions are right on every issue.
So actually one of my challenges for the discussion was to see are there areas in which I can convince Bob to change his mind or are we going to end up where at the end of the day we all have exactly the same views and actually I think I think there are areas where Bob's opinions softened or at least now maybe they'd already soften from what was in clean code but but they seem a little bit different to me like on the area of the small methods I think Bob has maybe is a little bit more aware of the risks of having super small methods than at least the original version of clean code did.
And actually my opinions have have changed at least a bit also in that honestly I'm finding more cases where I am comfortable chopping up larger methods into smaller methods than I think I would have if we hadn't had our discussion.
Now I'm nowhere near where Bob is on this.
We're still I mean you know we're we're miles apart but rather than being 10 miles apart maybe we're only nine or nine and a half miles apart now.
But I I feel like actually I have shifted a little bit in his direction and I have certainly moved as well and and I I've put this into the second edition of clean code and and in several cases I've credited you John for these ideas.
Um, so my views on um test-driven development, for example, uh you came up with a scheme that I hadn't thought of before.
Uh and and I couldn't shoot holes in it and you had to think about it for a long time and realize, okay, maybe it's not the way I'm going to do it all the time, but there doesn't seem to be anything I can I can complain about it.
Uh and so you know I put that in the book as well.
I said okay this is another option.
You can you could do it this way.
So um yeah the the discussion definitely moved me on certain opinions and I I'll go along with John there.
You know move me an inch not a mile but an inch is good.
You know you want to move an inch if you can move an inch.
So thank you John.
Th this is great.
I I was actually worried when I started reading about the the prime generator.
Um I was like, "Oh no, is this going to be like a is this going to be a straw man?" You know, we're we're basically we're like debating some code that wasn't necessarily representative, but it turned into something that was really cool.
It was it was interesting to see both of you re-implement this with your viewpoint on what good composition was and reasoning on why.
Uh, and I really appreciate it.
Like again, I went from this place where I'm like, "Oh boy, like this is just going to be uh tough to read to being like once we're in like the second section, I think it was really cool to see the back and forth of like, oh, well, this is why I made this approach or here's my short variable names, but more comments are better." And um, it felt like um, like maybe I'm doing this at like a, you know, a lower level where I've had debates like this in, you know, code reviews.
Um, but it was really cool to see like two um, you know, two sort of personalities in in the world where you know, both of your books come up in conversation like all the time when people are talking about things or why you you're trying to like use um, oh well in this book it says to do it this way and this is why like they'll defend their arguments with this.
Um, and so it was cool to see the two of you duke it out.
Like I will say that was like a very very fun.
Um what I wanted to to ask is I know that Bob you mentioned that uh you know John's views have actually influenced a second edition of the book that you're writing.
Um, John, I have a question for you, which is, do you think any of this debate is going to end up coming up in your in your class at Stanford, uh, as far as like talking about approaches and, you know, maybe pointing people to read read this if they maybe are, you know, thinking about things differently?
Well, it probably would except that uh I'm uh almost certainly going to retire at the end of this year and so I've probably taught the class for the last time unfortunately.
Oh man.
Actually, one of my one of the sad things about retirement is that I won't be teaching that class anymore because now we'll be back to a point where there are no classes in the world on software design, which is kind of sad.
So, I'd love it if somebody else if other people at other schools would start teaching that class.
Uh but so far uh no takes on that.
By the way, when I retire, I I I won't stop coding.
One of the reasons for retirement is so I have more time to code.
So I won't be going away in that respect, but I but I won't be teaching the class anymore.
But if I was, I I would definitely assign that discussion for students to read.
We'd and we'd have an in-class discussion about it.
And you know, and I and I would probably encourage students I' make maybe make students take one choose students have to take one side or the other and argue with each other about that.
I think it would be a really fun uh discussion to to kind of have have students have.
One of the things about the class is that it's a it's not a lecture style class.
It's much more of a studio style class.
There's maybe three or four lectures at the beginning of the quarter where I kind of set the stage.
Then everything after that is it's all discussions.
So I I think that would have made a really interesting part of the class.
Well, so what's next on the horizon for the both of you?
Um I mean that that's exciting for you, John, retiring.
I know Bob, you're working on second edition of Clean Code.
And I want to say Bob, weren't you working on a book?
You talked about um kind of detailing some of the the biggest figures in computer history from like inception to now.
Was there something like that?
Here it is.
There we go.
Okay.
Yes.
We programmers.
I remember.
Yeah.
Um, that's awesome.
Well, I mean, so is that I mean, both of you, so I guess maybe I'll start with you, Bob.
I mean, is that kind of what's consuming your time right now?
Have you moved on to other things or what's going on?
Second edition of Clean Code is um what's taking my time right now?
That's really close.
I'm going to submit the final manuscript at at the end of the month, and the book should probably be ready uh in August.
I have no plans after that.
Now, I have said that every year for the last 10 years, so I don't know what's coming something, but I don't know what it is right now.
I I may um I may actually just take a little bit of time and fly my airplane around and and uh see what else I can think of.
And how about you, Johnny?
Well, congrats on the retirement, by the way.
Um, I mean, do you you said you're going to keep coding.
Are you hoping to keep writing?
Is there a second edition of a philosophy of software design in the future or even or just anything else?
The great thing about being a professor is you can you can fractionally retire.
You know, you can become I'll become professor emeritus, which means I keep my office at Stanford.
I'll probably keep coming in pretty much every day of the week like I'm doing right now.
and you do the things you want and then you don't have to do the things about being a faculty member that you don't like like raising research funding.
It's sort of my least favorite activity as a professor.
So no more of that.
So I' I've basically reverted back to being an individual contributor again.
And the main thing I'm doing is I'm working on a new transport protocol called Homa which uh I believe should replace TCP for most uses in data centers for largecale applications.
Now, actually doing that is easier said than done, but this this started off as a research project for one of my graduate students.
It was his PhD dissertation and and the results were so amazing, really just completely exceeded my expectations that I've made it my personal goal to see if we can actually get it into widespread use.
So, I've personally developed a driver for it that runs in the Linux kernel.
In fact, right now I'm in the process of upstreaming that into the Linux kernel sources.
So, I'm going through the the code review process getting getting beat up on by the Linux developers.
By the way, totally fairly beat up.
They pointed all sorts of problems that I, you know, wasn't aware of.
And so, I'll probably continue working on that for a while until either it succeeds or I figure out why it can't.
And then there'll be other things after that, I'm sure.
But, but I'll probably be doing, you know, uh, more coding stuff.
That's so cool.
I actually I I've started tracking Homa after you when we interviewed you the first time.
Um you had mentioned that you were doing Linux kernel work um and that one of the areas that you you know a lot of contribution would be helpful is better comments and better um stuff in that area.
And so that actually kicked off.
I'm like well what what is he working on?
And so I think I noticed on Hacker News or something Homa had popped up and I was delighted to see that your name had been um associated with that and um I'm excited.
I mean I my background is a systems administration and SR work and so uh data center performance is something like with the bits flowing over the wire really matters to me and so I was like I really hope this gets traction that sounds really cool.
Well thank you both so much for coming on.
We have jokes but I think we're going to do it.
We are going to be submitting a poll request to the discussion repository uh to get some sort of credit for we could we'll attach a link to this conversation about it.
I think that would be awesome.
Um and again just so great to have you guys on um it really is like I I remember reading once I I wish I could find it but someone on Twitter had posted it was just like a little blog post but they kind of said the title of the blog post was how to be useful.
And I remember two steps really stood out to me.
It was uh have strong opinions and become famous.
And they're basically saying if you have strong opinions, you either sway people towards your opinion or you give someone that they become more clarified in their thinking against your opinion.
And they say by becoming famous, you can spread your ideas, right?
And you two I think exemplify that to a tea, at least within, you know, the software engineering world.
So um I I guess thank you so much for for being useful.
Thank you for freely sharing your ideas uh not just on this podcast but through your books and through the discussion you guys published.
Um and yeah, we we just can't thank you guys enough for coming on.
Do you guys have any closing thoughts before we wrap up and leave our audience?
Well, thank you for inviting us to be on your podcast both individually and then together that kind of kicked off the whole discussion.
I'd been actually hoping to have a debate with Bob for years because I'd had these disagreements with clean code kind of percolating in my mind and you guys facilitated that and and so I I we got to have the debate and I I hope that the results of that people will consider productive and useful and I'm not sure I can say that any better than John did.
Thank you guys for pulling us together.
Uh it turned out to be a um a great uh a great exercise for me.
I learned a lot.
I'm happy with the end result and it was a great pleasure to engage intellectually with somebody like you John.
Thank you.
And likewise like I like having you know I like having no holes barred technical discussions where the key thing is leave your ego at home you know so other people can say things that maybe completely conflict with your opinions.
You don't take it personally.
It's just a it's just a fun intellectual argument to see whose ideas can withstand scrutiny.
And so the the discussion really was kind of the kind of perfect no holds bar technical discussion that I really enjoy having and I think that those kinds of discussions tend to produce useful results.
Well, and and thank you both for uh the street cred for us.
I've had it happen a couple times with co-workers.
They brought up your discussion like, "Oh, yeah.
I was reading on Reddit and I said like, "Oh, is that the Uncle Bob uh John Oro thing?" They're like, "Yeah, yeah." I'm like, "Oh, yeah." Like, "I think that's my fault." And so uh well it it obviously had an impact though.
We actually recently had the creator of HTMX who's like big into hypermedia JavaScript minimalism Carson Gross and we were just having a conversation.
He was like oh yeah there's this debate between John Osterheld and and Uncle Bob and like he just brought it up in the interview and I was like this is cool.
Like I I I'm happy that this is making people's wheels turn on thinking about this stuff because I think no matter which conclusion you reach on which style is better.
Um being mindful about it is so important, right?
Spending more time thinking about why um you're building stuff the way you build it is so cool.
Well, thanks again uh both of you.
Really such a pleasure to have you on.
And thank you listeners for tuning in.
You can always find us at bookoverflow.io.
That's our website.
Um, you can contact us at contactbookflow.io.
I'm on Twitter or X or whatever you call it, Carter Morgan.
The podcast is the bookoverflow pod and Nathan does his work with Functionally imperative, his newsletter at functionally imperative.com.
And Bob and John, thank you so much for coming on.
It really, it couldn't have been more of a pleasure for both of us.
It was fun talk.
All right, see you later, folks.
All right.
[Music]
