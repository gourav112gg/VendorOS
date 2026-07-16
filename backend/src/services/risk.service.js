/**
 * VendorOS Risk Engine — Transparent Rules-Based Implementation
 *
 * Per TRD §5: Fixed function signature so a future trained ML model
 * can be swapped in with zero changes elsewhere in the codebase.
 *
 * Input:
 *   { orderId, deliveryDate, stagesRemaining, totalStages,
 *     assignedWorker: { id, activeTaskCount, activeTaskLoadScore } }
 *
 * Output (required shape regardless of implementation):
 *   { riskPercentage: Number, reason: String, suggestedAction: String }
 */

const Order = require("../models/Order");

/**
 * Compute risk percentage using a transparent, explainable formula:
 *   riskPercentage = f(daysRemaining, stagesRemaining, workerLoad)
 */
const computeRisk = ({
  deliveryDate,
  stagesRemaining,
  totalStages,
  assignedWorker,
}) => {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(
    0,
    Math.ceil((delivery - now) / msPerDay)
  );

  // --- Sub-scores (each 0–100) ---

  // 1. Schedule pressure: fewer days = higher risk
  //    Score of 100 when 0 days remain, 0 when 14+ days remain
  const schedulePressure = Math.min(100, Math.max(0, ((14 - daysRemaining) / 14) * 100));

  // 2. Stage completion ratio: more stages remaining = higher risk
  const stageRatio =
    totalStages > 0
      ? ((stagesRemaining / totalStages) * 100)
      : 0;

  // 3. Worker load: 0–100 score from caller (e.g. activeTaskCount * 20, capped at 100)
  const workerLoad = assignedWorker
    ? Math.min(100, (assignedWorker.activeTaskLoadScore || assignedWorker.activeTaskCount * 20 || 0))
    : 0;

  // --- Weighted composite ---
  const riskPercentage = Math.round(
    schedulePressure * 0.45 + stageRatio * 0.35 + workerLoad * 0.2
  );

  // --- Human-readable reason and action ---
  let reason, suggestedAction;

  if (riskPercentage >= 75) {
    reason = `High risk: only ${daysRemaining} day(s) remaining with ${stagesRemaining}/${totalStages} stages incomplete and a heavily loaded worker.`;
    suggestedAction = "Escalate to Owner immediately and reassign a free worker.";
  } else if (riskPercentage >= 50) {
    reason = `Moderate risk: ${daysRemaining} day(s) until delivery with ${stagesRemaining} stage(s) outstanding.`;
    suggestedAction = "Check in with the assigned worker and confirm realistic completion date.";
  } else if (riskPercentage >= 25) {
    reason = `Low-moderate risk: schedule is manageable but worker load or remaining stages warrant monitoring.`;
    suggestedAction = "Monitor daily progress and flag if any stage slips.";
  } else {
    reason = `Low risk: ample time (${daysRemaining} days), ${stagesRemaining} stage(s) left, and worker load is acceptable.`;
    suggestedAction = "No immediate action needed — continue routine monitoring.";
  }

  return { riskPercentage, reason, suggestedAction };
};

/**
 * Express handler: POST /api/risk/analyze
 * Body: { orderId, deliveryDate, stagesRemaining, totalStages, assignedWorker }
 */
const analyzeRisk = async (req, res) => {
  try {
    const {
      orderId,
      deliveryDate,
      stagesRemaining,
      totalStages,
      assignedWorker,
    } = req.body;

    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "deliveryDate is required",
      });
    }

    const result = computeRisk({
      deliveryDate,
      stagesRemaining: stagesRemaining ?? 0,
      totalStages: totalStages ?? 1,
      assignedWorker: assignedWorker ?? null,
    });

    // Optionally persist riskScore back to the order
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        riskScore: result.riskPercentage,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { computeRisk, analyzeRisk };
