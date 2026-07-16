import { 
  writeBatch, 
  doc, 
  runTransaction, 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Apply template stages to an order using Firestore writeBatch.
 * Handles chunking of batches into chunks of 500 to satisfy Firestore limits.
 */
export const applyTemplateBatch = async (orderId: string, template: { id: string; title: string; checklist: string[] }) => {
  const batchLimit = 500;
  let batch = writeBatch(db);
  let operationsCount = 0;

  // 1. Create stage documents under order subcollection
  const stagesRef = collection(db, "orders", orderId, "stages");

  for (let i = 0; i < template.checklist.length; i++) {
    const stageItem = template.checklist[i];
    const newStageDocRef = doc(stagesRef); // Auto-generate ID
    
    batch.set(newStageDocRef, {
      title: stageItem,
      status: "pending",
      assignedWorker: null,
      sequence: i,
      createdAt: Timestamp.now()
    });

    operationsCount++;

    // Commit batch if limit is hit, and start a fresh one
    if (operationsCount >= batchLimit) {
      await batch.commit();
      batch = writeBatch(db);
      operationsCount = 0;
    }
  }

  // Commit any remaining operations
  if (operationsCount > 0) {
    await batch.commit();
  }
};

/**
 * Perform login failure counting and account lockout checks using Firestore transactions.
 * Lockout rules: 5 attempts within a rolling 15 minute window disables the account.
 */
export const incrementLoginFailureTransaction = async (email: string): Promise<{ lockedOut: boolean; disabled: boolean }> => {
  const normalizedEmail = email.toLowerCase().trim();
  const attemptRef = doc(db, "loginAttempts", normalizedEmail);

  return runTransaction(db, async (transaction) => {
    const attemptDoc = await transaction.get(attemptRef);
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;

    let count = 0;
    let lastFailure = now;
    let failures: number[] = [];

    if (attemptDoc.exists()) {
      const data = attemptDoc.data();
      failures = data.failures || [];
      // Filter failures in rolling 15 minute window
      failures = failures.filter((timestamp: number) => timestamp > fifteenMinutesAgo);
      count = failures.length;
      if (failures.length > 0) {
        lastFailure = failures[failures.length - 1];
      }
    }

    count++;
    failures.push(now);

    // Write updated counter and timestamps
    transaction.set(attemptRef, {
      email: normalizedEmail,
      failures,
      count,
      updatedAt: Timestamp.fromMillis(now)
    }, { merge: true });

    if (count >= 5) {
      return { lockedOut: true, disabled: true };
    }

    return { lockedOut: false, disabled: false };
  });
};

/**
 * Check if the order amount is below the company's minimum threshold transactionally.
 */
export const checkMinimumOrderTransaction = async (orderId: string, companyId: string) => {
  const orderRef = doc(db, "orders", orderId);
  const companyRef = doc(db, "companies", companyId);

  return runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    const companyDoc = await transaction.get(companyRef);

    if (!orderDoc.exists() || !companyDoc.exists()) {
      throw new Error("Order or Company does not exist");
    }

    const orderValue = orderDoc.data().totalAmount || 0;
    const minOrderValue = companyDoc.data().minOrderValue || 0;
    const belowThreshold = orderValue < minOrderValue;

    transaction.update(orderRef, {
      belowMinimumThreshold: belowThreshold,
      thresholdCheckedAt: Timestamp.now()
    });

    return belowThreshold;
  });
};
