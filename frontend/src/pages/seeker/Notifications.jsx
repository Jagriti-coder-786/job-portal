import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatRelativeDate } from '../../utils/formatters';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ page, limit: 15 });
      setNotifications(res.data.data.notifications);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'application-update': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'new-application': return <Briefcase className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-primary-500" />;
    }
  };

  const getLink = (notif) => {
    if (notif.relatedJob && notif.type === 'application-update') return `/jobs/${notif.relatedJob}`;
    return '#';
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">Stay updated on your applications and account activity.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {notifications.map((notif, index) => (
              <div 
                key={notif._id}
                onClick={() => handleMarkRead(notif._id, notif.read)}
                className={`p-4 sm:p-6 flex items-start gap-4 transition-colors cursor-pointer
                  ${index !== 0 ? 'border-t border-slate-100 dark:border-slate-800/50' : ''}
                  ${!notif.read ? 'bg-primary-50/50 dark:bg-primary-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                `}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.read ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                    <h3 className={`font-semibold ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                      {formatRelativeDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'} mb-2`}>
                    {notif.message}
                  </p>
                  
                  {notif.relatedJob && (
                    <Link to={getLink(notif)} className="inline-flex text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      View details &rarr;
                    </Link>
                  )}
                </div>
                
                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-600 flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchNotifications} />
        </div>
      ) : (
        <Card className="p-12">
          <EmptyState 
            icon={Bell}
            title="No notifications yet"
            description="When you apply for jobs or receive updates, they will appear here."
          />
        </Card>
      )}
    </div>
  );
}

