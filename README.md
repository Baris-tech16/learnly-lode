# QuizWise Coach

Build a modern, highly interactive, dark-themed Web App named "QuizForge: AI Mistake Vault & Socratic Coach" for high school and university students preparing for exams.

### UI & Theme Guidelines:

- Clean, modern aesthetic using Tailwind CSS with dark slate backgrounds (#0F172A), vibrant indigo (#6366F1), and orange/amber accents for gamification.

- Mobile-first responsive layout with a side navigation bar for desktop and a bottom navigation bar for mobile.

### Core Pages & Features:

1. Dashboard (Home):

   - Top Header: User avatar, Level/XP badge (e.g., "Level 4 - 1,250 XP"), and a Daily Streak counter with a flame icon (e.g., "🔥 7 Day Streak").

   - Weakness Analytics Widget: A chart/progress card showing topics the user struggles with most (e.g., "Physics - Kinematics: 40% accuracy").

   - Quick Actions: Buttons for "Upload Wrong Question", "Start Daily Review", and "Generate Practice Quiz".

2. Mistake Vault (Yanlış Defteri):

   - A grid of card components representing saved incorrect questions.

   - Filtering options: Filter by Subject (Math, Physics, Chemistry, etc.), Difficulty, or Mastery Status (Unresolved vs. Mastered).

   - "Add New Mistake" Modal: Allows users to upload an image or type a text question, assign a subject, and add their own notes on why they got it wrong.

3. Socratic Practice Mode (Interactive Quiz View):

   - Displays a question card from the Vault.

   - Crucial Feature - "Get Socratic Hint": A button that provides progressive clues/hints without revealing the final answer immediately, guiding the user step-by-step.

   - "Generate Similar Question" Button: Uses AI logic to generate a new variation of the current question with different numbers/scenarios to test true understanding.

   - Detailed Solution view revealed only after the user submits an answer.

4. Gamified Leaderboard & Rewards:

   - Weekly Leaderboard table showing top students based on XP earned from resolving wrong questions.

   - Achievement Badges (e.g., "Night Owl", "Mistake Crusher", "10 Streak Club").

Please generate a fully functional, beautiful frontend with realistic dummy data for subjects, wrong questions, and interactive buttons for all modals and state transitions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://learnly-lode.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f4299073-d51f-42d0-885a-7be49cb36d94).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
