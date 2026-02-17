export const blogPosts = [
  {
    slug: 'choosing-the-right-design',
    title: 'Choosing the Right Design',
    subtitle: 'The architecture of a portfolio that speaks before you do',
    date: '2026-02-17',
    readTime: '8 min read',
    tags: ['Design', 'Portfolio', 'Web Development'],
    excerpt:
      'How I approached designing this portfolio — the decisions behind the dark aesthetic, the animation philosophy, and why restraint matters more than spectacle.',
    content: [
      {
        type: 'paragraph',
        text: 'A portfolio is the first conversation you have with someone who has never met you. It is not a resume. It is not a list of technologies. It is a statement about how you think, what you value, and whether you have the discipline to ship something that feels intentional. Every decision — from the background color to the way a heading fades in — carries weight. This post is about how I made those decisions for this portfolio, and more importantly, why.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Starting with darkness',
      },
      {
        type: 'paragraph',
        text: 'The first decision was the easiest and the most consequential: a pure black background. Not dark gray, not charcoal — #000000. There is a reason film credits roll on black, a reason galleries paint their walls white. The background is not decoration. It is the absence of distraction. A black canvas forces every element on the page to justify its existence. If it does not contribute, it is noise.',
      },
      {
        type: 'paragraph',
        text: 'Dark themes have become common, but many get it wrong by using dark grays that flatten the visual hierarchy. Pure black creates maximum contrast with white text, which means you can use subtler shades of gray (zinc-500, zinc-600) to establish secondary and tertiary information levels without those elements disappearing. The hierarchy writes itself.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The single-accent philosophy',
      },
      {
        type: 'paragraph',
        text: 'I chose one accent color: rose (#fb7185). Not a palette. Not a system of five complementary hues. One color, used consistently, everywhere it matters — the period after "saka.", the underline on hover, the cursor trail, the tag pills, the form focus state. The constraint is the point.',
      },
      {
        type: 'paragraph',
        text: 'When you limit yourself to a single accent, every use of that color becomes a signal. The viewer learns quickly: rose means interactive, rose means important, rose means "look here." Multiple accent colors create ambiguity. They force the viewer to decode a color language they did not sign up to learn. A single accent removes that cognitive overhead entirely.',
      },
      {
        type: 'quote',
        text: 'Constraint is not limitation — it is clarity. A single accent color does more work than five competing ones ever could.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Animation as communication',
      },
      {
        type: 'paragraph',
        text: 'There is a fine line between animation that communicates and animation that performs. Every motion on this portfolio exists to serve a purpose — none of it is decorative.',
      },
      {
        type: 'list',
        items: [
          'Scroll reveals signal content hierarchy. When a section fades up as you reach it, your brain registers it as new information. Without the reveal, everything on the page has equal visual weight, and nothing stands out.',
          'The magnetic hover on the hero title creates tactile feedback. It tells you this element is alive, that the page is responsive to your presence. It is subtle — 8 pixels of maximum offset — but it transforms a static heading into an interaction.',
          'The marquee for the tech stack is ambient motion. It runs at 0.5px per frame, slow enough to be peripheral. When you hover, it slows to 0.1px — an acknowledgment that you are paying attention. The speed transition uses a lerp (linear interpolation) factor of 0.06 for smoothness.',
          'The custom rose cursor adds personality without distraction. The trail particles are velocity-aware: fast movement spawns more particles, slow movement spawns fewer, and idle spawns none. This prevents the cursor from becoming a visual mess during normal use.',
        ],
      },
      {
        type: 'paragraph',
        text: 'The contact form uses a progressive reveal pattern. Instead of dumping three fields at once, it reveals them one at a time as you complete each step. Each field blurs in from below — a 600ms transition with a cubic-bezier(0.22, 1, 0.36, 1) easing curve. The progression dots glow as you advance. This turns a mundane form into a conversation.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Typography that works',
      },
      {
        type: 'paragraph',
        text: 'I use two fonts: Inter for body text and JetBrains Mono for technical contexts. The decision was not aesthetic — it was functional. Inter has exceptional legibility at all sizes, a carefully tuned x-height, and a weight range from thin to black that covers every use case. It disappears. You read the content, not the font.',
      },
      {
        type: 'paragraph',
        text: 'JetBrains Mono appears in dates, code blocks, and labels — anywhere the content is technical or data-oriented. The monospace treatment signals to the reader that this information is precise, structured, factual. The pairing works because the two fonts have distinct roles and never compete.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The layout toggle',
      },
      {
        type: 'paragraph',
        text: 'One feature that often surprises people is the layout toggle in the footer — a simple switch between wide and compact modes. In wide mode, the project grid becomes a two-column layout with a vertical timeline connecting the cards through horizontal branches. In compact mode, it collapses to a single column with divider lines.',
      },
      {
        type: 'paragraph',
        text: 'The decision to include this was philosophical: not everyone reads the same way. Some prefer density and overview, others prefer focus and flow. Rather than choosing for the user, I let them choose. The preference is persisted in localStorage, so it carries across sessions. The layout transition is animated with a 500ms ease-out on max-width and 300ms on padding, which prevents the jarring snap that most layout changes produce.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Building with components',
      },
      {
        type: 'paragraph',
        text: 'The architecture follows a pattern of composable reuse. The scroll reveal logic, the magnetic effect, and the custom cursor are all extracted into composables — standalone functions that can be dropped into any component. The TextEffect component alone supports five animation presets (blur, fade-in-blur, scale, fade, slide) and can animate per-character, per-word, or per-line. It uses the Web Animations API rather than CSS transitions, which gives frame-level control over timing.',
      },
      {
        type: 'code',
        language: 'css',
        code: '.reveal-slow {\n  opacity: 0;\n  transform: translateY(20px);\n  transition: opacity 1s ease, transform 1s ease;\n}\n.reveal-slow.visible {\n  opacity: 1;\n  transform: translateY(0);\n}',
      },
      {
        type: 'paragraph',
        text: 'This two-class pattern — a base state and a .visible modifier — is the foundation of every scroll-triggered animation. The IntersectionObserver adds .visible when the element enters the viewport, and the CSS transition handles the rest. No JavaScript animation libraries, no runtime overhead. The browser does what it does best.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Performance as a feature',
      },
      {
        type: 'paragraph',
        text: 'Performance is not an optimization you bolt on at the end. It is a design constraint from the start. The marquee animation uses requestAnimationFrame with a cached scrollWidth to avoid per-frame reflow. The timeline calculation batches all DOM reads before doing any writes. The project card images load lazily — they only fetch when the card is expanded. The custom cursor uses CSS will-change and contain: layout style size to hint the browser about compositing.',
      },
      {
        type: 'paragraph',
        text: 'These are not micro-optimizations for their own sake. They are the difference between a page that feels smooth and one that stutters during scroll. The user may not consciously notice 60fps, but they absolutely notice when it drops.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'What I would refine',
      },
      {
        type: 'paragraph',
        text: 'No project ships in its ideal state. The character reveal on the hero title could benefit from a spring-based easing rather than a linear stagger — the current 60ms per-character delay is functional but lacks the organic feel of a physics-driven approach. The contact form validation could be more graceful with inline feedback rather than disabled-state reliance. The project cards in wide mode could use a masonry layout to handle varying content heights more elegantly.',
      },
      {
        type: 'paragraph',
        text: 'Design is iteration. The portfolio you see today is the result of five major versions, each informed by what the previous one got wrong. Version one was a terminal-themed page with a neon cursor. Version four introduced the emerald accent and horizontal project cards. This version stripped everything back to what was essential: black, white, rose, and motion with purpose.',
      },
      {
        type: 'quote',
        text: 'The best portfolio is not the one with the most features — it is the one where every feature earns its place.',
      },
    ],
  },
  /*{
    slug: 'ai-tools-and-the-modern-dev-workflow',
    title: 'AI Tools and the Modern Dev Workflow',
    subtitle: 'How I stopped writing code and started directing it',
    date: '2026-02-17',
    readTime: '7 min read',
    tags: ['AI', 'Tooling', 'Workflow'],
    excerpt:
      'My actual development workflow in 2026 — Claude Code as the engine, Codex as the second brain, Cursor as the workbench, and why the developer\'s job is now to direct, not type.',
    content: [
      {
        type: 'paragraph',
        text: 'The workflow changed completely. Not gradually — it snapped. There was a moment where AI agents could build full features faster than I could type them, and that was it. The role shifted from writing code to directing it. I still make every architectural decision, I still review every line that ships, but the mechanical act of translating thought into syntax is no longer my job. This post is about the tools that made that shift possible and how they fit together.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Claude Code app — where the real work happens',
      },
      {
        type: 'paragraph',
        text: 'Claude Code with Opus 4.6 is the primary development tool. Not an assistant sitting next to the code — the engine that builds it. Full feature implementations, architecture planning, refactoring entire modules, debugging production issues — everything runs through it. You describe what you want, and it reads the codebase, plans an approach, implements across multiple files, and delivers. The context window is large enough that it holds the entire project in its head.',
      },
      {
        type: 'paragraph',
        text: 'The output quality with Opus 4.6 is high enough to trust for production code. Not blindly — I read everything — but the code it produces is clean, follows existing patterns, and handles edge cases I might have missed. The speed gain is what caused the shift. What used to take hours of manual implementation now takes minutes of direction and review. That is not an incremental improvement. That is a fundamentally different way of working.',
      },
      {
        type: 'paragraph',
        text: 'I also use the Claude Code CLI for terminal-based workflows — running it directly in the project directory, letting it navigate the file system, execute commands, and iterate. It is the same brain with a different interface, and sometimes the terminal context is exactly what a task needs.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Codex as the second brain',
      },
      {
        type: 'paragraph',
        text: 'Codex 5.3 running in the Codex app fills a different role. It is not a replacement for Claude — it is a complement. Certain types of tasks play to its strengths, and for those, it delivers faster or with a different perspective. When Claude is processing a large task, Codex picks up the next one. When I want a second opinion on an approach, I run the same prompt through both and compare.',
      },
      {
        type: 'paragraph',
        text: 'The real productivity unlock is running both simultaneously on different projects. Two AI agents building in parallel while I switch between reviewing their output. One is implementing a feature in project A, the other is refactoring a module in project B. The throughput is not double — it is more than double, because the context-switching cost that used to kill productivity when doing this manually is gone. Each agent maintains its own context. I just direct.',
      },
      {
        type: 'quote',
        text: 'The role shifted from writing code to directing it. Two AI agents building in parallel while you review, course-correct, and make decisions — that is the modern workflow.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Cursor as the workbench',
      },
      {
        type: 'paragraph',
        text: 'Cursor is still the IDE. I open it every day. But its role has narrowed significantly. It is the file browser, the git interface, the place where I read and navigate code. The syntax highlighting, the file tree, the integrated terminal, the diff view — all still essential. For quick inline fixes — a one-line change, a variable rename, a small tweak — Cmd+K is convenient and fast.',
      },
      {
        type: 'paragraph',
        text: 'But the heavy AI work does not happen in Cursor anymore. The dedicated AI coding agent apps have taken over that role entirely. Cursor tried to be the all-in-one AI IDE, and for a while it was. But standalone AI agents with full codebase access, persistent context, and deep reasoning capabilities have surpassed what an IDE-integrated AI can offer. Cursor is the workbench where you inspect what the agents built. That is still a valuable role — just a different one than it used to be.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'ChatGPT — still useful, just not for code',
      },
      {
        type: 'paragraph',
        text: 'ChatGPT has not disappeared from the workflow, but it has moved to the periphery. Brainstorming session for a new feature direction? ChatGPT. Drafting a README or a project description? ChatGPT. Research on a topic I am unfamiliar with? ChatGPT. General knowledge, writing assistance, creative exploration — that is its lane now.',
      },
      {
        type: 'paragraph',
        text: 'For anything code-related, Claude and Codex are categorically better. The gap is not subtle. ChatGPT produces code that often looks plausible but misses the context of your specific project. Claude and Codex, running with full codebase access, produce code that fits. That difference matters when you are shipping, not prototyping.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Architecture before implementation',
      },
      {
        type: 'paragraph',
        text: 'The biggest workflow change is not the tools — it is the process. Every feature starts as a conversation. Before a single line of code exists, I talk through the design with Claude. Describe the component structure. Walk through the data flow. Debate the tradeoffs between two approaches. The AI pushes back, suggests alternatives, catches architectural issues before they become implementation problems.',
      },
      {
        type: 'paragraph',
        text: 'By the time implementation starts, the plan is solid. The backtracking that used to eat project time — building something, realizing the approach is wrong, tearing it down, starting over — that cycle is mostly gone. Not because the AI is always right, but because the conversation forces you to think through the design at a level of detail you might skip when you are eager to start coding.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Debugging with understanding',
      },
      {
        type: 'paragraph',
        text: 'AI debugging is not "paste the error, get the fix." That is the surface-level use case, and it works, but it is not where the real value is. The real value is reasoning. Claude traces through the logic, explains why something broke, identifies the root cause rather than the symptom, and suggests structural fixes rather than patches. It understands context deeply enough to say "this broke because of a race condition in the initialization order" rather than "add a null check here."',
      },
      {
        type: 'paragraph',
        text: 'This is where Opus 4.6 shines specifically. The depth of reasoning on debugging tasks is noticeably stronger than other models. It does not just pattern-match on error messages — it reads the surrounding code, understands the intended behavior, and works backward from the failure to the cause. That is the difference between an AI that fixes bugs and an AI that understands systems.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Principles I follow',
      },
      {
        type: 'paragraph',
        text: 'Working this way requires discipline. AI makes you faster, but it also makes it easier to ship code you do not fully understand. These are the rules I hold myself to:',
      },
      {
        type: 'list',
        items: [
          'Always verify AI output — trust the tool, but read every line that ships. If you cannot explain what the code does, it does not ship.',
          'Use AI for the first draft, your judgment for the final one. The AI proposes, you decide.',
          'Let AI handle boilerplate and repetition. You handle architecture, taste, and the decisions that define the project.',
          'Run agents in parallel when possible. Two building is better than one waiting.',
          'Maintain your own understanding of what was generated. The moment you stop understanding your codebase, you have lost control of it.',
          'Different models for different tasks. Know their strengths. Opus for deep reasoning, Codex for specific task types, ChatGPT for non-code work.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        text: 'Where it breaks down',
      },
      {
        type: 'paragraph',
        text: 'AI hallucinates APIs that do not exist. It misses edge cases that a human with domain knowledge would catch immediately. It produces code that looks correct, passes a cursory review, and fails silently in production. The more plausible the output, the more dangerous the mistake — because plausible code is the kind you are most likely to approve without scrutiny.',
      },
      {
        type: 'paragraph',
        text: 'Over-reliance is the real risk. If you stop reading the code, if you stop understanding the systems you build, if you let the AI make architectural decisions without your input — you have a problem that speed cannot fix. The human role in this workflow is not optional. It is the quality gate. The developer\'s job is no longer to write code. It is to verify, decide, and maintain the standard.',
      },
      {
        type: 'quote',
        text: 'AI is a multiplier, not a replacement. The developers who thrive are the ones who learn to direct it effectively — not the ones who let it direct them.',
      },
    ],
  },*/
]

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null
}

export function getAllPosts() {
  return [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date))
}
