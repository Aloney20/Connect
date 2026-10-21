import { Plus, Trash2, X, FileText, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function PostWeeklyQuestionPage() {
  const [weeklyTestList, setWeeklyTestList] = useState(() => academicStore.getWeeklyTests());
  const [weeklyTestMarks, setWeeklyTestMarks] = useState(() => academicStore.getWeeklyTestMarks());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    subjectId: '',
    unit: 'Unit 1',
    date: new Date().toISOString().slice(0, 10),
    maxMarks: 20,
    questions: [''],
  });

  useEffect(() => {
    const sync = () => {
      setWeeklyTestList(academicStore.getWeeklyTests());
      setWeeklyTestMarks(academicStore.getWeeklyTestMarks());
      const sub = academicStore.getSubjects();
      setSubjects(sub);
      setStudents(academicStore.getStudents());
      if (!formData.subjectId && sub.length) {
        setFormData((prev) => ({ ...prev, subjectId: sub[0].id }));
      }
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, [formData.subjectId]);

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date || !formData.subjectId) {
      setNotice('Please enter week, subject, and date.');
      return;
    }
    
    const validQuestions = formData.questions.filter(q => q.trim() !== '');
    if (validQuestions.length === 0) {
      setNotice('Please enter at least one question.');
      return;
    }

    academicStore.saveWeeklyTest({
      id: formData.id,
      title: formData.title.trim(),
      subjectId: formData.subjectId,
      unit: formData.unit,
      date: formData.date,
      maxMarks: Number(formData.maxMarks || 20),
      questions: validQuestions,
    });

    setFormData({
      id: null,
      title: '',
      subjectId: subjects[0]?.id || '',
      unit: 'Unit 1',
      date: new Date().toISOString().slice(0, 10),
      maxMarks: 20,
      questions: [''],
    });
    setShowCreateModal(false);
    setNotice(`Weekly test "${formData.title}" ${formData.id ? 'updated' : 'created'} successfully.`);
  };

  const handleAddQuestion = () => {
    setFormData({ ...formData, questions: [...formData.questions, ''] });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleRemoveQuestion = (index) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const handleDeleteTest = (id, title) => {
    if (window.confirm(`Delete weekly test "${title}"?`)) {
      academicStore.deleteWeeklyTest(id);
      setNotice(`Weekly test "${title}" deleted.`);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Post Weekly Question</h2>
          <p className="text-sm text-slate-400">Post weekly questions for students to view in their portal</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              id: null,
              title: '',
              subjectId: subjects[0]?.id || '',
              unit: 'Unit 1',
              date: new Date().toISOString().slice(0, 10),
              maxMarks: 20,
              questions: [''],
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
        >
          <Plus size={16} />
          Post New Question
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Tests Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {weeklyTestList.map((test) => {
          const subject = subjects.find((s) => s.id === test.subjectId);
          const gradedCount = weeklyTestMarks.filter((m) => m.testId === test.id).length;

          return (
            <div key={test.id} className="card p-5 flex flex-col justify-between hover:border-sky-500/40 transition">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-semibold text-sky-400 uppercase">{subject?.code || 'CS'}</span>
                    <h3 className="mt-1 text-lg font-bold text-white leading-snug">{test.title}</h3>
                  </div>
                  <span className="rounded-xl bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-sky-300">
                    {test.maxMarks} Marks
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <p><strong className="text-slate-300">Subject:</strong> {subject?.name || 'General'}</p>
                  <p><strong className="text-slate-300">Unit:</strong> {test.unit}</p>
                  <p><strong className="text-slate-300">Date Posted:</strong> {test.date}</p>
                  <p><strong className="text-slate-300">Questions:</strong> {test.questions?.length || 0}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      id: test.id,
                      title: test.title || '',
                      subjectId: test.subjectId || '',
                      unit: test.unit || '',
                      date: test.date || '',
                      maxMarks: test.maxMarks || 20,
                      questions: test.questions && test.questions.length > 0 ? test.questions : [''],
                    });
                    setShowCreateModal(true);
                  }}
                  className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 text-sky-400 hover:bg-sky-500/20 transition"
                  title="Edit Question"
                >
                  <Edit size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTest(test.id, test.title)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition"
                  title="Delete Question"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">{formData.id ? 'Edit Weekly Question' : 'Post Weekly Question'}</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Week / Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Week 4"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Subject *</label>
                  <CustomSelect
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Unit Coverage</label>
                  <input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. Unit 2"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Max Marks</label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-slate-400">Questions *</label>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.questions.map((q, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-2.5 text-xs font-bold text-slate-500">{index + 1}.</span>
                      <textarea
                        value={q}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder="Enter your question here..."
                        rows={2}
                        required
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500 resize-none"
                      />
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(index)}
                          className="mt-1.5 rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400"
                >
                  {formData.id ? 'Save Changes' : 'Publish Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
