# ResQMeal — Product Requirements Document (PRD)
**Hackathon:** Codebenders ACE Builders Hackathon 2026
**Problem Statement:** PS2 — Society & Environment: Rescue the Surplus
**Product:** ResQMeal
**Tagline:** Rescue surplus food. Deliver it where it matters.
---

## 1. Product Overview

ResQMeal is a food-rescue coordination platform that connects restaurants with nearby NGOs and community kitchens so surplus edible food can be collected before its pickup deadline.

Restaurants can quickly list surplus food, suitable receivers can discover and claim donations, and volunteers can coordinate collection and delivery.

The platform aims to reduce avoidable food waste while making food-rescue coordination faster, more transparent and measurable.

**Core objective:** Solve the operational gap between food surplus and food demand through a reliable donation-matching and pickup-coordination workflow.

ResQMeal is an operational web application, not a chatbot or a static food-listing website.

## 2. Initial Launch Scope

To keep the solution focused and achievable:

- **City:** Bengaluru, India.
- **Initial locality:** Koramangala.
- **Donor type:** Restaurants.
- **Receivers:** NGOs and community kitchens.
- **Pickup coordinators:** Volunteers.

The initial product should demonstrate one focused local food-rescue ecosystem rather than attempting multi-city coverage.

Use fictional names, synthetic records and approximate demonstration locations. Never publish real addresses or personal information.

## 3. Target Users and Roles

### 3.1 Restaurant — Donor

Restaurants need a fast and convenient way to donate surplus food.

Required capabilities:
- Register or access a restaurant account.
- Post surplus food in ideally under one minute.
- Enter food name and category.
- Enter quantity and measurement unit.
- Enter preparation or packing time.
- Specify pickup-by deadline.
- Specify storage conditions.
- Declare allergens.
- Add handling instructions.
- View active, claimed and completed donations.
- View donation history and rescue impact.

The donation form must be simple, clearly organized and easy to complete.

### 3.2 NGO / Community Kitchen — Receiver

Receivers need to discover suitable donations and arrange collection.

Required capabilities:
- Access an NGO or community kitchen account.
- Set food preferences and receiving capacity.
- Browse available donations.
- View quantity, pickup deadline and food-handling details.
- See urgency and suitability indicators.
- Receive explainable donation recommendations.
- Claim suitable donations.
- Track collection and delivery progress.
- Confirm successful delivery.

### 3.3 Volunteer — Pickup Coordinator

Volunteers help coordinate the physical movement of donated food.

Required capabilities:
- Access a volunteer account.
- View available or assigned pickup tasks.
- View relevant pickup and delivery instructions.
- View donation quantity and deadline.
- Confirm successful collection.
- Update delivery status.
- Record completion of assigned pickups.

A volunteer must be associated with the relevant claimed donation before recording pickup activity.

## 4. Core Donation Workflow

Every donation must follow this shared lifecycle:

1. **Posted:** Restaurant creates a donation.
2. **Claimed:** An eligible receiver accepts the donation.
3. **Collected:** Assigned volunteer confirms collection.
4. **Delivered:** Receiver confirms successful delivery.

All three dashboards must use the same underlying donation record.

Status updates must be saved to the database and reflected consistently across relevant dashboards.

Additional handling:
- Unclaimed donations past their pickup deadline must become expired or unavailable.
- Expired donations must not be claimable.
- Invalid status transitions must be prevented.
- Completed donations must remain available in donation history.
- Only successfully delivered donations count towards confirmed rescue impact.

## 5. Smart Donation Matching

The platform must recommend suitable donations to receivers.

Matching factors:

1. **Distance:** Locality and approximate distance compatibility.
2. **Quantity:** Donation quantity compared with receiver capacity.
3. **Food preferences:** Food type and receiver requirements.
4. **Pickup timing:** Receiver and volunteer availability.
5. **Urgency:** Time remaining before the pickup deadline.

Requirements:
- Rank suitable donations using transparent matching logic.
- Prioritize urgent donations when they are suitable for the receiver.
- Explain why a donation is recommended.
- Avoid recommending expired or unavailable donations.
- Do not present invented distances as real measurements.

A transparent rule-based matching algorithm is acceptable. Advanced machine learning is not required.

## 6. Food Safety and Handling

Every donation listing must provide:

- Preparation or packing time.
- Pickup-by deadline.
- Storage conditions.
- Declared allergens.
- Food handling instructions.

