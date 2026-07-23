import { Company, UserProfile, Domain, ServiceOrder, ActivityLog, InventoryItem, Shipment, Subscription, GstInvoice, TrustScoreRecord, SpendIntelligenceRecord, OrderStage, StageTemplate, ChecklistItem } from '../types';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Interfaces for our simulated database state
interface DbState {
  companies: Company[];
  users: UserProfile[];
  domains: Domain[];
  orders: ServiceOrder[];
  activeSessions: string[]; // List of userIds currently logged in
  activityLogs: ActivityLog[];
  inventoryItems: InventoryItem[];
  shipments: Shipment[];
  gstInvoices?: GstInvoice[];
  trustScoreRecords?: TrustScoreRecord[];
  spendIntelligenceRecords?: SpendIntelligenceRecord[];
  templates?: StageTemplate[];
}

const STORAGE_KEY = 'vendoros_simulated_db';

const DEFAULT_STATE: DbState = {
  companies: [
    {
      id: 'comp_apex',
      name: 'Apex Plumbing & Co',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString(),
      subscription: {
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 14).toISOString(), // 14 days from now
        razorpaySubscriptionId: 'sub_APEX123_sim',
        updatedAt: new Date().toISOString()
      },
      minOrderValue: 2000
    },
    {
      id: 'comp_volt',
      name: 'VoltLine Electrical',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 45).toISOString(),
      subscription: {
        tier: 'growth',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 12).toISOString(), // 12 days from now
        razorpaySubscriptionId: 'sub_VOLT456_sim',
        updatedAt: new Date().toISOString()
      },
      minOrderValue: 1500
    },
    {
      id: 'comp_rapid',
      name: 'Rapid HVAC Solutions',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 60).toISOString(),
      subscription: {
        tier: 'scale',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 28).toISOString(), // 28 days from now
        razorpaySubscriptionId: 'sub_RAPID789_sim',
        updatedAt: new Date().toISOString()
      },
      minOrderValue: 3000
    }
  ],
  users: [
    { id: 'usr_alice', name: 'Alice Owner', email: 'alice@apex.com', role: 'Owner', companyId: 'comp_apex', createdAt: new Date().toISOString() },
    { id: 'usr_bob', name: 'Bob Manager', email: 'bob@apex.com', role: 'Manager', companyId: 'comp_apex', createdAt: new Date().toISOString() },
    { id: 'usr_charlie', name: 'Charlie Worker', email: 'charlie@apex.com', role: 'Worker', companyId: 'comp_apex', createdAt: new Date().toISOString() },
    { id: 'usr_volt_owner', name: 'Victor Volt', email: 'victor@volt.com', role: 'Owner', companyId: 'comp_volt', createdAt: new Date().toISOString() },
    { id: 'usr_customer', name: 'Dave Customer', email: 'dave@gmail.com', role: 'Customer', createdAt: new Date().toISOString() }
  ],
  domains: [
    { id: 'dom_1', companyId: 'comp_apex', name: 'Residential Plumbing', type: 'Plumbing', status: 'Active', createdAt: new Date().toISOString() },
    { id: 'dom_2', companyId: 'comp_apex', name: 'Commercial Sewers', type: 'Sewer/Drain', status: 'Active', createdAt: new Date().toISOString() },
    { id: 'dom_3', companyId: 'comp_apex', name: 'Emergency Leak Repair', type: 'Plumbing', status: 'Inactive', createdAt: new Date().toISOString() },
    { id: 'dom_4', companyId: 'comp_volt', name: 'High-Voltage Wiring', type: 'Electrical', status: 'Active', createdAt: new Date().toISOString() }
  ],
  orders: [
    {
      id: 'ord_1',
      companyId: 'comp_apex',
      title: 'Kitchen Pipe Burst Repair',
      description: 'The pipe under the main kitchen sink burst, causing minor flooding. Immediate response needed.',
      customerId: 'usr_customer',
      customerName: 'Dave Customer',
      managerId: 'usr_bob',
      managerName: 'Bob Manager',
      workerId: 'usr_charlie',
      workerName: 'Charlie Worker',
      stage: 'In Progress',
      address: '123 Pinecrest Avenue, Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      value: 350,
      belowMinimumThreshold: true,
      thresholdApprovalStatus: 'Approved',
      stages: [
        {
          id: 'stg_1_1',
          orderId: 'ord_1',
          title: 'Initial Damage Assessment',
          domainId: 'dom_1',
          domainName: 'Residential Plumbing',
          assignedWorkerId: 'usr_charlie',
          assignedWorkerName: 'Charlie Worker',
          status: 'Completed',
          checklist: [
            { id: 'chk_1', text: 'Shut off water supply valve', completed: true },
            { id: 'chk_2', text: 'Inspect pipe corrosion levels', completed: true }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 'stg_1_2',
          orderId: 'ord_1',
          title: 'Pipe Fitting Replacement',
          domainId: 'dom_1',
          domainName: 'Residential Plumbing',
          assignedWorkerId: 'usr_charlie',
          assignedWorkerName: 'Charlie Worker',
          status: 'In Progress',
          checklist: [
            { id: 'chk_3', text: 'Solder joint and replace copper pipe segment', completed: false },
            { id: 'chk_4', text: 'Turn on water and check for leaks', completed: false }
          ],
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'ord_2',
      companyId: 'comp_apex',
      title: 'Water Heater Annual Service',
      description: 'Inspect heating element, flush the tank, and check for scaling.',
      customerId: 'usr_customer',
      customerName: 'Dave Customer',
      stage: 'Unscheduled',
      address: '742 Evergreen Terrace, Seattle, WA',
      latitude: 47.6101,
      longitude: -122.3421,
      value: 150,
      belowMinimumThreshold: true,
      thresholdApprovalStatus: 'Pending',
      stages: [],
      createdAt: new Date().toISOString()
    }
  ],
  templates: [
    {
      id: 'tpl_1',
      managerId: 'usr_bob',
      companyId: 'comp_apex',
      title: 'Standard Pipe Leak Protocol',
      domainId: 'dom_1',
      domainName: 'Residential Plumbing',
      checklist: ['Locate leak origin', 'Turn off isolation valve', 'Replace worn washer/joint', 'Pressure test pipe line'],
      createdAt: new Date().toISOString()
    }
  ],
  activeSessions: [],
  activityLogs: [
    {
      id: 'log_init_1',
      userId: 'usr_charlie',
      userName: 'Charlie Worker',
      userRole: 'Worker',
      companyId: 'comp_apex',
      action: 'Login',
      details: 'Worker Charlie logged in from mobile client.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
    },
    {
      id: 'log_init_2',
      userId: 'usr_alice',
      userName: 'Alice Owner',
      userRole: 'Owner',
      companyId: 'comp_apex',
      action: 'Profile Update',
      details: 'Updated contact phone to +91 98765 43210.',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: 'log_init_3',
      userId: 'usr_bob',
      userName: 'Bob Manager',
      userRole: 'Manager',
      companyId: 'comp_apex',
      action: 'Login',
      details: 'Manager Bob authenticated and logged in.',
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() // 5 hours ago
    },
    {
      id: 'log_init_4',
      userId: 'usr_alice',
      userName: 'Alice Owner',
      userRole: 'Owner',
      companyId: 'comp_apex',
      action: 'User Registered',
      details: 'Registered company "Apex Plumbing & Co" and became Owner.',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 3).toISOString() // 3 days ago
    }
  ],
  inventoryItems: [
    {
      id: 'inv_1',
      companyId: 'comp_apex',
      name: '1/2-inch Copper Tubing (10ft)',
      sku: 'COP-12-10',
      stock: 5,
      minStock: 25,
      location: 'Aisle 4, Shelf B',
      category: 'Pipes & Fittings'
    },
    {
      id: 'inv_2',
      companyId: 'comp_apex',
      name: 'Commercial PVC Cement Solvent',
      sku: 'PVC-CEM-QT',
      stock: 2,
      minStock: 12,
      location: 'Flammables Cabinet A',
      category: 'Adhesives'
    },
    {
      id: 'inv_3',
      companyId: 'comp_apex',
      name: 'Heavy-Duty Brass Sump Pump 1/2 HP',
      sku: 'PMP-BR-12',
      stock: 14,
      minStock: 5,
      location: 'Aisle 12, Shelf D',
      category: 'Pumps'
    },
    {
      id: 'inv_4',
      companyId: 'comp_apex',
      name: 'Gas Water Heater Thermostat',
      sku: 'TSTAT-GAS-WH',
      stock: 3,
      minStock: 8,
      location: 'Parts Bin 23',
      category: 'Controls'
    },
    {
      id: 'inv_5',
      companyId: 'comp_apex',
      name: 'Professional Drain Cleaning Snake (50ft)',
      sku: 'SNK-PRO-50',
      stock: 8,
      minStock: 4,
      location: 'Aisle 1, Tool Locker 3',
      category: 'Tools'
    }
  ],
  shipments: [
    {
      id: 'shp_1',
      companyId: 'comp_apex',
      title: 'Carrier HVAC Replacement Parts',
      carrier: 'FedEx Express',
      status: 'Pending',
      createdAt: new Date(Date.now() - 1000 * 3600 * 18).toISOString() // 18 hours ago
    },
    {
      id: 'shp_2',
      companyId: 'comp_apex',
      title: 'Bulk Box of 3/4" Brass Coupling Elbows (x100)',
      carrier: 'UPS Ground',
      status: 'Pending',
      createdAt: new Date(Date.now() - 1000 * 3600 * 4).toISOString() // 4 hours ago
    },
    {
      id: 'shp_3',
      companyId: 'comp_apex',
      title: 'Digital Smart Pressure Gauge Prototype',
      carrier: 'DHL Express',
      trackingNumber: 'DHL-8472-9102',
      status: 'Shipped',
      estimatedDelivery: new Date(Date.now() + 1000 * 3600 * 48).toISOString().split('T')[0], // 2 days from now
      createdAt: new Date(Date.now() - 1000 * 3600 * 48).toISOString() // 2 days ago
    }
  ],
  gstInvoices: [
    {
      id: 'gst_1',
      companyId: 'comp_apex',
      orderId: 'ord_1',
      customerName: 'Dave Customer',
      baseAmount: 350,
      cgst: 31.5,
      sgst: 31.5,
      igst: 0,
      totalAmount: 413,
      invoiceNumber: 'INV-APEX-2026-001',
      status: 'Paid',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 5).toISOString()
    },
    {
      id: 'gst_2',
      companyId: 'comp_apex',
      orderId: 'ord_2',
      customerName: 'Dave Customer',
      baseAmount: 150,
      cgst: 13.5,
      sgst: 13.5,
      igst: 0,
      totalAmount: 177,
      invoiceNumber: 'INV-APEX-2026-002',
      status: 'Unpaid',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 1).toISOString()
    },
    {
      id: 'gst_3',
      companyId: 'comp_volt',
      orderId: 'ord_volt_1',
      customerName: 'Sarah Jenkins',
      baseAmount: 1200,
      cgst: 108,
      sgst: 108,
      igst: 0,
      totalAmount: 1416,
      invoiceNumber: 'INV-VOLT-2026-001',
      status: 'Paid',
      createdAt: new Date(Date.now() - 1000 * 3600 * 24 * 15).toISOString()
    }
  ],
  trustScoreRecords: [
    {
      id: 'ts_1',
      companyId: 'comp_apex',
      score: 84,
      factors: {
        orderCompletionRate: 90,
        inventoryLevelRating: 75,
        workerActivityScore: 88
      },
      updatedAt: new Date(Date.now() - 1000 * 3600 * 12).toISOString()
    },
    {
      id: 'ts_2',
      companyId: 'comp_volt',
      score: 95,
      factors: {
        orderCompletionRate: 98,
        inventoryLevelRating: 92,
        workerActivityScore: 95
      },
      updatedAt: new Date(Date.now() - 1000 * 3600 * 8).toISOString()
    },
    {
      id: 'ts_3',
      companyId: 'comp_rapid',
      score: 72,
      factors: {
        orderCompletionRate: 68,
        inventoryLevelRating: 80,
        workerActivityScore: 70
      },
      updatedAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString()
    }
  ],
  spendIntelligenceRecords: [
    {
      id: 'sp_1',
      companyId: 'comp_apex',
      month: 'June 2026',
      category: 'Copper Pipes',
      amount: 45000,
      changePercent: 12.5,
      suggestedAction: 'Consolidate orders to bulk supplier to save ₹4,500 on delivery.'
    },
    {
      id: 'sp_2',
      companyId: 'comp_apex',
      month: 'June 2026',
      category: 'Valves & Fittings',
      amount: 22000,
      changePercent: -5.2,
      suggestedAction: 'No immediate action required. Maintain current supply channel.'
    },
    {
      id: 'sp_3',
      companyId: 'comp_rapid',
      month: 'June 2026',
      category: 'HVAC Compressors',
      amount: 185000,
      changePercent: 24.8,
      suggestedAction: 'Slightly elevated. Negotiate quarterly volume agreement with VendorA.'
    }
  ]
};

