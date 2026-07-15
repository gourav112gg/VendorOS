import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, Clock, Percent, QrCode, Bell, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, UserProfile, GstInvoice, ServiceOrder } from '../types';
import dbStore from '../services/store';
import { hasFeatureAccess } from '../services/subscriptionService';

interface InvoicesTabProps {
  company: Company;
  currentUser: UserProfile;
  orders: ServiceOrder[];
  onNavigateToBilling: () => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  company,
  currentUser,
  orders,
  onNavigateToBilling,
}) => {
  const isGstEnabled = hasFeatureAccess(company, 'gst_invoice').hasAccess;

  const [invoices, setInvoices] = useState<GstInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<GstInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Invoice Form State
  const [customerName, setCustomerName] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [isGstToggle, setIsGstToggle] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [invoiceError, setInvoiceError] = useState('');

  // Reminder simulation states
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);

  useEffect(() => {
    const loadInvoices = () => {
      setInvoices(dbStore.getInvoices(company.id));
    };
    loadInvoices();
    const unsubscribe = dbStore.subscribe(loadInvoices);
    return () => unsubscribe();
  }, [company]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setInvoiceError('');

    if (!customerName.trim()) {
      setInvoiceError('Customer name is required.');
      return;
    }
    if (baseAmount <= 0) {
      setInvoiceError('Amount must be greater than zero.');
      return;
    }

    if (isGstToggle && !isGstEnabled) {
      setInvoiceError('GST-aware invoicing is gated under Growth/Scale tiers.');
      return;
    }

    let cgst = 0;
    let sgst = 0;
    let totalAmount = baseAmount;
    let invoiceNum = `INV-${company.name.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    if (isGstToggle && isGstEnabled) {
      cgst = Number((baseAmount * 0.09).toFixed(2)); // 9% CGST
      sgst = Number((baseAmount * 0.09).toFixed(2)); // 9% SGST
      totalAmount = baseAmount + cgst + sgst;
    }

    dbStore.addInvoice({
      companyId: company.id,
      orderId: selectedOrderId || undefined,
      customerName: customerName.trim(),
      baseAmount,
      cgst,
      sgst,
      igst: 0,
      totalAmount,
      invoiceNumber: invoiceNum,
      status: 'Unpaid'
    });

    // Record activity log
    dbStore.getActivityLogs(company.id); // push to store

    // Reset states
    setCustomerName('');
    setBaseAmount(0);
    setIsGstToggle(false);
    setSelectedOrderId('');
    setShowCreateModal(false);
  };

  const handleSendReminder = () => {
    if (!selectedInvoice) return;
    setSendingReminder(true);
    setReminderSuccess(false);

    setTimeout(() => {
      setSendingReminder(false);
      setReminderSuccess(true);
      
      // Log to simulated logs
      if (currentUser.companyId) {
        dbStore.getActivityLogs(company.id); // trigger activity log state update if we had log method
      }

      setTimeout(() => setReminderSuccess(false), 3000);
    }, 1500);
  };

  const handleMarkAsPaid = () => {
    if (!selectedInvoice) return;
    
    // We update invoice status in dbStore state directly
    const storedState = localStorage.getItem('vendoros_simulated_db');
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        const idx = parsed.gstInvoices.findIndex((i: any) => i.id === selectedInvoice.id);
        if (idx !== -1) {
          parsed.gstInvoices[idx].status = 'Paid';
          localStorage.setItem('vendoros_simulated_db', JSON.stringify(parsed));
          dbStore.subscribe(() => {})(); // force notify listeners
          setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6" id="invoice-manager-panel">
      {/* Tab Header with Create Invoice CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] border border-[#222222] p-6 rounded-sm">
        <div>
          <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
            Vendor Billing & Invoices
          </h3>
          <p className="text-xs text-[#555555] mt-1">
            {isGstEnabled 
              ? 'Unrestricted access: Generating GST-aware invoices, tracking UPI payments, and triggering reminders.'
              : 'Free Starter Plan: Restricted to basic plain invoices. Upgrade to unlock GST, UPI, and reminders.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-white hover:bg-[#E5E5E5] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Invoice Table / Main Content */}
      <div className="bg-[#111111] border border-[#222222] rounded-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-[#555555] text-xs font-mono">
            No invoices generated yet. Click 'New Invoice' to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0A0A] text-[#666666] font-mono text-[9px] uppercase tracking-widest border-b border-[#222222]">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Base Amount</th>
                  <th className="px-6 py-4">GST (CGST+SGST)</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D] text-xs">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#0D0D0D] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-[#888888]">{inv.customerName}</td>
                    <td className="px-6 py-4 font-mono text-[#888888]">₹{inv.baseAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-[#888888]">
                      {inv.cgst > 0 ? (
                        <span className="text-emerald-500">₹{(inv.cgst + inv.sgst).toFixed(2)} (18%)</span>
                      ) : (
                        <span className="text-[#444444] font-semibold uppercase text-[9px] tracking-wider">No GST (Basic)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">₹{inv.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest ${
                        inv.status === 'Paid'
                          ? 'bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40'
                          : 'bg-amber-950/20 text-amber-500 border border-amber-900/30'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-[10px] bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#222222] text-[#888888] hover:text-white px-2.5 py-1 rounded-sm uppercase font-bold tracking-widest transition-colors cursor-pointer"
                      >
                        Details / Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RENDER INVOICE DRAWER DETAILS */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-md bg-[#0F0F0F] border-l border-[#222222] h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between text-white"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#222222] pb-4">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-[#666666] uppercase tracking-widest">
                      Invoice details
                    </h3>
                    <span className="text-xl font-serif text-white font-semibold mt-1 block">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-xs text-[#555555] hover:text-white uppercase font-mono font-bold tracking-widest"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#161616] p-3 rounded-sm">
                      <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Customer Name</span>
                      <span className="text-xs font-semibold text-white mt-1 block">{selectedInvoice.customerName}</span>
                    </div>
                    <div className="bg-[#161616] p-3 rounded-sm">
                      <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Date Created</span>
                      <span className="text-xs font-mono text-white mt-1 block">
                        {new Date(selectedInvoice.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#161616] p-4 rounded-sm space-y-3.5">
                    <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Cost Calculation Breakdown</span>
                    
                    <div className="flex justify-between text-xs text-[#888888]">
                      <span>Base Service Cost</span>
                      <span className="font-mono text-white">₹{selectedInvoice.baseAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-[#888888]">
                      <span>CGST (9%)</span>
                      <span className="font-mono text-white">₹{selectedInvoice.cgst.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-[#888888]">
                      <span>SGST (9%)</span>
                      <span className="font-mono text-white">₹{selectedInvoice.sgst.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs border-t border-[#262626] pt-3 text-white font-semibold">
                      <span>Total Invoice Value</span>
                      <span className="font-mono text-lg text-emerald-400">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* PREMIUM GATED UPI & REMINDERS FLOW */}
                  {isGstEnabled ? (
                    <div className="bg-[#161616] border border-[#222222] p-4 rounded-sm space-y-4">
                      <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1 font-bold">
                        <QrCode className="w-3.5 h-3.5" /> Razorpay Autocollect Active
                      </span>

                      {selectedInvoice.status === 'Unpaid' ? (
                        <>
                          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-sm">
                            {/* Visual QR Code Mockup */}
                            <div className="w-32 h-32 bg-gray-200 border-4 border-white rounded-xs flex items-center justify-center text-black">
                              <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-center px-1">UPI Autopay Scan</span>
                            </div>
                            <span className="text-[10px] text-[#444444] font-sans font-semibold mt-2">
                              Scan with GPay/PhonePe to receive ₹{selectedInvoice.totalAmount.toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#262626]">
                            <button
                              onClick={handleSendReminder}
                              disabled={sendingReminder}
                              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#1C120D] hover:bg-[#1C120D]/80 border border-amber-950 text-amber-400 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {sendingReminder ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
                              <span>Send automated payment reminder</span>
                            </button>

                            {reminderSuccess && (
                              <p className="text-[10px] font-mono text-emerald-400 text-center font-bold">
                                SMS/WhatsApp Reminder Sent successfully!
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-[#0D2A1D]/30 border border-emerald-950 text-emerald-400 text-xs flex items-center gap-2 rounded-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>This invoice is fully paid. No reminders required.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-950/10 border border-amber-900/40 p-4 rounded-sm space-y-3">
                      <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1 font-bold">
                        <Lock className="w-3.5 h-3.5" /> UPI Collection & Reminders Locked
                      </span>
                      <p className="text-[11px] text-[#888888] leading-relaxed">
                        Upgrade to the Growth or Scale tier to unlock instant digital payment requests (Razorpay UPI QR codes) and automated SMS/WhatsApp customer payment reminder agents.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedInvoice(null);
                          onNavigateToBilling();
                        }}
                        className="w-full py-2 bg-[#2D220D] hover:bg-[#2D220D]/80 text-amber-400 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest transition-all"
                      >
                        Learn more / Upgrade
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedInvoice.status === 'Unpaid' && (
                <button
                  onClick={handleMarkAsPaid}
                  className="w-full py-3 bg-white hover:bg-[#E5E5E5] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Mark as Paid manually
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE INVOICE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111111] border border-[#222222] w-full max-w-md rounded-sm overflow-hidden text-white shadow-2xl"
            >
              <div className="bg-[#0A0A0A] p-4 border-b border-[#222222] flex justify-between items-center">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                  Generate Customer Invoice
                </h4>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs text-[#555555] hover:text-white uppercase font-mono font-bold tracking-widest"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#555555] uppercase tracking-widest">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                    className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0A0A0A] text-white text-xs focus:outline-none focus:border-[#444444]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#555555] uppercase tracking-widest">
                    Base Cost (INR)
                  </label>
                  <input
                    type="number"
                    value={baseAmount || ''}
                    onChange={(e) => setBaseAmount(Number(e.target.value))}
                    placeholder="Enter cost in ₹..."
                    className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0A0A0A] text-white text-xs font-mono focus:outline-none focus:border-[#444444]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-[#555555] uppercase tracking-widest">
                    Optional: Link to Order
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0A0A0A] text-white text-xs font-mono focus:outline-none focus:border-[#444444]"
                  >
                    <option value="">-- No order link --</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>[{o.id}] {o.title}</option>
                    ))}
                  </select>
                </div>

                {/* GST TIER CHECK */}
                <div className="bg-[#0A0A0A] border border-[#222222] p-4 rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">GST-Aware Invoice</span>
                    <p className="text-[10px] text-[#555555] mt-0.5 leading-relaxed">
                      Auto-calculate 9% CGST & 9% SGST taxes according to statutory norms.
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isGstToggle}
                      onChange={(e) => {
                        if (!isGstEnabled) {
                          setInvoiceError('GST-aware invoicing is gated under Growth/Scale tiers.');
                          setIsGstToggle(false);
                          return;
                        }
                        setIsGstToggle(e.target.checked);
                      }}
                      className="w-4 h-4 accent-white cursor-pointer"
                    />
                  </div>
                </div>

                {invoiceError && (
                  <p className="text-xs text-red-400 font-mono font-semibold">{invoiceError}</p>
                )}

                {/* Live Math Review */}
                {isGstToggle && isGstEnabled && baseAmount > 0 && (
                  <div className="bg-[#0D2A1D]/10 border border-emerald-950/40 p-3 rounded-sm text-xs space-y-1 text-[#888888]">
                    <div className="flex justify-between">
                      <span>Base Value:</span>
                      <span className="font-mono text-white">₹{baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (9%):</span>
                      <span className="font-mono text-white">₹{(baseAmount * 0.09).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9%):</span>
                      <span className="font-mono text-white">₹{(baseAmount * 0.09).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#1D1D1D] pt-2 font-bold text-white">
                      <span>Total Value:</span>
                      <span className="font-mono text-emerald-400">₹{(baseAmount * 1.18).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-white hover:bg-[#E5E5E5] text-black font-bold text-[10px] uppercase tracking-widest rounded-sm transition-all cursor-pointer"
                >
                  Generate Invoice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default InvoicesTab;
