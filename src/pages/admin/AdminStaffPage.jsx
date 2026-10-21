import { Edit2, Plus, Search, Trash2, UserPlus, X, Download, Upload } from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

const emptyForm = {
  name: '',
  email: '',
  password: 'staff123',
  department: 'Computer Science',
  employeeId: '',
  phone: '+91 98765 00000',
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value ?? '');

const parseStaffRow = (row) => {
  const name = normalizeText(row.name ?? row.Name ?? row['Full Name'] ?? row['Staff Name'] ?? row['Faculty Name']);
  const email = normalizeText(row.email ?? row.Email ?? row['Email ID'] ?? row['Email Address']);
  const employeeId = normalizeText(row.employeeId ?? row.EmployeeId ?? row['Employee ID'] ?? row.id ?? row.ID ?? row['Emp ID']);
  const department = normalizeText(row.department ?? row.Department ?? row['Department Name'] ?? 'Computer Science');
  const phone = normalizeText(row.phone ?? row.Phone ?? row['Mobile'] ?? row['Contact Number'] ?? '+91 98765 00000');
  
  return {
    name,
    email,
    employeeId,
    department,
    phone,
    role: 'staff',
    password: 'staff123'
  };
};

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState(() => academicStore.getStaff());
  const [departments, setDepartments] = useState(() => academicStore.getDepartments());
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      setStaffList(academicStore.getStaff());
      setDepartments(academicStore.getDepartments());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const filteredStaff = useMemo(() => {
    const search = query.toLowerCase();
    return staffList.filter((member) => {
      const matchSearch = member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        (member.employeeId || '').toLowerCase().includes(search) ||
        (member.department || '').toLowerCase().includes(search);
      const matchDept = selectedDept === 'All' || member.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [staffList, query, selectedDept]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
    setNotice('');
  };

  const handleOpenEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      password: member.password || 'staff123',
      department: member.department || 'Computer Science',
      employeeId: member.employeeId || '',
      phone: member.phone || '+91 98765 00000',
    });
    setShowModal(true);
    setNotice('');
  };

  const handleSaveStaff = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.employeeId.trim()) {
      setNotice('Please fill all required fields (Name, Employee ID, Email).');
      return;
    }

    const payload = {
      id: editingId || undefined,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || 'staff123',
      role: 'staff',
      employeeId: formData.employeeId.trim(),
      department: formData.department,
      phone: formData.phone,
    };

    academicStore.saveStaff(payload);
    setShowModal(false);
    setFormData(emptyForm);
    setNotice(`Staff member ${formData.name} was ${editingId ? 'updated' : 'added'} successfully.`);
  };

  const handleDeleteStaff = (id, name) => {
    if (window.confirm(`Are you sure you want to delete staff member "${name}"?`)) {
      academicStore.deleteStaff(id);
      setNotice(`Staff member "${name}" was deleted successfully.`);
    }
  };

  const handleDeleteAllStaff = () => {
    if (staffList.length === 0) return;
    if (window.confirm(`Are you absolutely sure you want to DELETE ALL ${staffList.length} staff members?`)) {
      academicStore.deleteAllStaff();
      setNotice(`All staff records have been permanently deleted.`);
    }
  };

  const handleExcelImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      try {
        const data = loadEvent.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!records.length) {
          setNotice('The uploaded sheet is empty.');
          event.target.value = '';
          return;
        }

        const currentStaff = academicStore.getStaff();
        
        const imported = records
          .map(parseStaffRow)
          .filter((s) => s.name && s.employeeId && s.email)
          .map((s, idx) => {
            const existing = currentStaff.find(curr => curr.employeeId === s.employeeId);
            return {
              id: existing ? existing.id : `staff-${Date.now()}-${idx}`,
              ...s,
            };
          });

        if (!imported.length) {
          setNotice('No valid staff rows found. Expected columns: Name, Employee ID, Email, Department.');
          event.target.value = '';
          return;
        }

        const existingDepts = academicStore.getDepartments();
        const deptSet = new Set(existingDepts.map(d => d.id));
        const newDepts = [];

        imported.forEach(s => {
          if (s.department && !deptSet.has(s.department)) {
            deptSet.add(s.department);
            newDepts.push({
              id: s.department,
              name: s.department,
              code: s.department.slice(0, 4).toUpperCase(),
              icon: 'Layers',
              color: 'sky'
            });
          }
        });

        newDepts.forEach(d => academicStore.saveDepartment(d));

        academicStore.saveStaffBatch(imported);
        setNotice(`Successfully imported ${imported.length} staff records.`);
      } catch (err) {
        console.error(err);
        setNotice('Could not parse Excel/CSV file. Please check format.');
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    const rows = [
      ['Employee ID', 'Full Name', 'Department', 'Email', 'Phone'],
      ...filteredStaff.map((s) => [
        s.employeeId,
        s.name,
        s.department,
        s.email,
        s.phone
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");
    XLSX.writeFile(workbook, `Staff_Export_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Staff & Faculty Directory</h2>
          <p className="text-sm text-slate-400">Manage institutional educators, course leads, and credentials</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Upload size={16} /> Import
          </button>
          
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Download size={16} /> Export (Excel)
          </button>

          <button
            onClick={handleDeleteAllStaff}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition"
          >
            <Trash2 size={16} /> Delete All
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition active:scale-[0.98]"
          >
            <UserPlus size={16} />
            Add Faculty Member
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, employee ID, email..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>
        <CustomSelect
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </CustomSelect>
      </div>

      {/* Staff Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Faculty / Staff</th>
                <th className="px-5 py-3.5 font-semibold">Employee ID</th>
                <th className="px-5 py-3.5 font-semibold">Department</th>
                <th className="px-5 py-3.5 font-semibold">Email & Phone</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStaff.length ? (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-sm font-bold text-amber-300">
                          {member.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'ST'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{member.name}</p>
                          <span className="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 mt-0.5">Faculty</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-amber-300">{member.employeeId || 'FAC-N/A'}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 font-medium">
                        {member.department}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white text-xs">{member.email}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{member.phone || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="inline-flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No faculty members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Faculty Member' : 'Add New Faculty Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Employee ID *</label>
                  <input
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    placeholder="e.g. FAC-2201"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@college.edu"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
                  <CustomSelect
                    value={formData.department}
                    onChange={(e) => handleChange({ target: { name: 'department', value: e.target.value } })}
                    className="w-full"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </CustomSelect>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Portal Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
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
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400"
                >
                  {editingId ? 'Update Staff Member' : 'Save Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
