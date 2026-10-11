'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, Key, Phone, Mail, CheckCircle, Lock } from 'lucide-react';

const ROLE_DEFINITIONS = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    description: 'Unrestricted full access across catalog, financial settings, logs, roles, media and system configs.',
    permissions: [
      'Full Database & Store Settings Root',
      'Manage Staff Roles & Credentials',
      'Financial Reports & Bank Configurations',
      'Product & Inventory Full Control',
      'Order Verification & Dispatch',
      'Promotions & Theme Customization',
    ],
  },
  {
    id: 'store_manager',
    label: 'Store Manager',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    description: 'Can manage catalog, orders, customers, reviews, coupons and hero banners. Cannot edit staff roles.',
    permissions: [
      'Manage Catalog, Categories & Collections',
      'Process & Verify Customer Orders',
      'Coupons, Discounts & Marketing Banners',
      'Review Moderation & Customer Profiles',
      'View Inventory Movements',
    ],
  },
  {
    id: 'catalog_manager',
    label: 'Catalog Manager',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    description: 'Focused strictly on creating & updating products, inventory adjustments, categories and collections.',
    permissions: [
      'Add & Edit Products & Slugs',
      'Manage Category Trees & Picture Uploads',
      'Stock Adjustments & Warehouse Replenishment',
      'Curate Collections & Product Showcases',
    ],
  },
  {
    id: 'order_fulfillment',
    label: 'Order Fulfillment',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    description: 'Manages customer orders, shipment tracking numbers, and view customer address profiles.',
    permissions: [
      'Inspect Customer Custom Text & Uploaded Photos',
      'Update Production Status (Pending -> Shipped)',
      'Assign Courier Tracking ID & Notify via Gmail',
      'Generate & Print Atelier Packing Slips',
    ],
  },
];

export default function AdminUserModal({ user, onClose, onSave }) {
  const isEditing = Boolean(user && (user.id || user._id));

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState(user?.role || 'catalog_manager');
  const [assignedTask, setAssignedTask] = useState(user?.assignedTask || '');
  const [status, setStatus] = useState(user?.status || 'Active');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'catalog_manager');
      setAssignedTask(user.assignedTask || '');
      setStatus(user.status || 'Active');
    }
  }, [user]);

  const activeRoleDef = ROLE_DEFINITIONS.find((r) => r.id === role) || ROLE_DEFINITIONS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSaving(true);
    const payload = {
      ...(user || {}),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      roleLabel: activeRoleDef.label,
      assignedTask: assignedTask.trim() || `${activeRoleDef.label} Operations`,
      status,
      addedOn: user?.addedOn || new Date().toISOString().split('T')[0],
      lastLogin: user?.lastLogin || 'Just Created',
    };

    if (password.trim()) {
      payload.hasCustomPassword = true;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save staff user:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Screenshot 1 luxury style */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B5936C]"></span>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {isEditing ? 'Edit Administrator / Role' : 'Add Administrator'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Assign staff credentials, role-based access control (RBAC), and specific atelier responsibilities.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Staff Member Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Artisan Asad, Khadija (Lead Designer)"
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] focus:bg-white text-stone-900 font-medium"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Work Email <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@vowcrafts.com"
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] focus:bg-white font-mono text-stone-900 text-xs"
              />
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Contact Phone / WhatsApp</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 8472910"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] focus:bg-white font-mono text-stone-900 text-xs"
              />
            </div>

            {/* Role & Access (RBAC) */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B5936C]" />
                <span>Assigned RBAC Role <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] font-semibold text-stone-900 text-xs"
              >
                {ROLE_DEFINITIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {r.description.slice(0, 60)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Duties / Task Description */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Assigned Atelier Duties & Specialization</span>
              </label>
              <input
                type="text"
                value={assignedTask}
                onChange={(e) => setAssignedTask(e.target.value)}
                placeholder="e.g. Courier Tracking & Urgent Dispatch, Product Photos & Gold Foil Cataloging"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] focus:bg-white text-stone-900 text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Helps your team know exactly what duties this staff member is responsible for.
              </span>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] font-semibold text-stone-900 text-xs"
              >
                <option value="Active">Active (Permitted to Login)</option>
                <option value="Inactive">Inactive (Suspended Access)</option>
              </select>
            </div>

            {/* Temporary Passcode / Password */}
            <div>
              <label className="block font-bold text-stone-700 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>{isEditing ? 'New Passcode (Optional)' : 'Initial Passcode / PIN'}</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Leave blank to retain current' : '••••••••'}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#B5936C] font-mono text-stone-900 text-xs"
              />
            </div>
          </div>

          {/* Role Permissions Preview Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Permissions Granted ({activeRoleDef.label}):
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeRoleDef.badgeColor}`}>
                {activeRoleDef.label}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {activeRoleDef.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-stone-200">
              {activeRoleDef.permissions.map((p, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-stone-700">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#B5936C] hover:bg-[#A3825B] text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Administrator' : 'Assign & Create Role'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
