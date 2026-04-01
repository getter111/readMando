## 2024-04-01 - Missing Form Label Bindings in Auth Pages
**Learning:** Auth forms lacked proper `htmlFor` and `id` bindings between labels and inputs, as well as visible focus states, which reduces accessibility for screen readers and keyboard navigation users.
**Action:** Ensure all forms have explicit label bindings (`htmlFor` -> `id`) and proper focus rings for accessibility going forward.
