# cBuilder LinkedIn Content Strategy — Partnership CRM

## cBuilder Cadence

| Day | Theme | Format |
|-----|-------|--------|
| **Monday** | Build Progress | Screenshot + Problem being solved |
| **Wednesday** | Technical Insight | Lesson learned while building |
| **Friday** | Public Proof | Demo video + metrics + what improved |

**Posting schedule**: 3 posts/week × 4 weeks = 12 posts

**Target audience**: Student developers, startup founders, recruiters, SaaS builders

**Tone**: Story-driven, humble but confident, educational

---

## Week 1 — Project Kickoff & The Problem

---

### Post 1 — Monday (Build Progress)

**Theme**: Why I built a CRM for partnerships instead of using Excel

**Screenshot**: The main dashboard showing the sidebar (stats: follow-ups due, active partners, meetings) + the pipeline list + the detail panel with health score visible.

**📸 Screenshot instructions**:
1. Open `http://localhost:5174/`
2. Login (signup first if needed)
3. Capture the full app shell — sidebar on left, dashboard header with stats (Follow-up risk, Partner health, Meetings, Notes), and the pipeline in center
4. Make sure at least one organization is selected on the right panel

---

**Post text**:

3 weeks ago, I was tracking startup partnerships in a Google Sheet.

Today, I have a full-stack CRM that shows me:

→ Which relationships need attention NOW
→ Health scores for every partner
→ A reminder queue so nothing slips
→ Search across universities, mentors, startups & partners

What changed?

I stopped waiting for "the right time to build" and started writing code.

Built with:
• React + TypeScript (frontend)
• Node.js + Express (API)
• PostgreSQL + Prisma (database)
• JWT auth with role-based access

The biggest lesson: if you can describe the problem clearly, you can build the solution. A spreadsheet is not a system.

#BuildInPublic #CRM #React #TypeScript #StudentDeveloper #PartnershipCRM

---

### Post 2 — Wednesday (Technical Insight)

**Theme**: The lesson about database schema design — why polymorphic relationships fail at scale

**Screenshot**: VS Code showing the Prisma schema (`backend/prisma/schema.prisma`) with the User, Organization, Contact, Meeting, Note, and Reminder models visible.

**📸 Screenshot instructions**:
1. Open `backend/prisma/schema.prisma` in VS Code
2. Zoom in so the model definitions are readable (User, Organization, Contact, Meeting, Note tables)
3. Capture the screen showing these models

---

**Post text**:

I almost designed my database with a polymorphic "activities" table.

One table for notes, meetings, calls, and emails — all tied to a generic `targetId` + `targetType`.

It felt elegant. Until I tried to query it.

Here's what I learned:

❌ Polymorphic joins are slow and hard to index
❌ TypeScript types become impossible to maintain
❌ Every new activity type breaks your queries

✅ Separate tables per entity with clear foreign keys
✅ Prisma relations that are type-safe
✅ Indexed columns for the queries you actually run

Before writing a single API route, I mapped every query the CRM dashboard needs:

- "Show me all reminders due this week"
- "Get all notes for this organization"
- "Find contacts by email"

Then I designed the schema backwards from those queries.

This is called "query-driven schema design" — and it saves weeks of rewrites.

What's one database mistake you've made that cost you time?

#DatabaseDesign #Prisma #WebDev #Backend #BuildInPublic

---

### Post 3 — Friday (Public Proof)

**Theme**: Demo video + metrics from the first prototype

**Video instructions**:
1. Record a 45-60 second Loom / screen recording
2. Start at the login screen → login with test credentials
3. Show the dashboard → scroll through the pipeline
4. Click an organization in the sidebar → show detail panel
5. Add a note → show it saving
6. Change the stage of a partnership → show activity logged
7. Bump a follow-up → show reminder queue updating
8. Search for an organization → show filtering working

**Metrics to display**:
- 8 seed organizations in the pipeline
- 25+ meetings logged across partners
- 4 pipeline stages: Discovery → Qualified → Proposal → Negotiation → Active
- JWT auth with admin/user roles

---

**Post text**:

6 months ago, my GitHub was mostly tutorial projects.

Today, I shipped a Partnership CRM that actually works.

Here's the demo ↓ [link to video or embedded video]

What it does:
→ Tracks universities, mentors, startups & partners in one place
→ Shows health scores and follow-up risk
→ Lets you add notes, log meetings, and move stages
→ Reminder queue so nothing drops
→ JWT auth with admin & user roles

