'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Save,
  Loader2,
  ChevronRight,
  LogOut,
  Camera,
  Building2,
  Smartphone,
  CheckCircle,
  XCircle,
  Key,
  Bell,
  MapPin,
} from 'lucide-react';
import { getAllStates, getCitiesForState, getCityTier } from '@/lib/india-cities';

export default function ProfilePage() {
  const { user, logout, fetchUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.state || '',
    city: user?.city || '',
    tier: user?.tier || null,
  });

  // Payment Method State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState('upi');
  const [paymentData, setPaymentData] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  // KYC State
  const [kycData, setKycData] = useState({
    panNumber: user?.kyc?.panNumber || '',
    aadharNumber: user?.kyc?.aadharNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('You are offline. Please check your connection.');
      setUploading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Profile picture updated!');
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        toast.error('Network error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Profile updated!');
        setEditing(false);
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        toast.error('Network error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async () => {
    setSaving(true);
    try {
      const body = {
        action: 'add_payment',
        type: paymentType,
        ...(paymentType === 'upi'
          ? { upiId: paymentData.upiId }
          : {
              bankName: paymentData.bankName,
              accountNumber: paymentData.accountNumber,
              ifscCode: paymentData.ifscCode,
              accountHolderName: paymentData.accountHolderName,
            }),
      };

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Payment method added!');
        setShowPaymentForm(false);
        setPaymentData({ upiId: '', bankName: '', accountNumber: '', ifscCode: '', accountHolderName: '' });
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed');
      }
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        toast.error('Network error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePayment = async (index) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_payment', paymentIndex: index }),
      });

      if (res.ok) {
        toast.success('Payment method removed');
        fetchUser();
      }
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        toast.error('Failed to remove');
      }
    }
  };

  const handleSubmitKYC = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_kyc', ...kycData }),
      });

      if (res.ok) {
        toast.success('KYC submitted for verification!');
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.message || 'KYC submission failed');
      }
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        toast.error('Network error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', ...passwordData }),
      });

      if (res.ok) {
        toast.success('Password changed!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        toast.error('Network error');
      }
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'kyc', label: 'KYC', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-dark-900 border-2 border-gold-500/30 flex items-center justify-center text-dark-50 text-2xl font-bold overflow-hidden relative group shadow-sm">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gold-gradient flex items-center justify-center">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4 text-dark-50">{user?.fullName}</h2>
        <p className="text-dark-500 text-sm">{user?.email}</p>
        <p className="text-dark-400 text-[10px] mt-1 font-bold uppercase tracking-wider">Referral Code: <span className="text-gold-600 font-mono font-bold ml-1 px-2 py-0.5 bg-gold-500/10 rounded-md">{user?.referralCode}</span></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 border border-dark-800 p-1 rounded-xl shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gold-500/10 text-gold-600 shadow-sm'
                  : 'text-dark-500 hover:text-dark-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card p-5 space-y-4 border-dark-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dark-50">Personal Information</h3>
            <button
              onClick={() => {
                if (!editing) {
                  setFormData({
                    fullName: user?.fullName || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    state: user?.state || '',
                    city: user?.city || '',
                    tier: user?.tier || null,
                  });
                }
                setEditing(!editing);
              }}
              className="text-xs text-gold-600 font-bold flex items-center gap-1"
            >
              <Edit size={12} />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-dark-500 mb-1.5 block uppercase font-bold tracking-wider">Full Name</label>
              <input
                type="text"
                value={editing ? formData.fullName : user?.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={!editing}
                className="w-full bg-white border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-100 font-medium disabled:opacity-60 outline-none focus:border-gold-500/50 shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-dark-500 mb-1.5 block uppercase font-bold tracking-wider">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-dark-900 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-400 font-medium opacity-60"
              />
            </div>
            <div>
              <label className="text-[10px] text-dark-500 mb-1.5 block uppercase font-bold tracking-wider">Phone</label>
              <input
                type="tel"
                value={user?.phone}
                disabled
                className="w-full bg-dark-900 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-400 font-medium opacity-60"
              />
            </div>
            <div>
              <label className="text-[10px] text-dark-500 mb-1.5 block uppercase font-bold tracking-wider flex items-center gap-1"><MapPin size={10} /> Location</label>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setFormData({ ...formData, state: newState, city: '', tier: null });
                    }}
                    className={`w-full bg-white border border-dark-800 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-gold-500/50 shadow-sm appearance-none cursor-pointer ${formData.state ? 'text-dark-100' : 'text-dark-500'}`}
                  >
                    <option value="">State</option>
                    {getAllStates().map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setFormData({ ...formData, city: newCity, tier: getCityTier(newCity, formData.state) });
                    }}
                    disabled={!formData.state}
                    className={`w-full bg-white border border-dark-800 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-gold-500/50 shadow-sm appearance-none cursor-pointer ${formData.city ? 'text-dark-100' : 'text-dark-500'} disabled:opacity-50`}
                  >
                    <option value="">City</option>
                    {formData.state && getCitiesForState(formData.state).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="w-full bg-dark-900 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-dark-400 font-medium opacity-60">
                  {user?.city && user?.state ? `${user.city}, ${user.state}` : 'Not set'}
                  {user?.tier ? ` • Tier ${user.tier}` : ''}
                </div>
              )}
            </div>
          </div>

          {editing && (
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-gold-gradient text-dark-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          )}
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          <div className="glass-card p-5 border-dark-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-dark-50">Payment Methods</h3>
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="text-xs text-gold-600 font-bold flex items-center gap-1"
              >
                <Plus size={12} />
                Add New
              </button>
            </div>

            {/* Existing Methods */}
            <div className="space-y-2">
              {user?.paymentMethods?.map((method, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-900 border border-dark-800 rounded-xl">
                  {method.type === 'upi' ? (
                    <Smartphone size={18} className="text-purple-600" />
                  ) : (
                    <Building2 size={18} className="text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-dark-100">
                      {method.type === 'upi' ? method.upiId : method.bankName}
                    </p>
                    <p className="text-[10px] text-dark-500 font-medium capitalize">{method.type?.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={() => handleRemovePayment(i)}
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!user?.paymentMethods || user.paymentMethods.length === 0) && (
                <p className="text-dark-500 text-sm text-center py-4">No payment methods added</p>
              )}
            </div>
          </div>

          {/* Add Payment Form */}
          {showPaymentForm && (
            <div className="glass-card p-6 space-y-5 border-dark-800 shadow-md">
              <div className="flex gap-2 p-1 bg-dark-900 border border-dark-800 rounded-xl">
                <button
                  onClick={() => setPaymentType('upi')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    paymentType === 'upi' ? 'bg-gold-500/10 text-gold-600 shadow-sm' : 'text-dark-500'
                  }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => setPaymentType('bank_account')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    paymentType === 'bank_account' ? 'bg-gold-500/10 text-gold-600 shadow-sm' : 'text-dark-500'
                  }`}
                >
                  Bank Account
                </button>
              </div>

              {paymentType === 'upi' ? (
                <input
                  type="text"
                  value={paymentData.upiId}
                  onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                  placeholder="UPI ID (e.g., name@upi)"
                  className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
                />
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={paymentData.accountHolderName}
                    onChange={(e) => setPaymentData({ ...paymentData, accountHolderName: e.target.value })}
                    placeholder="Account Holder Name"
                    className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
                  />
                  <input
                    type="text"
                    value={paymentData.bankName}
                    onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                    placeholder="Bank Name"
                    className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
                  />
                  <input
                    type="text"
                    value={paymentData.accountNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                    placeholder="Account Number"
                    className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
                  />
                  <input
                    type="text"
                    value={paymentData.ifscCode}
                    onChange={(e) => setPaymentData({ ...paymentData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="IFSC Code"
                    className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
                  />
                </div>
              )}

              <button
                onClick={handleAddPayment}
                disabled={saving}
                className="w-full bg-gold-gradient text-dark-50 font-bold py-3 rounded-xl disabled:opacity-50 shadow-md"
              >
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Add Payment Method'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div className="glass-card p-6 space-y-6 border-dark-800 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-dark-50">KYC Verification</h3>
            <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold ${
              user?.isKYCVerified
                ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
            }`}>
              {user?.isKYCVerified ? 'Verified' : user?.kyc?.status || 'Not Submitted'}
            </span>
          </div>

          {user?.isKYCVerified ? (
            <div className="text-center py-8 bg-green-500/5 rounded-2xl border border-green-500/10">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-600 font-bold">KYC Verified</p>
              <p className="text-xs text-dark-500 mt-1">Your identity has been verified</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-dark-500 mb-1.5 block uppercase font-bold tracking-wider">PAN Number</label>
                  <input
                    type="text"
                    value={kycData.panNumber}
                    onChange={(e) => setKycData({ ...kycData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 uppercase shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-dark-500 mb-1.5 block uppercase font-bold tracking-wider">Aadhar Number</label>
                  <input
                    type="text"
                    value={kycData.aadharNumber}
                    onChange={(e) => setKycData({ ...kycData, aadharNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
                  />
                </div>
              </div>


              <button
                onClick={handleSubmitKYC}
                disabled={saving || !kycData.panNumber || !kycData.aadharNumber}
                className="w-full bg-gold-gradient text-dark-50 font-bold py-3 rounded-xl disabled:opacity-50 shadow-md"
              >
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Submit KYC'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5 border-dark-800 shadow-sm">
            <h3 className="font-bold text-sm text-dark-50">Change Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Current Password"
                className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
              />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="New Password"
                className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
              />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm New Password"
                className="w-full bg-white border border-dark-800 rounded-xl px-4 py-3 text-sm text-dark-100 font-medium outline-none focus:border-gold-500/50 shadow-sm"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full bg-gold-gradient text-dark-50 font-bold py-3 rounded-xl disabled:opacity-50 shadow-md"
            >
              {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Change Password'}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full glass-card p-4 flex items-center gap-3 text-red-500 border border-red-500/10 hover:bg-red-500/5 transition-all shadow-sm"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}