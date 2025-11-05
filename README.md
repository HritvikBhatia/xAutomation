xAutomation

An automation tool for posting daily on X (formerly Twitter) using the X API and cron scheduling.
This script manages a database of scheduled posts (add/edit/delete) and posts them at the configured times.

Features
- Automated posting to X via the X API
- Scheduling of posts using cron jobs
- Database storage of posts: content, status
- Management scripts to add, update, delete scheduled posts
- Reset script to clear or reinitialize the schedule database

Project Structure
xAutomation/
├── index.js           - Main entry point for the bot
├── manage.js          - Script for managing scheduled posts (add/update/delete)
├── reset.js           - Script to reset or clear the scheduled posts database
├── package.json
├── package-lock.json
├── .gitignore
└── (config, DB models, etc.)

Setup
1. Fork or Clone the repository
   git clone https://github.com/HritvikBhatia/xAutomation.git
   cd xAutomation

2. Install dependencies
   npm install

3. Configure environment variables
   Create a .env file containing your X API credentials and database connection details. Example:
   X_BEARER_TOKEN=your_x_bearer_token_here
   DATABASE_URL=your_database_connection_string_here

4. Initialize or reset the database (optional)
   node reset.js

Usage
Run the bot:
   node index.js

This starts the scheduler, fetches due posts from the database, posts them to X, marks them as posted, and logs the results.

Manage scheduled posts:
Add a post:
   node manage.js add "Hello world!"

   node manage.js add "Post 1" "Post 2"


Cron Scheduling
- Default example: 0 9 * * * (every day at 09:00 UTC)
- Every 6 hours: 0 */6 * * *
- Weekly on Monday at 09:00: 0 9 * * MON


Logging & Monitoring
- The bot logs attempts, successes, failures, and post ids (if returned by the API).
- Consider adding retry logic, alerting, or integration with a logging/monitoring service.

Future Improvements
- Support for image or media posts on X
- Web UI/dashboard for scheduling and management
- Multi-account support
- More robust retry logic for failed API calls
- Analytics on engagement of posted content