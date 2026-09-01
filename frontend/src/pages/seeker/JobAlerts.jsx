import { useState, useEffect } from 'react';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { alertService } from '../../services/alertService';

export default function JobAlerts() {
  const { success, error } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    location: '',
    frequency: 'daily'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await alertService.getAlerts();
      setAlerts(res.data.data.alerts);
    } catch (err) {
      error('Failed to load job alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await alertService.updateAlert(id, { isActive: !currentStatus });
      setAlerts(alerts.map(a => a._id === id ? { ...a, isActive: !currentStatus } : a));
      success('Alert status updated');
    } catch (err) {
      error('Failed to update alert status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(alerts.filter(a => a._id !== id));
      success('Alert deleted');
    } catch (err) {
      error('Failed to delete alert');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (alerts.length >= 10) {
      error('Maximum of 10 alerts reached');
      return;
    }
    
    try {
      setSubmitting(true);
      const res = await alertService.createAlert(formData);
      setAlerts([res.data.data.alert, ...alerts]);
      success('Job alert created');
      setShowForm(false);
      setFormData({ keyword: '', location: '', frequency: 'daily' });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Job Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Get notified when new jobs match your criteria. ({alerts.length}/10 alerts used)
          </p>
        </div>
        {!showForm && alerts.length < 10 && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Alert
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 mb-8 border-t-4 border-t-primary-500 animate-slide-up">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Alert</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Job Title or Keyword"
                placeholder="e.g. React Developer"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                required
              />
              <Input
                label="Location (Optional)"
                placeholder="e.g. Remote, New York"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            
            <Select
              label="Notification Frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              options={[
                { value: 'instant', label: 'Instant (As soon as posted)' },
                { value: 'daily', label: 'Daily Digest' },
                { value: 'weekly', label: 'Weekly Summary' }
              ]}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Save Alert
              </Button>
            </div>
          </form>
        </Card>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map(alert => (
            <Card key={alert._id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    {alert.isActive ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {alert.keyword}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {alert.location && (
                        <Badge variant="default" className="text-xs">📍 {alert.location}</Badge>
                      )}
                      <Badge variant="default" className="text-xs capitalize">⏱ {alert.frequency}</Badge>
                      <span className={`text-xs font-medium ${alert.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {alert.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleToggle(alert._id, alert.isActive)}
                  >
                    {alert.isActive ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDelete(alert._id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !showForm && (
          <Card className="p-12">
            <EmptyState
              icon={Bell}
              title="No Job Alerts"
              description="Create a job alert to get notified when new jobs match your criteria."
              action={() => setShowForm(true)}
              actionLabel="Create Alert"
            />
          </Card>
        )
      )}
    </div>
  );
}
