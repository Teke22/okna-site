# Kronk CMS

This is a **Astro** project. Content lives in `src/pages/`.

**Today's date: 2026-10-12** - Use this for any new content dates.

## ALWAYS Follow These Guidelines

### Before Creating Any Content
1. **Review existing content** in `src/pages/` to understand structure
2. **Match the writing style** of existing content
3. **Follow guardrails** listed below

### Content Creation Workflow
1. Review existing content → Know what exists
2. Analyze style → Match the voice and tone
3. Create content → Follow framework conventions
4. Validate → Check guardrails compliance
5. Run `kronk audit` to verify quality

### Critical: Accuracy with Existing Content
- When referencing "how many" of something exists (posts, plugins, features), ALWAYS check existing files first
- Never say "first", "second", or count items without verifying
- Use the exact titles and categories from existing content

### SEO Requirements
- Title: 30-60 characters (required)
- Meta description: 120-160 characters (required)
- Include canonical URL for all pages
- Include Open Graph meta tags (og:title, og:description, og:image)
- Include Twitter Card meta tags
- Every image MUST have descriptive alt text
- Use proper heading hierarchy for content structure
- Include structured data/JSON-LD where appropriate

### Accessibility (WCAG 2.1 AA)
- Proper heading hierarchy (h1 → h2 → h3, NEVER skip levels)
- Descriptive link text (NEVER use "click here", "read more", "here")
- Color contrast ratio: 4.5:1 minimum for normal text, 3:1 for large text
- Include skip navigation links for keyboard users
- Use semantic HTML elements (header, nav, main, article, section, footer)
- All interactive elements must be keyboard accessible
- Form inputs must have associated labels
- Images must have meaningful alt text (not just filename)
- Videos must have captions or transcripts

### Performance
- Images: maximum 500KB per image
- Use lazy loading (loading="lazy") for below-fold images
- Provide responsive images with srcset and sizes attributes
- Minimize CSS files (maximum 3 external stylesheets)
- Minimize JavaScript files (maximum 5 external scripts)
- Use minified assets in production
- Prefer modern image formats (WebP, AVIF) with fallbacks
- Include width and height attributes on images to prevent layout shift

### Security
- Use rel="noopener noreferrer" on external links with target="_blank"
- Sanitize all user-generated content
- Never include sensitive data in front matter or content
- Use HTTPS for all external resources

### HTML Structure
- Mobile-first responsive design required
- Use semantic elements (header, nav, main, article, section, aside, footer)
- Include viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Document must have a single h1 element
- Test with screen readers (VoiceOver, NVDA)

### Content Quality
- Word count: 300-3000 words per article (aim for comprehensive coverage)
- Required front matter fields for Astro: title, description, pubDate
- Include estimated reading time where supported
- Use clear, scannable formatting (short paragraphs, bullet points, subheadings)
- Include internal links to related content

## Available CLI Commands

Use the Kronk CLI for project tasks:

| Command | Purpose |
|---------|---------|
| `kronk audit` | Run content quality audit |
| `kronk context` | Get project context, export to clipboard |
| `kronk detect` | Show detected framework |
| `kronk init` | Initialize project with guardrails |
| `kronk theme` | Generate theme with AI |
| `kronk addon` | Manage themes and plugins |

### Running from Terminal

```bash
# Run quality audit
npx kronk audit

# Check for issues in specific file
npx kronk audit content/posts/my-post.md

# Get project context
npx kronk context
```

## Quick Commands

### Skills

**CMS Skills**
- `/kronk` - Main Kronk CMS skill (lists all 12 skills)
- `/kronk-content` - Create SSG content with guardrails
- `/kronk-audit` - Run content quality audit
- `/kronk-theme` - Generate or modify theme

**Quality Guards**
- `/kronk-code-quality` - HTML/CSS/JS quality enforcement
- `/kronk-seo` - Full SEO enforcement
- `/kronk-theme-guard` - Theme consistency across pages
- `/kronk-theme-create` - Systematic theme creation workflow
- `/kronk-design-adapt` - Copy/adapt designs from reference websites
- `/kronk-writing-style` - Analyze and match writing voice/tone
- `/kronk-images` - Image optimization and responsive handling
- `/kronk-verify` - Mandatory verification before publishing

