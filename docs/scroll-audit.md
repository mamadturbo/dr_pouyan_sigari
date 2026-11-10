# Homepage scrolling audit — 2026-10-19

The prior migration did not implement a full-page presentation. Its only controlled interaction was `mountStory`: window wheel/touch/keyboard listeners, a ScrollTrigger measuring one story anchor, and a temporary `story-scroll-locked` overflow class. All other homepage sections used natural flow and had differing intrinsic heights. There was no current-section state, no next/previous panel navigation and no gesture ownership for the homepage. Lenis was already omitted; adding it would not create discrete navigation.

Blindly adding an Observer on top would conflict with the story's window listeners, guardScroll repositioning and ScrollTrigger onEnter/onLeaveBack callbacks. The fix must give the presentation sole input/position ownership in full-page mode and let the doctor player expose explicit internal steps. Natural fallback must retain the independently tested legacy story controller, with only one mode alive at a time. Long-form routes must never instantiate the presentation controller.

Existing React cleanup handles the standalone story and asynchronous imports, but it is local to DoctorStory; ownership moves to a single homepage lifecycle. Main sections and footer need one scoped scroll surface so global header/navigation can remain operable. Sections that do not fit a viewport must cause natural fallback instead of clipping. Reduced motion and explicit exit also use that fallback.

## Required skill discovery (completed before scroll implementation edits)

Using the supported Skills CLI through the available pnpm runtime:

```text
pnpm dlx skills add vercel-labs/skills --skill find-skills -a codex -y
pnpm dlx skills find "GSAP scroll animation"
pnpm dlx skills find "fullpage scroll"
pnpm dlx skills find "scroll driven animations"
pnpm dlx skills find "frontend animation"
pnpm dlx skills add greensock/gsap-skills --skill gsap-plugins gsap-scrolltrigger -a codex -y
```

Installed and read `.agents/skills/find-skills/SKILL.md`, `.agents/skills/gsap-plugins/SKILL.md` and `.agents/skills/gsap-scrolltrigger/SKILL.md`. The source is the [official GSAP skills repository](https://github.com/greensock/gsap-skills), verified through its repository metadata and the skills directory; discovery reported over 60K installs for each selected specialist skill. CLI installation completed for Codex. These local skills can also be discovered in the next chat turn; their actual installed instructions are applied in this turn.

Applied guidance: register existing GSAP plugins before use; use Observer for normalized gesture direction; use an explicit navigation state and timeline lock instead of ScrollTrigger scrub for section navigation; refresh measurements after layout/font changes; scope and kill owned observers/triggers/timelines and listeners on unmount. Reference: [Observer documentation](https://gsap.com/docs/v3/Plugins/Observer/). No additional scrolling package is needed.
