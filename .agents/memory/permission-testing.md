---
name: Permission testing
description: How database-backed Discord permission behavior is kept safe and deterministic in automated tests.
---

Permission tests should replace the role lookup with an in-memory store and stub command database writes at the boundary; only the production lookup query itself needs a narrow database-client contract test.

**Why:** Permission checks are shared by destructive staff and security commands, while test runs must never depend on or mutate a live PostgreSQL database.

**How to apply:** Extend the existing permission test helpers when adding a protected command, and keep owner, relevant staff ranks, and non-staff outcomes explicit.