## Skill Composition Chains

```
Content workflow:  kronk-content → kronk-writing-style → kronk-seo → kronk-verify
Theme workflow:    kronk-theme-create → kronk-theme-guard → kronk-code-quality → kronk-verify
Design workflow:   kronk-design-adapt → kronk-theme-guard → kronk-code-quality → kronk-verify
Image workflow:    kronk-images → kronk-seo (alt text) → kronk-code-quality (responsive) → kronk-verify
Audit workflow:    kronk-audit → kronk-seo + kronk-code-quality + kronk-theme-guard
```

NEVER skip `/kronk-verify` before claiming a task is complete.
NEVER claim "done" without showing build output as evidence.

## Framework Details

- **Framework:** Astro
- **Content Directory:** `src/pages/`
- **Output Directory:** `dist/`
- **Config File:** `astro.config.mjs`

## Quality Procedures

### When User Says "In the Style of..." or "Like this..."
1. Ask for or identify the reference (URL, existing content, description)
2. Read the reference content carefully
3. Extract key style elements: tone, structure, formatting, vocabulary
4. Document the style requirements before writing
5. Create content matching those requirements
6. Compare output against reference for consistency

### Quality Verification Checklist
Before marking any content task complete:
- [ ] Reviewed existing content to verify facts
- [ ] Style matches existing content
- [ ] All guardrails requirements met
- [ ] No inaccurate counts or references
- [ ] Run `kronk audit` and address any issues

## Website Migration (CRITICAL)

When user asks to migrate, convert, port, recreate, or rebuild a website from a source:

### MANDATORY WORKFLOW (DO NOT SKIP)

**Phase 1: Source Analysis (REQUIRED BEFORE ANY CODE)**

You MUST read ALL source files COMPLETELY before writing ANY code:

1. **Read ALL HTML files** - every single one, full content (not summaries)
2. **Read ALL CSS files** - every stylesheet, full content
3. **Read ALL JS files** - every script file

4. **Document in your response BEFORE writing code:**
   - Color palette (list exact hex/rgb values from CSS)
   - Typography (font families, sizes, weights, line heights)
   - Spacing system (margins, padding, gaps)
   - Layout patterns (grid columns, flexbox configurations)
   - Animations/transitions (all CSS animations, JS interactions)
   - External dependencies (CDN links, icon libraries, Google Fonts)

**Phase 2: Component Mapping (REQUIRED)**

Create explicit mapping in your response:
```
Source File → Target File
- index.html → src/pages/index.astro (or equivalent)
- styles.css → src/styles/main.css
[map EVERY file]

Source Section → Target Component
- header.nav → Header component
- hero section → Hero component
[map EVERY section]
```

**Phase 3: Implementation**

For EACH component/section:
1. Copy the source HTML structure EXACTLY
2. Copy ALL relevant CSS (preserve exact values)
3. Adapt syntax to target framework
4. Preserve all classes, IDs, data attributes

### FORBIDDEN ACTIONS

**NEVER do these during migration:**
- Create "simplified" or "cleaner" versions
- Use starter templates or boilerplate
- Change ANY color values (even "close" colors)
- Swap fonts for "similar" alternatives
- Remove animations because they're "unnecessary"
- Add features not in the source
- "Modernize" or "improve" the design
- Skip sections because they seem redundant
- Use placeholder content

### SUCCESS CRITERIA

Migration is ONLY complete when:
- [ ] ALL sections from source exist in target
- [ ] Colors match EXACTLY (verify with color picker)
- [ ] Typography matches EXACTLY (same fonts, sizes, weights)
- [ ] ALL animations and interactions work identically
- [ ] Responsive behavior matches at ALL breakpoints
- [ ] NO visual differences when comparing side-by-side

### KEY PRINCIPLE

> **"If it exists in the source, it MUST exist in the target - unchanged in appearance and behavior."**

The goal is a PERFECT REPLICA in the new framework, not a redesign.
