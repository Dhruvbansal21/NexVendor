import React, { useState } from 'react';
import {
  Store,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useGetMyVendorQuery, useOnboardVendorMutation } from '../../api/vendorApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/toastSlice';

export const VendorOnboardingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, refetch } = useGetMyVendorQuery();
  const [onboardVendor, { isLoading: isSubmitting }] = useOnboardVendorMutation();

  const vendor = data?.data;

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('storeName', storeName);
    formData.append('description', description);
    formData.append('contactEmail', contactEmail);
    formData.append('contactPhone', contactPhone);
    if (file) {
      formData.append('kycDoc', file);
    }

    try {
      await onboardVendor(formData).unwrap();
      dispatch(addToast({ type: 'success', message: 'Store application submitted for review!' }));
      refetch();
    } catch (err: any) {
      setErrorMsg(err.data?.error?.message || 'Failed to submit vendor application');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="vendor" />

      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Vendor Store & KYC Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit store credentials and business verification documents to sell on the marketplace
          </p>
        </div>

        {/* Existing Vendor Status Banner */}
        {vendor && (
          <div className="mb-8 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{vendor.storeName}</h2>
                  <p className="text-xs text-slate-500">Slug: /{vendor.slug}</p>
                </div>
              </div>
              <StatusBadge status={vendor.status} />
            </div>

            {vendor.status === 'pending' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Application Under Review</strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Your KYC documents are currently being evaluated by marketplace administrators. You can create draft products, but they will not be published in the public catalogue until your store is verified.
                  </p>
                </div>
              </div>
            )}

            {vendor.status === 'verified' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Store Verified & Active</strong>
                  <p className="mt-0.5 text-emerald-800 leading-relaxed">
                    Your vendor store is fully approved! All products you publish with active status will immediately appear in the public marketplace catalogue.
                  </p>
                </div>
              </div>
            )}

            {vendor.status === 'rejected' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-xs text-rose-900">
                <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Application Rejected</strong>
                  <p className="mt-0.5 text-rose-800">
                    Reason: <strong>{vendor.rejectionReason || 'Documents did not meet criteria'}</strong>
                  </p>
                  <p className="mt-1 text-[11px] text-rose-700">
                    You can re-apply by updating your store details and uploading new documents below.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Email</span>
                <span className="font-semibold text-slate-800">{vendor.contactEmail}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                <span className="font-semibold text-slate-800">{vendor.contactPhone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Commission</span>
                <span className="font-semibold text-slate-800">{vendor.commissionPct || 10}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding / Re-apply Form */}
        {(!vendor || vendor.status === 'rejected') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 mb-6 pb-3 border-b border-slate-100">
              {vendor?.status === 'rejected' ? 'Re-Apply for Store Verification' : 'Store Registration Form'}
            </h2>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Heritage Handicrafts"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers about your craftsmanship, products, and brand story..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="store@business.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Private KYC Document Upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  KYC Verification Document (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      {file ? file.name : 'Click to upload business license / GST document'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size 5MB (stored securely outside public web paths)'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileCheck className="w-4 h-4" />
                )}
                <span>Submit Store Application</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
