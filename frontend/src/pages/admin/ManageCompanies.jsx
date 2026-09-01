import { useState, useEffect } from 'react';
import { Building2, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react';
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

export default function ManageCompanies() {
  const { success, error } = useToast();
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getCompanies({ page, limit: 10, search });
      setCompanies(res.data.data.companies);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const confirmStatusChange = (company, status) => {
    setSelectedCompany(company);
    setNewStatus(status);
    setStatusModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      await adminService.updateCompanyStatus(selectedCompany._id, newStatus);
      success(`Company status updated to ${newStatus}`);
      setStatusModalOpen(false);
      
      // Update local state
      setCompanies(companies.map(c => 
        c._id === selectedCompany._id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      error('Failed to update company status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manage Companies</h1>
        <p className="text-slate-500 dark:text-slate-400">Approve or reject company registrations.</p>
      </div>

      <Card className="p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Search by company name..." 
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
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Company</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Industry / Size</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Status</th>
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <tr key={company._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            {company.logo ? (
                              <img src={company.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Building2 className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{company.name}</p>
                            <p className="text-xs text-slate-500">Registered {formatDate(company.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <span>{company.industry}</span>
                          <span className="text-xs text-slate-500">{company.size} employees</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={company.status === 'approved' ? 'success' : company.status === 'pending' ? 'warning' : 'danger'}>
                          {company.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {company.status !== 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:text-emerald-500 dark:hover:bg-emerald-900/20"
                              onClick={() => confirmStatusChange(company, 'approved')}
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          {company.status !== 'rejected' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:text-red-500 dark:hover:bg-red-900/20"
                              onClick={() => confirmStatusChange(company, 'rejected')}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-500">
                      No companies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && companies.length > 0 && (
        <div className="mt-6">
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchCompanies} />
        </div>
      )}

      {/* Status Confirmation Modal */}
      <ConfirmDialog
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusChange}
        title={`Confirm ${newStatus === 'approved' ? 'Approval' : 'Rejection'}`}
        message={`Are you sure you want to mark "${selectedCompany?.name}" as ${newStatus}?`}
        confirmText={newStatus === 'approved' ? 'Approve Company' : 'Reject Company'}
        variant={newStatus === 'approved' ? 'primary' : 'danger'}
      />
    </div>
  );
}