The dashboard shows you exactly what needs attention — no spreadsheets, no Slack threads, no "I'll follow up tomorrow."

Stack:
• React + TypeScript + Vite
• Node.js + Express + Prisma
• PostgreSQL
• JWT + bcryptjs

Tech decisions that made this faster:
1. Vite proxy for local dev = no CORS headaches
2. Prisma migrations = schema version control
3. Zod validation = type-safe API from request to database

The best investment I made? Building something OTHER people can use. Not another todo app.

Try it, break it, tell me what's missing.

#BuildInPublic #FullStack #WebDevelopment #React #NodeJS #IndieDev

---

## Week 2 — Authentication & Data Architecture

---

### Post 4 — Monday (Build Progress)

**Theme**: Solving JWT authentication flow — login, signup, session restore

**Screenshot**: The AuthScreen component (`src/components/AuthScreen.tsx`) showing the login/signup form + the backend auth middleware file side by side in VS Code.

**📸 Screenshot instructions**:
1. Split VS Code — left side open `src/components/AuthScreen.tsx`, right side open `backend/src/middleware/auth.ts`
2. Capture showing the frontend login form code and the backend JWT verification middleware
3. Or: capture the browser showing the auth screen with "Sign in" and "Create account" toggle

---

**Post text**:

I spent 3 days building authentication for a CRM that only I was going to use.

Was it overkill? Maybe.

But here's why it matters:

A real product has:
→ Multiple users with different access levels
→ Sessions that survive page refreshes
→ Secure password storage (bcrypt, not plain text)
→ Tokens that expire and refresh

I built the auth flow like this:

1. User signs up → backend hashes password with bcryptjs
2. Backend issues JWT with user ID + role embedded
3. Frontend stores token in localStorage
4. Every API call includes `Authorization: Bearer <token>`
5. Middleware verifies the token on every protected route
6. Session restores automatically on page reload

The hardest part? Error handling.

What happens when the token expires mid-session?
What if the backend is down?
What if the database connection fails?

I handle all three with clear error messages and automatic redirect to login.

Authentication is not glamorous. But it's the difference between a prototype and a product.

#Authentication #JWT #WebSecurity #FullStack #BuildInPublic

---

### Post 5 — Wednesday (Technical Insight)

**Theme**: The lesson about error handling middleware in Express — why centralized error handling saves hours of debugging

**Screenshot**: VS Code showing `backend/src/middleware/error-handler.ts` and `backend/src/lib/api-errors.ts`

**📸 Screenshot instructions**:
1. Open `backend/src/middleware/error-handler.ts` in VS Code
2. Open `backend/src/lib/api-errors.ts` in another tab
3. Capture both files showing the custom ApiError class and the Express error handler

---

**Post text**:

The #1 thing that makes an Express API feel professional?

Error handling.

Not the routes. Not the database schema. How the API fails.

Here's what I learned building the Partnership CRM backend:

❌ Don't: Try/catch in every single route handler
✅ Do: Use a centralized error handler middleware

I created a custom `ApiError` class:

```typescript
class ApiError extends Error {
  status: number;
  code: string;

  constructor({ status, code, message }) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
```

Then every route just throws `ApiError` with the right status code:

```typescript
throw new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Organization not found' });
```

And one single error handler middleware catches everything and returns a consistent JSON response:

```json
{
  "message": "Organization not found",
  "code": "NOT_FOUND"
}
```

This means:
✓ Every error has the same shape
✓ Status codes are meaningful (401 vs 403 vs 404)
✓ The frontend can handle errors predictably
✓ Debugging is 10x faster

Stop writing try/catch in every route. Build a proper error handling layer once.

#ExpressJS #NodeJS #APIDesign #Backend #BuildInPublic

---

### Post 6 — Friday (Public Proof)

**Theme**: Demo of the auth flow + CRUD operations working end-to-end

**Video instructions**:
1. Record 60-90 seconds
2. Show the login screen → type email/password → login
3. Show the dashboard loading with user's name and role ("admin") in header
4. Sign out → show redirect to login
5. Sign up a new account → show it works
6. Show a console log or network tab showing the JWT token in Authorization header
7. Close the browser, reopen, show session restores automatically

**Metrics to show**:
- 2 user roles: admin + user
- Password hashed with bcrypt (12 salt rounds)
- JWT expiry: configurable via env
- Session restore: < 1 second

