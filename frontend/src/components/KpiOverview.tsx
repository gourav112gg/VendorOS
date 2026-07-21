import React, { useState, useEffect } from 'react';
import dbStore from '../services/store';
import { InventoryItem, Shipment, ServiceOrder, UserProfile } from '../types';
import { 
  AlertTriangle, Package, Truck, ClipboardList, Check, Plus, 
  Activity, ArrowUpRight, TrendingUp, RefreshCw, Layers, ShieldCheck, 
  ChevronRight, Calendar, MapPin, Sparkles, PlusCircle, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

interface KpiOverviewProps {
  companyId: string;
  currentUser: UserProfile;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({ companyId, currentUser }) => {
  const { preferences } = useAuth();
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const formatCurrency = (amount: number) => {
    if (preferences.currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  
  // Interactive modal/form states
  const [activeDetailsTab, setActiveDetailsTab] = useState<'inventory' | 'shipments' | 'orders'>('inventory');
  const [isRestockLoading, setIsRestockLoading] = useState<string | null>(null);
  const [isShipLoading, setIsShipLoading] = useState<string | null>(null);
  
  // Adding inventory form
  const [isAddInvOpen, setIsAddInvOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Pipes & Fittings');
  const [newItemStock, setNewItemStock] = useState(10);
  const [newItemMinStock, setNewItemMinStock] = useState(5);
  const [newItemLocation, setNewItemLocation] = useState('Shelf A');

  // Adding shipment form
  const [isAddShpOpen, setIsAddShpOpen] = useState(false);
  const [newShpTitle, setNewShpTitle] = useState('');
  const [newShpCarrier, setNewShpCarrier] = useState('FedEx Ground');

  // Fulfilling shipment form
  const [shippingShipmentId, setShippingShipmentId] = useState<string | null>(null);
  const [shipCarrier, setShipCarrier] = useState('');
  const [shipTracking, setShipTracking] = useState('');

  // Load and subscribe to DB changes
  useEffect(() => {
    const loadKpis = () => {
      setInventory(dbStore.getInventory(companyId));
      setShipments(dbStore.getShipments(companyId));
      // Filter company orders
      const allOrders = dbStore.getUsers()
        .filter(u => u.companyId === companyId)
        .reduce((acc: ServiceOrder[], user) => {
          // get orders associated with this company
          return acc;
        }, []);
      
      // Let's get orders properly from state:
      // Orders have companyId as part of their schema
      const companyOrders = dbStore['state'].orders.filter((o: ServiceOrder) => o.companyId === companyId);
      setOrders(companyOrders);
    };

    loadKpis();
    const unsubscribe = dbStore.subscribe(loadKpis);
    return () => unsubscribe();
  }, [companyId]);

  // Derived metrics
  const activeOrdersCount = orders.filter(o => o.stage !== 'Completed').length;
  const totalActiveValue = orders.filter(o => o.stage !== 'Completed').reduce((sum, o) => sum + o.value, 0);
  const inventoryAlertsCount = inventory.filter(item => item.stock <= item.minStock).length;
  const pendingShipmentsCount = shipments.filter(s => s.status === 'Pending').length;
  const completedShipmentsCount = shipments.filter(s => s.status === 'Shipped' || s.status === 'Delivered').length;

  const handleRestock = async (itemId: string, amount: number) => {
    setIsRestockLoading(itemId);
    // Simulate slight loading latency
    await new Promise(resolve => setTimeout(resolve, 500));
    dbStore.restockInventoryItem(itemId, amount, currentUser.id);
    setIsRestockLoading(null);
  };

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemSku.trim()) return;
    dbStore.addInventoryItem(
      companyId,
      newItemName,
      newItemSku,
      newItemStock,
      newItemMinStock,
      newItemLocation,
      newItemCategory,
      currentUser.id
    );
    // Reset form
    setNewItemName('');
    setNewItemSku('');
    setNewItemStock(10);
    setNewItemMinStock(5);
    setNewItemLocation('Shelf A');
    setIsAddInvOpen(false);
  };

  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShpTitle.trim() || !newShpCarrier.trim()) return;
    dbStore.addShipment(companyId, newShpTitle, newShpCarrier, currentUser.id);
    setNewShpTitle('');
    setNewShpCarrier('FedEx Ground');
    setIsAddShpOpen(false);
  };

  const handleOpenShipForm = (shipmentId: string, currentCarrier: string) => {
    setShippingShipmentId(shipmentId);
    setShipCarrier(currentCarrier);
    setShipTracking('');
  };

  const handleShipShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingShipmentId || !shipTracking.trim()) return;
    
    setIsShipLoading(shippingShipmentId);
    await new Promise(resolve => setTimeout(resolve, 600));
    dbStore.updateShipmentStatus(
      shippingShipmentId,
      'Shipped',
      shipTracking,
      shipCarrier,
      currentUser.id
    );
    setIsShipLoading(null);
    setShippingShipmentId(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222222] pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest text-[#888888]">
              Operational Suite
            </span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400 text-[10px] font-mono uppercase tracking-widest flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 inline" /> {currentUser.role} Level
            </span>
          </div>
          <h1 className="text-2xl font-serif italic text-white mt-2 font-light tracking-tight">
            {t('kpiTitle', 'Key Performance Indicators')}
          </h1>
          <p className="text-xs text-[#666666] font-mono uppercase tracking-wider mt-0.5">
            {t('kpiSubtitle', 'Real-time fulfillment metrics, logistics pipeline, & critical inventory triggers')}
          </p>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveDetailsTab('inventory')}
            className={`text-[10px] uppercase tracking-wider font-bold py-2 px-3.5 border rounded-sm transition-all flex items-center ${
              activeDetailsTab === 'inventory' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Alerts & Stock ({inventoryAlertsCount})
          </button>
          <button 
            onClick={() => setActiveDetailsTab('shipments')}
            className={`text-[10px] uppercase tracking-wider font-bold py-2 px-3.5 border rounded-sm transition-all flex items-center ${
              activeDetailsTab === 'shipments' 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5 mr-1.5" />
            Shipments ({pendingShipmentsCount})
          </button>
        </div>
      </div>

      {/* Grid-based Bento Layout Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Active Orders */}
        <div className="bg-[#111111] p-6 rounded-sm border border-[#222222] flex flex-col justify-between relative overflow-hidden group hover:border-[#333333] transition-all">
          <div className="absolute top-0 right-0 p-3 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
            <ClipboardList className="w-20 h-20 -mr-4 -mt-4" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">{t('activeWorkOrders', 'Active Work Orders')}</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm text-[9px] font-mono">
                {t('liveQueue', 'LIVE QUEUE')}
              </span>
            </div>
            <div>
              <span className="text-4xl font-sans font-extrabold text-white block mt-1">
                {activeOrdersCount}
              </span>
              <span className="text-xs text-slate-400 mt-1 inline-flex items-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                Value: {formatCurrency(totalActiveValue)} pending
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveDetailsTab('orders')}
            className="text-[10px] uppercase tracking-widest font-extrabold text-white hover:text-emerald-400 transition-colors flex items-center mt-6 group-hover:translate-x-1"
          >
            View Dispatch <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Metric 2: Inventory Alerts */}
        <div className={`p-6 rounded-sm border flex flex-col justify-between relative overflow-hidden group transition-all ${
          inventoryAlertsCount > 0 
            ? 'bg-[#1C160C]/90 border-amber-500/20 hover:border-amber-500/40' 
            : 'bg-[#111111] border-[#222222] hover:border-[#333333]'
        }`}>
          <div className="absolute top-0 right-0 p-3 text-white/5 pointer-events-none">
            <AlertTriangle className="w-20 h-20 -mr-4 -mt-4" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest block">Inventory Alerts</span>
              {inventoryAlertsCount > 0 ? (
                <span className="bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded-sm text-[8px] font-mono animate-pulse">
                  DEPLETED
                </span>
              ) : (
                <span className="bg-[#1A1A1A] border border-[#222222] text-[#888888] px-2 py-0.5 rounded-sm text-[9px] font-mono">
                  HEALTHY
                </span>
              )}
            </div>
            <div>
              <span className={`text-4xl font-sans font-extrabold block mt-1 ${inventoryAlertsCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {inventoryAlertsCount}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {inventoryAlertsCount > 0 
                  ? `${inventoryAlertsCount} stock items below safe limit`
                  : 'All critical parts fully stocked'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveDetailsTab('inventory')}
            className="text-[10px] uppercase tracking-widest font-extrabold text-white hover:text-amber-400 transition-colors flex items-center mt-6 group-hover:translate-x-1"
          >
            Restock parts <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Metric 3: Pending Shipments */}
        <div className="bg-[#111111] p-6 rounded-sm border border-[#222222] flex flex-col justify-between relative overflow-hidden group hover:border-[#333333] transition-all">
          <div className="absolute top-0 right-0 p-3 text-white/5 pointer-events-none">
            <Truck className="w-20 h-20 -mr-4 -mt-4" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Pending Shipments</span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-sm text-[9px] font-mono">
                LOGISTICS
              </span>
            </div>
            <div>
              <span className="text-4xl font-sans font-extrabold text-white block mt-1">
                {pendingShipmentsCount}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                In-bound or outbound packages pending tracking
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveDetailsTab('shipments')}
            className="text-[10px] uppercase tracking-widest font-extrabold text-white hover:text-blue-400 transition-colors flex items-center mt-6 group-hover:translate-x-1"
          >
            Manage shipments <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Metric 4: Fulfillments Rate */}
        <div className="bg-[#111111] p-6 rounded-sm border border-[#222222] flex flex-col justify-between relative overflow-hidden group hover:border-[#333333] transition-all">
          <div className="absolute top-0 right-0 p-3 text-white/5 pointer-events-none">
            <Activity className="w-20 h-20 -mr-4 -mt-4" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Fulfillment Efficiency</span>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-sm text-[9px] font-mono">
                METRIC
              </span>
            </div>
            <div>
              <span className="text-4xl font-sans font-extrabold text-white block mt-1">
                {orders.length > 0 
                  ? Math.round((orders.filter(o => o.stage === 'Completed').length / orders.length) * 100) 
                  : 100}%
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {orders.filter(o => o.stage === 'Completed').length} of {orders.length} orders completed
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#555555] mt-6 flex items-center">
            <Sparkles className="w-3 h-3 text-indigo-400 mr-1" /> Quality service standard maintained
          </div>
        </div>

      </div>

      {/* Forms/Modals Block */}
      <AnimatePresence>
        {isAddInvOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#111111] p-6 border border-amber-500/20 rounded-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add New Inventory Stock Part</h3>
              <button onClick={() => setIsAddInvOpen(false)} className="text-xs text-[#666666] hover:text-white">Cancel</button>
            </div>
            <form onSubmit={handleAddInventory} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Part Name</label>
                <input 
                  type="text" 
                  value={newItemName} 
                  onChange={(e) => setNewItemName(e.target.value)} 
                  placeholder="e.g. 1/2-inch Galvanized Elbow"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none focus:border-amber-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">SKU Code</label>
                <input 
                  type="text" 
                  value={newItemSku} 
                  onChange={(e) => setNewItemSku(e.target.value)} 
                  placeholder="e.g. ELB-GALV-12"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none focus:border-amber-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Category</label>
                <select 
                  value={newItemCategory} 
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none focus:border-amber-500/40"
                >
                  <option value="Pipes & Fittings">Pipes & Fittings</option>
                  <option value="Adhesives">Adhesives</option>
                  <option value="Pumps">Pumps</option>
                  <option value="Controls">Controls</option>
                  <option value="Tools">Tools</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Current Stock Level</label>
                <input 
                  type="number" 
                  min="0"
                  value={newItemStock} 
                  onChange={(e) => setNewItemStock(parseInt(e.target.value) || 0)} 
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Minimum Stock Alert Trigger</label>
                <input 
                  type="number" 
                  min="0"
                  value={newItemMinStock} 
                  onChange={(e) => setNewItemMinStock(parseInt(e.target.value) || 0)} 
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Warehouse Location Bin</label>
                <input 
                  type="text" 
                  value={newItemLocation} 
                  onChange={(e) => setNewItemLocation(e.target.value)} 
                  placeholder="e.g. Aisle 3, Bin C"
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono px-6 py-2.5 rounded-sm uppercase tracking-wider"
                >
                  Confirm and Add Part
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isAddShpOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#111111] p-6 border border-blue-500/20 rounded-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Schedule Outbound shipment dispatch</h3>
              <button onClick={() => setIsAddShpOpen(false)} className="text-xs text-[#666666] hover:text-white">Cancel</button>
            </div>
            <form onSubmit={handleAddShipment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Shipment Title / Contents</label>
                <input 
                  type="text" 
                  value={newShpTitle} 
                  onChange={(e) => setNewShpTitle(e.target.value)} 
                  placeholder="e.g. Heavy Duty Sump Pump replacement unit"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Courier Carrier Partner</label>
                <input 
                  type="text" 
                  value={newShpCarrier} 
                  onChange={(e) => setNewShpCarrier(e.target.value)} 
                  placeholder="e.g. UPS Ground, FedEx Freight, DHL Express"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 text-black text-xs font-bold font-mono px-6 py-2.5 rounded-sm uppercase tracking-wider"
                >
                  Schedule Shipment Pipeline
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {shippingShipmentId && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#111111] p-6 border border-blue-500/30 rounded-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Enter Dispatch Tracking Metrics</h3>
                <p className="text-[10px] text-slate-400 mt-1">This will change shipment status to "Shipped" and log the event in the audit log.</p>
              </div>
              <button onClick={() => setShippingShipmentId(null)} className="text-xs text-[#666666] hover:text-white">Cancel</button>
            </div>
            <form onSubmit={handleShipShipment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Carrier Provider</label>
                <input 
                  type="text" 
                  value={shipCarrier} 
                  onChange={(e) => setShipCarrier(e.target.value)} 
                  required
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#888888] mb-1">Tracking Number</label>
                <input 
                  type="text" 
                  value={shipTracking} 
                  onChange={(e) => setShipTracking(e.target.value)} 
                  required
                  placeholder="e.g. 1Z999AA10123456784"
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-sm text-xs text-white p-2.5 focus:outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={isShipLoading !== null}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-black text-xs font-bold font-mono px-6 py-2.5 rounded-sm uppercase tracking-wider"
                >
                  {isShipLoading ? 'Processing Dispatch...' : 'Fulfill Outbound Shipment'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Details and Actions Section */}
      <div className="bg-[#111111] border border-[#222222] rounded-sm overflow-hidden">
        {/* Section Tabs Bar */}
        <div className="flex border-b border-[#222222] bg-[#0C0C0C] px-6 py-4 justify-between items-center flex-wrap gap-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveDetailsTab('inventory')}
              className={`text-xs font-mono font-bold uppercase tracking-wider pb-1.5 transition-colors border-b-2 ${
                activeDetailsTab === 'inventory' 
                  ? 'border-amber-400 text-amber-400' 
                  : 'border-transparent text-[#666666] hover:text-white'
              }`}
            >
              Inventory stock & Alerts ({inventory.length})
            </button>
            <button
              onClick={() => setActiveDetailsTab('shipments')}
              className={`text-xs font-mono font-bold uppercase tracking-wider pb-1.5 transition-colors border-b-2 ${
                activeDetailsTab === 'shipments' 
                  ? 'border-blue-400 text-blue-400' 
                  : 'border-transparent text-[#666666] hover:text-white'
              }`}
            >
              Logistics Shipments ({shipments.length})
            </button>
            <button
              onClick={() => setActiveDetailsTab('orders')}
              className={`text-xs font-mono font-bold uppercase tracking-wider pb-1.5 transition-colors border-b-2 ${
                activeDetailsTab === 'orders' 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-[#666666] hover:text-white'
              }`}
            >
              Active Order pipeline ({orders.length})
            </button>
          </div>

          <div>
            {activeDetailsTab === 'inventory' && (
              <button 
                onClick={() => setIsAddInvOpen(!isAddInvOpen)}
                className="text-[9px] uppercase tracking-widest font-extrabold bg-[#1A1A1A] border border-[#222222] hover:bg-white hover:text-black hover:border-white text-white px-3 py-1.5 rounded-sm transition-colors flex items-center"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add New Part
              </button>
            )}
            {activeDetailsTab === 'shipments' && (
              <button 
                onClick={() => setIsAddShpOpen(!isAddShpOpen)}
                className="text-[9px] uppercase tracking-widest font-extrabold bg-[#1A1A1A] border border-[#222222] hover:bg-white hover:text-black hover:border-white text-white px-3 py-1.5 rounded-sm transition-colors flex items-center"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Schedule delivery
              </button>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* INVENTORY TAB */}
            {activeDetailsTab === 'inventory' && (
              <motion.div
                key="inventory-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    Parts monitored and flagged under safe thresholds
                  </span>
                  <span className="text-xs text-[#888888]">
                    Depleted Alerts: <span className="text-amber-400 font-bold">{inventoryAlertsCount}</span>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#222222] text-[10px] font-mono uppercase text-[#555555]">
                        <th className="pb-3 font-semibold">Part Description / SKU</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Current Stock</th>
                        <th className="pb-3 font-semibold">Warehouse Location</th>
                        <th className="pb-3 font-semibold text-right">Fulfillment Restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {inventory.map(item => {
                        const isAlert = item.stock <= item.minStock;
                        return (
                          <tr key={item.id} className="text-xs hover:bg-white/[1%] transition-colors">
                            <td className="py-4">
                              <div className="font-bold text-white flex items-center">
                                {item.name}
                                {isAlert && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-mono font-bold uppercase flex items-center shrink-0">
                                    <AlertTriangle className="w-2.5 h-2.5 mr-1 inline" /> Below {item.minStock} min
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-[#555555] mt-1">SKU: {item.sku}</div>
                            </td>
                            <td className="py-4 text-[#888888]">{item.category}</td>
                            <td className="py-4">
                              <span className={`font-mono font-bold text-sm ${isAlert ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {item.stock}
                              </span>
                              <span className="text-[10px] text-[#555555] ml-1">/ {item.minStock} min</span>
                            </td>
                            <td className="py-4 text-[#888888] font-mono">{item.location}</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleRestock(item.id, 5)}
                                  disabled={isRestockLoading === item.id}
                                  className="text-[10px] uppercase font-bold font-mono tracking-widest bg-white/5 border border-white/10 hover:bg-white hover:text-black px-2.5 py-1.5 rounded-sm text-white disabled:opacity-50 transition-colors"
                                >
                                  {isRestockLoading === item.id ? '...' : '+5'}
                                </button>
                                <button
                                  onClick={() => handleRestock(item.id, 20)}
                                  disabled={isRestockLoading === item.id}
                                  className="text-[10px] uppercase font-bold font-mono tracking-widest bg-amber-500/10 border border-amber-500/20 hover:bg-amber-400 hover:text-black px-2.5 py-1.5 rounded-sm text-amber-400 disabled:opacity-50 transition-all"
                                >
                                  {isRestockLoading === item.id ? '...' : '+20'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SHIPMENTS TAB */}
            {activeDetailsTab === 'shipments' && (
              <motion.div
                key="shipments-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    Courier deliveries, inbound units, & dispatch logistics
                  </span>
                  <span className="text-xs text-[#888888]">
                    Pending Packages: <span className="text-blue-400 font-bold">{pendingShipmentsCount}</span>
                  </span>
                </div>

                <div className="space-y-4">
                  {shipments.length === 0 ? (
                    <div className="text-center py-12 text-[#444444] font-mono text-xs uppercase tracking-widest">
                      No logistics shipments currently catalogued.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shipments.map(shipment => {
                        const isPending = shipment.status === 'Pending';
                        return (
                          <div key={shipment.id} className="bg-[#0A0A0A] p-5 border border-[#222222] rounded-sm hover:border-[#333333] transition-colors flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold text-white">{shipment.title}</h4>
                                <span className={`px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase ${
                                  isPending 
                                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                }`}>
                                  {shipment.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#888888] pt-2">
                                <div>CARRIER: <span className="text-white font-semibold">{shipment.carrier}</span></div>
                                <div>ID: <span className="text-white">{shipment.id}</span></div>
                                {shipment.trackingNumber && (
                                  <div className="col-span-2">
                                    TRACKING CODE: <span className="text-emerald-400 font-bold select-all">{shipment.trackingNumber}</span>
                                  </div>
                                )}
                                {shipment.estimatedDelivery && (
                                  <div className="col-span-2">
                                    ESTIMATED ARRIVAL: <span className="text-white font-bold">{shipment.estimatedDelivery}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isPending && (
                              <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex justify-end">
                                <button
                                  onClick={() => handleOpenShipForm(shipment.id, shipment.carrier)}
                                  className="text-[9px] uppercase font-bold font-mono tracking-widest bg-blue-500/10 border border-blue-500/20 hover:bg-blue-400 hover:text-black px-3.5 py-1.5 rounded-sm text-blue-400 transition-all flex items-center"
                                >
                                  <Truck className="w-3.5 h-3.5 mr-1" /> Dispatch Outward
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeDetailsTab === 'orders' && (
              <motion.div
                key="orders-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    Real-time view of field jobs and tech dispatch statuses
                  </span>
                  <span className="text-xs text-[#888888]">
                    In Pipeline: <span className="text-emerald-400 font-bold">{activeOrdersCount}</span>
                  </span>
                </div>

                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-[#444444] font-mono text-xs uppercase tracking-widest">
                      No active operational work orders.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#222222] border border-[#222222] rounded-sm bg-[#0A0A0A] overflow-hidden">
                      {orders.map(order => {
                        const isCompleted = order.stage === 'Completed';
                        return (
                          <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[1%] transition-colors">
                            <div className="space-y-1 max-w-xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-extrabold text-white">{order.title}</span>
                                <span className="text-[10px] font-mono text-slate-500">•</span>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">{formatCurrency(order.value)}</span>
                                <span className={`px-2 py-0.2 rounded-sm text-[8px] font-mono uppercase tracking-wider border ${
                                  isCompleted 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>
                                  {order.stage}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-1">{order.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-[#555555] pt-1">
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {order.address}</span>
                                <span>•</span>
                                <span>TECH: <span className="text-[#888888] font-bold">{order.workerName || 'UNASSIGNED'}</span></span>
                              </div>
                            </div>

                            <div className="text-[10px] font-mono text-[#555555] text-left md:text-right shrink-0">
                              <span>CREATED AT</span>
                              <div className="text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
