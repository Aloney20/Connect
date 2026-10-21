import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from './firebase';
import { Toaster } from './components/ui/Toaster';
import FirebaseStatusBar from './components/ui/FirebaseStatusBar';
import { useToast } from './hooks/useToast';
import LoginPage from './pages/auth/LoginPage';
import StaffLayout from './layouts/StaffLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import DashboardPage from './pages/staff/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminSubjectsPage from './pages/admin/AdminSubjectsPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminMarksPage from './pages/admin/AdminMarksPage';
import StudentsPage from './pages/staff/StudentsPage';
import AttendancePage from './pages/staff/AttendancePage';
import ViewAttendancePage from './pages/staff/ViewAttendancePage';
import PostWeeklyQuestionPage from './pages/staff/PostWeeklyQuestionPage';
import EnterWeeklyMarksPage from './pages/staff/EnterWeeklyMarksPage';
import ViewWeeklyMarksPage from './pages/staff/ViewWeeklyMarksPage';
import PostAssignmentPage from './pages/staff/PostAssignmentPage';
import MarkAssignmentPage from './pages/staff/MarkAssignmentPage';
import ViewAssignmentPage from './pages/staff/ViewAssignmentPage';
import ExamSchedulePage from './pages/staff/ExamSchedulePage';
import AnnouncementsPage from './pages/staff/AnnouncementsPage';
import ReportsPage from './pages/staff/ReportsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentMarksPage from './pages/student/StudentMarksPage';
import StudentWeeklyTestsPage from './pages/student/StudentWeeklyTestsPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';

import StudentExamSchedulePage from './pages/student/StudentExamSchedulePage';
import StudentAnnouncementsPage from './pages/student/StudentAnnouncementsPage';

const VALID_ROLES = ['admin', 'staff', 'student'];

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('college-user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !VALID_ROLES.includes(parsed.role)) {
      localStorage.removeItem('college-user');
      localStorage.removeItem('saas-user');
      return null;
    }
    return parsed;
  } catch (e) {
    try {
      localStorage.removeItem('college-user');
      localStorage.removeItem('saas-user');
    } catch (err) { }
    return null;
  }
}

function App() {
  const [user, setUser] = useState(() => getUserFromStorage());
  const toast = useToast();

  useEffect(() => {
    const syncUser = () => {
      const stored = getUserFromStorage();
      setUser(stored);
    };

    window.addEventListener('college-user-changed', syncUser);
    window.addEventListener('storage', syncUser);

    if (firebaseReady && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          syncUser();
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const validRole = VALID_ROLES.includes(userData.role) ? userData.role : 'student';
            const u = { ...firebaseUser, ...userData, uid: firebaseUser.uid, role: validRole };
            setUser(u);
            localStorage.setItem('college-user', JSON.stringify(u));
          } else {
            const email = firebaseUser.email || '';
            let role = 'student';
            const lowercaseEmail = email.toLowerCase();

            if (lowercaseEmail.includes('admin') || lowercaseEmail === 'mrgamer20205@gmail.com') {
              role = 'admin';
            } else if (lowercaseEmail.includes('staff') || lowercaseEmail.includes('faculty')) {
              role = 'staff';
            }

            const u = { ...firebaseUser, uid: firebaseUser.uid, role };
            setUser(u);
            localStorage.setItem('college-user', JSON.stringify(u));
          }
        } catch (error) {
          console.error('Firebase user fetch error:', error);
          syncUser();
        }
      });

      return () => {
        unsubscribe();
        window.removeEventListener('college-user-changed', syncUser);
        window.removeEventListener('storage', syncUser);
      };
    }

    return () => {
      window.removeEventListener('college-user-changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const role = user?.role;
  const isAuthenticated = Boolean(user && VALID_ROLES.includes(role));

  const rolePath = useMemo(() => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    return '/student';
  }, [isAuthenticated, role]);

  return (
    <>
      <FirebaseStatusBar />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={rolePath} replace /> : <LoginPage />}
        />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? rolePath : '/login'} replace />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={isAuthenticated && role === 'admin' ? <AdminLayout user={user} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="departments" element={<AdminDepartmentsPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="marks" element={<AdminMarksPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={isAuthenticated && (role === 'staff' || role === 'admin') ? <StaffLayout user={user} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="students" replace />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="view-attendance" element={<ViewAttendancePage />} />
          <Route path="post-question" element={<PostWeeklyQuestionPage />} />
          <Route path="enter-weekly-marks" element={<EnterWeeklyMarksPage />} />
          <Route path="view-weekly-marks" element={<ViewWeeklyMarksPage />} />
          <Route path="post-assignment" element={<PostAssignmentPage />} />
          <Route path="mark-assignment" element={<MarkAssignmentPage />} />
          <Route path="view-assignment" element={<ViewAssignmentPage />} />
          <Route path="exam-schedule" element={<ExamSchedulePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={isAuthenticated && (role === 'student' || role === 'admin') ? <StudentLayout user={user} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<StudentProfilePage user={user} />} />
          <Route path="attendance" element={<StudentAttendancePage user={user} />} />
          <Route path="marks" element={<StudentMarksPage user={user} />} />
          <Route path="weekly-tests" element={<StudentWeeklyTestsPage user={user} />} />
          <Route path="assignments" element={<StudentAssignmentsPage user={user} />} />

          <Route path="exam-schedule" element={<StudentExamSchedulePage user={user} />} />
          <Route path="announcements" element={<StudentAnnouncementsPage user={user} />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? rolePath : '/login'} replace />} />
      </Routes>
      <Toaster toasts={toast.toasts} />
    </>
  );
}

export default App;