The application must:
- Display food safety information clearly.
- Flag missing or incomplete information.
- Clearly indicate expired donations.
- Avoid implying that food is safe simply because it is listed.
- Communicate that the platform does not inspect or certify food safety.

**Disclaimer:** ResQMeal connects food donors and receivers. It does not certify food safety or replace the responsibility of donors and receivers to follow applicable food-safety practices.

## 7. Impact Dashboard

Provide measurable and understandable impact information.

Required metrics:

- Total food rescued in kilograms.
- Estimated meals saved.
- Number of completed deliveries.
- Number of successful pickups.
- Donation completion rate.

### Calculation assumptions

**Food rescued:**

Sum the edible food quantities from successfully delivered donations, normalized to kilograms.

**Estimated meals saved:**

Estimated meals saved = rescued edible food weight ÷ assumed edible food weight per serving.

The assumed serving weight must be visible and configurable or clearly documented.

**Completion rate:**

Completion rate = delivered donations ÷ eligible claimed donations × 100.

All metrics must:
- Be calculated from actual application records.
- Count only completed deliveries towards confirmed rescue impact.
- Be clearly labelled as estimates where appropriate.
- Display their calculation assumptions.
- Avoid unsupported environmental impact claims.

## 8. Business Viability and Donor Retention

ResQMeal should provide restaurants with practical reasons to use the platform repeatedly.

Value to restaurants:
- Quick donation posting.
- Convenient receiver discovery.
- Pickup coordination.
- Donation history.
- Completed rescue statistics.
- Monthly sustainability summaries.
- Measurable impact reporting.

Potential future revenue models:
- Optional premium donor analytics.
- Recurring donation management features.
- CSR sponsorships.
- Aggregated and anonymized impact reporting for relevant organizations or city authorities.

The initial MVP should focus on demonstrating value rather than implementing complicated payments.

Do not promise tax deductions, legal benefits or guaranteed financial savings.

## 9. Application Design and User Experience

The application must have:

- Professional, trustworthy visual design.
- Responsive desktop and mobile layouts.
- Clear role-specific navigation.
- Separate Restaurant, NGO and Volunteer dashboards.
- Consistent visual language across roles.
- Clear buttons, forms and status indicators.
- Useful loading, error and empty states.
- Input validation and understandable error messages.
- Simple onboarding and role selection.

Avoid excessive animations, confusing navigation and unnecessary decorative elements.

The primary user journeys should require as few steps as practical.

## 10. Approved Technology Stack and Technical Architecture

### 10.1 Development Tools

- **Primary IDE:** Codebenders IDE.
- **Coding assistant:** Nexen AI within Codebenders.
- **Additional coding assistance:** GitHub Copilot, where permitted by hackathon rules.
- **Repository:** GitHub.
- **Hosting:** Vercel.

### 10.2 Frontend

Choose a reliable, maintainable frontend framework supported by the Codebenders environment.

Requirements:
- Responsive web application.
- Reusable components.
- Role-specific dashboards.
- Clean separation of frontend and backend responsibilities.
- Integration with Supabase through approved client libraries and APIs.

### 10.3 Backend and Database

**Approved backend: Supabase.**

Use Supabase for:
- PostgreSQL database.
- Authentication.
- Database APIs.
- Persistent application records.
- Row Level Security (RLS).
- Secure role-based access.

The database should support shared records for:

- User profiles and roles.
- Restaurants and donor information.
- NGOs and receiver preferences.
- Volunteer profiles.
- Food donations.
- Pickup assignments.
- Donation status history.
- Relevant impact records.

Suggested relationships:

- A restaurant can create multiple donations.
- An NGO can claim suitable donations.
- A donation can have an associated volunteer assignment.
- A donation has a status and relevant timestamps.
- Completed donations contribute to impact calculations.

The exact schema should be designed and reviewed during the backend milestone.

### 10.4 Database Security

- Use Supabase authentication where appropriate.
- Implement Row Level Security policies.
- Restrict users to authorized operations for their roles.
- Protect donor, receiver and volunteer information.
- Never expose the Supabase service-role key in frontend code.
- Keep credentials in environment variables.
- Do not commit secrets to GitHub.

### 10.5 Hosting and Deployment

Prepare the application for deployment through Vercel.

Maintain the source code in GitHub.

The deployed application should use properly configured environment variables and production-safe database access policies.

## 11. Hackathon and Development Constraints

### Permitted Tools

- Codebenders IDE and Nexen AI.
- Supabase.
- Vercel.
- GitHub.
- GitHub Copilot, subject to hackathon rules.

