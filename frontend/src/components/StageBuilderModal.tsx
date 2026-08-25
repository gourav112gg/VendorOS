import React, { useState } from "react";
import { ServiceOrder, Domain, UserProfile } from "../types";
import dbStore from "../services/store";
import { Layers, X } from "lucide-react";
import { motion } from "motion/react";

interface StageBuilderModalProps {
  order: ServiceOrder;
  onClose: () => void;
  domains: Domain[];
  teamMembers: UserProfile[];
  userId: string;
  companyId: string;
  allOrders?: ServiceOrder[];
}

export const StageBuilderModal: React.FC<StageBuilderModalProps> = ({
  order,
  onClose,
  domains,
  teamMembers,
  userId,
  companyId,
  allOrders = [],
}) => {
  // Custom stage fields
  const [stageTitle, setStageTitle] = useState("");
  const [stageDomainId, setStageDomainId] = useState("");
  const [stageWorkerId, setStageWorkerId] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);

  // Template states
  const templates = dbStore.getTemplates(userId);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");

  const isWorkerBusy = (workerId: string) => {
    return allOrders.some(
      (o) =>
        o.stage !== "Completed" &&
        (o.stages || []).some(
          (s) => s.assignedWorkerId === workerId && s.status === "In Progress"
        )
    );
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageTitle.trim() || !stageDomainId) return;

    const dom = domains.find((d) => d.id === stageDomainId);
    const worker = teamMembers.find((w) => w.id === stageWorkerId);

    dbStore.addOrderStage(order.id, {
      orderId: order.id,
      title: stageTitle.trim(),
      domainId: stageDomainId,
      domainName: dom ? dom.name : "General",
      assignedWorkerId: worker ? worker.id : undefined,
      assignedWorkerName: worker ? worker.name : undefined,
      status: "Pending",
      checklist: checklistItems.map((text, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        text,
        completed: false,
      })),
    });

    // Reset Form
    setStageTitle("");
    setStageDomainId("");
    setStageWorkerId("");
    setChecklistItems([]);
    setChecklistInput("");
  };

  const handleAddChecklistItem = () => {
    if (!checklistInput.trim()) return;
    setChecklistItems([...checklistItems, checklistInput.trim()]);
    setChecklistInput("");
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleDeleteStage = (stageId: string) => {
    dbStore.deleteOrderStage(order.id, stageId);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;

    dbStore.addOrderStage(order.id, {
      orderId: order.id,
      title: tpl.title,
      domainId: tpl.domainId || "",
      domainName: tpl.domainName || "General",
      status: "Pending",
      checklist: (tpl.checklist || []).map((txt: string, idx: number) => ({
        id: `chk-${Date.now()}-${idx}-${Math.random()}`,
        text: txt,
        completed: false,
      })),
    });

    setSelectedTemplateId("");
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) return;
    const currentStages = order.stages || [];
    if (currentStages.length === 0) {
      alert("Please add at least one stage to the order first before saving as a template.");
      return;
    }

    const firstStage = currentStages[0];
    dbStore.addTemplate({
      managerId: userId,
      companyId,
      title: newTemplateName.trim(),
      domainId: firstStage.domainId,
      domainName: firstStage.domainName,
      checklist: firstStage.checklist.map((c) => c.text),
    });

    setNewTemplateName("");
    alert("Stage template saved successfully under your private profile.");
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this private template?")) {
      dbStore.deleteTemplate(id, userId);
    }
  };

  const handleSaveSingleStageAsTemplate = (stg: any) => {
    const tName = prompt("Enter a name for this stage template:", stg.title);
    if (!tName || !tName.trim()) return;

    dbStore.addTemplate({
      managerId: userId,
      companyId,
      title: tName.trim(),
      domainId: stg.domainId,
      domainName: stg.domainName,
      checklist: stg.checklist.map((c: any) => c.text),
    });

    alert(`Stage template "${tName}" saved successfully under your private profile.`);
  };

  const workers = teamMembers.filter((t) => t.role === "Worker");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-[#0A0A0A] border border-[#222222] rounded-sm max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#222222] flex justify-between items-center sticky top-0 bg-[#0A0A0A] z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1A1A1A] border border-[#333333] rounded-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded-sm">
                  Stage Builder
                </span>
                <span className="text-[10px] font-mono text-[#888888]">{order.id}</span>
              </div>
              <h2 className="text-lg font-serif italic text-white font-light mt-0.5">
                {order.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1A1A1A] text-[#888888] hover:text-white rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-grow">
          {/* Templates Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111111] border border-[#222222] p-6 rounded-sm">
            {/* Apply Preset Template */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                Apply Saved Stage Template
              </h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Instantly populate the service lifecycle stages using one of your custom templates.
              </p>

              <div className="flex gap-2">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="flex-grow p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                >
                  <option value="">-- Select custom template --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.domainName}) - {t.checklist?.length || 0} items
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplateId}
                  className="px-4 py-2 bg-white hover:bg-[#F0EAD8] text-black text-[10px] font-bold font-mono uppercase tracking-widest rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Apply
                </button>
              </div>

              {templates.length > 0 && (
                <div className="pt-2">
                  <span className="text-[9px] font-mono text-[#444444] uppercase tracking-wider block mb-1">
                    Your saved protocols:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center space-x-1 bg-[#1A1A1A] border border-[#222222] px-2 py-0.5 rounded-sm text-[10px] font-mono text-[#888888]"
                      >
                        <span className="truncate max-w-[120px]">{t.title}</span>
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="text-red-500 hover:text-red-400 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Current Layout as Template */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-[#222222] pt-4 md:pt-0 md:pl-6">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                Save Current Layout as Template
              </h4>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Export this customized list of service stages and checklist items so you can reuse them.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Standard Plumbing Leak Repair"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="flex-grow p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                />
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!newTemplateName.trim() || !order.stages?.length}
                  className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white border border-[#444444] text-[10px] font-bold font-mono uppercase tracking-widest rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Stage Manual Builder Form */}
            <div className="lg:col-span-5 bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4 h-fit">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center justify-between">
                <span>Add Service Stage</span>
                <span className="text-[9px] text-[#666666] normal-case">Step-by-step dispatch</span>
              </h3>

              <form onSubmit={handleAddStage} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#666666] uppercase text-[9px] tracking-wider mb-1">
                    Stage Action/Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shut off main supply and inspect joints"
                    value={stageTitle}
                    onChange={(e) => setStageTitle(e.target.value)}
                    className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[#666666] uppercase text-[9px] tracking-wider mb-1">
                    Operational Domain *
                  </label>
                  <select
                    required
                    value={stageDomainId}
                    onChange={(e) => setStageDomainId(e.target.value)}
                    className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                  >
                    <option value="">-- Choose operational domain --</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#666666] uppercase text-[9px] tracking-wider mb-1">
                    Assign Technician *
                  </label>
                  <select
                    value={stageWorkerId}
                    onChange={(e) => setStageWorkerId(e.target.value)}
                    className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                  >
                    <option value="">-- Assign Stage Tech (Optional) --</option>
                    {workers.map((w) => {
                      const busy = isWorkerBusy(w.id);
                      return (
                        <option key={w.id} value={w.id}>
                          {w.name} {busy ? "(🔴 BUSY - Active Stage)" : "(🟢 FREE)"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Checklist items list */}
                <div className="pt-2 border-t border-[#222222] space-y-2">
                  <label className="block text-[#666666] uppercase text-[9px] tracking-wider">
                    Protocol Verification Checklist
                  </label>
                  <p className="text-[10px] text-[#555555] leading-normal mb-2">
                    Add compliance items technician must verify before submitting.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Verify pressure is under 50 PSI"
                      value={checklistInput}
                      onChange={(e) => setChecklistInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      className="flex-grow p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="px-3 bg-[#222222] hover:bg-[#333333] border border-[#444444] text-white text-xs font-bold rounded-sm cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {checklistItems.length > 0 && (
                    <div className="space-y-1.5 pt-2 max-h-[150px] overflow-y-auto">
                      {checklistItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-[#0A0A0A] p-2 border border-[#222222] rounded-sm text-xs"
                        >
                          <span className="text-slate-400 truncate max-w-[200px]">
                            {idx + 1}. {item}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(idx)}
                            className="text-red-500 hover:text-red-400 font-bold ml-2 font-mono cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#222222]">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-white hover:bg-[#F0EAD8] text-black text-xs font-bold font-mono uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
                  >
                    Add Stage to Order
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Active Stages */}
            <div className="lg:col-span-7 bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                Configured Service Delivery Stages ({order.stages?.length || 0})
              </h3>

              {!order.stages || order.stages.length === 0 ? (
                <div className="p-12 text-center text-[#555555] text-xs font-mono border border-dashed border-[#222222] rounded-sm">
                  No service execution stages defined yet. Use the manual form or select a template above.
                </div>
              ) : (
                <div className="space-y-4">
                  {order.stages.map((stg, sIdx) => (
                    <div
                      key={stg.id}
                      className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-sm space-y-3 relative group"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-3">
                        <button
                          onClick={() => handleSaveSingleStageAsTemplate(stg)}
                          className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono transition-colors uppercase tracking-widest cursor-pointer"
                          title="Save as template preset"
                        >
                          💾 Save Preset
                        </button>
                        <button
                          onClick={() => handleDeleteStage(stg.id)}
                          className="text-[#444444] hover:text-red-500 transition-colors font-mono font-bold text-xs cursor-pointer"
                          title="Remove Stage"
                        >
                          &times; Delete
                        </button>
                      </div>

                      <div>
                        <span className="text-[9px] font-mono text-blue-400 bg-[#0D1D2D] border border-blue-950/40 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                          Stage {sIdx + 1} • {stg.domainName}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-1.5 pr-20">
                          {stg.title}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono py-2 border-y border-[#1A1A1A] text-[#888888]">
                        <div>
                          <span className="text-[9px] text-[#444444] uppercase block mb-1">
                            Assigned Specialist
                          </span>
                          <span className="text-white font-bold">
                            {stg.assignedWorkerName || "Unassigned"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#444444] uppercase block mb-1">Status</span>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold border ${
                              stg.status === "Completed"
                                ? "bg-[#0D2A1D] text-emerald-400 border-emerald-950/40"
                                : stg.status === "In Progress"
                                ? "bg-[#0D1D2D] text-blue-400 border-blue-950/40"
                                : "bg-[#1A1A1A] text-[#888888] border-[#222222]"
                            }`}
                          >
                            {stg.status}
                          </span>
                        </div>
                      </div>

                      {stg.checklist && stg.checklist.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-mono text-[#555555] uppercase tracking-wider block">
                            Stage Protocol Items ({stg.checklist.filter((c) => c.completed).length}/
                            {stg.checklist.length}):
                          </span>
                          {stg.checklist.map((chk) => (
                            <div
                              key={chk.id}
                              className="flex items-center space-x-2 text-xs font-mono"
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center font-bold text-[9px] ${
                                  chk.completed
                                    ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                                    : "border-[#333333] text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                              <span
                                className={
                                  chk.completed ? "line-through text-[#666666]" : "text-[#AAAAAA]"
                                }
                              >
                                {chk.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0D0D0D] border-t border-[#222222] flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white hover:bg-[#E5E5E5] text-black text-xs font-bold font-mono uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
          >
            Done Building Stages
          </button>
        </div>
      </motion.div>
    </div>
  );
};
