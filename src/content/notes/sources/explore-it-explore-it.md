---
title: "Explore It? Explore It! (Elisabeth Hendrickson — overview talk)"
type: source
source_type: youtube
source_id: "9FKY1Is0lgs"
captured_at: 2026-04-18
url: "https://www.youtube.com/watch?v=9FKY1Is0lgs"
channel: "Elisabeth Hendrickson"
duration: "39:31"
publish: false
---

## Metadata

- **Speaker:** Elisabeth Hendrickson
- **Title:** Explore It? Explore It!
- **Channel:** Elisabeth Hendrickson (YouTube)
- **URL:** https://www.youtube.com/watch?v=9FKY1Is0lgs
- **Companion book:** _Explore It!_ (Pragmatic Bookshelf)

## Transcript (timestamped, auto-generated)

[00:00] hi i'm elizabeth hendrickson i wrote a book called explore it about exploratory testing published by pragmatic bookshelf there are a lot of details in the book but in this video i wanted to give you a quick overview what is exploratory testing why might you want to do it and how to go about doing so just enough to get started so let's dig in let's start with what is it and why would you want to do it well as i mentioned i wrote this book and in the book i explained that

[00:29] exploratory testing is simultaneously designing and executing tests using insight from the last little experiment to inform the next so we're going to dig into each aspect of that in this video but that's what it is in a nutshell and let's contrast that with checking so if you have are developing software you probably have regression tests of some kind you may have unit tests integration tests

[00:58] whatever they are they are tests that you run over and over and over again and they check that at each step of the way as you make changes to the software that all of the things that worked before still work so let's say you've got a widget that handles various types of data you want to check that the past dates and the future dates and short strings and long strings you've got this whole list a litany of things that need to be checked over and over and over again so

[01:27] that is checking now exploring we don't start with any preconceived notions of exactly what we should be verifying instead we're exploring to discover what the software does its capabilities and limitations we're going outside the box and in fact depending on the kind of information that we're seeking we might ignore the fact that there's a box all together so in short checking is

[01:56] checking expectations that you have about the software that you're developing while exploring is all about discovering surprises and this is why i like to say that something isn't tested until it is both checked and explored okay you might be thinking well hold up here i work on a super disciplined team we have the developers writing unit tests at each step of the way in fact we're practicing test driven development

[02:26] incidentally if you are truly practicing test driven development congratulations not that many teams have successfully managed to uh use techniques like this but let's imagine that you are you've got amazing testing already going on your team has ci practices in place and is doing continuous delivery with fully automated pipelines and you've got somebody in a business role maybe a product manager maybe somebody else but somebody who can

[02:55] really say yes that is the business value that we intended to deliver by doing acceptance testing if you were doing all of this would you still need exploratory testing and i argue yes in fact you're in a better place to be using exploratory testing for what it's really good at than a team that does not have these kinds of disciplined practices in place but exploratory testing can still apply to any of these situations because in

[03:24] short your checks are kind of like a safety net and all nets have holes most organizations let's be honest they have a very loosely woven safety net the tests are inadequate or people don't trust them and i there's a lot of places that bugs can get through if you are on one of these super highly disciplined teams your safety net is

[03:51] much more tightly woven but nets can have holes and sometimes they can be really big holes so let's take some examples i want to introduce you to my personal bug hall of fame these bugs are all all the examples i'm going to explain they're all bugs that i found frankly on projects a long time ago but they still are valid and they nearly escaped but because the team

[04:20] was practicing exploratory testing we were able to discover them before the software shipped let's take first example i like to call this one your money is no good here here's the situation we were developing a payment flow for software as a service this is the first time this company had introduced a payment flow for this because prior to that the application had only been used internally so they were very nervous about turning on

[04:48] payments and uh they invited me to join the team to explore for risks related to taking payments up until the point when i joined the project the primary focus had been on making sure that customers could pay for the service and receive what they paid for without any hiccup i quickly discovered that if a customer's credit card was rejected for any reason including something like the validation on the zip code

