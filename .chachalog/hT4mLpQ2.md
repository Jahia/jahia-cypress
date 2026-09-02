---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

Added an optional startup provisioning script that configures Jahia's SMTP settings for a Mailpit test server when `SMTP_SERVER_URL` is set, and does nothing otherwise.