---

**Post text**:

Last week I showed you the CRM dashboard.

This week, I'm showing you the authentication system that powers it.

Here's what I want you to notice in this demo ↓ [video]

1. **Signup → auto-login**: One form creates your account and signs you in immediately
2. **Session persistence**: Close the tab, reopen it — you're still logged in
3. **Role-based UI**: Admins see different options than regular users
4. **Clean error states**: Wrong password, expired token, network failure — all handled

The stack for auth:
→ bcryptjs for password hashing
→ jsonwebtoken for access tokens
→ Prisma for user storage
→ Zod for input validation

What I'm most proud of? The error messages.

Instead of "Authentication failed", users see:
→ "Missing access token"
→ "Invalid or expired token"
→ "Insufficient permissions"

Because good UX includes good error UX.

#Authentication #FullStack #UX #WebDev #BuildInPublic

---

## Week 3 — Pipeline UI & Real-Time Features

---

### Post 7 — Monday (Build Progress)

**Theme**: Building the pipeline view — dragging stages, health scores, visual design

**Screenshot**: The pipeline list in the center panel showing organizations sorted by stage (Discovery → Active), with the health score badges and priority indicators visible

**📸 Screenshot instructions**:
1. Open the app on `http://localhost:5174/`
2. Click on different organizations to show the stage selector dropdown working
3. Capture the left sidebar showing "Stage Mix" with counts
4. Also capture the organization cards showing: type badge, name, health %, summary, owner, dates

---

**Post text**:

Pipeline management is the heart of any CRM.

But I didn't want a boring table with rows and columns.

I wanted a visual system where you can:

→ See at a glance which stage every partner is in
→ Click to move them forward (Discovery → Qualified → Proposal → Negotiation → Active)
→ Watch the health score change as relationships grow
→ Filter by stage to focus on what's stuck

Here's how I built it:

1. **Stage palette**: Each stage has its own color (Discovery = blue, Active = green)
2. **Health score**: 0-100% calculated from meeting frequency + recency
3. **Stage dropdown**: Click to change stage, and a system note is logged automatically
4. **Filter buttons**: Click any stage in the sidebar to filter the pipeline

The data flows like this:

User clicks stage → React state updates → localStorage saves → UI re-renders → Stats recalculate → Sidebar updates

Everything is reactive. Nothing is stale.

The best part? Adding a note when a stage changes creates an audit trail. You can look back and see exactly when a relationship moved from "Proposal" to "Negotiation."

Pipeline management shouldn't be complicated. It should be visual.

#PipelineManagement #ReactJS #UI #UX #CRM #BuildInPublic

---

### Post 8 — Wednesday (Technical Insight)

**Theme**: The lesson about useMemo performance optimization — when NOT to optimize

**Screenshot**: VS Code showing `src/App.tsx` with the `useMemo` hooks visible (stats, stageCounts, prioritizedOrganizations, followUpQueue, reminderQueue)

**📸 Screenshot instructions**:
1. Open `src/App.tsx` in VS Code
2. Search for `useMemo` — capture showing multiple useMemo calls
3. Highlight the ones computing `stats`, `followUpQueue`, and `visibleOrganizations`

---

**Post text**:

Let me tell you about the time I over-optimized a React app.

I was building the Partnership CRM and added `useMemo` to EVERY computed value.

Stats? useMemo.
Filtered list? useMemo.
Follow-up queue? useMemo.
Priority sorting? useMemo.

My rationale: "Performance first!"

Here's what actually happened:

→ The code became harder to read
→ I introduced a stale closure bug (useMemo cached the wrong data)
→ The performance gain was literally 2ms on a list of 15 items
→ I spent 3 hours debugging a bug that didn't exist before

The lesson?

**Don't optimize what doesn't need optimizing.**

React is fast enough for 99% of apps. `useMemo` and `useCallback` are tools for specific bottlenecks — not default patterns.

Here's when you SHOULD use useMemo:

✓ Expensive computations (sorting 10,000 items)
✓ Referential stability for child components
✓ Derived data used in dependency arrays

Here's when you should NOT:

❌ Small arrays (< 100 items)
❌ Simple arithmetic (sum, count, average)
❌ Single-level filter operations

The Partnership CRM has 15 organizations. It doesn't need useMemo on every calculation.

But I kept it in the code for one reason: **it shows I understand when optimization matters.**

Junior devs use useMemo everywhere. Senior devs know when to skip it.

