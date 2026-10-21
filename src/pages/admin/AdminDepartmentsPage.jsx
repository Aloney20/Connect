import { BookOpen, Edit2, GraduationCap, Layers, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

const ICONS = {
  GraduationCap: GraduationCap,
  Layers: Layers,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
};

const COLORS = ['violet', 'sky', 'emerald', 'amber', 'rose', 'indigo', 'pink'];

const emptyForm = {
  name: '',
  code: '',
  icon: 'Layers',
  color: 'sky',
};

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState(() => academicStore.getDepartments());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setDepartments(academicStore.getDepartments());
      setStudents(academicStore.getStudents());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const filteredDepts = useMemo(() => {
    const search = query.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(search) ||
        (d.code || '').toLowerCase().includes(search) ||
        d.id.toLowerCase().includes(search)
    );
  }, [departments, query]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
    setNotice('');
  };

  const handleOpenEdit = (dept) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      code: dept.code || '',
      icon: dept.icon || 'Layers',
      color: dept.color || 'sky',
    });
    setShowModal(true);
    setNotice('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newId = editingId || formData.code.trim().toUpperCase() || formData.name.trim();

    const payload = {
      id: newId,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      icon: formData.icon,
      color: formData.color,
    };

    if (editingId && editingId !== newId) {
      // They changed the ID (code/name), we need to handle migration manually or just don't allow changing ID easily.
      // Easiest is to keep the original ID if editing, so we don't break student links.
      payload.id = editingId;
    }

    academicStore.saveDepartment(payload);
    
    // If we want to rename the ID globally for all students, we could do it here, but keeping ID fixed and changing Name is safer.
    
    setShowModal(false);
    setFormData(emptyForm);
    setNotice(`Department "${payload.name}" was ${editingId ? 'updated' : 'created'} successfully.`);
  };

  const handleDelete = async (dept) => {
    if (window.confirm(`Are you sure you want to delete "${dept.name}"? All students in this department will be moved to "Unassigned".`)) {
      academicStore.deleteDepartment(dept.id);
      
      const studentsInDept = students.filter(s => s.department === dept.id);
      if (studentsInDept.length > 0) {
        const updatedStudents = studentsInDept.map(s => ({...s, department: 'Unassigned'}));
        await academicStore.saveStudentBatch(updatedStudents);
      }
      
      setNotice(`Department "${dept.name}" deleted successfully.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Academic Departments</h2>
          <p className="text-sm text-slate-400">Manage institution branches, codes, and configurations</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition active:scale-[0.98]"
        >
          <Plus size={16} />
          New Department
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by department name or code..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredDepts.map((dept) => {
          const Icon = ICONS[dept.icon] || Layers;
          const studentCount = students.filter(s => s.department === dept.id).length;
          
          return (
            <div key={dept.id} className="card p-5 group flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${dept.color}-500/15 text-${dept.color}-400`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white" title={dept.name}>{dept.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase">{dept.code || dept.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-400">
                  <strong className="text-white">{studentCount}</strong> Enrolled Students
                </span>
                
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenEdit(dept)}
                    className="rounded-lg p-2 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 transition"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(dept)}
                    className="rounded-lg p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredDepts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 card border-dashed border-2 border-slate-700 bg-transparent">
            No departments found.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Master of Business Administration"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department Code / Short Form</label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. MBA"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Icon</label>
                  <CustomSelect
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full"
                  >
                    {Object.keys(ICONS).map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </CustomSelect>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Color Theme</label>
                  <CustomSelect
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full capitalize"
                  >
                    {COLORS.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </CustomSelect>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400"
                >
                  {editingId ? 'Update Department' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
