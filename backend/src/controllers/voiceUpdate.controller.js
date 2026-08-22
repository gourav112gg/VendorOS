const Order = require("../models/Order");
const { transcribeAudio } = require("../services/groqTranscribe.service");
const { matchTranscriptToChecklist } = require("../services/checklistMatcher.service");

async function submitVoiceUpdate(req, res) {
  const { orderId } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received." });
    }

    if (!req.user || !req.user.company) {
      return res.status(403).json({ error: "Access denied. Company profile required." });
    }

    const orderQuery = { _id: orderId, company: req.user.company };
    if (req.user.role === "worker") {
      orderQuery.assignedWorker = req.user._id;
    }

    const order = await Order.findOne(orderQuery);
    if (!order) {
      return res.status(404).json({ error: "Order not found or access denied." });
    }

    const checklistItems = order.checklist || [];
    if (!checklistItems.length) {
      return res.status(400).json({ error: "This order has no checklist items to match against." });
    }

    const transcript = await transcribeAudio(req.file.buffer, req.file.originalname || "update.webm");

    if (!transcript) {
      return res.status(200).json({
        transcript: "",
        matches: [],
        message: "Couldn't hear anything clear — please try again or tick manually.",
      });
    }

    const { matches, method } = await matchTranscriptToChecklist(transcript, checklistItems);

    const logEntry = {
      transcript,
      matchedItemIds: matches.map((m) => m.item._id || m.item.id),
      method,
      timestamp: new Date(),
    };

    if (!matches.length) {
      order.voiceUpdateLog = order.voiceUpdateLog || [];
      order.voiceUpdateLog.push(logEntry);
      await order.save();

      return res.status(200).json({
        transcript,
        matches: [],
        message: "Couldn't confidently match that to a checklist item — please tick it manually.",
      });
    }

    matches.forEach((m) => {
      const subdoc = order.checklist.id ? order.checklist.id(m.item._id || m.item.id) : order.checklist.find(i => String(i._id) === String(m.item._id));
      if (subdoc) {
        subdoc.status = m.newStatus;
        subdoc.verifiedBy = "voice";
      }
    });

    order.voiceUpdateLog = order.voiceUpdateLog || [];
    order.voiceUpdateLog.push(logEntry);
    await order.save();

    return res.status(200).json({
      transcript,
      matches: matches.map((m) => ({
        id: m.item._id || m.item.id,
        label: m.item.label,
        newStatus: m.newStatus,
        confidence: m.confidence,
        method: m.method,
      })),
    });
  } catch (err) {
    console.error("Voice task update failed:", err);
    return res.status(500).json({ error: err.message || "Something went wrong processing the voice update." });
  }
}

module.exports = { submitVoiceUpdate };