#ReactJS #Performance #WebDev #TypeScript #BuildInPublic

---

### Post 9 — Friday (Public Proof)

**Theme**: Demo of the full pipeline workflow — create partner → move stages → add notes → set reminders

**Video instructions**:
1. Record 90-120 seconds
2. Start at the dashboard
3. Click "Add new partner" → fill the form (name, type, owner, priority, contact, reminder)
4. Submit → show the new partner appearing at the top of the pipeline
5. Click the new partner → change stage from Discovery to Qualified → show the note logged
6. Add a note → show it saving
7. Set a reminder → show it appearing in the Reminder Queue sidebar
8. Search for the partner by name → show filter working
9. Scroll through the stats — show them updating

**Metrics to show**:
- Partners move through 5 stages
- Notes are logged with author, timestamp, and tag
- Reminders appear in the queue automatically
- Stats update instantly

---

**Post text**:

A CRM where you can't add a partner in under 30 seconds is not a CRM.

Here's the full workflow in action ↓ [video]

What you'll see:

0:00 — Dashboard with stats
0:15 — Creating a new partner (name, type, owner, priority)
0:35 — Partner appears at the top of the pipeline
0:45 — Moving stage from Discovery to Qualified
0:55 — Adding a meeting note
1:10 — Setting a follow-up reminder
1:25 — Reminder appears in the queue
1:35 — Searching across the pipeline

I built this because I was tired of:

❌ Switching between Slack, email, and Google Sheets to track a partnership
❌ Missing follow-ups because "I'll remember"
❌ Having no idea who owns which relationship

Now everything is in one place.

The tech that makes this fast:
→ React state management without Redux (localStorage + useState)
→ Debounced search (instant filtering without API calls)
→ Optimistic UI updates (move stage, see result immediately)

Stop building products that add more friction. Build things that delete steps.

#CRM #WebApp #Productivity #FullStack #BuildInPublic

---

## Week 4 — Production Polish & Lessons Learned

---

### Post 10 — Monday (Build Progress)

**Theme**: Adding role-based access control — admin vs user permissions

**Screenshot**: VS Code showing `backend/src/middleware/roles.ts` and `backend/src/lib/authz.ts` side by side

**📸 Screenshot instructions**:
1. Open `backend/src/middleware/roles.ts` and `backend/src/lib/authz.ts` in VS Code
2. Capture showing the `assertAdmin()` and `assertOwnerOrAdmin()` functions
3. Also show the Prisma schema user model (has `role` field with enum `admin | user`)

---

**Post text**>

Not every user should see everything.

In the Partnership CRM:

→ **Admins**: Can view, edit, and delete ALL organizations and reminders
→ **Users**: Can only view and edit their OWN organizations

This is called Role-Based Access Control (RBAC), and here's how I built it:

1. **User model** has a `role` field: `admin | user`
2. **JWT token** embeds the user's role at login
3. **Auth middleware** decodes the token and attaches user to `req.user`
4. **Authorization functions** check permissions:

```typescript
function assertAdmin(req) {
  if (req.user.role !== 'admin') {
    throw new ApiError({ status: 403, message: 'Insufficient permissions' });
  }
}

function assertOwnerOrAdmin(req, ownerId) {
  if (req.user.role === 'admin') return; // admin can do anything
  if (req.user.userId !== ownerId) {
    throw new ApiError({ status: 403, message: 'Not your organization' });
  }
}
```

5. **Routes** call these functions before any data operation

Why does this matter?

Because if you're building for real users, you need to think about:
→ Data privacy (users shouldn't see each other's data)
→ Audit trails (who did what)
→ Scalable permissions (add new roles later)

RBAC turns a single-user prototype into a multi-user product.

#RBAC #Authorization #Backend #NodeJS #BuildInPublic

---

### Post 11 — Wednesday (Technical Insight)

**Theme**: The lesson about Prisma migrations — how to treat your database like code

**Screenshot**: VS Code showing the migrations folder (`backend/prisma/migrations/`) in the file explorer, and the `migration.sql` file showing the SQL generated by Prisma

**📸 Screenshot instructions**:
1. Open the `backend/prisma/migrations/` folder in VS Code explorer
2. Click on the latest migration to show the SQL file
3. Also show `backend/prisma/schema.prisma` next to it

---

**Post text**:

Here's the #1 thing that separates hobby projects from production apps:

**Migrations.**