[05:16] had failed the software kind of held on to that state and never let the customer pay for the software they could never purchase i found this by varying sequences of events all of the various things that can happen in a credit card transaction i was varying those sequences of events and discovered this relatively quickly another example is i like to call this go ahead grant yourself those privileges this is

[05:46] another different team where we were building enterprise software and we had introduced role-based access control where users belong to groups groups had roles roles had permissions and i had explored the the new role-based access control capabilities could not find any holes and the team that was developing this was doing very strict extreme programming so i wasn't surprised that i had difficulty finding

[06:14] holes in that safety net but it occurred to me that it'd be interesting to explore interactions with other features and so i started exploring around one of the things i did was to create a user that had no permissions except read they could read anything in the system but they couldn't create anything however it turns out there was one place where the user could make changes and save them back to the database and that was their own profile you could edit your profile

[06:43] i noticed since the user could read everything in the system that on the part of the profile where it showed what roles they had they had a huge uh multiple select field that showed all of the roles and highlighted the ones that they belonged to so it turns out that that field was made editable and so they could select themselves a new role hypothetically say the super admin role and then hit save

[07:12] on their profile and sure enough because of the way that the underlying software was built they could make themselves a super admin it was a privilege escalation bug very very serious and the kind of thing that nobody would have thought in advance to check to see if there was some interaction there so it was only by taking a an exploratory mindset approach to the system that we were able to find this

[07:40] and then finally i call this one zombie process land this was i think a particularly interesting example of exploratory testing because some people think that exploratory testing can only be done manually and it's not true exploratory testing is an approach a mindset it is a a process of discovery and that absolutely can be done automatically in this case we were developing an agent-based chat system where agents

[08:08] could chat with users and there was a whole flow for users that looked kind of like the flow that you might have with a telephone support system where customers call in they're put in a queue then they may get transferred between agents etc so in this particular system i built some model based test automation that knew about the different states of the client perspective or the user perspective and the agent perspective and just walked through combinations of

[08:38] states and sure enough it turns out that if a user disconnected like if they gave up and walked away and closed their connection while they were in a hold queue that call or that chat session stayed open but was a zombie nothing could ever be done with that chat session again and if enough custom users did this then you would end up with

[09:06] the entire system filled up with zombie processes or zombie zombie sessions uh clogging up the entire works so potentially very serious bug and only found because we were doing model-based test automation that allowed us to walk through every possible combination of states and events or states and transitions so even with these three teams where in each case they had incredibly disciplined software engineering

[09:35] practices in two of the three cases they were doing very strict extreme programming very thoughtful about testing there were still cases where we had unexpected surprises that could only be found by taking a a very exploratory mindset all right so if we look at the different types of testing we can see that each one answers

[10:03] different questions and so that's why exploratory testing absolutely fits into your overall test strategy regardless of all of the other types of testing that might be going on with your team it serves a completely different purpose with luck i have now convinced you of the why and and convinced you that this can be a useful technique or approach for your organization so let's talk about how how

[10:31] do you go about doing this thing so i like to think of it from a very methodical standpoint because what i don't want to do is go off with just no idea of what i'm looking for and performing random actions with no idea of what good looks like and three weeks later come out the other side with no idea what information i have discovered instead i want to take a very methodical approach and i like to

[10:59] work in sessions for me i like my sessions to be half a day to a day worth of time and in that time i'm doing the following things first i'm starting with a charter and we'll talk more about charters and where they can come from and what goes in a charter but it is the thing that's going to guide what information am i looking for then while i am actually in the loop of exploring i am executing my little experiments and

[11:29] observing and then going to use that information to inform the next little experiment that i run and what that looks like is first i'm looking for things that i can vary i am looking for interesting variables and identifying the kinds of heuristics that would be useful in exploiting the variables that i find we'll talk more about what variables are and how to identify them momentarily then i conduct a little mini experiment

[11:56] i try to do a thing and see what happens i observe very very carefully and then i use all the information that i just got to suggest a next series of things to investigate that could steer me towards risk and then at the end of the session again half a day to a day worth of time give or take i like to do a debrief and your debrief the format for that can vary the key thing is to capture the lessons

