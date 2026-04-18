---
title: "Deep and shallow modules: Module design for reduced complexity"
type: source
source_type: article
source_id: "https://vladimirzdrazil.com/posts/deep-shallow-modules/"
url: "https://vladimirzdrazil.com/posts/deep-shallow-modules/"
captured_at: 2026-04-18
publish: false
authors:
  - vladimir-zdrazil
tags:
  - software-design
  - software-architecture
  - abstraction
  - complexity
---

# Deep and shallow modules: Module design for reduced complexity

## Updates

- Added
  [TypeScript example](#typescript-example).

[TLDR](#tldr)

To keep complexity in check, prefer deep modules to shallow modules. A deep module has a lot of functionality hidden behind a simple interface. A shallow module has a relatively complicated interface, but doesn't provide much functionality behind it.

[Introduction](#introduction)

In this post, we'll take a look at one of the ways to design modules in a manner that reduces complexity in your code base. By the end of it, you'll be equipped with the knowledge you need to make your projects a bit easier to work with.

This article draws its ideas from the book

by [A Philosophy of Software Design](https://www.amazon.com/dp/173210221X)[John Ousterhout](https://en.wikipedia.org/wiki/John_Ousterhout), particularly from the chapter on Deep modules

. I highly recommend reading this book.

Here's what we're going to cover:

[Definitions](#definitions)[Why each module has a cost and a benefit associated with it](#avoid-complexity-by-considering-the-cost-and-benefit-of-modules)[Deep and shallow modules](#deep-and-shallow-modules)[Why prefer deep modules](#to-keep-complexity-in-check-prefer-deep-modules)

[Definitions](#definitions)

[What's a module](#what-s-a-module)

A module is a relatively independent entity that can take many forms, such as classes, services, functions, or subsystems. It consists of an [interface](#whats-an-interface) (the _what_) and an [implementation](#whats-an-implementation) (the _how_).

[What's an abstraction](#what-s-an-abstraction)

An abstraction is a simplified view of an entity, which omits unimportant details. This makes it easier to think about and manipulate such an entity.

[What's an interface](#what-s-an-interface)

Each module has an interface which serves as the module's abstraction. This abstraction presents a simplified view of the module's functionality. You can interact with the module through this abstraction without needing to know the implementation details.

The module interface contains essential information you need to use a module effectively. It consists of two kinds of information:

[Formal interface information](#formal-interface-information)

Formal interface information is specified explicitly in code, and some of it can be checked for correctness by your programming language.

For example, the formal interface of a method is expressed in its signature, which includes the parameter names, types and the return value's type.

[Informal interface information](#informal-interface-information)

Informal interface information describes behaviors and usage restrictions that cannot be enforced and described by the programming language. They can only be described through comments, and they are usually more complicated than the formal information.

Examples could be description of the limitations or known issues with the module.

[What's an implementation](#what-s-an-implementation)

Implementation is the actual code that does what the module's interface promised. It's all the technical stuff behind the scenes, like algorithms and data structures, that achieves what the interface described.

[Avoid complexity by considering the cost and benefit of modules](#avoid-complexity-by-considering-the-cost-and-benefit-of-modules)

Adding a module to your codebase introduces complexity because it adds another thing you need to understand and integrate with existing code.

The cost associated with a module is primarily its interface. As a user of the module, you do not need to know its implementation details, only how to interact with its interface. The smaller and simpler the interface, the less complexity the module introduces.

The benefit associated with a module is the additional functionality it provides to your program.

To avoid complexity, you need to consider the cost and benefit associated with each module. The cost primarily relates to the complexity the module's interface is introducing, while the benefit comes from the additional functionality the module provides.

[Deep and shallow modules](#deep-and-shallow-modules)

By comparing the functionality and interface of modules, which we described in terms of cost vs. benefit, you can categorize modules into two types:

A module's depth refers to the amount of functionality it has hidden behind an interface. The more functionality there is hidden behind an interface, the deeper the module is.

[Deep modules](#deep-modules)

A deep module has a lot of functionality hidden behind a simple interface.

[Shallow modules](#shallow-modules)

A shallow module has a relatively complicated interface, but doesn't provide much functionality behind it. In extreme cases, a module can be so shallow that it adds no abstraction — using it requires more documentation and effort than just directly manipulating the variable it's supposed to modify.

[Deep and shallow modules figure](#deep-and-shallow-modules-figure)

```
interface/cost
┌─ (less is better)
│ │
│ │
│ │
│ │
│ │ functionality/benefit
■■■■■■■■■■■◀┘ │ ┌───────────── (more is better)
│ │ │ │
│ │ │ │ │
│ │ │ │ │
│ │ │ │ │
│ │ │ │ ┌────────────┘
│ ◀─────┼──────┘ │
│ │ │ │
│ │ │ │
│ │ │ │
│ │ └───▶■■■■■■■■■■■■■■■■■│■■■■
│ │ │ ▼ │
│ │ │ │
└──────────┘ └─────────────────────┘
deep module shallow module
```

[To keep complexity in check, prefer deep modules](#to-keep-complexity-in-check-prefer-deep-modules)

The best modules are those that offer significant benefits while keeping the costs low. Deep modules are an example of this, as they offer a lot of functionality behind a simple interface, while imposing the least amount of complexity on the system.

On the other hand, shallow modules don't help much in managing complexity, as they offer little to no abstraction and make things more complicated. In other words, they add complexity but provide no compensating benefit.

When you're adding a module, do a cost-benefit analysis. Ask yourself if the module provides enough benefit (functionality) compared to its cost (interface). By thinking in terms of deep modules, you can ensure that you're adding modules that offer significant benefits while keeping the costs low.

[TypeScript example](#typescript-example)

## Examples

This TypeScript example demonstrates the concepts of shallow and deep modules. The code is organized into separate modules represented by region comments.

In the first example, we have several shallow modules. In the second example, I've refactored the code to reduce the number of those shallow modules.

Feel free to dig in, play around with it, and ask yourself: Which example is easier to understand and maintain? Which one introduces more complexity?

[Example with shallow modules](#example-with-shallow-modules)

```typescript
/**
 * Pretend that each region comment represents a separate module.
 *
 * By keeping everything in one file, it's easier to experiment with the example
 * in a REPL.
 */
/* #region Module `types.ts` */
type State = {
  cancellationPolicies: CancellationPolicy[];
  prices: ProductPrice[];
  productGroups: ProductGroup[];
};
/* #endregion */
/* #region Module `cancellationPolicy.ts` */
type CancellationPolicy = {
  absoluteFee: number;
  relativeFee: number;
  productId: string;
};
const getCancellationPolicies = (state: State) => state.cancellationPolicies;
const getProductCancellationPolicies = (state: State, productId: string) => {
  const policies = getCancellationPolicies(state);
  return policies.filter((policy) => policy.productId === productId);
};
const isCancellationPolicyFree = ({ absoluteFee, relativeFee }: CancellationPolicy) =>
  absoluteFee === 0 && relativeFee === 0;
const isSomeProductCancellationPolicyFree = (state: State, productId: string) => {
  const policies = getProductCancellationPolicies(state, productId);
  return policies.some(isCancellationPolicyFree);
};
const hasProductGroupFreeCancellation = (state: State, productIds: string[]) =>
  productIds.some((productId) => isSomeProductCancellationPolicyFree(state, productId));
/* #endregion */
/* #region Module `productPrice.ts` */
type ProductPrice = {
  productId: string;
  productGroupId: string;
  value: number;
};
const getProductPrices = (state: State): ProductPrice[] => state.prices;
const getProductGroupPrices = (state: State, productGroupId: string) => {
  const prices = getProductPrices(state);
  return prices.filter((prices) => prices.productGroupId === productGroupId);
};
const getPriceProductIds = (productPrices: ProductPrice[]) =>
  productPrices.map((price) => price.productId);
/* #endregion */
/* #region Module `productGroup.ts` */
type ProductGroup = {
  id: string;
  name: string;
};
const getProductGroups = (state: State) => state.productGroups;
const getProductGroup = (state: State, id: string) => {
  const productGroups = getProductGroups(state);
  return productGroups.find((productGroup) => productGroup.id === id);
};
/* #endregion */
/* #region Module `productGroupView.ts` */
function getProductGroupData(state: State, productGroupId: string) {
  const productGroup = getProductGroup(state, productGroupId);
  if (productGroup == null) {
    return undefined;
  }
  /* #region We're going to refactor these callers and callees in the second example. */
  const productGroupPrices = getProductGroupPrices(state, productGroupId);
  const productIds = getPriceProductIds(productGroupPrices);
  const hasFreeCancellation = hasProductGroupFreeCancellation(state, productIds);
  /* #endregion */
  return {
    id: productGroupId,
    hasFreeCancellation,
    name: productGroup.name,
  };
}
/* #endregion */
// #region Module `main.ts`
const productId1 = "productId1";
const productId2 = "productId2";
const productId3 = "productId3";
const productGroupId1 = "productGroupId1";
const productGroupId2 = "productGroupId2";
const productGroupId3 = "productGroupId3";
/**
 * Assume that you cannot change the returned state.
 *
 * We could restructure the state to make it easier to achieve our desired
 * outcome, but in longer-term projects, that task might not be as
 * straightforward.
 */
function getState(): State {
  return {
    cancellationPolicies: [
      { absoluteFee: 25, productId: productId1, relativeFee: 0 },
      { absoluteFee: 0, productId: productId2, relativeFee: 0 },
      { absoluteFee: 32, productId: productId3, relativeFee: 0 },
    ],
    productGroups: [
      { id: productGroupId1, name: "Product group 1" },
      { id: productGroupId2, name: "Product group 2" },
    ],
    prices: [
      { productGroupId: productGroupId1, productId: productId1, value: 36 },
      { productGroupId: productGroupId1, productId: productId2, value: 45 },
      { productGroupId: productGroupId2, productId: productId3, value: 47 },
    ],
  };
}
function main() {
  const state = getState();
  console.log(getProductGroupData(state, productGroupId1));
  console.log(getProductGroupData(state, productGroupId2));
  console.log(getProductGroupData(state, productGroupId3));
}
main();
/* #endregion */
```

[Example refactored based on the idea of deep modules](#example-refactored-based-on-the-idea-of-deep-modules)

I've kept the root selectors in each module and have not refactored `hasProductGroupFreeCancellation`

to directly access the `state`

. In our example, it doesn't matter if we access the state directly, but in larger projects, it might be a good idea to encapsulate the state shape.

```typescript
/**
 * Pretend that each region comment represents a separate module.
 *
 * By keeping everything in one file, it's easier to experiment with the example
 * in a REPL.
 */
/* #region Module `types.ts` */
type State = {
  cancellationPolicies: CancellationPolicy[];
  prices: ProductPrice[];
  productGroups: ProductGroup[];
};
/* #endregion */
/* #region Module `cancellationPolicy.ts` */
type CancellationPolicy = {
  absoluteFee: number;
  relativeFee: number;
  productId: string;
};
const getCancellationPolicies = (state: State) => state.cancellationPolicies;
/* #endregion */
/* #region Module `productPrice.ts` */
type ProductPrice = {
  productId: string;
  productGroupId: string;
  value: number;
};
const getProductPrices = (state: State): ProductPrice[] => state.prices;
/* #endregion */
/* #region Module `productGroup.ts` */
type ProductGroup = {
  id: string;
  name: string;
};
const getProductGroups = (state: State) => state.productGroups;
const getProductGroup = (state: State, id: string) => {
  const productGroups = getProductGroups(state);
  return productGroups.find((productGroup) => productGroup.id === id);
};
/* #endregion */
/* #region Module `productGroupView.ts` */
function hasProductGroupFreeCancellation(state: State, productGroupId: string) {
  const productIds = getProductPrices(state)
    .filter((prices) => prices.productGroupId === productGroupId)
    .map((price) => price.productId);
  /**
   * When you start putting things closer together, as we did here, you might
   * start seeing opportunities for refactors you haven't seen before.
   *
   * For example, in this case, I removed the nested `some` and used `includes`
   * instead.
   */
  const cancellationPolicies = getCancellationPolicies(state);
  const matchedPolicies = cancellationPolicies.filter(
    ({ productId, absoluteFee, relativeFee }) =>
      absoluteFee === 0 && relativeFee === 0 && productIds.includes(productId),
  );
  return matchedPolicies.length > 0;
}
function getProductGroupData(state: State, productGroupId: string) {
  const productGroup = getProductGroup(state, productGroupId);
  if (productGroup == null) {
    return undefined;
  }
  // Callers and callees are refactored.
  const hasFreeCancellation = hasProductGroupFreeCancellation(state, productGroupId);
  return {
    id: productGroupId,
    hasFreeCancellation,
    name: productGroup.name,
  };
}
/* #endregion */
// #region Module `main.ts`
const productId1 = "productId1";
const productId2 = "productId2";
const productId3 = "productId3";
const productGroupId1 = "productGroupId1";
const productGroupId2 = "productGroupId2";
const productGroupId3 = "productGroupId3";
/**
 * Assume that you cannot change the returned state, for example, because it
 * comes from a third-party API.
 */
function getState(): State {
  return {
    cancellationPolicies: [
      { absoluteFee: 25, productId: productId1, relativeFee: 0 },
      { absoluteFee: 0, productId: productId2, relativeFee: 0 },
      { absoluteFee: 32, productId: productId3, relativeFee: 0 },
    ],
    productGroups: [
      { id: productGroupId1, name: "Product group 1" },
      { id: productGroupId2, name: "Product group 2" },
    ],
    prices: [
      { productGroupId: productGroupId1, productId: productId1, value: 36 },
      { productGroupId: productGroupId1, productId: productId2, value: 45 },
      { productGroupId: productGroupId2, productId: productId3, value: 47 },
    ],
  };
}
function main() {
  const state = getState();
  console.log(getProductGroupData(state, productGroupId1));
  console.log(getProductGroupData(state, productGroupId2));
  console.log(getProductGroupData(state, productGroupId3));
}
main();
/* #endregion */
```

[Conclusion](#conclusion)

When designing modules, consider the balance between the cost and benefit associated with each module. To keep complexity in check, generally prefer deep modules over shallow modules.

Deep modules provide a lot of functionality behind a simple interface, while shallow modules have a relatively complicated interface but do not provide much functionality. By choosing deep modules, you can ensure that you are adding significant benefits to your codebase while keeping complexity lower.

[Related reading](#related-reading)

- Book and book chapter — Ousterhout, J. K. (2022).
  [Deep modules. In A philosophy of software design (Second edition)](https://www.amazon.com/dp/173210221X). Yaknyam Press.
- Talk — Ousterhout, J. (2018, August 1).
  [A Philosophy of Software Design](https://www.youtube.com/watch?v=bmSAYlu0NcY). Talks at Google.
- Google Talk Forum — Ousterhout, J. (2018, May 24).
  [Software-Design-Book](https://groups.google.com/g/software-design-book) Google Talk Forum.
- Lecture notes – Ousterhout, J. (2018).
  [Modular Design—Lecture Notes for CS 190](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=modularDesign). CS 190: Software Design Studio (Winter 2018)
- Article — P. Gabriel, R. (1991).
  [Worse Is Better](https://dreamsongs.com/WIB.html). Simplicity – the design must be simple, both in implementation and interface. It is more important for the interface to be simple than the implementation.

- This review is interesting because the reviewer disagrees with some points of the book. Personally, I'm still siding with points expressed in the book:
- Koppel, J. (2018, October 29).
  [Book Review: A Philosophy of Software Design](https://www.pathsensitive.com/2018/10/book-review-philosophy-of-software.html). Path-Sensitive.
- Koppel, J. (2018, October 8).
  [Book Review: A Philosophy of Software Design](https://groups.google.com/g/software-design-book/c/DvnQ1Bvqy30). Software-Design-Book Google Talk Forum.
