import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../firebase';
import { academicStore } from './academicStore';

export const adminService = {
  async listStudents() {
    if (!firebaseReady || !db) {
      return academicStore.getStudents();
    }
    try {
      const snapshot = await getDocs(collection(db, 'students'));
      if (snapshot.empty) {
        return academicStore.getStudents();
      }
      const rows = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      return rows;
    } catch (error) {
      console.warn('Firestore fallback to local store for students:', error);
      return academicStore.getStudents();
    }
  },

  async saveStudent(student) {
    academicStore.saveStudent(student);
    if (!firebaseReady || !db) {
      return student;
    }
    try {
      const studentRef = doc(db, 'students', student.id);
      await setDoc(studentRef, student, { merge: true });
      return student;
    } catch (error) {
      console.warn('Firestore write failed for student, using local:', error);
      return student;
    }
  },

  async deleteStudent(studentId) {
    academicStore.deleteStudent(studentId);
    if (!firebaseReady || !db) {
      return true;
    }
    try {
      await deleteDoc(doc(db, 'students', studentId));
      return true;
    } catch (error) {
      console.warn('Firestore delete failed, using local:', error);
      return true;
    }
  },

  async listStaff() {
    if (!firebaseReady || !db) {
      return academicStore.getStaff();
    }
    try {
      const snapshot = await getDocs(collection(db, 'staff'));
      if (snapshot.empty) return academicStore.getStaff();
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (error) {
      console.warn('Firestore fallback to local store for staff:', error);
      return academicStore.getStaff();
    }
  },

  async saveStaff(staffMember) {
    academicStore.saveStaff(staffMember);
    if (!firebaseReady || !db) {
      return staffMember;
    }
    try {
      const ref = doc(db, 'staff', staffMember.id);
      await setDoc(ref, staffMember, { merge: true });
      return staffMember;
    } catch (error) {
      console.warn('Firestore write failed for staff, using local:', error);
      return staffMember;
    }
  },

  async deleteStaff(staffId) {
    academicStore.deleteStaff(staffId);
    if (!firebaseReady || !db) {
      return true;
    }
    try {
      await deleteDoc(doc(db, 'staff', staffId));
      return true;
    } catch (error) {
      console.warn('Firestore delete failed for staff, using local:', error);
      return true;
    }
  },

  async listSubjects() {
    return academicStore.getSubjects();
  },

  async listMarks() {
    if (!firebaseReady || !db) {
      return academicStore.getInternalMarks();
    }
    try {
      let snapshot = await getDocs(collection(db, 'internalMarks'));
      if (snapshot.empty) {
        snapshot = await getDocs(collection(db, 'marks'));
      }
      if (snapshot.empty) return academicStore.getInternalMarks();
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (error) {
      console.warn('Firestore fallback to local store for marks:', error);
      return academicStore.getInternalMarks();
    }
  },

  async saveMark(mark) {
    const saved = academicStore.saveInternalMark(mark);
    if (!firebaseReady || !db) {
      return saved;
    }
    try {
      const ref = doc(db, 'marks', saved.id);
      await setDoc(ref, saved, { merge: true });
      return saved;
    } catch (error) {
      console.warn('Firestore save failed for mark, using local:', error);
      return saved;
    }
  },

  async deleteMark(markId) {
    academicStore.deleteInternalMark(markId);
    if (!firebaseReady || !db) {
      return true;
    }
    try {
      await deleteDoc(doc(db, 'marks', markId));
      return true;
    } catch (error) {
      console.warn('Firestore delete failed for mark, using local:', error);
      return true;
    }
  },
};