[12:24] learned uh in your your exploratory session so let's dive into each of these five things a little bit more deeply starting with charters what is a charter it is the statement of what information you're looking for it is a statement of explore the thing or the area that you want to explore the thing or the area that you want to get information about with and here resources could be um

[12:54] different configurations they could be different data or types of users or any other kind of of thing it could be other features that you want to explore with and then finally to discover the information that you're seeking these charters can come from just about anywhere sometimes when i'm exploring if i have a general sense of the kinds of information that would be valuable to the team that i am working with i will create a charter right before i start a

[13:23] session other times i will work with the team to brainstorm a whole list of charters and we'll actually put those into the team backlog as things that anybody could pick up and as a an activity between different programming tasks pick up a an exploratory charter and explore to discover information before moving on to the next programming task for example

[13:51] so charters can come from just about anywhere let's take some examples from the last set of bug hall of fame that i gave you so in the first example bug it was a charter of exploring the payment flow with different sequences of events to discover problems um with transactions and the second one was explore the new security system with existing system capabilities

[14:20] to discover possible privilege escalation risks and then finally the third bug was to explore this chat state model with a random walk of events and transitions to discover surprises okay so those are the charters or examples of charters and again i want to emphasize that they can come from anywhere and you can create them right before you explore or you can create them in a big group brainstorming

[14:49] discussion but if we start from the point that you have char a charter that you're executing against now how do you go about actually exploring and this is where variables come into play so the next step is to identify what are the things that i can vary a variable in this case is anything that you can vary that you can change directly or cause to be changed so for example maybe you've got a form that's got fields

[15:18] you can change the values in those fields obviously those are things that you can change you can change them directly so those are examples of variables oftentimes when we're exploring especially if we're exploring software for a that has been created by a team with very disciplined software engineering practices and we've got that tightly woven net there's good probability there's not going to be a huge amount of interesting information

[15:46] to be found in exploring by just changing the values of fields on a form certainly it's possible but but some of the more interesting variables can be things that are a little bit more subtle like say the size of the data you you don't set this directly you set this indirectly by using data of different sizes or different data formats or things where you have a different count of numbers or different position or location for a thing or a different state or different attributes or

[16:16] different sequences of events and method of input and oh the list goes on um if you're getting the sense that it's all variables you're right there are a lot of variables let's take just one example though from a publicly explained bug that happened with the uh nasa mars rover spirit this is a particularly interesting bug so this happened back in 2004 and as the

[16:45] mars rover spirit was on its its way to mars um they did discover that it wasn't responding at some point and it turned out what was happening was it was rebooting over and over and over again and what was happening with that well it turns out that along the way to mars the software had been active in gathering data and as it gathered data there was working memory and there was the flash memory where things were stored and so it was taking the data

[17:13] that was it was gathering and putting that onto the flash drive so it puts it on the flash drive and eventually it got to a point where um uh there were actually so many files on the flash drive that on boot up it would not all fit into the working memory and so the mars rover spirit kept going through this cycle of boot up load stuff from flash drive won't all fit panic shut down

[17:43] load up load from flash drive won't all fit panic shutdown and what i found so fascinating about this bug actually a couple things i found fascinating the first thing i found fascinating was that it wasn't about the amount of disk space that was taken but rather the number of files on disk and the second thing that i found fascinating was that they were still able to recover they were in the tiny tiny window that they had to send commands to the mars

[18:12] river spirit they were able to tell it to start deleting those files and after they deleted enough it was able to boot up and then it was able to complete its mission so it's a fascinating example of a a well-engineered system that was in fact able to recover from a catastrophic error in flight but the the thing that really caught my attention is that it's such a subtle subtle thing how many files are on disk so as you

[18:42] start looking at variables what you're going to find is that they're everywhere i there's so many things that you could change directly or cause to be changed it's practically infinite it's very fractal each thing that you discover is going to have attributes on it of its own files on disk for example have size format permissions etc um so it's a very fractal thing and the challenge for you as an explorer is to figure out what are

