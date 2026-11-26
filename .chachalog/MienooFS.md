---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

Added the node builders `areaNode()`, `textNode()` and `bigTextNode()` for the `children` of `addPage`, such as `children: [areaNode('area-main', textNode())]`. A builder takes the page language by default, and a text value defaults to the page name. A node without a name is named after its type and suffixed past its siblings, `text` then `text-1`; a given name is kept, and two siblings given one name throw.
