import { Company } from '../types';

export const FEATURE_TIERS: Record<string, 'free' | 'growth' | 'scale'> = {
  // Free Tier Features
  order_intake: 'free',
  production_tracking: 'free',
  delivery_tracking: 'free',
  basic_invoice: 'free',
  supplier_list: 'free',

  // Growth Tier Features
  ai_copilot: 'growth',
  gst_invoice: 'growth',
  upi_payment_collection: 'growth',
  automated_reminders: 'growth',
  public_trust_score: 'growth',

  // Scale Tier Features
  supplier_spend_intelligence: 'scale',
  multi_factory_management: 'scale',
  worker_supplier_performance_analytics: 'scale',
};

export function getFeatureRequiredTier(featureKey: string): 'free' | 'growth' | 'scale' {
  return FEATURE_TIERS[featureKey] || 'free';
}

export interface AccessResult {
  hasAccess: boolean;
  requiredTier: 'free' | 'growth' | 'scale';
  status: 'active' | 'past_due' | 'canceled' | 'none';
}

export function hasFeatureAccess(company: Company | null, featureKey: string): AccessResult {
  const requiredTier = getFeatureRequiredTier(featureKey);
  
  if (requiredTier === 'free') {
    return { hasAccess: true, requiredTier, status: 'active' };
  }

  if (!company || !company.subscription) {
    return { hasAccess: false, requiredTier, status: 'none' };
  }

  const { tier, status } = company.subscription;

  // Gated features are soft-locked if subscription status is past_due or canceled
  if (status !== 'active') {
    return { hasAccess: false, requiredTier, status };
  }

  // Tier Hierarchy Evaluation
  if (tier === 'scale') {
    return { hasAccess: true, requiredTier, status };
  }

  if (tier === 'growth' && requiredTier === 'growth') {
    return { hasAccess: true, requiredTier, status };
  }

  return { hasAccess: false, requiredTier, status };
}

export const TIER_PRICING = {
  free: {
    name: 'Free Starter',
    price: 0,
    period: 'month',
    features: [
      'Order intake (manual & self-serve)',
      'Production stage tracking',
      'Worker task assignment',
      'Live delivery tracking with halt alerts',
      'Basic invoices (plain, non-GST)',
      'Basic supplier list & manual requests',
    ]
  },
  growth: {
    name: 'Growth Core',
    price: 999, // ₹999/mo
    period: 'month',
    features: [
      'Everything in Free',
      'AI Operations Copilot (Risk Scoring & Actions)',
      'GST-aware invoicing',
      'UPI/Razorpay payment collection',
      'Automated payment reminders',
      'Public Trust Score page',
    ]
  },
  scale: {
    name: 'Enterprise Scale',
    price: 1999, // ₹1999/mo
    period: 'month',
    features: [
      'Everything in Growth',
      'Supplier Spend Intelligence',
      'Multi-factory management',
      'Worker/Supplier performance analytics',
    ]
  }
};