// Simulated store class
class SimulatedStore {
  private state: DbState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.load();
  }

  private load(): DbState {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Ensure schemas align or merge defaults
        if (!parsed.inventoryItems) parsed.inventoryItems = DEFAULT_STATE.inventoryItems;
        if (!parsed.shipments) parsed.shipments = DEFAULT_STATE.shipments;
        return { ...DEFAULT_STATE, ...parsed };
      } catch (e) {
        console.error('Failed to parse simulated DB, resetting to defaults', e);
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  private pushLog(log: ActivityLog): void {
    if (!this.state.activityLogs) {
      this.state.activityLogs = [];
    }
    this.state.activityLogs.unshift(log);
  }

  public getActivityLogs(companyId?: string): ActivityLog[] {
    if (!this.state.activityLogs) {
      this.state.activityLogs = [];
    }
    if (companyId) {
      return this.state.activityLogs.filter(log => log.companyId === companyId);
    }
    return this.state.activityLogs;
  }

  // --- Inventory & Shipments API ---
  public getInventory(companyId: string): InventoryItem[] {
    if (!this.state.inventoryItems) {
      this.state.inventoryItems = [];
    }
    return this.state.inventoryItems.filter(item => item.companyId === companyId);
  }

  public getShipments(companyId: string): Shipment[] {
    if (!this.state.shipments) {
      this.state.shipments = [];
    }
    return this.state.shipments.filter(shipment => shipment.companyId === companyId);
  }

  public restockInventoryItem(itemId: string, quantity: number, performingUserId: string): void {
    if (!this.state.inventoryItems) this.state.inventoryItems = [];
    const item = this.state.inventoryItems.find(i => i.id === itemId);
    if (item) {
      const oldStock = item.stock;
      item.stock += quantity;
      
      const actor = this.state.users.find(u => u.id === performingUserId);
      if (actor) {
        this.pushLog({
          id: 'log_' + generateId(),
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          companyId: actor.companyId,
          action: 'Inventory Update',
          details: `Restocked "${item.name}" by +${quantity} units (Stock: ${oldStock} -> ${item.stock}).`,
          createdAt: new Date().toISOString()
        });
      }
      this.save();
    }
  }

  public updateShipmentStatus(
    shipmentId: string, 
    status: Shipment['status'], 
    trackingNumber?: string, 
    carrier?: string,
    performingUserId?: string
  ): void {
    if (!this.state.shipments) this.state.shipments = [];
    const shipment = this.state.shipments.find(s => s.id === shipmentId);
    if (shipment) {
      const oldStatus = shipment.status;
      shipment.status = status;
      if (trackingNumber) shipment.trackingNumber = trackingNumber.trim();
      if (carrier) shipment.carrier = carrier.trim();
      if (status === 'Shipped' && !shipment.estimatedDelivery) {
        shipment.estimatedDelivery = new Date(Date.now() + 1000 * 3600 * 72).toISOString().split('T')[0]; // 3 days
      }

      if (performingUserId) {
        const actor = this.state.users.find(u => u.id === performingUserId);
        if (actor) {
          this.pushLog({
            id: 'log_' + generateId(),
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            companyId: actor.companyId,
            action: 'Shipment Update',
            details: `Updated shipment "${shipment.title}" status to "${status}" (Carrier: ${shipment.carrier}, Tracking: ${shipment.trackingNumber || 'N/A'}).`,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.save();
    }
  }

  public addInventoryItem(
    companyId: string,
    name: string,
    sku: string,
    stock: number,
    minStock: number,
    location: string,
    category: string,
    performingUserId: string
  ): void {
    if (!this.state.inventoryItems) this.state.inventoryItems = [];
    const newItem: InventoryItem = {
      id: 'inv_' + generateId(),
      companyId,
      name: name.trim(),
      sku: sku.toUpperCase().trim(),
      stock,
      minStock,
      location: location.trim(),
      category: category.trim()
    };
    this.state.inventoryItems.push(newItem);

    const actor = this.state.users.find(u => u.id === performingUserId);
    if (actor) {
      this.pushLog({
        id: 'log_' + generateId(),
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        companyId: actor.companyId,
        action: 'Inventory Update',
        details: `Added new inventory item "${newItem.name}" (SKU: ${newItem.sku}, Stock: ${stock}, Min: ${minStock}).`,
        createdAt: new Date().toISOString()
      });
    }
    this.save();
  }

  public addShipment(
    companyId: string,
    title: string,
    carrier: string,
    performingUserId: string
  ): void {
    if (!this.state.shipments) this.state.shipments = [];
    const newShipment: Shipment = {
      id: 'shp_' + generateId(),
      companyId,
      title: title.trim(),
      carrier: carrier.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.state.shipments.push(newShipment);

    const actor = this.state.users.find(u => u.id === performingUserId);
    if (actor) {
      this.pushLog({
        id: 'log_' + generateId(),
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        companyId: actor.companyId,
        action: 'Shipment Update',
        details: `Scheduled new pending shipment "${newShipment.title}" via ${carrier}.`,
        createdAt: new Date().toISOString()
      });
    }
    this.save();
  }

  // --- Auth & Users API ---
  public getUsers(): UserProfile[] {
    return this.state.users;
  }

  public getCompanies(): Company[] {
    return this.state.companies;
  }

  public isCompanyNameAvailable(name: string): boolean {
    if (!name.trim()) return false;
    const normalized = name.trim().toLowerCase();
    return !this.state.companies.some(c => c.name.toLowerCase() === normalized);
  }

  public registerOwner(userName: string, email: string, companyName: string): { user: UserProfile; company: Company } {
    // 1. Create Company
    const companyId = 'comp_' + generateId();
    const company: Company = {
      id: companyId,
      name: companyName.trim(),
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(), // 30 days
        razorpaySubscriptionId: 'sub_' + generateId() + '_sim',
        updatedAt: new Date().toISOString()
      }
    };

    // 2. Create User
    const userId = 'usr_' + generateId();
    const user: UserProfile = {
      id: userId,
      name: userName.trim(),
      email: email.trim().toLowerCase(),
      role: 'Owner',
      companyId: companyId,
      createdAt: new Date().toISOString()
    };

    this.state.companies.push(company);
    this.state.users.push(user);
    this.state.activeSessions.push(userId);
    this.pushLog({
      id: 'log_' + generateId(),
      userId,
      userName: userName.trim(),
      userRole: 'Owner',
      companyId,
      action: 'User Registered',
      details: `Registered company "${companyName.trim()}" and became Owner.`,
      createdAt: new Date().toISOString()
    });
    this.save();

    return { user, company };
  }

  public registerManagerOrWorker(userName: string, email: string, companyId: string, role: 'Manager' | 'Worker'): UserProfile {
    const userId = 'usr_' + generateId();
    const user: UserProfile = {
      id: userId,
      name: userName.trim(),
      email: email.trim().toLowerCase(),
      role,
      companyId,
      createdAt: new Date().toISOString()
    };

    this.state.users.push(user);
    this.state.activeSessions.push(userId);
    this.pushLog({
      id: 'log_' + generateId(),
      userId,
      userName: userName.trim(),
      userRole: role,
      companyId,
      action: 'User Registered',
      details: `Registered as ${role}.`,
      createdAt: new Date().toISOString()
    });
    this.save();

    return user;
  }

  public registerCustomer(userName: string, email: string, phone?: string): UserProfile {
    const userId = 'usr_' + generateId();
    const user: UserProfile = {
      id: userId,
      name: userName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      role: 'Customer',
      createdAt: new Date().toISOString()
    };

    this.state.users.push(user);
    this.state.activeSessions.push(userId);
    this.pushLog({
      id: 'log_' + generateId(),
      userId,
      userName: userName.trim(),
      userRole: 'Customer',
      action: 'User Registered',
      details: `Registered Customer profile.`,
      createdAt: new Date().toISOString()
    });
    this.save();

    return user;
  }

  public login(email: string): UserProfile | null {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      if (!this.state.activeSessions.includes(user.id)) {
        this.state.activeSessions.push(user.id);
      }
      this.pushLog({
        id: 'log_' + generateId(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        companyId: user.companyId,
        action: 'Login',
        details: `User logged into portal.`,
        createdAt: new Date().toISOString()
      });
      this.save();
      return user;
    }
    return null;
  }

  public logout(userId: string): void {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.pushLog({
        id: 'log_' + generateId(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        companyId: user.companyId,
        action: 'Logout',
        details: `User signed out from portal.`,
        createdAt: new Date().toISOString()
      });
    }
    this.state.activeSessions = this.state.activeSessions.filter(id => id !== userId);
    this.save();
  }

  public isSessionActive(userId: string): boolean {
    return this.state.activeSessions.includes(userId);
  }

  public updateUserProfile(userId: string, name: string, phone?: string): void {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      const oldName = user.name;
      user.name = name.trim();
      user.phone = phone?.trim();
      
      this.pushLog({
        id: 'log_' + generateId(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        companyId: user.companyId,
        action: 'Profile Update',
        details: `Updated name from "${oldName}" to "${user.name}" (Phone: ${phone?.trim() || 'None'}).`,
        createdAt: new Date().toISOString()
      });
      this.save();
    }
  }

  public updateUserRoleAndCompany(userId: string, role?: 'Owner' | 'Manager' | 'Worker' | 'Customer', companyId?: string): void {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      if (role) {
        user.role = role;
      }
      if (companyId !== undefined) {
        user.companyId = companyId || undefined;
      }
      this.save();
    }
  }

  public revokeOtherSessions(currentUserId: string): void {
    const user = this.state.users.find(u => u.id === currentUserId);
    if (user) {
      this.pushLog({
        id: 'log_' + generateId(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        companyId: user.companyId,
        action: 'Security Update',
        details: `Revoked all other active sessions/tokens.`,
        createdAt: new Date().toISOString()
      });
    }
    this.state.activeSessions = this.state.activeSessions.filter(id => id === currentUserId);
    this.save();
  }

  public removeUser(userId: string): void {
    // Simulated Backend Trigger: Delete user from database and revoke login session
    const targetUser = this.state.users.find(u => u.id === userId);
    if (targetUser) {
      this.pushLog({
        id: 'log_' + generateId(),
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: targetUser.role,
        companyId: targetUser.companyId,
        action: 'Role Revoked',
        details: `Removed user "${targetUser.name}" with role "${targetUser.role}" from company.`,
        createdAt: new Date().toISOString()
      });
    }
    this.state.users = this.state.users.filter(u => u.id !== userId);
    this.state.activeSessions = this.state.activeSessions.filter(id => id !== userId);
    this.save();
  }

  // --- Domains CRUD API ---
  public getDomains(companyId: string): Domain[] {
    return this.state.domains.filter(d => d.companyId === companyId);
  }

  public addDomain(companyId: string, name: string, type: string, status: 'Active' | 'Inactive', performingUserId?: string): Domain {
    const domain: Domain = {
      id: 'dom_' + generateId(),
      companyId,
      name: name.trim(),
      type: type.trim(),
      status,
      createdAt: new Date().toISOString()
    };
    this.state.domains.push(domain);
    if (performingUserId) {
      const actor = this.state.users.find(u => u.id === performingUserId);
      if (actor) {
        this.pushLog({
          id: 'log_' + generateId(),
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          companyId: actor.companyId,
          action: 'Domain Action',
          details: `Created operational domain "${name.trim()}".`,
          createdAt: new Date().toISOString()
        });
      }
    }
    this.save();
    return domain;
  }

  public updateDomain(id: string, name: string, type: string, status: 'Active' | 'Inactive', performingUserId?: string): void {
    const domain = this.state.domains.find(d => d.id === id);
    if (domain) {
      domain.name = name.trim();
      domain.type = type.trim();
      domain.status = status;
      if (performingUserId) {
        const actor = this.state.users.find(u => u.id === performingUserId);
        if (actor) {
          this.pushLog({
            id: 'log_' + generateId(),
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            companyId: actor.companyId,
            action: 'Domain Action',
            details: `Updated domain "${name.trim()}" (Status: ${status}).`,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.save();
    }
  }

  public deleteDomain(id: string, performingUserId?: string): void {
    const domain = this.state.domains.find(d => d.id === id);
    if (domain && performingUserId) {
      const actor = this.state.users.find(u => u.id === performingUserId);
      if (actor) {
        this.pushLog({
          id: 'log_' + generateId(),
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          companyId: actor.companyId,
          action: 'Domain Action',
          details: `Deleted operational domain "${domain.name}".`,
          createdAt: new Date().toISOString()
        });
      }
    }
    this.state.domains = this.state.domains.filter(d => d.id !== id);
    this.save();
  }

  // --- Service Orders API ---
  public getOrders(companyId?: string, customerId?: string, workerId?: string): ServiceOrder[] {
    let list = this.state.orders;
    if (companyId) {
      list = list.filter(o => o.companyId === companyId);
    }
    if (customerId) {
      list = list.filter(o => o.customerId === customerId);
    }
    if (workerId) {
      list = list.filter(o => o.workerId === workerId);
    }
    return list;
  }

  public addOrder(order: Omit<ServiceOrder, 'id' | 'createdAt'>): ServiceOrder {
    const company = this.state.companies.find(c => c.id === order.companyId);
    const minVal = company?.minOrderValue ?? 2000;
    const isBelow = order.value < minVal;

    const newOrder: ServiceOrder = {
      ...order,
      id: 'ord_' + generateId(),
      belowMinimumThreshold: isBelow,
      thresholdApprovalStatus: isBelow ? 'Pending' : undefined,
      stages: order.stages || [],
      createdAt: new Date().toISOString()
    };
    this.state.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStage(orderId: string, stage: ServiceOrder['stage'], performingUserId?: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.stage = stage;
      if (stage === 'Completed') {
        order.completedAt = new Date().toISOString();
      } else {
        delete order.completedAt;
      }
      if (performingUserId) {
        const actor = this.state.users.find(u => u.id === performingUserId);
        if (actor) {
          this.pushLog({
            id: 'log_' + generateId(),
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            companyId: actor.companyId,
            action: 'Order Stage',
            details: `Transitioned order "${order.title}" stage to "${stage}".`,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.save();
    }
  }

  public assignWorker(orderId: string, workerId?: string, workerName?: string, performingUserId?: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.workerId = workerId;
      order.workerName = workerName;
      if (workerId) {
        order.stage = 'Scheduled';
      } else {
        order.stage = 'Unscheduled';
      }
      if (performingUserId) {
        const actor = this.state.users.find(u => u.id === performingUserId);
        if (actor) {
          const detailText = workerId 
            ? `Assigned order "${order.title}" to worker "${workerName}".`
            : `De-assigned worker from order "${order.title}".`;
          this.pushLog({
            id: 'log_' + generateId(),
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            companyId: actor.companyId,
            action: 'Order Assignment',
            details: detailText,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.save();
    }
  }

  public assignManager(orderId: string, managerId?: string, managerName?: string, performingUserId?: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.managerId = managerId;
      order.managerName = managerName;
      if (performingUserId) {
        const actor = this.state.users.find(u => u.id === performingUserId);
        if (actor) {
          const detailText = managerId 
            ? `Assigned order "${order.title}" to manager "${managerName}".`
            : `De-assigned manager from order "${order.title}".`;
          this.pushLog({
            id: 'log_' + generateId(),
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            companyId: actor.companyId,
            action: 'Order Manager Assignment',
            details: detailText,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.save();
    }
  }

  public approveOrRejectThreshold(orderId: string, status: 'Approved' | 'Rejected', performingUserId: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.thresholdApprovalStatus = status;
      const actor = this.state.users.find(u => u.id === performingUserId);
      if (actor) {
        this.pushLog({
          id: 'log_' + generateId(),
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          companyId: actor.companyId,
          action: 'Order Threshold',
          details: `${status} order "${order.title}" which was below the minimum value threshold.`,
          createdAt: new Date().toISOString()
        });
      }
      this.save();
    }
  }

  public addOrderStage(orderId: string, stage: Omit<OrderStage, 'id' | 'createdAt'>): OrderStage {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!order.stages) order.stages = [];

    const newStage: OrderStage = {
      ...stage,
      id: 'stg_' + generateId(),
      createdAt: new Date().toISOString()
    };
    order.stages.push(newStage);

    // If an order stage is scheduled to a worker, update order-level worker too (backward compatibility / quick views)
    if (newStage.assignedWorkerId && !order.workerId) {
      order.workerId = newStage.assignedWorkerId;
      order.workerName = newStage.assignedWorkerName;
      order.stage = 'Scheduled';
    } else if (order.stages.length > 0 && order.stage === 'Unscheduled') {
      order.stage = 'Scheduled';
    }

    this.save();
    return newStage;
  }

  public updateOrderStageDetails(orderId: string, stageId: string, updates: Partial<OrderStage>): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || !order.stages) return;
    const stage = order.stages.find(s => s.id === stageId);
    if (stage) {
      Object.assign(stage, updates);
      if (updates.status === 'Completed') {
        stage.completedAt = new Date().toISOString();
      }

      if (updates.assignedWorkerId) {
        // Propagate worker name if workerId changes
        const workerProfile = this.state.users.find(u => u.id === updates.assignedWorkerId);
        if (workerProfile) {
          stage.assignedWorkerName = workerProfile.name;
        }
        
        // Also update legacy top-level order worker if unassigned
        if (!order.workerId) {
          order.workerId = stage.assignedWorkerId;
          order.workerName = stage.assignedWorkerName;
          order.stage = 'Scheduled';
        }
      }

      // Check if all stages are completed, if so mark order as completed
      const allCompleted = order.stages.every(s => s.status === 'Completed');
      if (allCompleted && order.stages.length > 0) {
        order.stage = 'Completed';
        order.completedAt = new Date().toISOString();
      } else if (order.stages.some(s => s.status === 'In Progress')) {
        order.stage = 'In Progress';
      } else if (order.stages.some(s => s.status === 'Pending' && s.assignedWorkerId)) {
        order.stage = 'Scheduled';
      }

      this.save();
    }
  }

  public deleteOrderStage(orderId: string, stageId: string): void {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || !order.stages) return;
    order.stages = order.stages.filter(s => s.id !== stageId);
    this.save();
  }

  public getTemplates(managerId: string): StageTemplate[] {
    if (!this.state.templates) {
      this.state.templates = [];
    }
    return this.state.templates.filter(t => t.managerId === managerId);
  }

  public addTemplate(template: Omit<StageTemplate, 'id' | 'createdAt'>): StageTemplate {
    if (!this.state.templates) {
      this.state.templates = [];
    }
    const newTemplate: StageTemplate = {
      ...template,
      id: 'tpl_' + generateId(),
      createdAt: new Date().toISOString()
    };
    this.state.templates.push(newTemplate);
    this.save();
    return newTemplate;
  }

  public deleteTemplate(templateId: string, managerId: string): void {
    if (!this.state.templates) return;
    this.state.templates = this.state.templates.filter(t => !(t.id === templateId && t.managerId === managerId));
    this.save();
  }

  public updateCompanyThreshold(companyId: string, threshold: number): void {
    const company = this.state.companies.find(c => c.id === companyId);
    if (company) {
      company.minOrderValue = threshold;
      this.save();
    }
  }

  // --- Subscription & Feature APIs ---
  public updateCompanySubscription(companyId: string, subscription: Subscription, performingUserId?: string): void {
    const company = this.state.companies.find(c => c.id === companyId);
    if (company) {
      company.subscription = subscription;
      if (performingUserId) {
        const actor = this.state.users.find(u => u.id === performingUserId);
        if (actor) {
          this.pushLog({
            id: 'log_' + generateId(),
            userId: actor.id,
            userName: actor.name,
            userRole: actor.role,
            companyId: actor.companyId,
            action: 'Subscription Update',
            details: `Updated subscription tier to "${subscription.tier.toUpperCase()}" (Status: ${subscription.status}).`,
            createdAt: new Date().toISOString()
          });
        }
      }
      this.save();
    }
  }

  public getInvoices(companyId: string): GstInvoice[] {
    if (!this.state.gstInvoices) {
      this.state.gstInvoices = [];
    }
    return this.state.gstInvoices.filter(i => i.companyId === companyId);
  }

  public addInvoice(invoice: Omit<GstInvoice, 'id' | 'createdAt'>): GstInvoice {
    if (!this.state.gstInvoices) {
      this.state.gstInvoices = [];
    }
    const newInvoice: GstInvoice = {
      ...invoice,
      id: 'gst_' + generateId(),
      createdAt: new Date().toISOString()
    };
    this.state.gstInvoices.push(newInvoice);
    this.save();
    return newInvoice;
  }

  public getTrustScores(companyId: string): TrustScoreRecord[] {
    if (!this.state.trustScoreRecords) {
      this.state.trustScoreRecords = [];
    }
    return this.state.trustScoreRecords.filter(r => r.companyId === companyId);
  }

  public addTrustScore(score: Omit<TrustScoreRecord, 'id' | 'updatedAt'>): TrustScoreRecord {
    if (!this.state.trustScoreRecords) {
      this.state.trustScoreRecords = [];
    }
    const newRecord: TrustScoreRecord = {
      ...score,
      id: 'ts_' + generateId(),
      updatedAt: new Date().toISOString()
    };
    this.state.trustScoreRecords.push(newRecord);
    this.save();
    return newRecord;
  }

  public getSpendIntelligence(companyId: string): SpendIntelligenceRecord[] {
    if (!this.state.spendIntelligenceRecords) {
      this.state.spendIntelligenceRecords = [];
    }
    const records = this.state.spendIntelligenceRecords.filter(r => r.companyId === companyId);
    if (records.length > 0) {
      return records;
    }
    return [
      {
        id: `sp_def_1_${companyId}`,
        companyId,
        month: 'Current Cycle',
        category: 'Copper Pipes & Fittings',
        amount: 45000,
        changePercent: 12.5,
        suggestedAction: 'Consolidate orders to primary supplier to save 10% delivery surcharge.'
      },
      {
        id: `sp_def_2_${companyId}`,
        companyId,
        month: 'Current Cycle',
        category: 'Valves & Fasteners',
        amount: 22000,
        changePercent: -5.2,
        suggestedAction: 'Optimal pricing locked with local vendor. No leakage detected.'
      },
      {
        id: `sp_def_3_${companyId}`,
        companyId,
        month: 'Current Cycle',
        category: 'HVAC Refrigerant & Gas',
        amount: 68000,
        changePercent: 18.0,
        suggestedAction: 'Demand surge detected. Re-negotiate contract for Q3 volume rebate.'
      }
    ];
  }

  public addSpendIntelligence(record: Omit<SpendIntelligenceRecord, 'id'>): SpendIntelligenceRecord {
    if (!this.state.spendIntelligenceRecords) {
      this.state.spendIntelligenceRecords = [];
    }
    const newRecord: SpendIntelligenceRecord = {
      ...record,
      id: 'sp_' + generateId()
    };
    this.state.spendIntelligenceRecords.push(newRecord);
    this.save();
    return newRecord;
  }

  public syncUserSession(user: UserProfile, company?: Company | null): void {
    // 1. Sync User Profile
    const existingUserIndex = this.state.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const mappedUser: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt,
    };
    if (existingUserIndex >= 0) {
      this.state.users[existingUserIndex] = mappedUser;
    } else {
      this.state.users.push(mappedUser);
    }

    // 2. Sync Company Profile
    if (company) {
      const existingCompanyIndex = this.state.companies.findIndex(c => c.id === company.id);
      const mappedCompany: Company = {
        id: company.id,
        name: company.name,
        createdAt: company.createdAt,
        minOrderValue: company.minOrderValue,
        subscription: company.subscription,
      };
      if (existingCompanyIndex >= 0) {
        this.state.companies[existingCompanyIndex] = mappedCompany;
      } else {
        this.state.companies.push(mappedCompany);
      }
    }

    // 3. Mark session active to prevent auto-logouts on page refresh
    if (!this.state.activeSessions.includes(user.id)) {
      this.state.activeSessions.push(user.id);
    }

    this.save();
  }

  public clearUserLockout(userIdOrEmail: string): void {
    const userIndex = this.state.users.findIndex(
      u => u.id === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase()
    );
    if (userIndex >= 0) {
      const u = this.state.users[userIndex] as any;
      u.failedAttempts = 0;
      u.lockoutUntil = null;
      u.accountStatus = 'active';
      this.save();
    }
    // Also re-activate session if needed
    if (!this.state.activeSessions.includes(userIdOrEmail)) {
      this.state.activeSessions.push(userIdOrEmail);
    }
    this.save();
  }
}

export const dbStore = new SimulatedStore();
export default dbStore;