[19:10] the most interesting variables and this is why i say that exploratory testing is about navigating towards risk you're going to prioritize changing those things that appear to potentially lead to the most risky parts of the software the things that nobody has thought about before okay so so the next thing we're also going to do is design these little experiments and to do that we we use heuristics

[19:39] so uh heuristics well what is that a a heuristic is just a pre-planned problem-solving strategy that is derived from past experience with similar kinds of of problems so in this case since the kind of thing that we want to do is testing it's test design techniques which means that really good explorers also have a really good grounding in test design techniques how do you approach changing these variables what

[20:07] are interesting kinds of values so that you can explore for risk so for example one test design technique is boundaries boundaries and constraints so values that are too big or almost too big or too small or almost too small or just right times times that are exact are too late exactly on time etc um strings that are too short or exactly

[20:37] at the limit or strings that includes special or often reserved characters that violate a constraint within the system or counts that are too many or too few these are all examples of uh using boundary analysis to identify interesting tests and it's these kinds of tests that yield the joke on the internet about a tester walks into a bar and orders zero beers .98 beers nine

[21:03] nine beers negative one beers etcetera okay so what's another technique how about sequences and experimenting with sequences you can vary the order in which things are done you can skip steps or reverses steps or do undo redo and loop again and again and again and again i can't tell you how many bugs i have found by just looping the same thing over and over and over again turns out sometimes there's some variable that is

[21:32] affected by repeating a loop over and over and over again or say synchronizing to different sequences so they're trying to do the same thing at exactly the same time they may discover you may discover that there is some form of resource conflict in that circumstance uh another one relates to states and events and using states and events to design tests so any time that you can say the word while

[22:02] you've identified a state in your software so while the file is uploading or while the user is on hold or in the queue in the chat agent or the agent's chat sessions whatever that's an example of you've now seen a state and as soon as you see a state you can use state examples of of test heuristics for states like interrupting it and forms of interrupting it could include logging off or disconnecting or putting a pc

[22:31] into hibernate or causing it potentially you could cause it to time out or canceling an event triggering other events that may interact with this thing so let's take an example of a bug from a very long time ago that is not in my hall of fame of prevented bugs because this one shipped i was involved and uh to this day i still have nightmares about this particular situation

[22:58] so here we have a system that runs on pcs and is constantly monitoring to see what's happening and if it sees an event that it knows or a series of conditions that it knows are potentially problematic the software was supposed to pop up a little message to the user to tell the user how to deal with the problem that this software had identified it was intended to support users and prevent them from having to call tech support for help

[23:27] so the way that the software under the covers worked is that there was a process that was constantly monitoring what was happening on the pc most of the time if we look at just clock cycles most of the time it's in idle but when it wakes up it would collect data like what windows are open or what processes are running or how much memory is is taken up or left or free how much disk space is free etc things like that so it's collecting this data

[23:55] and then it updates its database of conditions uh to say this is the the circumst you know these are the circumstances that the pc finds itself in right now and then it would go back to sleep so that's the system monitor process there was also a parallel process the system update process that would go up to a central server to get new rules about the kinds of conditions that should trigger a message

[24:23] and so again most of the time that system update is in idle in fact it would only wake up about once a day to go get the new rules that would describe conditions that would cause the software to pop up an error or a warning message so that would go get the updates download those updates and then load that update into the database and then go back to idle

[24:52] so here's here's what we saw we knew that we were experiencing intermittent crashes in the test lab but they were incredibly rare we could not reproduce it to save our lives we had been we'd had something like 15 or so people testing this thing day in day out hours and hours and hours and hours and hours and in conditions that we believed were way worse than anything that would be seen in the field

[25:22] so we believed that we had done the worst that anybody would experience with this system so we we did unfortunately make the decision to ship even with this undiagnosed intermittent catastrophic failure because we thought we did the the sort of the risk calculus and said well it doesn't happen very often uh when it happens it's bad but it

