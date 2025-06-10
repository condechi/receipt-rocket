# **App Name**: Receipt Rocket

## Core Features:

- User Authentication: Google Sign-In using Firebase Authentication with redirect.
- Role-Based Access Control: Role-Based Access Control (RBAC) with user roles stored in Firestore.
- Add Expense: Add Expense: Form to input expense details including receipt image, account type, transaction type, amount, currency, date, vendor, and category.
- View Expenses: View Expenses: Display a list of the logged-in user's previously submitted expenses.
- Category Management: Category Management: Allow users to add and remove expense categories.
- User Profile: Create/Update user profiles (UID, email, displayName, photoURL, role) in Firestore on login, including lastLogin and createdAt timestamps.

## Style Guidelines:

- Primary color: Soft Blue (#82C0F4) to maintain the existing branding without being overpowering.
- Background color: Light Gray (#F0F4F7), very similar to the provided value, for a clean and modern backdrop.
- Accent color: Light Orange (#FFD180) for calls to action and important UI elements.
- Body and headline font: 'Inter' (sans-serif) for a modern, machined, objective, neutral look.
- Use consistent icons from lucide-react throughout the application.
- Utilize ShadCN UI components to ensure a clean and consistent design across the application, as specified.
- Subtle animations for loading states and transitions to improve user experience.