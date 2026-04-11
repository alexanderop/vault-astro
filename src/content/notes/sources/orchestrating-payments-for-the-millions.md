---
title: "Orchestrating payments for the millions"
type: source
source_type: talk
source_id: "youtube:nJprIKMMXns"
captured_at: 2026-04-11
url: "https://www.youtube.com/watch?v=nJprIKMMXns"
speaker: "Faris Aziz"
conference: "Devoxx"
publish: false
---

## Metadata

- **Speaker:** Faris Aziz (Staff Software Engineer, Smallpdf)
- **Conference:** Devoxx
- **Duration:** ~45 minutes
- **URL:** https://www.youtube.com/watch?v=nJprIKMMXns

## Transcript

Using English (auto-generated) (en, auto-generated) transcript
[music] >> I feel like the the easiest way to start a talk is with a rubber duck.
Uh there's always that awkward moment before a talk starts where everyone's like shuffling around getting to the right room.
Oh no, this is not a Java talk so you're going to start leaving.
Um so rubber ducks are really easy.
Does anybody know the rubber ducky method in software development or why rubber duckies are only two people?
Okay, wonderful.
Okay, more hands.
That's why rubber duckies are important especially in the era of like vibe coding and everything.
Um another reason I bring a rubber duck around is because I come from Switzerland and if anybody knows anything about Switzerland it's super expensive which means that I can't afford to go to therapy over there and this tends to be a cheaper alternative.

