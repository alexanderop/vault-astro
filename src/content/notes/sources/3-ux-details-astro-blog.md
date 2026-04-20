---
title: "3 UX Details That Make a Difference on an Astro Blog"
type: source
source_type: article
source_id: "https://www.vbesse.com/en/blog/3-ux-details-astro-blog/"
captured_at: 2026-04-19
url: "https://www.vbesse.com/en/blog/3-ux-details-astro-blog/"
authors:
  - valentin-besse
date: 2026-03-13
publish: false
---

After [making my blog bilingual](/en/blog/astro-i18n-view-transitions) by mastering Astro's View Transitions, I thought I had done the hardest part. But as is often the case in web development, the devil (and the quality) is in the details.

My friend ** Cristian Fernández Del Pozo**, always on the lookout for a good improvement, suggested three excellent ideas to take the blog's UX (User Experience) to the next level.

Here is how I implemented these three "micro-features" that make all the difference.

## 1. (Smart) Language Redirection

**The problem:** My site offers both French and English. But if a developer from New York types `vbesse.com`

, they land on the French version by default. Not ideal.

**The naive solution:** Redirect everyone based on their browser language (`navigator.language`

).

**The danger:** If I share a direct link to a French article with a Spanish colleague, they would be forcefully redirected to the English homepage. Frustrating!

**My solution (The gentle approach):** I only perform the check **on the strict root** of the site (`/`

). So, I added an "inline" script right at the top of my `index.astro`

file to ensure it executes instantly, even before the page renders:

```
<script is:inline>
if (window.location.pathname === '/') {
const savedLang = localStorage.getItem('preferred_lang');
if (savedLang === 'en') {
window.location.replace('/en/');
} else if (!savedLang) {
const browserLang = navigator.language || navigator.userLanguage;
if (!browserLang.toLowerCase().startsWith('fr')) {
window.location.replace('/en/');
}
}
}
</script>
```

To make it perfect, I also listen for clicks on my language picker in the menu to save the user's choice in their `localStorage`

. If they manually choose French, I will never force them to switch to English again!

## 2. The "Click-Away" Mobile Menu

**The problem:** On mobile, when you open the hamburger menu, it takes up all the available space. The user reads a link, clicks outside to close the menu… and nothing happens. You have to aim exactly for the little cross to close it.

**The solution:** Listen for clicks on the entire document and check if the click target is outside the menu container. With Astro and the `ClientRouter`

(View Transitions), you have to be careful not to duplicate event listeners on every page load.

In my `<Header />`

component, I attached this logic to the `astro:page-load`

event:

```
const closeMenuOnClickOutside = (event) => {
const target = event.target;
// If the menu is open AND the click is outside of it
if (
navLinksContainer?.classList.contains("expanded") &&
!navLinksContainer.contains(target) &&
!newMenuToggle.contains(target)
) {
// Close the menu
newMenuToggle.setAttribute("aria-expanded", "false");
navLinksContainer.classList.remove("expanded");
newMenuToggle.classList.remove("open");
}
};
// Clean up the old listener before adding a new one (thanks ClientRouter!)
document.removeEventListener("click", closeMenuOnClickOutside);
document.addEventListener("click", closeMenuOnClickOutside);
```

## 3. Always Visible Menu Icons

**The problem:** With the switch to Dark Mode or changing background colors, the SVG icons of my menu (the hamburger and the cross) could sometimes lack contrast and become invisible.

**The solution:** Keep things simple with CSS variables. I added a global variable `--kebab-menu-color`

in my `global.css`

file.

Then, a small modification in the `<Header />`

style allows this color to be applied dynamically, exclusively on mobile screens:

```
@media (max-width: 768px) {
#menu-toggle {
display: flex;
align-items: center;
justify-content: center;
color: var(--kebab-menu-color, #ffffff);
}
#menu-toggle svg {
stroke: currentColor;
}
}
```

Thanks to `currentColor`

, the SVG automatically inherits its parent's color. If I completely change the vibe of my site tomorrow, I'll only have one single CSS variable to update!

## Conclusion

These are the little details that transform a simple static site into a truly pleasant web application to browse. Never hesitate to listen to user feedback (or your picky developer friends!).

What about you, what's the one small UX feature you can't live without on a website?
