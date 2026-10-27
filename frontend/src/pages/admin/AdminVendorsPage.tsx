import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  FileText,
  Search,
  AlertTriangle,
  Building2,
  Calendar
} from 'lucide-react';
import {
  useGetVendorsQuery,
  useVerifyVendorMutation,
  useRejectVendorMutation,
  Vendor
} from '../../api/vendorApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../lib/formatters';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToast } from '../../store/toastSlice';

export const AdminVendorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected' | ''>('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetVendorsQuery({
    status: activeTab || undefined,
    page,
    limit: 10
  });

  const [verifyVendor, { isLoading: isVerifying }] = useVerifyVendorMutation();
  const [rejectVendor, { isLoading: isRejecting }] = useRejectVendorMutation();

  // Dialog states
  const [verifyTarget, setVerifyTarget] = useState<Vendor | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleVerify = async () => {
    if (!verifyTarget) return;
    try {
      await verifyVendor(verifyTarget.id).unwrap();
      dispatch(addToast({ type: 'success', message: `Vendor "${verifyTarget.storeName}" verified!` }));
      setVerifyTarget(null);
      refetch();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.data?.error?.message || 'Verification failed' }));
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    try {
      await rejectVendor({ id: rejectTarget.id, reason: rejectReason.trim() }).unwrap();
      dispatch(addToast({ type: 'warning', message: `Vendor "${rejectTarget.storeName}" rejected.` }));
      setRejectTarget(null);
      setRejectReason('');
      refetch();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.data?.error?.message || 'Rejection failed' }));
    }
  };

  const vendors = data?.data || [];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Vendor Store Approvals
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review onboarding applications, inspect private KYC documents, and approve or reject vendor stores
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200/80 mb-6">
          <button
            onClick={() => { setActiveTab('pending'); setPage(1); }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Pending Approvals</span>
          </button>

          <button
            onClick={() => { setActiveTab('verified'); setPage(1); }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px ${
              activeTab === 'verified'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Verified Stores
          </button>

          <button
            onClick={() => { setActiveTab('rejected'); setPage(1); }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px ${
              activeTab === 'rejected'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Rejected Applications
          </button>

          <button
            onClick={() => { setActiveTab(''); setPage(1); }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition -mb-px ${
              activeTab === ''
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            All Vendors
          </button>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Store & Slug</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">KYC Documents</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">Loading vendors...</td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      No vendors found under this filter.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block">{v.storeName}</span>
                            <span className="text-[10px] text-stone-400 font-mono">/{v.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-800">{v.contactEmail}</p>
                        <p className="text-[11px] text-stone-500">{v.contactPhone}</p>
                      </td>

                      <td className="py-3 px-4">
                        {v.kycDocs && v.kycDocs.length > 0 ? (
                          <div className="space-y-1">
                            {v.kycDocs.map((doc) => (
                              <a
                                key={doc.docId}
                                href={`http://localhost:4000/api/vendors/${v.id}/kyc/${doc.docId}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  // Open with authorization header or in new window
                                  e.preventDefault();
                                  fetch(`http://localhost:4000/api/vendors/${v.id}/kyc/${doc.docId}`, {
                                    headers: { Authorization: `Bearer ${auth.token}` }
                                  })
                                    .then(r => r.blob())
                                    .then(b => {
                                      const url = window.URL.createObjectURL(b);
                                      window.open(url, '_blank');
                                    })
                                    .catch(() => alert('Failed to open private KYC file'));
                                }}
                                className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 text-[11px] font-semibold bg-brand-50 px-2.5 py-1 rounded-md"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{doc.originalName}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">No docs attached</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={v.status} />
                        {v.rejectionReason && (
                          <p className="text-[10px] text-rose-600 mt-1 max-w-xs truncate" title={v.rejectionReason}>
                            Reason: {v.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {formatDate(v.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5">
                        {v.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setVerifyTarget(v)}
                              className="px-2.5 py-1.5 rounded-lg font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition inline-flex items-center gap-1"
                              title="Verify Vendor"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => { setRejectTarget(v); setRejectReason(''); }}
                              className="px-2.5 py-1.5 rounded-lg font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition inline-flex items-center gap-1"
                              title="Reject Vendor"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verify Modal */}
        <ConfirmDialog
          isOpen={!!verifyTarget}
          title="Verify Vendor Store"
          message={`Are you sure you want to approve "${verifyTarget?.storeName}"? Once verified, all active products published by this vendor will appear live in the public catalogue.`}
          confirmLabel="Verify Store"
          isLoading={isVerifying}
          onConfirm={handleVerify}
          onCancel={() => setVerifyTarget(null)}
        />

        {/* Reject Modal */}
        <ConfirmDialog
          isOpen={!!rejectTarget}
          title="Reject Vendor Application"
          message={`Please provide a reason for rejecting "${rejectTarget?.storeName}". The vendor will see this reason and may re-apply.`}
          confirmLabel="Reject Application"
          isDestructive={true}
          isLoading={isRejecting}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        >
          <div className="mt-2 text-xs">
            <label className="block font-semibold text-stone-700 mb-1">Rejection Reason *</label>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. KYC document signature is unclear / missing GST registration number"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-rose-500"
            />
          </div>
        </ConfirmDialog>
      </main>
    </div>
  );
};
