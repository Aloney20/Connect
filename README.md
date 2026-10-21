# Student Academic Handling System

A comprehensive web application designed for colleges and universities to manage academic workflows across Admin, Staff, and Student portals.

## 🚀 Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend / Database**: Firebase (Auth & Firestore)
- **Spreadsheet Export**: XLSX

## 📌 Features

### 👨‍💼 Admin Portal
- Dashboard with overall academic statistics & analytics
- Department and Subject management
- Staff and Student account management
- Consolidated marks overview and institutional reporting

### 👩‍🏫 Staff Portal
- Attendance tracking & reporting
- Weekly tests, questions, and mark entries
- Assignment posting, collection & grading
- Exam schedule publishing
- Announcements & departmental notifications

### 👨‍🎓 Student Portal
- Personal profile & academic summary
- Real-time attendance percentage tracking
- Marks and internal assessment history
- Weekly test reviews and assignment submissions
- Exam schedules and institutional announcements

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Mini Project"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a `.env` file based on `.env.example`:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```
