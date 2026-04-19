---
title: "Typesafe state in your URL — Eduardo San Martin Morote (Vuejs Amsterdam)"
type: source
source_type: youtube
source_id: "Wz57d7ijW28"
captured_at: 2026-04-18
url: "https://www.youtube.com/watch?v=Wz57d7ijW28"
channel: "Vuejs Amsterdam"
speaker: "Eduardo San Martin Morote"
conference: "Vuejs Amsterdam 2026"
publish: false
---

## Metadata

- **Speaker:** Eduardo San Martin Morote (posva) — Vue core, Vue Router and Pinia author
- **Title:** Typesafe state in your URL
- **Conference:** Vuejs Amsterdam
- **Channel:** Vuejs Amsterdam (YouTube)
- **URL:** https://www.youtube.com/watch?v=Wz57d7ijW28

## Transcript (auto-generated, sentence-per-line)

All right.
Now, before we start, uh, I have to say that I'm really surprised to why Evan isn't opening the conference.
Right now, I don't have an answer for that, but I do have today a lot of answers for URL and state management.
And um I'm really excited about it because it's going to be a nice new release for V rocker in the future, but I'm getting ahead of myself.
As Alex said, I moved to Berlin.
I'm still looking for a master swimmers club.
If you have any contacts, please reach out.
Really important for me.
Anyway, today I want to mix the two topics that I love the most about routing and state.
I want to talk about type safe state in your URL.
Now state is something you use every day right whereas it comes from local ephemeral refs reactive shallow ref that are lost and unmount pina stores so global state that are also ephemeral but lost when you reload the page to not so ephemeral because they are preserved upon reload um so local storage this is from view use by the way or fancier ones like use ref history which allows you to time travel kind of uh by preserving a a list or a stack of the changes on the state and then the one that we often forget about the URL.
Now the URL as state we are already using it in a way we are familiar with it.
We have the domain which we're going to forget.
Then we have the path which is usually matched by the router and the router extracts uh from these path uh parents like 42 here.
Then we have the query which is not matched by the router yet but uh it's more flexible in a way.
It's about optional things, pagination, uh filtering, sorting, all these kind of things.
And last but not least, we have the hash.
The hash is a bit special because it's client only.
So it's never sent to the server and it's usually used for scroll restoration.
But that's not the only thing.
It can be used also for uh more innovative things.
For example, in the VueTS uh repository on GitHub, we use this for reproductions.
So we ask uh people opening new issues to just create a reproduction and the actual code is embedded in the hash which is really fun and is really nice for us and it has something really nice that the other states do not have is that the URL is the only state that is visible to the user.
Your other state is in the code right in the runtime.
The user is not going to open your app and change the state.
They're not going to open the console and change the state or inspect it, right?
Or copy paste.
That's why you use things like sentry to get bug reports.
But it brings a few uh perks or superpowers as some people like to call it.
And the first one is teleportation.
Uh this comes from the ability to share link.
How many times you search for, I don't know, a product you want to buy, you want to ask the opinion of your friends, you just copy the URL and you send it over and they tell you, "Now this is terrible shoes.
You're going to look like a loser." Um, this is something that people now well they use normally and it should be that way because it's baked in in the design of the URL.
And the same happens for on the right you see the that's the playground for the view repository uh issues.
So we can share the reproduction easily and this is something that none of the other state has because it's not exposed to the user.
We have also builtin time travel kind of like the use ref history because we have the back and forward button.
So we or rather the browser keeps a history of all the different URLs visit and going back and forward allows you to restore and kind of teleport in a way uh your applications to a different state in time.
And last but not least, we have server client uh communication.
A very limited one of course, but uh often forgotten.
It's really about redirects.
So when you visit a page, for example, the dashboard, and you're not authenticated, the server can reply with a redirect saying, hey, you have to go to the login page and if uh the user succeed, then redirect them to the dashboard because that's where they initially wanted to go.
And then you log in.
uh that can change based on how well your process of login works but then you get back to your initial page and then you get maybe a token or an extra information that the client side works.
Now there is a big catch about URL state because all these three superpowers are really nice but the URL is just a string.
So anything you get out of the URL is going to be a string as well.
And if you try to manipulate that state, well, you might have some surprises like numbers that are not correct, incrementals that do not work, true uh or false booleans that are going to be always true or even weirder things if you are dealing with floating numbers.
Now in view router we still have some of these limitations today because even if you use the type routes uh which are going to limit a little bit the possible types for the params you still need to handle any validation yourself or any parsing yourself.
For example, if you need a number you're going to apply the number constructor to the param ID and then check if it's a nan because that will give you errors and then handle the error or not.
And this is needed in many cases.
Now numbers are an easy scenario I would say.
Uh and maybe some of you are thinking what about regular expressions and it's true that you can trim down a little bit the amount of errors uh and the work needed for validation with regular expressions but they do not solve everything unfortunately.
Now query params are even worse because they allow strings null and arrays.
So when you do validation you really need a little more code to handle that like is this an array no then I have to filter null as well.
So it's a lot of a lot of work and this creates a lot of noise uh not only for well nowadays we talk about context right in AI but also for humans if you're reading your component and you have half of it that is just parsing numbers validating numbers validating objects that come from the query or the parameters well it gets in the way of working right this is all noise in a way and it's a bit annoying because it's not only the script it also goes into the template you also need to check there if you want to display the error or not.
And I think that well this is not a page job, right?
We already have the router doing the matching.
We're already matching the URLs.
We can apply reg.
Why not move also the validation over to the router and which you can you can just strip off completely this part of the of the page.
What if it just worked?
So this is what I'm proposing today.
Maybe a little bit dumb, very simple, very simplistic.
Uh, but what if just the parms had the type version of what you want?
What if both path parms and query parms were combined into the same object?
Because for the component, it doesn't matter where these come from.
For for users, it does.
Careful about that because you might create breaking changes for your URLs, which is something a little bit complicated to handle.
But another topic uh but for your page component, these are just props or state.
Okay.
And it should be typed.
It should just work.
And this is what I want to or what router resolvers are going to solve.
Okay, it's not a fancy name.
I don't want it to be fancy.
It's more of a API of the router and I'm really excited about it because it's something that no other router has done before or I haven't seen it.
So I I find it really interesting.
And so the first step if you want to try it out you have to go out adapt your route definitions.
Now nowadays you have this simple route definition and we're going to change it for something a little bit more complicated.
Now you have this path that becomes a a complex small object called a matcher that allows you to have more uh validation logic in it.
And we can do the same for the query because now we can also match uh the query.
Now we need to take a look a few seconds uh to the this code and I'm going to drink a little bit meantime and I really hope that this is what is going on in your mind.
This is a horrible code is very verbose.
It is not meant to be handwritten.
The first step is to not write this code.
Okay, this is code that is generated not by an undeterministic AI but by a deterministic plug-in.
This is code that is performant and compresses very well.
This is why you have unreadable stuff going in there like positional parameters that a reg x first then an object then an array with string and numbers.
What the hell?
The first step is to enable the view router plugin.
Now, if you haven't done it already, uh, in view router 5, I merge unplugging view router into view router.
So, filebased routing is now a core part of your router.
And you just need to import it from the from the package.
It's an unplugging plugin.
So, plugging plugin.
So, it works with vit uh rea and everything.
Uh, I'm just using vit here for the example.
Now you enable it in your plugins and then you can enable the experimental parsers.
Terrible name I know but bear with me.
It's just an experimental experimental uh flag.
Anyway, now I want to know I think I can see who has updated view router to version five.
Oh, they put the lights on.
Very few people.
So it's a nonre who is using Yeah.
Okay.
So with it will be out of the box in the next version.
um it has no breaking changes so you can upgrade safely.
It was mostly about merging the two uh repositories and code bases together.
Uh where was I?
Uh yeah the first step the second step is to use the experimental router.
So if you are already using filebased routing you are already importing from auto routes which is a virtual file that creates the routes array for you and then you just pass the array.
So it also simplifies your router file a lot.
The change is simple.
Well, it becomes autoresolver and you import a resolver that is also generated for you which if I have time I will show you also.
Uh that's pretty much it.
There's also the experimental version of the router which is a new version of the router that accepts this new option resolver otherwise it wouldn't work.
And last is last I think it's not the last one but third we define parameters.
So in your page components if you define a a parameter by putting it between brackets.
For example, here I have a product ID.
Uh now you can add equals and then the name of the parser and it's going to transform the type.
So here um we have the type as a number.
We can also use define page which is a macro.
So it's not it's completely scripted on at build time.
It's only used during build.
And then we have these path option and query options that we're going to cover a little bit.
If the int and bool param parsers do not work for you, you just create your own.
Now, I'm not even sure that I'm going to keep the built-in parsers.
I think I will, but still experimental.
So, working out there.
You just drop a new file in SOC parms and then you can use equals the name of the file.
That's pretty much it.
Now, the param parsers are themselves pretty simple.
We have few different functions like define path param parser, define param parser, define query param parser because they have different constraints.
Something from the query has more possible values than something from the path.
Also, we don't want you we don't want to enforce you to solve all the possible cases.
So, as you see here, for example, the get accepts a string.
So that means that this path parent parser only works for a regular value that is always required and the get is going to be the function that transforms the string into whatever you want and I really say whatever you want.
It doesn't have to be a primitive and the setter is going to be the opposite.
Now there is something interesting is that any error thrown inside of these custom parameters is going to just miss the match and that means that the resolver is going to skip over that route definition and go into the next one.
So it's not going to just completely stop the matching but it's going to try to fall back into all the routes which makes also routing more predictable.
Anything in the setter can be done as well.
You can return for example there an empty string as you can see on the last line.
That means that the getter later is going to pick that up.
So that way we only have to write the validation in the getter.
This is because when we create the routes or rather than we um we normalize the routes, we need to run the getter after the setter in order to ensure that the values are correct.
So you only need to write the validation logic in one place.
Now, all this is really nice, but I have a little demo prepared because there is a lot of typing involved and I figure that it's not the same without.
So, I'm going to open uh let me see.
There you go.
Gonna put the other notes on the side here so I can check them.
and I'm going to start the server.
Okay, so this is the little thing I have prepared is a nostalgic XP uh Windows XP themed application.
It has a V config uh router config.
So let me just show you real quick.
We have the view router here defined with the parsers and uh then the router is just the experimental router that I show you with the resolver here.
All right.
Now I'm going to go to this product.
So the product that you see here, let me just go here is we have here.
So we have a few nostic products from the 2000.
Um and well you have uh I cannot show the URL which is a bit annoying anyway.
It's too too small but the ID is a number.
Okay.
So any URL here is going to be like one or two or 24 or whatever.
And then if you go to anything that doesn't exist like 999, it would just not find the the the product and display an an unknown.
Also any route that doesn't exist like any so an invalid uh ID will still match the route and would just end up in the 404 here which is a little bit of inconvenience because it's not really a 404 I mean it's still a 404 but not the same kind and you can differentiate that in your page at runtime but it would be better if it was handled differently.
Now how does it work?
Here we have the route and if we go to the route here we have this product ID that is um just parsed into a number.
So now if I want to change that I'm going to rename the product ID and I'm going to add the int in the in the name.
So that's going to rename that.
And if we go here now the ID has become a number.
Now this wasn't a number before uh I should have showed you but now you have to trust me.
So what does this mean?
It means that now we can remove everything that is parsing validating.
So for example here uh I'm going to check where this is used.
Uh it's used here and here.
So I'm going to remove this completely actually.
Uh remove this because we know it's not uh it's not a nan.
And then we're going to do route.params dot product ID.
And I have a typo.
So here the params is actually an object that contains only that value and the number.
If you have used type router before you will see product ID string which is already great but it's not the perfect version.
So by just changing the name there we make this type safe.
Also worth noting that the route here um is being matched to the page we are in.
So that's why if you have used filebasing routing before we are not providing the argument here.
This is a recent improvement but really nice.
Now I don't have any errors in the in the page.
And now that I move this here, if I go back to my page, well, this was the page from before.
It's the nope in the URL.
And I get well not found.
I can go back and this one still renders with the not found, but I just reduce a little bit of the surface implementation that I have to handle for the products.
Now, this is still pretty straightforward.
So let's get into something a little bit more complicated.
I have another page here that has a when.
Now this one doesn't transform.
Um it's a custom parser and I have not at the beginning here.
I do a new date and then I have I need to check if it's not a number which should be number by the way but doesn't matter.
Uh and uh if I have errors, I also have things that are going to crash.
So just to show you, I have this today here.
Uh here we can go to uh the something invalid and it's going to get me invalid and I get some errors.
But all of these I had to write code for it, right?
I need to write code in my page here to handle that.
So what I'm going to do is I already wrote a parser.
So I'm just going to add date.
And now the white has become a date.
So I can again I think this one is used in a few more places.
So I'm going to keep it like this with a computed for the sake of refactoring.
Yeah.
But is valid doesn't make any sense anymore because we know that uh well this is a valid one.
So I'm just gonna follow the errors.
It's valid.
Yes.
What is this?
The push doesn't work.
We're going to handle that later.
Uh I'm going to explain that why we can remove the error handling here as well.
Let's move to the next one.
Same here.
Same here.
Uh return error.
Same here.
Again, this is the kind of thing I would ask an M to do from me nowadays, but and now I can also remove the parts on the template.
So, the field set here uh removed.
Oops, that wasn't what I expected.
Now, I probably have a VL.
Oh, no, I didn't.
Okay.
So now the only last renaming remaining uh error is this navigate to date which is used when I want to navigate to a date and experiment.
Now these are always going to be text uh because they come from the inputs.
So I have a few tricks to change this.
I'm going to show you one that I really like.
Uh I can just do this.
So this is a relative location.
uh by by putting the dot in front we mean that we want to change the last section of the URL completely.
This is regular in URLs.
And now I don't have any more errors.
And if I go back to my uh to my page now I get a 404 with an invalid invalid date which is great.
The other ones are working today and uh what was this?
The first day of the year that are working.
And if I put anything here 404 pretty cool how does this work?
This works by specifying uh custom parser.
Oh very simple in this case because I'm not handling arrays and optional values.
I'm throwing uh am I throwing?
Yes, I'm throwing this uh error here.
So miss is a function that you can import.
It really just throws an error.
So any error thrown works.
This is just for debugging purposes.
And here I'm applying a small trick to remove the last part of the date uh for some easier strings.
Why not?
This is all about customization.
You you do whatever you want.
Okay.
What else?
Now, why not import it from somewhere else like you can do whatever you want.
But what I want to show you now is one a little bit more interesting because this one is let me do search.
We have done only path farms, right?
So what about search?
In this case, I have the route here which has no parameters.
So what I do here is use the the Q uh and I have to cast it here or technically I should do actual proper validation anyway.
So what I want to I want to do now is define this Q as a proper category here.
Uh not category as a probably proper query.
So I'm going to use define page and then I'm going to do params and this is typed and then I do query and it already worked out.
Okay, I'm gonna still go ahead and show you but I can do this and now I go back here.
I move this into pars and you will see well I remove this and you will see that Q is either a string or undefined.
Now why being undefined?
I could always have a fallback value.
So I'm going to remove that and I'm going to put default an empty string.
And now this is always going to be a string.
I remove that part on the on the on the URL and it works the same way.
So we have a search here that works now.
Yeah, Photoshop.
Uh I show another URL which is very small but I can share the the link with you later.
We can filter free.
Of course, there is no Photoshop that is free, but we have Winamp and other things that are free.
And what is cool about these syntax is that is also very easy to understand even for LM.
So, for example, uh page uh is going to be a parser and these here have in.
So, we have auto completion there as well.
And what's cool is I can just pop a codex and be like uh gonna paste this because I prepared it.
Okay, did I save?
I saved just in the search of you refactor the query params like I did for Q and page.
This is not a replay session.
This is really going through.
So if it fails, it fails.
But it didn't fail.
Uh so this was using also the ultra fast which I can use because they give me the open gave me uh thanks to open source access to the good model.
So that's great.
Thanks to them.
Uh this is not sponsored by the way.
Um but yeah, pretty much removed all the validation, moved to the the defined page here, replace the the page.
It even found out that I was using route query here and now becomes route parm.
And uh did it do any mistakes?
I didn't tell him.
So I didn't tell it not to make mistakes.
So maybe yeah, it imported define page.
So that's the only uh error here is define page which is not needed.
But everything works the same.
Always going to the wrong direction.
So here the page still works.
Um navigation works.
There is no type errors.
No type errors anywhere.
And we just refactor out the validation.
This has less tokens uh less words for humans.
Uh so it's more efficient a more efficient way to work.
Now, uh, let me just make sure I don't forget anything.
And yeah, moving to the next one.
So, this is the small thing I want to show you because I think speaks a lot more than talking about about what does it mean.
Now, there's something you might notice is that path params are strict, right?
Anything that doesn't match well it just fails and it lets resolve maybe another route but query params are resilient uh is the opposite by default they can fall back to undefined or a default value is provided the idea is you should always render a page with valid and typed data and I think this matches well the nature of params right in query you want optional things and in params you want things that are more strict now I want you to uh warn a little bit about limitations uh URL is not storage.
So don't put everything on the URL.
Uh you have a limitation of 2,000 characters which might seems like a lot but it's not that much.
And this is because of Internet Explorer.
Uh again um always blame the same person.
Uh but basically Edge I think also follows this limitation.
In any case, you're not going to share a 2,00 uh characters URL.
Like people are going to look at you like what is this hacker?
Um, and also, uh, take care about SEO when you do query pars because this is something people forget a lot.
Anything that is cosmetic, anything that doesn't change the the content, it's still going to look like three different pages that are competing in the ranking on SEO.
So, you need to use canonical URLs.
Any cosmetic par should be stripped from the canonical version of that URL.
But anything that is meaningful should be kept.
So, for example, a page, the sword, etc., that should be kept.
It's very important and often forgotten.
So the last question remaining I guess is view 6 when when is it coming out?
The real thing is you can already try some of these.
I mean you can already try these experimental things.
I show you the the code.
Uh but uh we have a few things left done.
So this automatic canonical URL generation is one of them.
Uh there are a few bugs that are tracked.
There is also nested analysis not working.
And the version I show you is a static resolver which means that we don't have dynamic routing built in.
And the key to this is that we move everything of the par of the parsing of the routes to the build time.
Now this has a nice benefit is that the minified version uh goes down by 30%.
Uh broadly size that's 6 kilobytes.
That's extremely light for a router I have to say especially with so many features.
Of course, this is the minimal version of your router.
If you add more things like data loaders or any other function um is going to go up, but still very very small.
And I think usually these percentage changes, they go up as you add new features.
But because we move things to the build time, this is going to stay very close to 30%.
So really good news, I think, for the router.
This includes uh router link and router view components which should also get trimmed down a little bit.
I have plans.
So the question is more like how to get prepared.
Uh if you are using row string with no safety you should move to type routes ideally with filebased routing.
Give it a try if you haven't because there is a lot of options configurations that we can add and it's really nice if you can build validators if you use zod valbot whatever.
uh if you can try to prepare for birectional uh validators it's not in the standard schema yet but I hope it will make it at some point otherwise I think it's losing a lot of potential in zod uh those are called codex uh otherwise you can write your own functions honestly most of the time they're very simple and then in the future well just embrace filebased routing if you can't uh clean the pages use custom uh parsers you can move these validators into the the paras and get nicely typed uh pars.
I'm really excited for this.
Uh you can try it already on view router 5 not in the experimental uh folder which is a new initiative I I I wanted to have to try out and experiment with uh new features.
Of course it's not production ready.
Uh but please try it out in toy projects or small projects.
It should be fun.
Thanks for having me.
I hope you have a nice conference today.
