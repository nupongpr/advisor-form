---
name: AI thesis co-advisor Evaluation System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4a4452'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7b7484'
  outline-variant: '#ccc3d4'
  surface-tint: '#6e46ba'
  primary: '#6b44b7'
  on-primary: '#ffffff'
  primary-container: '#855ed2'
  on-primary-container: '#fffbff'
  inverse-primary: '#d2bbff'
  secondary: '#5d5e68'
  on-secondary: '#ffffff'
  secondary-container: '#e2e1ed'
  on-secondary-container: '#63646e'
  tertiary: '#725c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#caa82b'
  on-tertiary-container: '#4d3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#552ba0'
  secondary-fixed: '#e2e1ed'
  secondary-fixed-dim: '#c6c5d1'
  on-secondary-fixed: '#1a1b23'
  on-secondary-fixed-variant: '#45464f'
  tertiary-fixed: '#ffe080'
  tertiary-fixed-dim: '#e7c345'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#564500'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  background-subtle: '#fdfcff'
  border-muted: '#e4e7ec'
  text-main: '#1d2939'
  text-muted: '#667085'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans Thai
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: IBM Plex Sans Thai
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: IBM Plex Sans Thai
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: IBM Plex Sans Thai
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans Thai
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans Thai
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans Thai
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: IBM Plex Sans Thai
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: IBM Plex Sans Thai
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 800px
  gutter: 1.5rem
  margin-mobile: 1rem
  section-gap: 2.5rem
  element-gap: 1rem
---

## Brand & Style

The brand personality for the design system is **academic, professional, and reassuring**. As a tool for evaluating complex research platforms, it must feel authoritative yet highly accessible to students and faculty alike. The UI should evoke a sense of progress, clarity, and intellectual rigor.

The chosen design style is **Corporate / Modern with a focus on Soft Minimalism**. This approach utilizes generous whitespace and a refined color palette to reduce cognitive load during long form-filling sessions. 
- **Cleanliness:** High use of whitespace to separate sections of the multi-step wizard.
- **Professionalism:** Systematic alignment and clear hierarchy to establish trust.
- **Modernity:** Subtle use of depth through soft shadows and rounded geometry to make the interface feel contemporary and friendly.
- **Thai-Centric Legibility:** Layouts are optimized for Thai script, ensuring line heights and character spacing prevent "crowding" of tone marks and vowels.

## Colors

The palette is centered around **Light Violet**, specifically chosen to balance academic seriousness with a modern, digital-first feel. 

- **Primary (Light Violet):** Used for call-to-action buttons, active progress bar segments, and selected states in radio groups. It provides a clear focal point against the neutral background.
- **Secondary (Pale Violet):** Utilized for hover states, subtle highlights, and secondary button backgrounds to maintain a cohesive monochromatic theme.
- **Background (Grey-Violet Tint):** A very light, desaturated violet-grey serves as the global background to reduce eye strain compared to pure white, while keeping the "Card" elements (which use pure white) distinct.
- **Neutral:** A range of cool greys is used for borders, secondary text, and inactive states to ensure the interface remains grounded and professional.

## Typography

The typography system uses **IBM Plex Sans Thai** (or Noto Sans Thai as a fallback) to provide a clean, "loopless" modern aesthetic that remains highly legible in technical and academic contexts.

- **Scale:** A modular scale is used to ensure clear hierarchy between question headers, sub-instructions, and input labels.
- **Line Height:** Thai script requires slightly larger line heights (1.5x to 1.6x) to avoid vertical clashing of glyphs; this is strictly enforced across all body and label styles.
- **Weights:** Use Medium (500) for labels and Semi-Bold (600) for headlines to ensure they stand out against the standard Regular (400) body text.
- **Responsive adjustment:** Large headlines scale down on mobile to prevent awkward word breaks in long Thai sentences.

## Layout & Spacing

This design system employs a **Fixed Grid** approach for the wizard to keep the cognitive field narrow and focused, while using a **Fluid Grid** for the admin dashboard to maximize data density.

- **Form Layout:** The wizard is centered with a max-width of 800px. This prevents long-form lines from becoming unreadable and keeps the user's focus on the center of the screen.
- **Admin Dashboard:** Uses a 12-column fluid grid. Data tables can span the full width to accommodate multiple columns (Role, SUS Score, Date).
- **Rhythm:** A 4px/8px baseline grid is used. Sections of the form are separated by 40px (section-gap), while individual questions within a section are separated by 16px (element-gap).
- **Mobile Adaptivity:** On mobile, side margins shrink to 16px, and multi-column radio groups for Likert scales stack vertically or use a horizontal scroll pattern if space is tight.

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layering** and **Ambient Shadows**. 

- **Surface Levels:** The background uses the grey-violet tint, while the primary interaction containers (cards) use pure white (#FFFFFF). This creates an immediate "Level 1" elevation.
- **Shadows:** We use very soft, diffused shadows (Blur: 15px, Opacity: 5%, Color: Primary-Tinted) for cards to make them feel lifted from the background without creating visual clutter.
- **Interactive States:** Buttons and input fields use a subtle 1px border (`border-muted`). Upon focus, the border transitions to the Primary color with a soft outer glow (2px spread) to indicate activity.
- **Z-Index:** The Progress Bar and Navigation buttons (Next/Back) may use a sticky position with a higher z-index and a slight backdrop-blur to maintain context during long scrolls.

## Shapes

The shape language is **Rounded**, reflecting a modern and approachable software aesthetic. 

- **Containers:** Main form cards and dashboard panels use `rounded-xl` (1.5rem) to soften the large layout blocks.
- **Interactive Elements:** Buttons, input fields, and radio group items use the standard `rounded` (0.5rem) for a balanced, professional look.
- **Progress Bars:** These use a pill-shape (full rounding) to indicate a continuous, fluid process.
- **Badges:** Status indicators in the admin dashboard (e.g., "Student", "Advisor") use a pill-shape for quick visual scanning.

## Components

### Multi-step Wizard
The wizard container must include a prominent **Progress Bar** at the top. Each step should be encapsulated in a white card with a "fade-in" transition when moving between steps.

### Buttons
- **Primary:** Solid Light Violet with white text. High-contrast and rounded.
- **Secondary:** Light Violet ghost button (border only) or Pale Violet background with dark violet text for "Back" actions.

### Likert Scale (Radio Groups)
Likert scales should be presented as a horizontal row of 5 circles on desktop, clearly labeled "Strongly Disagree" (น้อยที่สุด) on the left and "Strongly Agree" (มากที่สุด) on the right. On mobile, these should expand to fill the width for easier tapping.

### Data Tables
Admin tables should be clean with no vertical borders. Use alternating row stripes (zebra striping) in the neutral background color for readability. The header row should be slightly darker with bold labels.

### Input Fields
Inputs for the "Access Code" and "Open Questions" should use a subtle grey border that thickens and changes to the primary violet on focus. Label text must always sit clearly above the input field.

### Progress Bars
Use a thick (8px-12px) bar with a rounded track. The filled portion should use a gradient or solid primary color to show completion.