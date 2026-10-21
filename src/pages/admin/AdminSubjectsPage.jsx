import { BookOpen, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

const emptyForm = {
  name: '',
  code: '',
  department: '',
};

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [departments, setDepartments] = useState(() => academicStore.getDepartments());
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setSubjects(academicStore.getSubjects());
      setDepartments(academicStore.getDepartments());
    };
    sync();
    return academicStore.subscribe(sync);
  }, []);

  const filteredSubjects = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return subjects.filter((subject) => {
      const matchesQuery = subject.name.toLowerCase().includes(normalizedQuery)
        || (subject.code || '').toLowerCase().includes(normalizedQuery);
      const matchesDepartment = departmentFilter === 'All'
        || (subject.department || 'All Departments') === departmentFilter;
      return matchesQuery && matchesDepartment;
    });
  }, [subjects, query, departmentFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyForm, department: departments[0]?.id || '' });
    setNotice('');
    setShowModal(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      department: subject.department || '',
    });
    setNotice('');
    setShowModal(true);
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.department) return;

    academicStore.saveSubject({
      id: editingId || undefined,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      department: formData.department,
    });
    setShowModal(false);
    setFormData(emptyForm);
    setNotice(`Subject "${formData.name.trim()}" was ${editingId ? 'updated' : 'added'} successfully.`);
  };

  const handleDelete = (subject) => {
    if (window.confirm(`Delete subject "${subject.name}"?`)) {
      academicStore.deleteSubject(subject.id);
      setNotice(`Subject "${subject.name}" deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Academic Subjects</h2>
          <p className="text-sm text-slate-400">Add and manage subjects department-wise</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search subject name or code..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>
          <CustomSelect
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="w-full"
          >
            <option value="All">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </CustomSelect>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSubjects.map((subject) => {
          const department = departments.find((item) => item.id === subject.department);
          return (
            <div key={subject.id} className="card flex flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/15 p-3 text-amber-400"><BookOpen size={21} /></div>
                  <div>
                    <h3 className="font-bold text-white">{subject.name}</h3>
                    <p className="mt-0.5 text-xs font-mono font-semibold text-amber-400">{subject.code || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-400">{department?.name || 'All Departments'}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleOpenEdit(subject)} className="rounded-lg bg-sky-500/10 p-2 text-sky-400 hover:bg-sky-500/20" title="Edit subject">
                    <Edit2 size={14} />
                  </button>
                  <button type="button" onClick={() => handleDelete(subject)} className="rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20" title="Delete subject">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!filteredSubjects.length && (
          <div className="card col-span-full border-2 border-dashed border-slate-700 bg-transparent py-12 text-center text-slate-400">
            No subjects found.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl p-1 text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Subject Name *</label>
                <input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="e.g. Web Technologies" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Subject Code *</label>
                <input required value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} placeholder="e.g. WT" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department *</label>
                <CustomSelect required value={formData.department} onChange={(event) => setFormData({ ...formData, department: event.target.value })} className="w-full">
                  <option value="">Select Department</option>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </CustomSelect>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400">{editingId ? 'Update Subject' : 'Save Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
