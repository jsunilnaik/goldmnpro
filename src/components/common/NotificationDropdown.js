'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, ChevronRight, Info, PlusCircle, ArrowDownToLine, Zap } from 'lucide-react';
import Link from 'next/link';

export default function NotificationDropdown({ isOpen, onClose, notifications = [], unreadCount = 0, onMarkAsRead }) {
  const getIcon = (type) => {
    switch (type) {
      case 'withdrawal':
        return <ArrowDownToLine size={16} className="text-green-500" />;
      case 'payment':
        return <CheckCircle2 size={16} className="text-blue-500" />;
      case 'referral':
        return <PlusCircle size={16} className="text-purple-500" />;
      case 'mining':
        return <Zap size={16} className="text-gold-500" />;
      default:
        return <Info size={16} className="text-slate-400" />;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onMarkAsRead();
              onClose();
            }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              fixed md:absolute 
              inset-x-4 md:left-auto md:right-0 
              top-[68px] md:top-full 
              mt-0 md:mt-2 
              w-auto md:w-[380px] 
              z-50
              bg-white rounded-3xl shadow-2xl border border-dark-900/10 overflow-hidden
              origin-top md:origin-top-right transform
            `}
            // Prevent clicks inside from bubbling to window and closing immediately
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-900/10 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-dark-500" />
                <h3 className="font-bold text-dark-50">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Bell size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-dark-400">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">We'll alert you here for updates.</p>
                </div>
              ) : (
                <div className="divide-y divide-dark-900/5">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${
                        !notif.isRead ? 'bg-blue-50/50' : 'bg-white'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        !notif.isRead ? 'bg-white shadow-sm border border-blue-100' : 'bg-slate-100'
                      }`}>
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm tracking-tight ${!notif.isRead ? 'font-bold text-dark-50' : 'font-semibold text-dark-100'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${!notif.isRead ? 'text-dark-400 font-medium' : 'text-slate-500'}`}>
                          {notif.message}
                        </p>

                        {/* Optional Action Link */}
                        {notif.actionUrl && (
                          <Link href={notif.actionUrl} onClick={onClose} className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800">
                            View details <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {!notif.isRead && (
                        <div className="shrink-0 mt-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-dark-900/10 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Notifications are kept for 30 days.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
