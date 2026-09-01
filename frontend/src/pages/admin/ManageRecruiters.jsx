import { useState, useEffect } from 'react';
import { UserCheck, Search, Trash2, Mail } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ManageRecruiters() {
  const { success, error } = useToast();
  
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const fetchRecruiters = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ page, limit: 10, search, role: 'recruiter' });
      setRecruiters(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error('Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecruiters(1);
  };

  const confirmDelete = (user) => {
    setSelectedRecruiter(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(selectedRecruiter._id);
      success('Recruiter deleted successfully');
      setDeleteModalOpen(false);
      fetchRecruiters(pagination.page);
    } catch (err) {
      error('Failed to delete recruiter');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manage Recruiters</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage employer accounts on the platform.</p>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Search by name or email..." 
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-0"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Recruiter</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Contact</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Joined</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.length > 0 ? (
                  recruiters.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="font-bold text-slate-500">{user.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            <Badge variant="purple" className="mt-1">Recruiter</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          onClick={() => confirmDelete(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500">
                      No recruiters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && recruiters.length > 0 && (
        <div className="mt-6">
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchRecruiters} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Recruiter"
        message={`Are you sure you want to delete ${selectedRecruiter?.name}? This action cannot be undone.`}
        confirmText="Delete Recruiter"
        variant="danger"
      />
    </div>
  );
}

