import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db, firebaseReady } from '../firebase.js';
import * as demo from '../data/demoData.js';

const loadInitial = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(`academic_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return Array.isArray(fallback) ? [...fallback] : fallback;
};

// Global Memory State with cached localStorage and demo fallback
const state = {
  students: loadInitial('students', demo.students || []),
  staff: loadInitial('staff', demo.demoUsers?.staff ? [demo.demoUsers.staff] : []),
  subjects: loadInitial('subjects', demo.subjects || []),
  attendance: loadInitial('attendance', demo.attendance || []),
  internalMarks: loadInitial('internalMarks', demo.internalMarks || []),
  weeklyTests: loadInitial('weeklyTests', demo.weeklyTests || []),
  weeklyTestMarks: loadInitial('weeklyTestMarks', demo.weeklyTestMarks || []),
  assignments: loadInitial('assignments', demo.assignments || []),
  submissions: loadInitial('submissions', demo.submissions || []),
  practicals: loadInitial('practicals', demo.practicals || []),
  questionBank: loadInitial('questionBank', demo.questionBank || []),
  onlineTests: loadInitial('onlineTests', demo.onlineTests || []),
  quizResults: loadInitial('quizResults', demo.quizResults || []),
  examSchedules: loadInitial('examSchedules', demo.examSchedules || []),
  announcements: loadInitial('announcements', demo.announcements || []),
  departments: loadInitial('departments', demo.departments || []),
};

let firebaseStatus = {
  status: 'connecting', // 'connecting' | 'connected' | 'permission-denied' | 'error'
  message: 'Connecting to Cloud Firestore...',
  error: null,
  syncedCollections: [],
  lastCheck: Date.now()
};

const notifyStatus = (status, message, error = null, colName = null) => {
  firebaseStatus.status = status;
  firebaseStatus.message = message;
  firebaseStatus.error = error;
  if (colName && !firebaseStatus.syncedCollections.includes(colName)) {
    firebaseStatus.syncedCollections.push(colName);
  }
  firebaseStatus.lastCheck = Date.now();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firebase-status-changed', { detail: { ...firebaseStatus } }));
  }
};

const notify = (key, value) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('academic-data-updated', { detail: { key, value } }));
  }
};

const updateState = (key, data) => {
  state[key] = data;
  try {
    localStorage.setItem(`academic_${key}`, JSON.stringify(data));
  } catch (e) {}
  notify(key, data);
};

export const academicStore = {
  // Subscribers
  subscribe(callback) {
    if (typeof window === 'undefined') return () => { };
    const handler = (e) => callback(e.detail);
    window.addEventListener('academic-data-updated', handler);
    return () => {
      window.removeEventListener('academic-data-updated', handler);
    };
  },

  // Students (Root)
  getStudents() { return state.students; },
  async saveStudent(student) {
    const id = student.id || `stu-${Date.now()}`;
    const normalized = { ...student, id, role: 'student', password: student.password || 'student123' };
    updateState('students', [...state.students.filter(s => s.id !== id), normalized]);
    if (firebaseReady && db) {
      await setDoc(doc(db, 'students', id), normalized, { merge: true });
    }
    return normalized;
  },
  async deleteStudent(id) {
    updateState('students', state.students.filter(s => s.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'students', id));
    return true;
  },
  async deleteAllStudents() {
    const list = state.students;
    updateState('students', []);
    if (firebaseReady && db && list.length > 0) {
      try {
        const batch = writeBatch(db);
        list.forEach(s => batch.delete(doc(db, 'students', s.id)));
        await batch.commit();
      } catch (e) { console.error('Batch delete failed', e); }
    }
    return true;
  },
  async saveStudentBatch(studentsToSave) {
    if (!studentsToSave || !studentsToSave.length) return [];
    const normalizedList = studentsToSave.map((s, idx) => ({ ...s, id: s.id || `stu-${Date.now()}-${idx}`, role: 'student', password: s.password || 'student123' }));
    const map = new Map(state.students.map(s => [s.id, s]));
    normalizedList.forEach(s => map.set(s.id, s));
    updateState('students', Array.from(map.values()));
    if (firebaseReady && db) {
      try {
        const batch = writeBatch(db);
        normalizedList.forEach(s => batch.set(doc(db, 'students', s.id), s, { merge: true }));
        await batch.commit();
      } catch (e) { console.error('Batch save failed', e); }
    }
    return normalizedList;
  },

  // Staff (Root)
  getStaff() { return state.staff; },
  async saveStaff(member) {
    const id = member.id || member.employeeId || `staff-${Date.now()}`;
    const normalized = { ...member, id, role: 'staff', password: member.password || 'staff123' };
    updateState('staff', [...state.staff.filter(s => s.id !== id), normalized]);
    if (firebaseReady && db) {
      await setDoc(doc(db, 'staff', id), normalized, { merge: true });
    }
    return normalized;
  },
  async deleteStaff(id) {
    updateState('staff', state.staff.filter(s => s.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'staff', id));
    return true;
  },
  async deleteAllStaff() {
    const list = state.staff;
    updateState('staff', []);
    if (firebaseReady && db && list.length > 0) {
      try {
        const batch = writeBatch(db);
        list.forEach(s => batch.delete(doc(db, 'staff', s.id)));
        await batch.commit();
      } catch (e) { console.error('Batch delete failed', e); }
    }
    return true;
  },
  async saveStaffBatch(staffToSave) {
    if (!staffToSave || !staffToSave.length) return [];
    const normalizedList = staffToSave.map((s, idx) => ({ ...s, id: s.id || `staff-${Date.now()}-${idx}`, role: 'staff' }));
    const map = new Map(state.staff.map(s => [s.id, s]));
    normalizedList.forEach(s => map.set(s.id, s));
    updateState('staff', Array.from(map.values()));
    if (firebaseReady && db) {
      try {
        const batch = writeBatch(db);
        normalizedList.forEach(s => batch.set(doc(db, 'staff', s.id), s, { merge: true }));
        await batch.commit();
      } catch (e) { console.error('Batch save failed', e); }
    }
    return normalizedList;
  },

  // Departments (Root)
  getDepartments() { return state.departments; },
  async saveDepartment(department) {
    const id = department.id || `dept-${Date.now()}`;
    const normalized = { ...department, id };
    updateState('departments', [...state.departments.filter(d => d.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'departments', id), normalized, { merge: true });
    return normalized;
  },
  async deleteDepartment(id) {
    updateState('departments', state.departments.filter(d => d.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'departments', id));
    return true;
  },

  // Subjects (Root)
  getSubjects() { return state.subjects; },
  async saveSubject(subject) {
    const id = subject.id || `sub-${Date.now()}`;
    const normalized = { ...subject, id };
    updateState('subjects', [...state.subjects.filter(s => s.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'subjects', id), normalized, { merge: true });
    return normalized;
  },
  async deleteSubject(id) {
    updateState('subjects', state.subjects.filter(s => s.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'subjects', id));
    return true;
  },

  // Assignments (Root)
  getAssignments() { return state.assignments; },
  async saveAssignment(assignment) {
    const id = assignment.id || `as-${Date.now()}`;
    const normalized = { ...assignment, id, status: assignment.status || 'Open' };
    updateState('assignments', [...state.assignments.filter(a => a.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'assignments', id), normalized, { merge: true });
    return normalized;
  },
  async deleteAssignment(id) {
    updateState('assignments', state.assignments.filter(a => a.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'assignments', id));
    return true;
  },

  // Submissions (Subcollection: students/{studentId}/submissions)
  getSubmissions() { return state.submissions; },
  async saveSubmission(submission) {
    const id = submission.id || `subm-${Date.now()}`;
    const normalized = { ...submission, id, submittedAt: submission.submittedAt || new Date().toISOString() };
    const exists = state.submissions.some(item => item.id === id || (item.assignmentId === submission.assignmentId && item.studentId === submission.studentId));
    const nextState = exists ? state.submissions.map(item => ((item.id === id || (item.assignmentId === submission.assignmentId && item.studentId === submission.studentId)) ? { ...item, ...normalized } : item)) : [normalized, ...state.submissions];
    updateState('submissions', nextState);
    if (firebaseReady && db && normalized.studentId) {
      await setDoc(doc(db, 'students', normalized.studentId, 'submissions', id), normalized, { merge: true });
    }
    return normalized;
  },

  // Attendance (Subcollection: students/{studentId}/attendance)
  getAttendance() { return state.attendance; },
  async saveAttendanceBatch(records) {
    const keysToRemove = new Set(records.map((r) => `${r.studentId}-${r.date}`));
    const filtered = state.attendance.filter((r) => !keysToRemove.has(`${r.studentId}-${r.date}`));
    const next = [...records, ...filtered];
    updateState('attendance', next);

    if (firebaseReady && db) {
      const batch = writeBatch(db);
      records.forEach(r => {
        if (!r.studentId) return;
        const id = `${r.date}`;
        batch.set(doc(db, 'students', r.studentId, 'attendance', id), { ...r, id }, { merge: true });
      });
      await batch.commit().catch(e => console.error(e));
    }
    return next;
  },

  // Internal Marks (Subcollection: students/{studentId}/internalMarks)
  getInternalMarks() { return state.internalMarks; },
  async saveInternalMark(mark) {
    const id = mark.id || `m-${Date.now()}`;
    const normalized = { ...mark, id, score: Number(mark.score || 0), total: Number(mark.total || mark.max || 100) };
    updateState('internalMarks', [...state.internalMarks.filter(m => m.id !== id), normalized]);
    if (firebaseReady && db && normalized.studentId) {
      await setDoc(doc(db, 'students', normalized.studentId, 'internalMarks', id), normalized, { merge: true });
    }
    return normalized;
  },
  async deleteInternalMark(id) {
    const mark = state.internalMarks.find(m => m.id === id);
    updateState('internalMarks', state.internalMarks.filter(m => m.id !== id));
    if (firebaseReady && db && mark && mark.studentId) {
      await deleteDoc(doc(db, 'students', mark.studentId, 'internalMarks', id));
    }
    return true;
  },

  // Weekly Tests (Root)
  getWeeklyTests() { return state.weeklyTests; },
  async saveWeeklyTest(test) {
    const id = test.id || `wt-${Date.now()}`;
    const normalized = { ...test, id, maxMarks: Number(test.maxMarks || 20) };
    updateState('weeklyTests', [...state.weeklyTests.filter(t => t.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'weeklyTests', id), normalized, { merge: true });
    return normalized;
  },
  async deleteWeeklyTest(id) {
    updateState('weeklyTests', state.weeklyTests.filter(t => t.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'weeklyTests', id));
    return true;
  },

  // Weekly Test Marks (Subcollection: students/{studentId}/weeklyTestMarks)
  getWeeklyTestMarks() { return state.weeklyTestMarks; },
  async saveWeeklyTestMark(studentId, testId, marks) {
    const id = `wm-${studentId}-${testId}`;
    const normalized = { id, studentId, testId, marks: Number(marks) };
    updateState('weeklyTestMarks', [...state.weeklyTestMarks.filter(m => !(m.studentId === studentId && m.testId === testId)), normalized]);
    if (firebaseReady && db && studentId) {
      await setDoc(doc(db, 'students', studentId, 'weeklyTestMarks', id), normalized, { merge: true });
    }
    return [normalized];
  },

  // Question Bank (Root)
  getQuestionBank() { return state.questionBank; },
  async saveQuestion(q) {
    const id = q.id || `qb-${Date.now()}`;
    const normalized = { ...q, id };
    updateState('questionBank', [...state.questionBank.filter(x => x.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'questionBank', id), normalized, { merge: true });
    return normalized;
  },
  async deleteQuestion(id) {
    updateState('questionBank', state.questionBank.filter(q => q.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'questionBank', id));
    return true;
  },

  // Online Tests (Root)
  getOnlineTests() { return state.onlineTests; },
  async saveOnlineTest(test) {
    const id = test.id || `ot-${Date.now()}`;
    const normalized = { ...test, id };
    updateState('onlineTests', [...state.onlineTests.filter(t => t.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'onlineTests', id), normalized, { merge: true });
    return normalized;
  },
  async deleteOnlineTest(id) {
    updateState('onlineTests', state.onlineTests.filter(t => t.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'onlineTests', id));
    return true;
  },

  // Quiz Results (Subcollection: students/{studentId}/quizResults)
  getQuizResults() { return state.quizResults; },
  async saveQuizResult(result) {
    const id = result.id || `qr-${Date.now()}`;
    const normalized = { ...result, id };
    updateState('quizResults', [...state.quizResults.filter(r => !(r.studentId === result.studentId && r.testId === result.testId)), normalized]);
    if (firebaseReady && db && result.studentId) {
      await setDoc(doc(db, 'students', result.studentId, 'quizResults', id), normalized, { merge: true });
    }
    return normalized;
  },

  // Exam Schedules (Root)
  getExamSchedules() { return state.examSchedules; },
  async saveExamSchedule(schedule) {
    const id = schedule.id || `es-${Date.now()}`;
    const normalized = { ...schedule, id };
    updateState('examSchedules', [...state.examSchedules.filter(s => s.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'examSchedules', id), normalized, { merge: true });
    return normalized;
  },
  async deleteExamSchedule(id) {
    updateState('examSchedules', state.examSchedules.filter(s => s.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'examSchedules', id));
    return true;
  },

  // Announcements (Root)
  getAnnouncements() { return state.announcements; },
  async saveAnnouncement(announcement) {
    const id = announcement.id || `an-${Date.now()}`;
    const normalized = { ...announcement, id };
    updateState('announcements', [...state.announcements.filter(a => a.id !== id), normalized]);
    if (firebaseReady && db) await setDoc(doc(db, 'announcements', id), normalized, { merge: true });
    return normalized;
  },
  async deleteAnnouncement(id) {
    updateState('announcements', state.announcements.filter(a => a.id !== id));
    if (firebaseReady && db) await deleteDoc(doc(db, 'announcements', id));
    return true;
  },

  // Practicals (Subcollection)
  getPracticals() { return state.practicals; },
  async savePractical(practical) {
    const id = practical.id || `p-${Date.now()}`;
    const normalized = { ...practical, id };
    updateState('practicals', [...state.practicals.filter(p => p.id !== id), normalized]);
    if (firebaseReady && db && normalized.studentId) {
      await setDoc(doc(db, 'students', normalized.studentId, 'practicals', id), normalized, { merge: true });
    }
    return normalized;
  },
  async deletePractical(id) {
    const pr = state.practicals.find(p => p.id === id);
    updateState('practicals', state.practicals.filter(p => p.id !== id));
    if (firebaseReady && db && pr && pr.studentId) await deleteDoc(doc(db, 'students', pr.studentId, 'practicals', id));
    return true;
  },

  // Migrate Data from LocalStorage to Firestore
  async migrateDataToFirestore() {
    if (!firebaseReady || !db) return alert("Firebase not ready");
    const migratedFlag = localStorage.getItem('academic_migrated_to_firestore');
    if (migratedFlag === 'true') {
      console.log('Already migrated data to Firestore.');
      return;
    }
    console.log('Starting Migration of LocalStorage data to Firestore...');
    const KEYS = {
      students: 'academic_students', staff: 'academic_staff', subjects: 'academic_subjects',
      attendance: 'academic_attendance', internalMarks: 'academic_internal_marks',
      weeklyTests: 'academic_weekly_tests', weeklyTestMarks: 'academic_weekly_test_marks',
      assignments: 'academic_assignments', submissions: 'academic_submissions',
      practicals: 'academic_practicals', questionBank: 'academic_question_bank',
      onlineTests: 'academic_online_tests', quizResults: 'academic_quiz_results',
      examSchedules: 'academic_exam_schedules', announcements: 'academic_announcements',
      departments: 'academic_departments',
    };

    const getLocal = (key) => JSON.parse(localStorage.getItem(key) || '[]');

    // Root Collections Migration
    const roots = ['students', 'staff', 'departments', 'subjects', 'assignments', 'weeklyTests', 'onlineTests', 'questionBank', 'examSchedules', 'announcements'];
    for (let r of roots) {
      const data = getLocal(KEYS[r]);
      for (let item of data) {
        if (!item.id) continue;
        await setDoc(doc(db, r, item.id), item, { merge: true });
      }
    }

    // Subcollections Migration (requires studentId)
    const subs = {
      attendance: 'attendance', internalMarks: 'internalMarks',
      submissions: 'submissions', weeklyTestMarks: 'weeklyTestMarks',
      practicals: 'practicals', quizResults: 'quizResults'
    };
    for (let [localKey, subName] of Object.entries(subs)) {
      const data = getLocal(KEYS[localKey]);
      for (let item of data) {
        if (!item.studentId) continue;
        const itemId = item.id || `${Date.now()}_${Math.random()}`;
        await setDoc(doc(db, 'students', item.studentId, subName, itemId), item, { merge: true });
      }
    }

    localStorage.setItem('academic_migrated_to_firestore', 'true');
    console.log('Migration Complete.');
  },

  // Real-time Firestore Sync
  initFirestoreSync() {
    if (!firebaseReady || !db) {
      console.warn('Firebase is not available. Showing local/cached academic data.');
      notifyStatus('error', 'Firebase SDK is not initialized.');
      return () => {};
    }

    notifyStatus('connecting', 'Connecting to Firebase Firestore...');

    const unsubscribers = [];

    const handleSyncError = (colName, error) => {
      console.warn(`Firestore sync note for ${colName}:`, error?.code, error?.message);
      if (error?.code === 'permission-denied') {
        notifyStatus(
          'permission-denied',
          `Cloud Firestore Security Rules denied read access (Missing or insufficient permissions). Set 'allow read, write: if true;' in Firebase Console.`,
          error
        );
      } else {
        notifyStatus('error', error?.message || `Sync failed for ${colName}`, error);
      }
    };

    const watchCollection = (colName, stateKey) => {
      try {
        const unsub = onSnapshot(collection(db, colName), (snap) => {
          if (!snap.empty) {
            const liveDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            updateState(stateKey, liveDocs);
            notifyStatus('connected', `Connected to Firebase. Loaded ${liveDocs.length} items from '${colName}'.`, null, colName);
          } else {
            notifyStatus('connected', 'Connected to Firebase Firestore.', null);
          }
        }, (error) => handleSyncError(colName, error));
        unsubscribers.push(unsub);
      } catch (err) {
        handleSyncError(colName, err);
      }
    };

    const watchGroupOrRoot = (colName, stateKey) => {
      // 1. Root collection
      watchCollection(colName, stateKey);

      // 2. Subcollections via collectionGroup
      try {
        const unsub = onSnapshot(collectionGroup(db, colName), (snap) => {
          if (!snap.empty) {
            const groupDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const existing = state[stateKey] || [];
            const map = new Map(existing.map(item => [item.id, item]));
            groupDocs.forEach(item => map.set(item.id, item));
            updateState(stateKey, Array.from(map.values()));
            notifyStatus('connected', `Loaded ${colName} subcollections from Firebase.`, null, colName);
          }
        }, (error) => {
          if (error?.code === 'permission-denied') {
            handleSyncError(colName, error);
          }
        });
        unsubscribers.push(unsub);
      } catch (err) {
        // ignore group error
      }
    };

    // Roots
    watchCollection('students', 'students');
    watchCollection('Students', 'students');
    watchCollection('staff', 'staff');
    watchCollection('Staff', 'staff');
    watchCollection('departments', 'departments');
    watchCollection('Departments', 'departments');
    watchCollection('subjects', 'subjects');
    watchCollection('Subjects', 'subjects');
    watchCollection('assignments', 'assignments');
    watchCollection('weeklyTests', 'weeklyTests');
    watchCollection('onlineTests', 'onlineTests');
    watchCollection('questionBank', 'questionBank');
    watchCollection('examSchedules', 'examSchedules');
    watchCollection('announcements', 'announcements');

    // Groups & Roots
    watchGroupOrRoot('attendance', 'attendance');
    watchGroupOrRoot('internalMarks', 'internalMarks');
    watchGroupOrRoot('marks', 'internalMarks');
    watchGroupOrRoot('submissions', 'submissions');
    watchGroupOrRoot('weeklyTestMarks', 'weeklyTestMarks');
    watchGroupOrRoot('practicals', 'practicals');
    watchGroupOrRoot('quizResults', 'quizResults');

    return () => unsubscribers.forEach(u => u && u());
  },

  getFirebaseStatus() {
    return { ...firebaseStatus };
  },

  subscribeStatus(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => callback(e.detail);
    window.addEventListener('firebase-status-changed', handler);
    return () => window.removeEventListener('firebase-status-changed', handler);
  },

  async checkFirebaseConnection() {
    if (!firebaseReady || !db) {
      return { ok: false, message: 'Firebase SDK not initialized' };
    }
    notifyStatus('connecting', 'Testing Firestore connection...');
    try {
      const snap = await getDocs(collection(db, 'students'));
      notifyStatus('connected', `Connected! Found ${snap.size} documents in students collection.`);
      return { ok: true, count: snap.size };
    } catch (err) {
      if (err?.code === 'permission-denied') {
        notifyStatus(
          'permission-denied',
          'Cloud Firestore Security Rules denied read access (Missing or insufficient permissions). Set rules to allow read, write in Firebase Console.',
          err
        );
      } else {
        notifyStatus('error', err?.message || 'Connection test failed', err);
      }
      return { ok: false, error: err };
    }
  }
};
