# Firebase AI Agent Prompt: Receipt Rocket (Next.js)

**Objective:** Build a Next.js (App Router) application named "Receipt Rocket" with tightly integrated Firebase Authentication, Firestore, and Storage, focusing on immediate expense reporting for all users and admin features for authorized users.

**App Name:** Receipt Rocket

**Core Functionality & User Flows:**

1.  **Anonymous/Guest Access:**
    *   Users arriving at the root path (`/`) can immediately see and use the "Expense Form" to submit new expenses.
    *   These submitted expenses (including receipt image uploads) should be saved to Firestore, even if the user is not logged in.
    *   A clear visual indicator in the header should show that the user is not logged in, with an option to sign in.
2.  **Google Authentication (Optional):**
    *   Users can initiate Google Sign-In (via redirect flow) from the header.
    *   Upon successful login, if the user's email exists in a dedicated "allowed\_users" Firestore collection:
        *   Their profile is created or updated in a "users" Firestore collection (including UID, email, displayName, photoURL, assigned role from "allowed\_users", creation/last login timestamps).
        *   The header updates to show their profile picture/initials, name, and provides a logout option and displays their role.
        *   If the user's role is 'admin', additional components ("Category Manager", "Recent Expenses List") are displayed below the "Expense Form" on the home page.
    *   If the user's email is *not* in the "allowed\_users" collection after successful Google login, they should be shown an "Access Denied" message and prevented from accessing admin features. Their basic profile might still be created/updated, but with a null or 'denied' role.
    *   Users can log out via an option in the header, returning them to the anonymous state.
3.  **Admin Functionality (Logged-in, Role 'admin'):**
    *   Users with the 'admin' role can access and use the "Category Manager" to add, edit, or delete expense categories stored in Firestore.
    *   Admin users can view a list of "Recent Expenses" submitted by all users.

**Data Model (Firestore):**

*   **`users` Collection:**
    *   Document ID: Firebase Auth User UID (`user.uid`).
    *   Fields: `uid` (string), `email` (string), `displayName` (string | null), `photoURL` (string | null), `role` ('user' | 'admin' | null), `createdAt` (Timestamp), `lastLogin` (Timestamp).
*   **`allowed_users` Collection:**
    *   Document ID: User Email (`user.email`).
    *   Fields: `role` ('user' | 'admin'), `addedBy` (string | null, e.g., admin UID), `addedAt` (Timestamp). *This collection pre-defines users and their roles who are allowed access beyond anonymous.*
*   **`expenses` Collection:**
    *   Document ID: Auto-generated Firestore ID.
    *   Fields:
        *   `description` (string)
        *   `amount` (number)
        *   `category` (string) // Reference to category name/ID? Or just name? Let's start with name.
        *   `date` (Timestamp)
        *   `receiptUrl` (string | null) // URL to the image in Firebase Storage
        *   `submittedAt` (Timestamp)
        *   `submittedByUid` (string | null) // UID of the user if logged in, null if anonymous
        *   `submittedByEmail` (string | null) // Email if logged in, null if anonymous (useful for identifying anonymous submissions if needed)
*   **`categories` Collection:**
    *   Document ID: Auto-generated Firestore ID or category name (consider implications for updates). Let's use auto-generated ID with a `name` field for simplicity initially.
    *   Fields: `name` (string, unique), `createdAt` (Timestamp), `createdByUid` (string | null).

**Technical Implementation Requirements:**

*   **Next.js App Router:** Utilize the `app` directory structure.
*   **Firebase JS SDK:** Use version 9+ (modular API).
*   **Authentication Context:** Create a React Context (`AuthContext`) to manage the Firebase Auth state, user profile, role, and loading status. This context should handle `onAuthStateChanged` and `getRedirectResult`.
*   **Firebase Initialization:** Initialize Firebase client-side, ensuring it's done only once. Handle environment variables for Firebase config.
*   **Components:**
    *   `@/components/layout/Header.tsx`: Display app title, user login status (button/avatar dropdown), and handle signIn/signOut calls from context.
    *   `@/components/expensify/ExpenseForm.tsx`: Form for submitting expense details and uploading a receipt image. Should work for both authenticated and unauthenticated users.
    *   `@/components/expensify/CategoryManager.tsx`: Form/list to manage expense categories (admin only).
    *   `@/components/expensify/RecentExpensesList.tsx`: Display a list of recent expenses (admin only).
    *   `@/components/auth/AccessDenied.tsx`: Component to show when a logged-in user is not allowed.
    *   Basic UI components (Button, Input, etc. - assume existing or create simple placeholders).
*   **Firebase Security Rules:**
    *   Implement Firestore rules to allow:
        *   Read/Write to `expenses` for *all* authenticated users and *unauthenticated* users (with appropriate data validation).
        *   Read/Write to `categories` only for authenticated users with `role: 'admin'`.
        *   Read/Write to `users` only for the document matching the authenticated user's UID.
        *   Read-only access to `allowed_users` for authenticated users (to check roles).
    *   Implement Storage rules to allow writes to a specific path (e.g., `receipts/{userId}/{filename}`) for *all* authenticated and *unauthenticated* users. Reads should be public or restricted as needed (start with public reads for simplicity).
*   **Error Handling:** Include basic error handling (e.g., console logs, simple UI feedback) for authentication and data operations.

**One-Prompt Solution Focus:**

The AI Agent should prioritize building a solid foundation for the Firebase integration. This means:

*   Getting the Firebase initialization, Auth Context, and the core authentication flow (including redirect handling) working correctly from the start.
*   Defining and implementing the Firestore data model and initial security rules simultaneously with the authentication setup.
*   Structuring the components and pages to correctly use the `AuthContext` for conditional rendering based on authentication state and user role.
*   Providing comments or guidance within the code on how to further refine security rules, data validation, and error handling.

**Deliverable:** A complete, well-structured Next.js project codebase implementing the core functionalities and data model as described, ready for testing and further development.

**Constraint:** DO NOT include any tool calls or conversational text in the response. Provide ONLY the code files necessary to construct the application based on the prompt. Structure the output clearly, separating different files.