If you're still editing your database directly in pgAdmin or MySQL Workbench, you're doing it wrong.

Here's what I learned building the Partnership CRM:

**Your database schema IS code. Version control it.**

Using Prisma migrations means:

1. Every schema change is a FILE with a timestamp
2. Migrations are committed alongside code changes
3. Any team member can run `prisma migrate dev` and have the exact same schema
4. Production migrations are safe — preview the SQL before running
5. Rollback is possible (or at least reversible)

Example flow:

```
1. Edit schema.prisma (add a "priority" field to organizations)
2. Run `prisma migrate dev --name add-priority-field`
3. Prisma generates migration.sql
4. Commit schema.prisma + migration.sql
5. Deploy → run `prisma migrate deploy`
```

No more:
❌ "Wait, which database has the latest schema?"
❌ "I forgot to run the ALTER TABLE script"
❌ "It works on my machine"

**Treat your database like code.**

Your future team (and future self) will thank you.

#Prisma #Database #Migrations #DevOps #BuildInPublic

---

### Post 12 — Friday (Public Proof)

**Theme**: Full project demo + GitHub + what's next — the final recap

**Video instructions**:
1. Record 2-3 minutes (final recap)
2. Show the login screen
3. Quick walkthrough of every feature:
   - Dashboard with stats
   - Pipeline list
   - Organization detail (notes, meetings, contacts, reminders)
   - Add new partner form
   - Stage change
   - Search and filter
   - Reminder queue in sidebar
4. Open VS Code and show the project structure briefly
5. Show the README with setup instructions
6. Talk about what's next

**Metrics to showcase**:
- 12+ LinkedIn posts documenting the journey
- 1 full-stack app built in 4 weeks
- Frontend: React + TypeScript + Vite
- Backend: Express + Prisma + PostgreSQL
- Auth: JWT with role-based access
- Features: CRUD, search, filter, reminders, pipeline, notes

---

**Post text**:

4 weeks ago, I started building.

Today, I'm shipping the Partnership CRM — a full-stack application that helps startup teams track universities, mentors, and partners in one place.

**The journey →**

Week 1: Project setup + pipeline UI + seed data
Week 2: JWT authentication + database schema + Prisma migrations
Week 3: CRUD routes, search, filtering, reminders, role-based access
Week 4: Error handling, authZ middleware, production polish

**The stack →**

Frontend: React 18 · TypeScript · Vite · CSS
Backend: Node.js · Express · Prisma ORM · PostgreSQL
Auth: JWT · bcryptjs · Role-based access control
Validation: Zod (backend) · TypeScript (frontend)

**What 12 posts of #BuildInPublic taught me →**

1. Building in public keeps you accountable
2. Explaining your code helps you understand it better
3. People don't care about your certificates — they care about what you've shipped
4. The best time to start was yesterday. The second best time is today.

**What's next →**
→ Deploy frontend to Vercel
→ Deploy backend to Render
→ Add email reminders
→ Real-time notifications

If you've been waiting for "permission" to build — this is it.

Open your editor. Write the first line. Ship the first version.

Everything else is just iteration.

#BuildInPublic #FullStack #DeveloperJourney #React #NodeJS #ShipIt

---

## Hashtag Strategy

**Always use (top 3)**:
- `#BuildInPublic`
- `#WebDev` or `#FullStack`

**Rotate from these**:
- `#ReactJS`, `#TypeScript`, `#NodeJS`, `#Backend`
- `#CRM`, `#Authentication`, `#DatabaseDesign`
- `#StudentDeveloper`, `#IndieDev`, `#ShipIt`

**Post-specific** (choose 1-2):
- `#Prisma`, `#ExpressJS`, `#RBAC`, `#PipelineManagement`
- `#API`, `#UX`, `#Performance`

**Rule**: Never use more than 10 hashtags. 5-8 is ideal.

---

## Best Posting Times

- **Monday**: 7:00-9:00 AM or 12:00-1:00 PM
- **Wednesday**: 7:00-9:00 AM or 12:00-1:00 PM
- **Friday**: 7:00-9:00 AM or 12:00-1:00 PM (peak engagement)

---

## Notes for each post

- Always add a line break between paragraphs for readability
- Add the screenshot/video AFTER writing the post text
- Tag relevant people/companies in comments, not the post body
- Reply to every comment within 2 hours of posting (for algo boost)
- Cross-post to Twitter/X with a shortened version + link to LinkedIn