### Prohibited Coding Tools

Do not use:
- Gemini Antigravity to write project code.
- OpenAI Codex to write project code.
- Cursor to write project code.

Codebenders must remain the primary implementation environment.

### Implementation Constraints

- Use synthetic demonstration data.
- Do not expose real addresses or personal details.
- Do not create fake live GPS tracking.
- Do not pretend simulated notifications are real.
- Avoid unnecessary third-party integrations.
- Do not introduce complex features that delay the working MVP.
- Do not compromise security for convenience.

## 12. Development Milestones

Build ResQMeal incrementally.

### Milestone 0 — Requirements and Planning
- Finalize PRD.md.
- Establish project scope and architecture.
- Identify implementation milestones.

### Milestone 1 — Application Foundation
- Inspect development environment.
- Select frontend framework.
- Create project structure.
- Build responsive application layout.
- Create Restaurant, NGO and Volunteer dashboard entry points.

### Milestone 2 — Supabase Foundation and Donation Management
- Design and create database schema.
- Configure authentication and role access.
- Implement restaurant donation posting.
- Save and retrieve donation records.
- Validate inputs.

### Milestone 3 — NGO Discovery and Smart Matching
- Display available donations.
- Implement matching and urgency logic.
- Explain recommendations.
- Implement donation claiming.

### Milestone 4 — Volunteer Pickup Coordination
- Implement volunteer assignment.
- Display pickup tasks.
- Record collection confirmation.
- Record delivery confirmation.

### Milestone 5 — Shared Records and Workflow Reliability
- Verify shared status updates.
- Validate database persistence.
- Prevent invalid status transitions.
- Handle expired donations.
- Test access permissions.

### Milestone 6 — Impact and Donor Analytics
- Implement impact calculations.
- Display completed rescue statistics.
- Show calculation assumptions.
- Implement donation history and donor summaries.

### Milestone 7 — Final Quality Assurance and Deployment
- Verify all three user journeys.
- Test the complete donation workflow.
- Test security and validation.
- Test responsive layouts.
- Fix critical bugs.
- Prepare Vercel deployment.
- Prepare the final demonstration.

Each milestone must be tested before proceeding to the next.

## 13. Token and Context Management

To use the available Codebenders hackathon tokens efficiently:

- Maintain this PRD.md as the permanent source of truth.
- Maintain a PROGRESS.md file recording completed work, technical decisions, file locations and pending tasks.
- Use a separate Nexen chat for each development milestone.
- In every new chat, instruct Nexen to read PRD.md and extract only the requirements relevant to the current milestone.
- Ask Nexen to inspect only the files necessary for the task.
- Avoid unnecessary full-codebase explanations and repeated analysis.
- Avoid unrelated file modifications.
- Provide explicit implementation constraints.
- Update PROGRESS.md after each completed milestone.
- Do not repeat work that is already implemented and tested.

## 14. Out of Scope for the Initial MVP

Do not prioritize these features before completing the core workflow:

- Multi-city expansion.
- Advanced machine learning.
- Complex payment gateways.
- Live GPS tracking.
- Native Android or iOS applications.
- Unnecessary chatbot functionality.
- Complicated external integrations.
- Features that do not directly improve food rescue.

These may be considered as future enhancements.

## 15. Main Demonstration Scenario

The final demonstration must show a complete, working food-rescue journey:

1. A restaurant logs in and posts surplus food.
2. The donation is saved in the database.
3. The platform recommends suitable nearby receivers.
4. An NGO views and claims the donation.
5. A volunteer is assigned to the pickup.
6. The volunteer confirms collection.
7. The NGO confirms delivery.
8. All relevant dashboards reflect the updated status.
9. The impact dashboard calculates the completed rescue.

The demonstration must clearly distinguish synthetic demo activity from real-world food rescues.

## 16. Product Success Criteria

ResQMeal will be considered a successful MVP when it demonstrates:

- A clear solution to the surplus food problem.
- A defined launch locality and donor segment.
- Fast restaurant donation posting.
- Suitable and explainable receiver matching.
- Reliable pickup and delivery coordination.
- Shared persistent records across all roles.
- Food handling and safety information.
- Credible impact calculations.
- A practical reason for restaurants to use the platform repeatedly.
- Secure backend access.
- A complete, tested end-to-end workflow.

**Final product objective:** Build a functional, reliable and demonstrable food-rescue coordination platform that helps edible surplus food reach suitable receivers before it goes to waste.