> > [laughter and gasps] >> Uh so it's going to help me out during my talk.
> > But no, thank you for taking the time.
> > It's probably been a long day.
> > It's a lot to consume all this content and talk specifically in 45-minute uh segments.
> > So we're going to try to keep our attention for this one uh and I'll keep you engaged as much as I can.
> > So who am I?
> > My name is Faris.
> > I'm a staff software engineer uh at a company called Smallpdf.
> > Has anyone ever used Smallpdf before?
> > Okay, two hands.
> > Has anybody used a PDF before?
> > There we go.
> > So [laughter] uh it tends to come in handy to do stuff around with PDFs.
> > Uh not nothing fancy in terms of just being able to compress stuff, merge stuff, but we have a ton a ton of users.
> > We have over 30 million users per month which is pretty crazy when it comes to um PDF-related stuff uh and one of the worst things about working at a PDF company is that everyone now comes to me with the weirdest PDF problems in the world.
> > Somebody has come to me once with like I have a PDF with a nested PDF within a nested PDF and can you unflatten it?
> > Can you do this?
> > And in the almost 2 years I've worked at Smallpdf I've actually never touched a PDF.
> > All I do is monitor help monetize the platform and design our payments infrastructure and that's what the talk is going to be about today about what is all this chaos that comes along when you have to orchestrate payments for tens of millions of users across the globe.
> > Um some of my previous experiences also in the connected TV industry.
> > I've helped build platforms like Discovery Plus, uh GCN and Eurosport for the 2020 Olympics, worked in fintech previously, uh fitness technology.
> > I love web performance and web uh and engineering leadership and I also love contributing to open-source projects like Raycast and more recently I've been dabbling around looking into a new project called npmx uh which is catching a lot of fire.
> > Anybody here use Raycast?
> > Oh, we got to change that.
> > It works on Windows now so you don't have an excuse.
> > [laughter] >> Uh but yeah, I helped develop, you know, the official like Stripe extension for that and I'm also the co-founder of uh Zurich JS which is a JavaScript community in Zurich and I also built the Stripe community uh in Switzerland.
> > So I want to start this with a story time because we're going to be talking about an incident today.
> > And so uh at my company a couple of months ago uh at Smallpdf we had something called a Braintree outage.
> > Braintree is a payment provider that's uh created by PayPal and what happened was we actually lost our our Braintree integration stopped working because our API key was removed at some point.
> > What was actually happening is um somebody uh after working hours was actually going and uh deleting accounts because of of employees that had left the company at some point in time.
> > We had accounts that were still existing and they just went through and be like, "Okay, I'm going to delete their Gmail.
> > I'm going to delete this.
> > I'm going to delete that." And they never realized that actually our Braintree token was attached to an account of an employee that left.
> > Which meant that when they deleted the account of the employee all the payments stopped.
> > And we saw a lovely graph >> [snorts] >> like this.
> > I love the color red.
> > Don't we don't don't you?
> > 3,208 errors, not too bad, right?
> > Within the span of a couple of hours.
> > You see that spike goes up really really high and you can see it was really flat before on the graph right below there.
> > Uh and we had an incredibly high volume of payment errors.
> > 1,420 users being impacted in that period of time.
> > And those are 1,420 that were actively trying to pay.
> > Which means every time the error surfaced they weren't able to go through make a transaction that was actual revenue lost.
> > If you go look at this Datadog dashboard now, this is a Datadog dashboard that shows all the snapshots created when you attempt to create a payment or a payment tries to go through and you can see at that exact same period of time that just slumped all the way down.
> > You'll see there's still some payments that managed to go through and we'll talk a little bit by about why those were still able to go through in a minute.
> > Um but essentially that incident time was from 9:00 p.m.
> > to 10:00 a.m.
> > Does anybody here sleep at 9:00 or 10:00 p.m.?
> > I like sleeping a little bit early sometimes, right?
> > It's a little you know, you get tired after a long day.
> > Usually you don't want to be receiving a PagerDuty alert uh at this time or any instant alert at this time because these are core sleeping hours.
> > Especially for a company that is based in Switzerland for example and only works in those hours.
> > If you have you if you're an international company and you have a US hub, if you have hubs in Asia, sometimes you have teams that can work and overlap 24/7.
> > That's not always the case for all of our teams.
> > If you're good at math which I am not, that's 12 hours of downtime.
> > This is a significant amount of time to not be able to accept payments.
> > And then that's around about 5 to 10,000 dollars in missed subscriptions.
> > And beyond that there's also lost trust.
> > Sometimes people don't retry.
> > I would even, you know, argue that the amount lost is a lot higher when it comes to annual recurring revenue.
> > And today we're going to be talking about the story of how how do we change this?
> > How do we make sure that we can avoid this?
> > And to do that we have to first understand what are the struggles when it comes to payments.
> > Uh has anyone here ever used Revolut before?
> > Cool.
> > Uh why do we use Revolut?
> > Because before Revolut I'm using it right now.
> > I'm based in Switzerland.
> > I spend money and I earn money in Swiss francs.
> > Coming over here to the Netherlands I've got to spend money in euros.
> > I typically don't want to use my Swiss credit card cuz I'm going to have credit card fees and then foreign exchange fees and the rates are horrible.
> > I'm going to lose like half the money in a transaction just trying to get a croissant uh and that's not ideal.
> > And what was really interesting when Revolut came about as a mobile banking platform.
> > They now it's changed a little bit because they did get actually a banking license in the UK and previously they had an EMI license and there are quite a lot of differences between those uh two licensing systems.
> > But they worked on something called liquidity pooling which is really really interesting which is this whole concept of if I have Swiss francs and you have euros and an exchange were to take place that money sometimes doesn't actually even leave Revolut.
> > What they have is a source account system which actually pools money where let's say there's a million Swiss francs in one Revolut account and there's a million euros another Revolut account.
> > They actually have all your money pooled into singular accounts and retain a ledger that says, "Okay, this amount of money belongs to Faris.
> > This amount of money belongs to Bob or something else." Same for all the different currencies and if I want to exchange 100 Swiss francs for euros actually will not necessarily leave the system.
> > What will happen is that it will look for somebody else or a bunch of other people trying to do the same reverse transaction and just switch the numbers.
> > And that's how they're able to get it so cheap.
> > And what what's that to say is that there's a lot of complexities around different segments when it comes to processing.
> > Um so there's the effects and conversion problem we just talked about but there's also the optimization of payment methods.
> > Uh in Switzerland we use something called Twint.
> > Does everyone ever Has anyone ever heard of Twint before?
> > Okay, I was expecting no hands to go up.
> > [laughter] >> Um so usually not a lot of people know about Twint.
> > It's just our closed ecosystem essentially connected to our bank accounts being able to make payments with QR codes.
> > What's really interesting is that also in Thailand they have a similar system when it comes to paying with QR codes but just because you can accept a payment with QR codes doesn't mean that the Twint and the system in Thailand actually overlap or able to work the same way.
> > So each country has its own ecosystem.
> > Um in Brazil you have Pix bank transfers and I think what was interesting about Pix is that when we had COVID happening and a lot of people needed to receive certain benefits I think you did need to have some sort of a Pix integration for those benefits to be dispersed.
> > Couple of Brazilian uh friends told me about that so it's quite interesting about about the around the adoption of that payment method.
> > In India you have UPI which stands for Unified Payments Interface uh and we'll dig a little bit later into why this is also really complicated payment method to work with especially for subscription-based payment methods because there are complexities between one-time payments, subscription-based payments, and then now we're in a place of tokens being used so it's usage-based billing which has a different set of problems.
> > And in the Netherlands this slide needs to be updated but it was iDEAL payments and now I think this is shifting to a new one called Wero or something like that.
> > Um is iDEAL payments already deprecated?
> > I think it was in 2020 16.
> > No, it's still in the entire year, right?
> > So there's a transition period happening which is also quite interesting and I'm I'm a I'll see if I give this talk in a year's time and anything's changed around that.
> > But we'll take a little bit of an example.
> > Let's say we take the example of Alipay.
> > Alipay from like Alibaba and everything is a payment method a wallet-based payment method used in China.
> > And just introducing this as a payment method as an option in a checkout experience at Smallpdf we were able to increase revenue by 3.5x.
> > No price changes.
> > No nothing else.
> > If you were already making a million ARR in China 3.5x that and you're in a very happy place.
> > Just by adding a payment method.
> > Now, there's the payment method thing and there's also regulation and compliance.
> > Now, we're in a world where sometimes you're going to have to change the way you go about, especially if you have a global platform, change the way you go about processing transactions if you are operating in potentially sanctioned countries.
> > And these rules are changing based on, you know, political situations, sometimes even on a monthly basis.
> > And so you don't align yourself in a place where you're dealing with restricted transactions because you tend to then increase your risk profile.
> > So let's say for example, I mean Switzerland's a neutral country, but something let's say something's going on in Switzerland and I should not be able to operate payments in Switzerland for some reason.
> > There should be a system in place that allows your product to very easily adapt and stop accepting payments or reroute them or do something.
> > For example, in our case, we just offer our platform for free in countries that we cannot charge for because charging in those countries is actually riskier and more reputationally damaging than providing the platform for free in those countries until the situation changes.
> > So that's a big thing that one has to take into account, especially if you're operating globally.
> > There's also problems faced when it comes to business entities.
> > So if you have a company that's if you have a your your your company's based in one location and you don't have entities in different places, it's the same problem as, you know, employer of record companies have.
> > I can't just if I'm based in Switzerland, have a company in Switzerland, I can't just hire somebody like that in France or in Germany or somewhere else.
> > I need to go through companies like Remote First and Deal that are employer of record companies that have entities in the right regions to be able to then handle the transactions and be able to maintain all the HR rules and laws for those local jurisdictions.
> > And the same thing applies for payments.
> > You can't just start accepting payments in any particular region because some of them, like UPI for example, require you to have a business entity there.
> > And you're not just going to go open up a company now in a certain region to be able to process payments.
> > This is where merchant of record companies and uh are really really interesting.
> > Like so Stripe's a payment processor, a PSP, and Stripe acquired a company called Lemon Squeezy, which is a merchant of record.
> > You also have companies like Paddle that operate as merchant of records.
> > And the fees tend to be a little bit higher with these platforms, but they handle the tax complexities, uh managing, you know, the chargeback problems, and a bunch of other things.
> > But sometimes they're a little bit more limiting to work with because they have more overhead that they have to deal with.
> > You may not have access to as many payment methods, currencies, so on and so forth, but they take care of the entire regulatory overhead for you.
> > So, when it comes to uh compliance, there's of course country-dependent compliance.
> > And I think one of the craziest examples is that in the US, there are 11,000 separate tax jurisdictions.
> > You can walk 5 minutes and the tax is entirely different.
> > And in the US, the way it's calculated also is very very different.
> > You have to reach something called Nexus, which is a sufficient connection between a business and a state for something to be able to be taxable at that point.
> > For a certain region or for a certain street, it could be that Nexus is 100,000 AR.
> > For another part of the country, it could also be that, oh, you just made 200k, even if it's not annually, you made 200k over time, from that point time we're going to start have to, you know, charge taxes.
> > Or for some of them, it's from the first dollar or whatever.
> > That's actually a really complicated thing to handle.
> > I've been building the system for Smallpdf, it's taken 6 months.
> > And it's incredibly incredibly difficult, uh especially if you've locked yourself into a PSP flow where you want to integrate this manually.
> > It's generally quite easy to much easier to hand this over to a merchant of record to deal with.
> > The interesting thing that also comes out of this is to be able to locate you for your tax code, you we need to be able to also locate you from using your zip code.
> > Now, geo IP detection isn't super accurate, so we're not going to be able to get your zip code up to 100%.
> > So at some point in a checkout form in the US, you have to add a zip code.
> > Or you have to add add additional information, may even may even have to know the level of the street to be able to determine the tax code.
> > And we ran a little bit of an experiment and we saw that just adding two input fields to our checkout in the US alone dropped our conversion by 11%.
> > Which means that let's say you're making 10 million in the US annually, just making yourself compliant means that you're paying taxes correctly, which you should be doing in any case, but secondarily, you've lost a million even though you're doing it correctly.
> > And so that means you have to have tools in your arsenal to be able to recover the revenue while maintaining this compliance.
> > And then we get to the problem of chargebacks and disputes.
> > Don't worry, the story gets better.
> > We're not just here to depress you about like all the problems around here.
> > Chargebacks and disputes.
> > Has anyone ever subscribed to a service and then at some point they had the free trial for 7 days, you put on your calendar that on the sixth day I'm going to cancel the subscription, but then you forgot about it.
> > Eighth day happens, you get charged and you and you go to your bank and you're like, this is not me, I didn't do it.
> > Has anyone ever done this?
> > I've heard one laugh, so somebody's done this.
> > Okay, a couple of people.
> > Uh I'm pretty sure I've done this before where you just cancel before or you even use Revolut virtual cards and then you cancel them.
> > All these tricks because you want to test out software.
> > And there are all these things now that certain, you know, uh platforms won't accept virtual cards, all these problems that come with it, but when you have chargebacks and disputes, every time that you're actually saying that, oh, this transaction wasn't me, and then the bank has to dispute this with the merchant, not only do they have to refund you the amount if it was successful, they have to even sometimes pay like a 20 buck fee.
> > Which means if your subscription was 10 bucks and they have to refund you the 10 bucks, lose the transaction fee, and on top of that pay 20 bucks, it's a very expensive thing to go through.
> > Not only that, payment providers like Stripe, uh and a bunch of them, they actually track these dispute rates.
> > And if you hit a certain threshold of these dispute rates, they pull the plug.
> > And so for example, this happened at Smallpdf in 2021 where our dispute rate got so high that Stripe said, nope, we're not doing this anymore.
> > Pull the plug, payments gone overnight.
> > So, I don't know what the numbers exactly were, but I'm sure that it killed more than half of our ARR and the business was almost decimated as a result.
> > It's a very very scary place to be.
> > And it's very interesting that why did would this uniquely happen to a company like Smallpdf?
> > It's because what how often do you have PDF needs?
> > Unless you're an accountant or you work in a legal department and you have those needs every single day, I do my taxes once a year.
> > My PDF needs are maybe once a year where I merge some stuff together, I compress it, I send it over an email.
> > Which means I don't need a subscription for something like this.
> > Maybe it's a one-time usage thing.
> > So it makes sense that the pattern of behavior maybe for students who want to submit their homework is that I start a free trial, I use this product during my exam period or when I'm paying my taxes and then I cancel or I dispute or whatever else, and you have to deal with the whole chargeback and dispute problem and you increase that rate and then a provider pulls the plug.
> > It's a lot of work that has to be done to make sure that this dispute rate remains low.
> > And depending on your business model, it can really have a high impact because your customers react differently.
> > For for Netflix, it's very rare that you're going to cancel.
> > You'll just keep that thing for the whole year because you watch maybe movies on a regular basis.
> > It's a different risk model when it comes to these things.
> > And then finally, there's reliability and uptime.
> > So irrespective of API keys being deleted or lost, you also want to make sure if you're operating with 30 plus million users per month, that you can reliably charge at any given time depending on which countries are waking using your product.
> > So it's really important to make sure that they can do that any point in the day.
> > So you want to have as many of the nines as you can.
> > Does anyone know what five nine availability actually yields in terms of the amount of downtime you are theoretically allowed per year?
> > 1 hour?
> > Any other guesses?
> > 8 seconds.
> > I think I would add a couple more nines for that one.
> > [laughter] >> Uh it's actually 5 minutes and 16 seconds.
> > Does anybody here have a build pipeline that runs in under 5 minutes and 15 seconds?
> > So we already have a problem.
> > You're not going to be able to quickly get your agent to switch a couple of lines of code and then build something.
> > Your build pipeline's already a problem.
> > Sure, you may have, you know, uh images, the Docker images or whatever that you can switch to and you have, you know, the last 50 versions.
> > You can do rollbacks, there are a bunch of strategies in place, but it's a scary place to be when it's out of your control.
> > When it's the payment provider that's down.
> > Now, what's interesting is that Stripe actually boasts five nine availability.
> > But that's platform API level availability.
> > That actually doesn't necessarily mean availability at the payment method level.
> > So, we'll oversee a case over here.
> > This is the Stripe status page from a couple of months ago.
> > You can see there were elevated PayPal errors and that lasted for an hour and a half.
> > SLAs already broken.
> > You see bank contact errors for 45 minutes and then just general elevated API errors for 2 hours.
> > There's no way that that constitutes as a legitimate five nine availability at the payment method level.
> > Let's say if that was for example the Alipay case where you have Alipay as your only payment method, that's not going to have five nine availability.
> > So you need to be able to switch these things really fast to go back to having uptime because Stripe may work as a platform overall, but the payment method may not.
> > And if we go down for example to PayPal, they had some downtimes for like 8 hours.
> > So maybe it's irrespective of the gateway, the payment gateway like Stripe that is processing.
> > It could be even the downstream payment method that has outages themselves.
> > And so, again, you need to be able to react to these situations.
> > And how do we do that?
> > We do that with a concept called payment orchestration.
> > And the topic of orchestration isn't new.
> > We have now talks, I'm sure we've seen today about like agent orchestration, alter other types of orchestration.
> > It is generally a routing mechanism or how I like to say it's more like air traffic control for payments, directing the transactions based on the best route for cost, speed, and reliability.
> > And so, one system essentially manages multiple payment providers.
> > If Stripe is one, there's also Adyen, Revolut, and so on and so forth.
> > You have multiple of them in a single system.
> > And yeah, you route that transaction based on three core core criteria.
> > You could even have more criteria, but we'll say just cost, success rate, and region.
> > Cuz you can accept credit card payments, but that doesn't mean that every single provider has the same acceptance rate.
> > For example, um Stripe payments actually don't perform as well via credit card in India than payments for credit card via Adyen.
> > Same actual details you're entering in to make that payment, but the underlying gateway is different and have different success rates.
> > Then, there's also you're reducing your reliance on a single provider.
> > So, if you ever have that case where we have dispute rates or chargebacks or downtime in general, you don't have a single point of failure.
> > And the biggest thing of all is being able to optimize these payment methods per country for higher success rates because not every single provider gives you every single payment method.
> > For example, you can actually use a There's a subscription management platform called Recurly.
> > You can connect to Stripe under the hood as a gateway to process payments, but it they don't have Alipay available.
> > So, you actually have to integrate Stripe directly and bypass your subscription management platform to be able to have access to a payment method which 3.5 x's your revenue.
> > So, there's a lot of workarounds one has to do, and an orchestration system allows you to do those workarounds.
> > If we take the example of now comparing certain payment method payment providers, we're going to look at three core ones.
> > We're going to look at uh not two core ones.
> > We're going to look at Revolut and Stripe in different cases.
> > If we look at the country United Kingdom and France, Stripe fees for United Kingdom are 1.5x and 0.2 p.
> > Revolut fees 1% and 0.2 p.
> > If you're going to process for the with the same payment method and the same currency in the same country, why wouldn't you opt for the one with the lower fees?
> > So, a selected gateway may be Revolut in this scenario.
> > You're not charging your customers more, but your margin increases significantly.
> > Same thing for France.
> > We go down to 2.5%, which is the Stripe fee.
> > Revolut, it's 1%.
> > And then the same case comes in Cyprus where Stripe doesn't even operate in Stripe Cyprus, which means you can't even expand into that region.
> > So, you have no choice.
> > And if you now have a secondary gateway that you can assign, you can actually now expand and provide that as an option.
> > Same now for if we go to the case of uh the US and Canada, Revolut generally works in uh the European region.
> > So, Stripe actually has a win in the US and Canada because Revolut doesn't operate over there.
> > And so, you have no choice but to go for Stripe even though the fees are a little bit higher.
> > So, now you have flexibility to expand and navigate your growth into new regions because you can make the best of multiple worlds.
> > I'm going to look at the front-end architecture for this because payment orchestration isn't a new concept.
> > This is something that's exist.
> > There are products to like Primer that exist that allow you to do this.
> > However, these are generally API driven from the back end and are seldom actually done at the front-end level.
> > So, we're going to look at what a front-end architecture looks like to be able to do this.
> > So, let's say we stay we we start with opening your checkout.
> > When you open your checkout, we're going to initialize this orchestration layer.
> > This orchestration layer is going to consume your global state, whether it's Redux, Zustand, whatever you're using for global state, any rules configuration, a static set of rules, whether you can have them dynamic in the future, static set of rules that are consumed, and based on the global state and these rules, we do something interesting.
> > So, we consume these three core states.
> > User country, so what country you're located in, what AB tests are running.
> > Are you segmented into certain variants?
> > Are we testing prices?
> > Are we testing new payment methods?
> > And the list of currencies that we want you to be able to pay with.
> > And so, what this does is now we go into a decision tree, and this can be custom logic that you develop over time within your business.
> > There's no one fixed decision tree that you can design.
> > But what you do is then create a prioritized list of PSPs.
> > You don't just select a singular one, you create a prioritized list.
> > Why?
> > Because if one PSP is down, you want to be able to fall back to the next best one.
> > And so, then how does that look like?
> > Let's say we're in the case where we want to be able to pay in China using Chinese Yuan, and uh the best scenario over here would be paying with Alipay.
> > And they support the currency that we want, and they support the payment method that we want.
> > Now, let's say Stripe is down for some reason.
> > So, the next logical thing to do is select Adyen because the currency that we want is still available, but the payment method is not.
> > And in the worst-case scenario, we go for Revolut, which does not have the desired currency or payment method, but allows us to process the transaction nonetheless.
> > So, we want to never stop the user from getting to their end goal of creating a subscription.
> > Now, when it comes to integrating this in the front end, anyone here React developer?
> > Wonderful.
> > So, let me start with explaining what React is.
> > Uh no.
> > Um Just imagine this.
> > In React, we have a bunch of components.
> > This designs a user interface of some sort.
> > And to be able to use these SDKs that payment providers give us like Stripe and Adyen, we need to be able to import certain utility functions and components that they give to us.
> > What they generally give us are these things called providers.
> > Providers pass uh context to their children components.
> > So, a checkout is a child component of a Stripe provider, Adyen provider, or Revolut provider, which then gives it the context that it needs to be able to execute a payment flow.
> > The problem here is that in most multi-gateway flows I've seen in a front-end system, and this is what we originally had had at Smallpdf, you get into context provider hell where you're now just importing all of the SDKs, everything.
> > You're not tree-shaking anything.
> > You're not selecting you Even if you're not using it, you're still importing it and it's part of the bundle, and you're getting into a place of provider hell.
> > And what you ideally want is that you have a single payment orchestrator provider, a single component that dynamically, based on the state that we acquire from our global context, whether that it's our country being in China and our currency being chosen as Chinese Yuan, then assigns the right provider to use.
> > And then we don't load up the additional ones.
> > The same when it comes to processing the payment itself.
> > Every single provider will come with its own hooks, or you'll create, you know, abstractions to have hooks to process these payments.
> > And all of them have their own language of how a payment is interpreted.
> > So, Stripe may say that, you know, use the currency key for USD.
> > Or the way that Adyen understands a payment is you you use the submit payment function, and you provide a value, not an amount, and you use the currency code key to assign a currency.
> > And they all have these different ways of interpreting what is a payment.
> > And now you get to a place where you don't know what is executing what based on different, you know, parameters being assigned, and you get to a place where you have to map a lot of stuff, and it's it's a big pain.
> > And you want to be able to essentially design a front end that is payment provider agnostic.
> > We want to take away all this complexity and design our own understanding and schema for what a payment is.
> > So, our front end says that an amount is the value of a transaction.
> > We don't care about how the payment provider is going to process it cuz we're going to use adapters under the hood to be able to connect to these providers and then pass the information along.
> > Your front end should not care.
> > Should be as dumb as possible, and only this middle piece, this orchestration logic should handle the connections to the providers and everything else.
> > If we look at now what a gateway configuration looks like, it's essentially a JavaScript object.
> > It's really it's designed in a really simple way where we assign a gateway by saying that, "Hey, we've got Stripe." We give we pass it enablement criteria.
> > So, in what cases should I use Stripe?
> > Over here, it's in SQL SQ you know, uh syntax in the way they're saying we're saying that, "Hey, do this only in these uh situations." Or you can have or syntax, do it or in these situations.
> > And you can create and and or combinations to be able to decide when to load something.
> > So, we say only in China do we want to load this, only in this either feature flag called Stripe gateway or AB test being enabled.
> > And for the currencies, we don't care.
> > For we just put null.
> > You can you can accept any currency and work with any currency.
> > And then in this payment methods array, we will assign Alipay as a payment method, and we can assign a bunch more and say only in China do we want you to say that this is enabled.
> > So, then you can define enablement criteria at the gateway level and also at the payment method level.
> > And finally, at the end, you're saying, "Here's the provider from the SDK that I want you to load if all the criteria is met." And then we'll lazy load that.
> > And so, let's say we wanted to add a payment method.
> > Let's say we want to add PayPal, and we want to add that to be able to operate in the US.
> > You just add the US to the country list at the top.
> > You add payment add a payment method called PayPal.
> > You just say that based on the global state if you are in the US that is enabled.
> > And in seven lines of code, you've added a brand new payment method that is automatically adapted to being in the way that Stripe interprets it.
> > You have a mapping that's created and it will be able to work out of the box.
> > So it's super super simple.
> > And the way that I like to see this is a little bit like infrastructure as code like with Terraform, but this is a little bit different as I like to see this concept is more around payments as code where the benefits of that are really that you get to version control your payments.
> > So over time if you made mistakes or you want to go back to a previous state because certain results or analytics aren't as favorable as possible, you know what point in time these changes were made and you can roll them back.
> > These are not just happening at the you know in the dashboards of Stripe or in Adyen.
> > You just click and move things around.
> > You can version control and see how the system evolves over time.
> > You can then also unit test your payments configuration which means that you have you can actually do sanity checks to make sure that not you know things work in the countries or with the payment method that you expect them to work in.
> > Whereas if you're in a dashboard and you're changing things, generally you have audit logs assigned with who the logged in user was and with what groups and scopes that they had access to.
> > It's not an ideal place to be.
> > And then what we can also do is then AB test for cost efficiency at scale.
> > It's much easier to AB test on the front end than sometimes it is in the back end just because what front end to AB testing systems, it's very common for you to then open up your front end and then you query your AB testing system to be able to tell you, "Okay, we're in the variant or the original of this." So generally how we do it at Smallpdf is that we manage this all with local storage and we deal with it on the front ends that when you scale, we don't have all this cost associated with a bunch of API requests being made for this despite caching being being put in place.
> > So if we take the case of a 10 million ARR business, how does this actually impact us?
> > So for 10 million ARR business, you're making around $1,140 every single hour assuming you're running 24/7 365.
> > Now you have seasonality in place where there waking hours and sleeping hours where the revenue is not consistent like this, but we'll make a general assumption.
> > Let's say you have 99.9% availability which still not a bad place to be which then allows you your 8 minutes and 41 8 hours and 41 minutes of allowed downtime per year which gives you a potential loss of almost $10,000 a year.
> > That's not the only thing that we're trying to evade here just the availability problem, but also be able to generate uplift.
> > So just by for example prioritizing Pix payments in Brazil versus credit card, you don't only get an increase of 5 to 15% conversion, but you also avoid the credit card fees at the same time.
> > So you make savings at the fee level, get the uplift, have the availability, and then their savings tend to be in the multiple tens of thousands.
> > You can even get to a place where you have hundreds of thousands worth of savings depending on the size and revenue of your business.
> > Want to see a demo?
> > There we go.
> > Cool.
> > So I'm opening up the Smallpdf website.
> > And over here we're going to go to our checkout.
> > And where we're originally starting is we're starting in a place I think we're in the UK.
> > We're in Great Britain and we have PayPal and we have credit card available as options with British pounds as the currency over there.
> > Then I'm going to go to my dev tools and what I'm going to do is I'm going to change it to China I believe and then we're going to open up and see credit card is an option, but PayPal's not available to us.
> > Now if I go and look at the feature flag where the experiment that enables Stripe as a gateway, we've dynamically now switched to having Alipay available as an option and now Stripe is being loaded as a gateway.
> > And then if we switch now to another country, I think we're switching to the US here.
> > You now have PayPal, Google Pay, and a bunch of other options because PayPal I mean Alipay is not being used in the US.
> > Then switch back and we're currently in Braintree being used as gateways.
> > So now because this is all happening in the front end, we're reacting and our UI is adapting to what's going on based on the user state.
> > Just like over here in Germany, SEPA payments are much better to be used are much much have much higher conversion because people want to use IBANs.
> > So we have SEPA payments there.
> > And in India, even though this is a credit card you know UI that you're still seeing, you'll see the the design is a little bit different.
> > It's because it's using Adyen under the hood not Braintree and Recurly.
> > So same payment method, different gateway under the hood depending on the country because it has a higher success rate.
> > So this is the whole reactivity problem that we're trying to solve which wasn't going to be solved on the back end.
> > The UI now gets to adapt based on what the context is.
> > And so what we get from this is actually a 70% drop in component bundle size.
> > Which means that it is much much faster to load your checkout UI.
> > That in enough itself has a boost in conversion especially if you're talking about emerging markets where there really bad network conditions.
> > So this is really really nice.
> > And then even if you have you're failing to load the chunks when it comes to lazy loading, retrying is also much faster because you have a lot less to load to be able to get to a UI that's fully built.
> > Now let's talk about edge cases.
> > Stripe by default also consumes what country you're in and different pieces of context when you provide their elements UI and they decide their own order of oh should I put PayPal first, Apple Pay first, Google Pay first.
> > But what if this order that Stripe decides isn't the order that you want?
> > So this payment orchestration or rules configuration can allow you to sort of almost hijack or override whatever Stripe's payment ordering is based on what your AB tests showed were how your customers like prioritize payments.
> > For example, when you go on Google and you search for something, 30% of users go to the first result.
> > So this is such an important thing to make sure that the first payment method is the one that you users want.
> > And that's why being able to have custom ordering and being able to override payment payment gateways and how they do it is really important and much easier with this.
> > Then there's SEPA payments.
> > SEPA payments are direct debits via you using your IBANs.
> > This is predominantly used in Europe.
> > I mean only used in Europe.
> > And with most payment methods, you have a 24-hour less than 24-hour settlement period.
> > So you may have seen that you paid with something with credit card and then in your app for your credit card app, it'll show that maybe it's gray or that it's still trying to settle.
> > In 24 hours, the whole transaction completes and everything is good.
> > But with SEPA payments, you need and you have a 24-hour grace period for those, but with SEPA payments, it can take 5 to 6 days to settle.
> > If it's the weekend, it's not going to settle.
> > You even have a case where there's Bacs payments and those are predominantly in the UK.
> > Those ones are a little bit odd where they actually process I think once every couple of days and they all happen in one go at noon.
> > So you can't actually determine what what point that the the payment will be processed.
> > It just depends on what time you started the transaction.
> > So in cases of SEPA payments, you need a 6-day grace period because if you started a transaction or you started a subscription in a free trial with SEPA payments, you may be in a case where your free trial ends and you don't even know if the payment is valid at point in time.
> > So your entire UI or the way it restricts a successfully subscription paid state versus an unpaid state changes depending on the payment method.
> > And then we're finally getting to the topic of tax inclusivity or exclusivity.
> > In Europe, we're very used to the price we see is the price we pay at the checkout.
> > So in the in the in the EU, we are tax inclusive when it comes to paying for products, but in the US, it's tax exclusive.
> > So the price you see is not the price at the checkout most of the time.
> > So you see maybe a percentage added afterwards because all the tax numbers and the percentages they're not included.
> > So again, your pricing strategy also changes depending on the region that you're in.
> > And what this allows you to do is AB test maybe tax inclusivity inclusivity and exclusivity where maybe you want to test out in the UK, how do users adapt to you including or excluding the taxes?
> > And then we finally get to the case also with UPI in India which is also an interesting payment method where they have a 15,000 rupee threshold on mandate behavior.
> > So if your subscription cost is above 15,000 rupees per month, what happens is that every single month they get a notification on their phone.
> > They have 60 minutes to approve or decline.
> > So that means every single month whenever you want to charge, it has to be an explicit approval and this is this whole mandate concept.
> > So if you make your subscription cost actually 14,000 rupees, every single month the transaction will go through without an explicit approval.
> > And this is not just a bypass the system.
> > These thresholds exist based on the cultures in certain regions or based on the earning powers and so on so forth.
> > So your pricing strategies again would have to change in the scenario or you have other rules that are in place like with UPI, they have a dedicated app that they can actually pause and resume all their subscriptions in one place.
> > So outside of your UI, they're able to change stuff.
> > So you have to have webhooks in place to be able to support pausing and resuming.
> > So you actually have to add functionality to your application to be allowed to use a payment method.
> > So your application user experience changes depending on how somebody paid for it.
> > And this is something else that you can bake into your rules configuration.
> > Now let's talk about what happens when things go wrong.
> > And that's where anomaly detection is really interesting because when it comes to these rules configuration, too, you want to be able to set maybe data dog alerts that are segmented based on the success rates of certain gateways, currencies, and countries.
> > Which means that when something changes within a 15-minute window, you know that oh one gateway is down or one country is not performing as as as previously.
> > And from the example we saw all the way at the beginning where we weren't doing this anomaly detection or we weren't segmenting into different things that we want to detect, it's essentially the difference between throwing a rock in the sea where you don't see the puddle where you don't see the waves or throwing it in a pond where you do see the ripples.
> > Segmenting also the data that's being consumed or ingested by DataDog or other observability systems allows you to be alerted when there much more granular peaks and being able to make adjustments as a result.
> > And so that means that with a system like this, you're 15 minutes away from detecting metric deviations.
> > So if we're in a scenario where we say we get an alert and we have failing payments for Braintree within Switzerland, what do we do?
> > So let's open up.
> > We've got Braintree in Switzerland right now with credit card and PayPal as an option.
> > So it's important to know those two things.
> > I'm going to go to the code and what I'm going to do is I am going to now just go to Stripe and I'm going to add CH Switzerland as a country to be enabled in.
> > Stripe is loaded.
> > But we previously had PayPal.
> > So I want to have parity with the payment methods.
> > So let me just go and go to the Stripe configuration and add PayPal support as a payment method in Switzerland.
> > And now we have parity.
> > So in 30 seconds, you got well, you got an alert, fixed something up, switched the configuration, and our build pipeline is 10 minutes.
> > So we're 10 minutes back to operational versus 12 hours of downtime.
> > And your only limiting factor really is the speed at which you code and the speed of your build pipeline.
> > What if we could go one step further and simulate this when it comes to chaos engineering?
> > Uh and I think this is really interesting being in play implementing chaos engineering when it comes to payments and also having game days.
> > And I'd like to just demo this really briefly where we can take our payments configuration.
> > I got to go out here.
> > We're going to take our payments configuration and I just vibe coded this Ooh, I got to push it over here.
> > Which is I just vibe coded this application which allows me Okay, we're going to go here.
> > Is that visible enough?
> > Okay.
> > I vibe coded this application where I just have a little IDE baked into my web application here and I've copied and pasted these rules over here.
> > And because I've copied and pasted these rules, I'm actually allowed to simulate what happened if I go into different countries.
> > So let's say I go into Germany and I want to pay in euros over there.
> > We saw previously that the preference is to have IBAN or SEPA payments over there.
> > So what you're able to see is uh if I can scroll here.
> > No, I'm not not allowed to scroll.
> > There.
> > So if you see over here, you have Recurly.
> > This is really This is really small, so it's not great.
> > Recurly and over here is payment methods, you'll see you have PayPal, card, and bank.
> > And so what this allows you to do is have a You can have a situation where you can create a a fake outage with your team and sort of gamify how quick can you get back to fixing the scenario.
> > And sometimes we do this with our team where uh we'll say, "Okay, we got the same alert in Switzerland or in Germany or whatever." And how fast can we change the configuration to make sure that the simulator shows us the payment methods that we want, the gateways that we want, and get back to a success.
> > So then this also allows us to eventually improve the developer experience because maybe the way we've designed the type system or the way we the way we've designed the the API or the contract for this wasn't ideal.
> > So we can improve how fast we have or improve our mean time to resolution essentially.
> > Uh and then I'm going to get all the way back.
> > Cool.
> > And that's pretty much all I wanted to show you guys.
> > Um hope that this gave you a little bit of an o- eye-opening when it comes to how to deal with payments and all the complexities.
> > Um the last thing that I wanted to say is that I organize uh this Zurich JS conference or this meetup in uh in Switzerland.
> > Uh and this year it's turning into a conference.
> > So if you are interested in the web ecosystem and all that sort of stuff, we're flying some really really cool people there.
> > Um and it would be a pleasure to see some of your faces.
> > But thank you for your time.
> > Thank you.
> > [applause] [music]
