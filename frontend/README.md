# Frontend Review Exercise

This folder contains a small React/Next-style dashboard intended for interview code review.

It is intentionally lightweight and is **not wired into the root build**. Treat it like a pull request snapshot rather than a fully runnable app.

## Scenario

You are reviewing a customer-health dashboard for an internal B2B operations team. The UI consumes curated backend data and lets operators search customers, inspect account notes, and update those notes.

## Candidate Prompt

Please review the code in `frontend/src/` as if it were a real pull request.

Focus on:

- the most important bugs or risks
- React and Next.js patterns you would challenge
- data-fetching and state-management trade-offs
- API boundary and security implications
- maintainability and product impact

If there is time, pick one area and explain how you would refactor it.

## Suggested Files To Start With

- `src/app/customers/page.tsx`
- `src/hooks/useCustomers.ts`
- `src/components/CustomersTable.tsx`
- `src/components/CustomerDrawer.tsx`
- `src/lib/api.ts`

## What We Care About

- Prioritization over volume
- Clear reasoning about trade-offs
- Practical React/Next.js knowledge
- Ability to connect code issues to production impact
