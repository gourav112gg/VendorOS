export type UserRole = 'Owner' | 'Manager' | 'Worker' | 'Customer';

export interface Subscription {
  tier: 'free' | 'growth' | 'scale';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  razorpaySubscriptionId?: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  subscription?: Subscription;
  minOrderValue?: number; // Owner-configured threshold (e.g. ₹5,000 or $500)
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyId?: string; // Empty for Customers
  createdAt: string;
}

export interface Domain {
  id: string;
  companyId: string;
  name: string;
  type: string; // e.g., "Plumbing", "Electrical", "HVAC"
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface OrderStage {
  id: string;
  orderId: string;
  title: string;
  domainId: string;
  domainName: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  checklist: ChecklistItem[];
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  completedAt?: string;
}

export interface StageTemplate {
  id: string;
  managerId: string; // private to the manager
  companyId: string;
  title: string;
  domainId: string;
  domainName: string;
  checklist: string[]; // standard checklist item texts
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  companyId: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  managerId?: string; // Assigned manager who builds stages
  managerName?: string;
  workerId?: string; // Primary assigned worker (legacy/summary)
  workerName?: string;
  stage: 'Unscheduled' | 'Scheduled' | 'Dispatched' | 'In Progress' | 'Completed';
  address: string;
  latitude: number;
  longitude: number;
  value: number;
  belowMinimumThreshold?: boolean; // triggers belowMinimumThreshold
  thresholdApprovalStatus?: 'Pending' | 'Approved' | 'Rejected'; // accept/reject banner
  riskScore?: number; // stubbed
  stages?: OrderStage[]; // Stages subcollection representation
  createdAt: string;
  completedAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  companyId?: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number; // Alerts triggered when stock <= minStock
  location: string;
  category: string;
}

export interface Shipment {
  id: string;
  companyId: string;
  title: string;
  carrier: string;
  trackingNumber?: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  estimatedDelivery?: string;
  createdAt: string;
}

export interface GstInvoice {
  id: string;
  companyId: string;
  orderId: string;
  customerName: string;
  baseAmount: number;
  cgst: number; // 9% CGST
  sgst: number; // 9% SGST
  igst: number; // 0 or 18% IGST
  totalAmount: number;
  invoiceNumber: string;
  status: 'Paid' | 'Unpaid';
  createdAt: string;
}

export interface TrustScoreRecord {
  id: string;
  companyId: string;
  score: number; // 0-100
  factors: {
    orderCompletionRate: number;
    inventoryLevelRating: number;
    workerActivityScore: number;
  };
  updatedAt: string;
}

export interface SpendIntelligenceRecord {
  id: string;
  companyId: string;
  month: string;
  category: string;
  amount: number;
  changePercent: number;
  suggestedAction: string;
}


