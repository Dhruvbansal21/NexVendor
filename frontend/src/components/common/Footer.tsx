import React from 'react';
import { ShoppingBag, ShieldCheck, Database, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-tight">NexVendor</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Multi-Vendor Marketplace powered by independent Node.js microservices, isolated MongoDB databases, and React + RTK Query.
            </p>
          </div>

          {/* Architecture Highlights */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Microservices Stack
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                API Gateway (:4000)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Auth Service (:4001)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Vendor Service (:4002)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Catalogue Service (:4003)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Order Service (:4004)
              </li>
            </ul>
          </div>

          {/* Business Rules */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Evaluation Features
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Role-based access & JWT
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                4 Separate MongoDB Databases
              </li>
              <li className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Idempotency & Mini-Saga rollback
              </li>
            </ul>
          </div>

          {/* Milestone Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <span>BEE-II Evaluation Milestone</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ~50% progress milestone. Demo checkout operates without real money movement.
            </p>
            <p className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2 font-medium">
              Phase 2 Pending: Real payment processing, automated vendor commission splits & RabbitMQ event streaming.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 NexVendor Marketplace. Built for academic evaluation.</p>
          <div className="flex items-center gap-4">
            <span>Gateway :4000</span>
            <span>•</span>
            <span>Frontend :5173</span>
            <span>•</span>
            <span>MongoDB :27017</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
