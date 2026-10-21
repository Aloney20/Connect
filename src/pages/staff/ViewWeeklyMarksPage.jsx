import { Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function ViewWeeklyMarksPage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [weeklyTestList, setWeeklyTestList] = useState(() => academicStore.getWeeklyTests());
  const [weeklyTestMarks, setWeeklyTestMarks] = useState(() => academicStore.getWeeklyTestMarks());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  
  const [selectedTestId, setSelectedTestId] = useState('');
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [sortByRank, setSortByRank] = useState(false);

  useEffect(() => {
    const sync = () => {
      setWeeklyTestList(academicStore.getWeeklyTests());
      setWeeklyTestMarks(academicStore.getWeeklyTestMarks());
      setStudents(academicStore.getStudents());
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const departments = useMemo(() => {
    if (!isAdmin && staffDept) {
      return [staffDept];
    }
    return ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
  }, [students, isAdmin, staffDept]);

  const filteredStudentsWithMarks = useMemo(() => {
    if (!selectedTestId) return [];
    let list = students;
    if (!isAdmin && staffDept) {
      list = list.filter(s => s.department === staffDept);
    }
    if (filterDept !== 'All') {
      list = list.filter(s => s.department === filterDept);
    }
    
    const mapped = list.map(student => {
      const match = weeklyTestMarks.find(m => m.studentId === student.id && m.testId === selectedTestId);
      return {
        ...student,
        marks: match ? match.marks : '-',
      };
    });

    if (sortByRank) {
      return mapped.sort((a, b) => {
        const marksA = a.marks === '-' ? -1 : a.marks;
        const marksB = b.marks === '-' ? -1 : b.marks;
        if (marksA !== marksB) {
          return marksB - marksA; // Descending
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      return mapped.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [students, selectedTestId, filterDept, weeklyTestMarks, isAdmin, staffDept, sortByRank]);

  const selectedTest = useMemo(() => {
    return weeklyTestList.find(t => t.id === selectedTestId);
  }, [weeklyTestList, selectedTestId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">View Weekly Marks</h2>
          <p className="text-sm text-slate-400">View student marks for weekly questions</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
            <CustomSelect
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
              }}
              className="w-full"
              disabled={!isAdmin && !!staffDept}
            >
              {isAdmin && <option value="All">All Departments</option>}
              {departments.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </CustomSelect>
          </div>


          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Select Question</label>
            <CustomSelect
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full"
            >
              <option value="">-- Choose a Question --</option>
              {weeklyTestList.map((test) => (
                <option key={test.id} value={test.id}>{test.title} (Max: {test.maxMarks})</option>
              ))}
            </CustomSelect>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Sort Order</label>
            <CustomSelect
              value={sortByRank ? 'rank' : 'name'}
              onChange={(e) => setSortByRank(e.target.value === 'rank')}
              className="w-full"
            >
              <option value="name">Alphabetical (Name)</option>
              <option value="rank">Rank (Highest Score First)</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      {selectedTest && (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-800 p-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" />
              Marks for {selectedTest.title}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudentsWithMarks.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-5 py-8 text-center text-slate-400">
                      No students found for this department.
                    </td>
                  </tr>
                ) : filteredStudentsWithMarks.map((student) => {
                  const hasMarks = student.marks !== '-';
                  const percentage = hasMarks ? Math.round((student.marks / selectedTest.maxMarks) * 100) : 0;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {hasMarks ? (
                          <span className="font-mono font-bold text-lg text-white">
                            {student.marks} <span className="text-sm text-slate-500">/ {selectedTest.maxMarks}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Not Marked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
