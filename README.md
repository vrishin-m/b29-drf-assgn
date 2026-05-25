# b29-drf-assgn
### Creative Studio Workflow System
Build a full stack system (you may use react or any different frontend framework and Django REST Framework for backend) for a creative studio platform where teams manage projects like posters, videos, campaigns, or content workflows.

The platform should support multiple studios/teams with isolated data and proper role-based access control. Example roles may include Studio Admin, Project Lead, Designer, Writer, Reviewer, and Client Viewer.

Core deliverables:
 - Project creation and task/work item management
 - Assigning tasks to team members (use your learnings of RBAC here)
 - Workflow stages such as Draft, Review, Revision, Approved, and Completed
 - Comments/feedback threads on tasks
 - Deadlines, priorities, tags, and attachments (treat them as labels)
 - Search and filtering support (may use django filter)
 - Notifications for important actions/events

Bonus deliverables:
  - Create a Chat Section for communication among the team members (may use websockets)
  - Dashboard for overdue items and project progress (A tracker sort of)
  - Delayed reminders for pending review (may use celery)
  - Version history on submitted work items (learn how to maintain multiple versions)
  - Restricted transitions between workflow stages (manage stage dependencies)

**Deadline: 24th May EOD**