[25:50] doesn't happen very often and we believe that the odds of any given user seeing it are incredibly low and so if it does happen we'll deal with it well what we had underestimated was the extent to which the real world is way more complicated than any test lab could possibly be and so uh you could tell from the screams of pain coming from our support organization that actually almost every new user of the system was seeing this bug

[26:19] how could we have been so wrong here's what we learned there was an interaction between the state of updating the database and the state of loading the update from the central server because loading updates required an exclusive lock on the database and furthermore in the lab conditions not that much was changing on those lab machines because they weren't real world

[26:47] machines they were test lab machines so i updating the database didn't take very long very very short there wasn't much new information to be gathered and then it just took a few nanoseconds to write those that that new information to the database also in the lab conditions when we connected up to the server there really wasn't that we would make sure that there were a few new rules so that we could test the functionality of

[27:15] downloading new rules and integrating them into the um the client but again very little new content by contrast every new user who signed up for our service uh the first thing that the software did was to go off and do a full inventory of the entire state of the entire machine took a long time and then there was a lot of data to write to the database so it was in that state for a much larger window and you've probably guessed where we're going here the first time they connected up to the central server there were a

[27:45] lot of updates that they needed to download which meant that that loading update was going to take a longer period of time so the odds of being in both states at the same time were virtually a hundred percent for any new user of this system this is why understanding analyzing the states of your software and thinking about how to cause states to occur at the same time

[28:14] is such a a critical test design approach um and why i really wish that we had been taking a more analytical approach to our exploration on this project but that's all water under the bridge it was over 20 years ago now um so time has moved on and i need to let go of this bug all right another test design technique analyzing entities and relationships any

[28:43] time you have a a system that has things like let's say you've got a payment system and there are customers who make purchases and then payments get applied purchases cause invoices to be created and then payments get applied to those invoices what you have are entities and relationships between those entities and whether or not this data is stored in a relational database they're still things that have relationships with one another

[29:11] so you can use some of the test design techniques that would come out of the sort of relational database world to help you explore this um first of all finding all of the ways to crud to create read update or delete any of these entities and then varying the values playing with the boundary values for the system but as you then dig deeper and start to look at the more subtle variables

[29:38] using count heuristics on dependencies zero payments one payment etc or potentially violating dependencies what if you have an invoice that somehow manages to have no customer is there a way to make that happen these are all examples of using entities and relationships as a test design approach to help inform your explorations or following the data all the way through its life cycle saving importing exporting searching here's the thing i mean i could go on

[30:09] endlessly about test design techniques and this would be a much longer video than it needs to be my goal with giving you these highlights is to help you see ways in which test design techniques are going to help you be much more effective in exploring all right so next we have to talk about observing observing is actually it seems so simple but it's actually really really really hard it is so hard to let go of your preconceived notions

[30:39] about what should be there or what you expect to see and instead see what is actually there um and i also want to tell you about a bug that it it doesn't hit my my hall of fame this this particular one uh it it um we got so lucky that we found this but we didn't find it through exploratory testing we found this

[31:08] through the simple act of having somebody in tech support use the software so it was right before ship and we were building something that was consumer facing it had an installer and we were testing the installer for the pc and all of the installed tests had come back green they all worked this was way back in the day and we were doing very manual installation tests when we gave it to tech support i got a

[31:38] call from our tech head of tech support to say what are you doing what what do you mean what are we doing um it doesn't work how could it not work it totally works no no it doesn't work so it turns out when we were doing installation testing we were only looking for errors so when i say it's really hard to observe where you choose to look is going to have a huge effect on what you find

[32:09] so we were only looking for errors which means that we weren't running the software after installation so we weren't noticing that it couldn't run that key files that needed to be present on an installation were simply not not being laid down by the installer it was it was the most obvious kind of error and it was really embarrassing to us uh that we had not found this error

[32:37] um fortunately though like i said we we did find this before shipping but only because we gave a preview to our tech support team so when i say it's really hard to observe that's both because we have our preconceived notions of what we're going to find and we may also only be looking in obvious places so you want to observe by using all of your resources all your senses hearing when a drive spins up for example not just seeing what's happening on the

