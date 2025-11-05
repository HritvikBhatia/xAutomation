# xAutomation

An automation tool for posting sequentially from a database to X (formerly Twitter), managed via CLI scripts and scheduled with GitHub Actions.

This script fetches posts one by one from a PostgreSQL database, posts them using the X API, and keeps track of which post to send next.

## Features

  * **Automated Sequential Posting**: Posts tweets from a database in the order they were added.
  * **Database State**: Remembers the last posted tweet's index to ensure no duplicates and correct ordering.
  * **CLI Content Management**: Includes scripts to add, list, delete, and check the status of tweets in the queue.
  * **Database Reset**: A simple script to clear all posts and reset the posting index.
  * **Scheduled Automation**: Comes with a GitHub Actions workflow to run the bot automatically on a cron schedule.

## Project Structure

```
xAutomation/
├── .env.example        # Example environment variables
├── .github/
│   └── workflows/
│       └── schedule.yml  # GitHub Actions workflow
├── .gitignore          # Files to ignore
├── index.js            # Main script to post tweets
├── manage.js           # Script to manage posts (add, list, delete, status)
├── package-lock.json   # Exact dependency versions
├── package.json        # Project dependencies and info
├── README.md           # This project documentation
└── reset.js            # Script to clear the database
```

## Setup

1.  **Clone the repository**

    ```sh
    git clone https://github.com/HritvikBhatia/xAutomation.git
    cd xAutomation
    ```

2.  **Install dependencies**

    ```sh
    npm install
    ```

3.  **Configure environment variables**
    Create a `.env` file in the root directory and copy the contents of `.env.example`. Fill in your credentials.

    ```env
    # Your app credentials (identifies your app to Twitter)
    TWITTER_API_KEY=...
    TWITTER_API_SECRET=...

    # Your user access credentials (allows tweeting as your user)
    TWITTER_ACCESS_TOKEN=...
    TWITTER_ACCESS_SECRET=...

    # Connection string for your PostgreSQL database
    DATABASE_URL=postgresql://user:password@host:port/dbname...
    ```

4.  **Initialize the Database**
    This project requires a PostgreSQL database with two tables. Connect to your database and run the following SQL commands to create them:

    ```sql
    -- Creates the table to store your posts
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL
    );

    -- Creates the table to track which post is next
    CREATE TABLE tweet_state (
      id INT PRIMARY KEY,
      current_index INT NOT NULL DEFAULT 0
    );

    -- Initializes the state tracker
    INSERT INTO tweet_state (id, current_index) VALUES (1, 0);
    ```

## Usage

### Managing Posts (CLI)

Use the `manage.js` script to add and review your scheduled posts.

  * **Add one or more new posts:**

      * Posts will be added to the queue. Use `\n` for line breaks.

    <!-- end list -->

    ```sh
    node manage.js add "This is my first post." "This is my second post, with a\nline break."
    ```

  * **List all current posts:**

    ```sh
    node manage.js list
    ```

  * **Delete a specific post by its ID:**

    ```sh
    node manage.js delete <id>
    ```

  * **Check the current status:**

      * Shows how many posts are in the database and which one is next to be posted.

    <!-- end list -->

    ```sh
    node manage.js status
    ```

  * **Reset the entire queue:**

      * This will delete *all* posts and reset the posting index to 0. Use with caution\!

    <!-- end list -->

    ```sh
    node reset.js
    ```

### Running the Bot

  * **Manually:**
    You can trigger the bot manually at any time to post the next tweet in the queue.

    ```sh
    node index.js
    ```

    If successful, it will log the posted tweet and update the database index.

  * **Scheduled (GitHub Actions):**
    The project is configured to run automatically using GitHub Actions.

      * **Schedule:** The bot is set to run at:
          * 03:30 UTC
          * 13:30 UTC
          * 17:30 UTC
          * 20:30 UTC
      * **Setup:** For this to work in your own fork, you must add your `.env` variables ( `TWITTER_API_KEY`, `DATABASE_URL`, etc.) to your GitHub repository's **Settings \> Secrets and variables \> Actions** page.

## Future Improvements

  * Support for image or media posts on X
  * Web UI/dashboard for scheduling and management
  * Multi-account support
  * More robust retry logic for failed API calls
  * Analytics on engagement of posted content