# Agent Directives for EGS Bespoke Atelier

1. **Modular Partials Only:** Never inject large HTML blocks directly into `templates/index.html`. All UI features live inside `templates/components/`.
2. **Targeted Edits:** When modifying a component, only touch its corresponding file in `templates/components/`.
3. **Responsive Spacing:** Maintain spacing using Tailwind flex/grid containers and the defined `:root` CSS variables in `input.css`. Avoid ad-hoc pixel margins.
4. **Logic Isolation:** Keep business/API logic in `app.js` and pure animations/Lenis physics in `motion.js`.
