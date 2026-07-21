/**
 * VendorOS Risk Engine — Rules-Based & ML-Powered Stacking Engine
 *
 * Input:
 *   { orderId, deliveryDate, stagesRemaining, totalStages,
 *     assignedWorker: { id, activeTaskCount, activeTaskLoadScore },
 *     sla_days, defect_rate, weather_hazard, location_risk, worker_load, total_pending_tasks }
 *
 * Output:
 *   { riskPercentage: Number, expectedDelayDays: Number, reason: String, suggestedAction: String, engine: String }
 */

const Order = require("../models/Order");
const { generateRiskExplanation } = require("./llm.service");

/**
 * Compute risk percentage using transparent rules-based formula
 */
const computeRisk = ({
  deliveryDate,
  stagesRemaining,
  totalStages,
  assignedWorker,
}) => {
  const now = new Date();
  const delivery = new Date(deliveryDate || Date.now() + 3 * 24 * 60 * 60 * 1000);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(
    0,
    Math.ceil((delivery - now) / msPerDay)
  );

  const schedulePressure = Math.min(100, Math.max(0, ((14 - daysRemaining) / 14) * 100));

  const stageRatio =
    totalStages > 0
      ? ((stagesRemaining / totalStages) * 100)
      : 0;

  const workerLoad = assignedWorker
    ? Math.min(100, (assignedWorker.activeTaskLoadScore || assignedWorker.activeTaskCount * 20 || 0))
    : 0;

  const riskPercentage = Math.round(
    schedulePressure * 0.45 + stageRatio * 0.35 + workerLoad * 0.2
  );

  let reason, suggestedAction;

  if (riskPercentage >= 75) {
    reason = `High risk: only ${daysRemaining} day(s) remaining with ${stagesRemaining}/${totalStages} stages incomplete and worker load elevated.`;
    suggestedAction = "Escalate to Owner immediately and reassign workload.";
  } else if (riskPercentage >= 50) {
    reason = `Moderate risk: ${daysRemaining} day(s) until delivery with ${stagesRemaining} stage(s) outstanding.`;
    suggestedAction = "Check in with assigned team and confirm completion timeline.";
  } else if (riskPercentage >= 25) {
    reason = `Low-moderate risk: schedule is manageable; monitor ongoing progress.`;
    suggestedAction = "Monitor daily task status.";
  } else {
    reason = `Low risk: target timeline is secure (${daysRemaining} days remaining).`;
    suggestedAction = "No immediate action required.";
  }

  const expectedDelayDays = riskPercentage > 70 ? 2.5 : riskPercentage > 40 ? 1.0 : 0.0;

  return { riskPercentage, expectedDelayDays, reason, suggestedAction, engine: "Rules Engine" };
};

/**
 * Express handler: POST /api/risk/analyze (Rules Engine)
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

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        riskScore: result.riskPercentage,
        expectedDelayDays: result.expectedDelayDays,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Rules Risk Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Express handler: POST /api/risk/predict (ML Stacking Engine + Gemini Explanation)
 */
const predictRiskML = async (req, res) => {
  try {
    const {
      orderId,
      deliveryDate,
      stagesRemaining = 1,
      totalStages = 3,
      assignedWorker = null,
      sla_days,
      defect_rate = 0.05,
      weather_hazard = 0.1,
      location_risk = 0.1,
      worker_load,
      total_pending_tasks = 5,
    } = req.body;

    // Calculate SLA days if not explicitly provided
    let computedSlaDays = sla_days;
    if (computedSlaDays === undefined || computedSlaDays === null) {
      if (deliveryDate) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diff = Math.ceil((new Date(deliveryDate).getTime() - Date.now()) / msPerDay);
        computedSlaDays = Math.max(1, diff);
      } else {
        computedSlaDays = 3;
      }
    }

    const computedWorkerLoad = worker_load ?? (assignedWorker?.activeTaskCount || 2);

    const mlPayload = {
      sla_days: Number(computedSlaDays),
      defect_rate: Number(defect_rate),
      weather_hazard: Number(weather_hazard),
      location_risk: Number(location_risk),
      worker_load: Number(computedWorkerLoad),
      total_pending_tasks: Number(total_pending_tasks),
    };

    let mlResult = null;
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

    try {
      const response = await fetch(`${mlServiceUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
      });

      if (response.ok) {
        mlResult = await response.json();
      }
    } catch (mlErr) {
      console.warn("ML Service unavailable, falling back to rules engine:", mlErr.message);
    }

    let result;
    if (mlResult && typeof mlResult.riskPercentage === "number") {
      const riskPercentage = mlResult.riskPercentage;
      const expectedDelayDays = mlResult.expectedDelayDays;

      let reason = `ML Stacking Model predicts ${riskPercentage}% risk score with ${expectedDelayDays} day(s) expected delay.`;
      let suggestedAction = riskPercentage > 60
        ? "Review worker assignment and optimize pending tasks immediately."
        : "Maintain normal workflow monitoring.";

      // Enrich with Gemini LLM explanation if GEMINI_API_KEY is configured
      if (process.env.GEMINI_API_KEY) {
        try {
          const llmRes = await generateRiskExplanation({
            riskPercentage,
            deliveryDate: deliveryDate || "N/A",
            stagesRemaining,
            totalStages,
            assignedWorker,
            reason,
            suggestedAction,
          });
          if (llmRes && llmRes.reason) {
            reason = llmRes.reason;
            suggestedAction = llmRes.suggestedAction || suggestedAction;
          }
        } catch (llmErr) {
          console.warn("Gemini explanation generation skipped:", llmErr.message);
        }
      }

      result = {
        riskPercentage,
        expectedDelayDays,
        reason,
        suggestedAction,
        engine: "ML Stacking Engine",
      };
    } else {
      // Fallback to transparent rules engine
      result = computeRisk({
        deliveryDate: deliveryDate || Date.now(),
        stagesRemaining,
        totalStages,
        assignedWorker,
      });
    }

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        riskScore: result.riskPercentage,
        expectedDelayDays: result.expectedDelayDays,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("ML Risk Prediction Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { computeRisk, analyzeRisk, predictRiskML };