[33:07] screen any tool that can help you dig deeper diagnostic tools or looking at logs looking at consoles looking using monitoring tools looking at any kind of telemetry that you have built into the software that you're working with so using all of those resources so that you could detect if something went wrong and one thing to ask yourself is if something were going wrong how would i know and use that question to steer you towards all of the places

[33:35] to look not just the obvious places all right finally final step in a session is the debrief and this is critical this is where you ensure that you capture what you learned about the capabilities and limitations of the software that you're exploring and put the information where it will have the most value so file any bugs that you happen to find work with your team to reflect on what you discovered you may end up having a

[34:05] conversation with a product manager who is steering the direction of the product to talk about the things that you're not sure if they're bugs because they don't exactly violate expectations that that the team has or the product manager has of the software but they felt kind of weird to you so all of these are examples of getting the information that you discovered out because if you don't get it out of your head then no one can act on that information and the value of information is in the

[34:35] actions that people take based on that information so you want to make sure that if there is something interesting in what you discovered it gets to somebody who can do something about it incidentally that includes you so i'm not assuming that you are a dedicated tester who never writes co production code maybe part of what you do as part of the debrief is to capture the bugs but maybe also part of what you do is then to pick them up and fix them right away and one of the

[35:04] most productive exploratory sessions i ever had was as a pair i was working with another developer and we did some exploration around sql injection attacks and javascript injection and we discovered that we had vulnerabilities and so we found the bugs in the morning and we fixed them in the afternoon and so within the space of the day we had a way more secure system than we would have had if we had just

[35:33] filed those bugs and then had to triage them and uh whatever anyway so capture what you learned act on it and then the final thought here is that actually it turns out exploring is learning and let me explain that in a little bit more detail what i mean by that so there's a learning model that goes like this first you experiment this is this is general learning it's not just about software

[36:01] it's not just about testing it's it's not just about technology this is a generalized model for learning that whenever someone is learning you're experimenting with reality with the the real world you're having an experience you're observing and reflecting on that experience and then you're abstracting distilling what you observed into lessons that then can feed your next little experiment

[36:29] this is called the cold learning cycle and it looks remarkably like the exploratory testing loop so exploring is learning all right let's let's just take a moment to talk about when should you explore and who should be exploring when uh who everyone when always and i'm not kidding about this so uh i'm not saying i don't value people who are really really good at

[36:58] exploratory testing i absolutely do and if you find people for your team or if you are a person who is really good at exploration oh you're worth your weight in gold um but they're not the ones who should be having all the fun you want that perspective on your team but you don't want them to become the designated explorer so um the nobody else thinks about these cases because if you'll notice some of

[37:26] the things that i described from my my exploratory hall uh sorry bug hall of fame are things where um we missed it and if i hadn't been there it's possible nobody would have spotted it and that's a problem so the team having the overall team having this exploratory mindset and being able to switch into this exploratory mindset is going to radically increase the probability that if there's a problem the team as a whole

[37:55] will notice it so you definitely want people who are good at exploring on your team and you don't want them to be the single point of failure for discovering surprises and then finally in terms of when always always i'll give you another example on a project where i joined on the second day of the project there was already a little bit of software there and i i explored the software that was there and discovered an entire class of bugs

[38:25] and by fixing that that the bug that i found we also learned about an entire class of bugs that was possible and prevented that entire class of bugs from ever happening so it's never too early to explore the second that there is something there to explore you could productively be generating information about it you could even be exploring ideas ideas about requirements or ideas about design

[38:54] so you always want to be exploring and everyone on your team would benefit from at least periodically taking a step back and having that exploratory mindset with that i'm going to wish you happy exploring i hope that this video has been a helpful overview of what exploratory testing is and why you might want to do it and if you would like to know more may i humbly recommend my book explore it from pragmatic bookshelf thank you so

[39:23] much bye

[39:31] okay and
