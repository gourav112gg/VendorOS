export type Language = 'en' | 'hi' | 'pa';

export interface TranslationDictionary {
  // Navigation & General
  vendorOS: string;
  signOut: string;
  signIn: string;
  signUp: string;
  startCompany: string;
  joinVendor: string;
  clientCustomer: string;
  languageName: string;

  // Dashboards & Roles
  ownerDashboard: string;
  managerDashboard: string;
  workerDashboard: string;
  customerDashboard: string;
  owner: string;
  manager: string;
  worker: string;
  customer: string;

  // Sidebar & Top Nav Tabs
  overview: string;
  domains: string;
  team: string;
  dispatch: string;
  aiCopilot: string;
  invoices: string;
  trustScore: string;
  analytics: string;
  pricingBilling: string;
  activityLog: string;
  settings: string;
  myJobs: string;
  customerRequests: string;

  // Header Subtitles & Badges
  operationalSuite: string;
  ownerLevel: string;
  managerLevel: string;
  workerLevel: string;
  adminSystemProfile: string;
  realtimeArchitecture: string;
  realtimeArchitectureDesc: string;
  sessionStatus: string;
  localActiveSimulation: string;
  systemClaimsState: string;
  ownerQuickOps: string;
  addOpDomain: string;
  addOpDomainDesc: string;
  manageTeamMembers: string;
  manageTeamDesc: string;

  // Domains Tab
  registeredOpDomains: string;
  opDomainsDesc: string;
  createDomain: string;
  activeStatus: string;

  // KPI Bento Metrics
  kpiTitle: string;
  kpiSubtitle: string;
  activeWorkOrders: string;
  inventoryAlerts: string;
  pendingShipments: string;
  fulfillmentEfficiency: string;
  atRiskOrders: string;
  belowMinThreshold: string;
  pendingApprovals: string;
  liveQueue: string;
  healthy: string;
  logistics: string;
  metric: string;
  viewDispatch: string;
  restockParts: string;
  manageShipments: string;
  partsStocked: string;
  shipmentsTracking: string;
  qualityStandard: string;
  pendingValue: string;
  completedCount: string;

  // Sub-tabs & Tables
  alertsAndStock: string;
  shipmentsTab: string;
  inventoryStockAlerts: string;
  logisticsShipments: string;
  activeOrderPipeline: string;
  addNewPart: string;
  partDescription: string;
  category: string;
  currentStock: string;
  warehouseLocation: string;
  fulfillmentRestock: string;
  domainName: string;
  typeTag: string;
  status: string;
  createdDate: string;
  actions: string;

  // Settings Panel Forms
  profileSecurity: string;
  subscriptionPricing: string;
  updateProfileDesc: string;
  displayName: string;
  contactPhone: string;
  emailAddress: string;
  saveProfileDetails: string;
  companyProfile: string;
  manageCompanyDesc: string;
  companyName: string;
  companyNameUnique: string;
  descriptionBio: string;

  // Common Actions & Controls
  newOrder: string;
  approve: string;
  reject: string;
  save: string;
  cancel: string;
  close: string;
  filter: string;
  search: string;
  autoRefresh: string;
  startDriving: string;
  beginWork: string;
  submitCloseJob: string;
  saving: string;
  updating: string;
  allRoles: string;
  allStatuses: string;
  
  // Settings & Preferences
  appPreferences: string;
  visualCustomization: string;
  themeMode: string;
  darkMode: string;
  lightMode: string;
  displayCurrency: string;
  profileSettings: string;
  activeDevicesSessions: string;
  revokeOtherSessions: string;

  // Footer Elements
  vendorOsEnvironment: string;
  pressShortcuts: string;
  allRightsReserved: string;

  // ML & Risk Engine
  riskAnalysis: string;
  riskScore: string;
  expectedDelay: string;
  analyzeRisk: string;
  predictedBy: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    vendorOS: "VendorOS",
    signOut: "Sign Out",
    signIn: "Sign In",
    signUp: "Sign Up Now",
    startCompany: "Start a Company",
    joinVendor: "Join a Vendor",
    clientCustomer: "Client / Customer",
    languageName: "English",

    ownerDashboard: "Owner Dashboard",
    managerDashboard: "Manager Dashboard",
    workerDashboard: "Worker Dashboard",
    customerDashboard: "Customer Portal",
    owner: "Owner",
    manager: "Manager",
    worker: "Worker",
    customer: "Customer",

    overview: "OVERVIEW",
    domains: "DOMAINS",
    team: "TEAM MEMBERS",
    dispatch: "DISPATCH",
    aiCopilot: "AI COPILOT",
    invoices: "INVOICES",
    trustScore: "TRUST SCORE",
    analytics: "ANALYTICS",
    pricingBilling: "PRICING & BILLING",
    activityLog: "ACTIVITY LOG",
    settings: "SETTINGS",
    myJobs: "MY JOBS",
    customerRequests: "SERVICE REQUESTS",

    operationalSuite: "OPERATIONAL SUITE",
    ownerLevel: "OWNER LEVEL",
    managerLevel: "MANAGER LEVEL",
    workerLevel: "WORKER LEVEL",
    adminSystemProfile: "Admin System Profile",
    realtimeArchitecture: "VendorOS Real-Time Architecture",
    realtimeArchitectureDesc: "Your team, operational domains, and field service requests are managed via local persistence.",
    sessionStatus: "Session Status",
    localActiveSimulation: "Local Active Simulation",
    systemClaimsState: "System Claims State",
    ownerQuickOps: "Owner Quick Operations",
    addOpDomain: "Add Operational Domain",
    addOpDomainDesc: "Add categories like HVAC, Plumbing, or custom specializations.",
    manageTeamMembers: "Manage Team Members",
    manageTeamDesc: "View registered Managers and Workers, or simulate session deletion.",

    registeredOpDomains: "Registered Operational Domains",
    opDomainsDesc: "Owners define the fields of service the company provides to customers.",
    createDomain: "Create Domain",
    activeStatus: "Active",

    kpiTitle: "Key Performance Indicators",
    kpiSubtitle: "Real-time fulfillment metrics, logistics pipeline, & critical inventory triggers",
    activeWorkOrders: "ACTIVE WORK ORDERS",
    inventoryAlerts: "INVENTORY ALERTS",
    pendingShipments: "PENDING SHIPMENTS",
    fulfillmentEfficiency: "FULFILLMENT EFFICIENCY",
    atRiskOrders: "Orders At Risk",
    belowMinThreshold: "Below Min. Threshold",
    pendingApprovals: "Pending Approvals",
    liveQueue: "LIVE QUEUE",
    healthy: "HEALTHY",
    logistics: "LOGISTICS",
    metric: "METRIC",
    viewDispatch: "VIEW DISPATCH >",
    restockParts: "RESTOCK PARTS >",
    manageShipments: "MANAGE SHIPMENTS >",
    partsStocked: "All critical parts fully stocked",
    shipmentsTracking: "In-bound or outbound packages pending tracking",
    qualityStandard: "Quality service standard maintained",
    pendingValue: "Value pending",
    completedCount: "orders completed",

    alertsAndStock: "ALERTS & STOCK",
    shipmentsTab: "SHIPMENTS",
    inventoryStockAlerts: "INVENTORY STOCK & ALERTS",
    logisticsShipments: "LOGISTICS SHIPMENTS",
    activeOrderPipeline: "ACTIVE ORDER PIPELINE",
    addNewPart: "+ ADD NEW PART",
    partDescription: "PART DESCRIPTION / SKU",
    category: "CATEGORY",
    currentStock: "CURRENT STOCK",
    warehouseLocation: "WAREHOUSE LOCATION",
    fulfillmentRestock: "FULFILLMENT RESTOCK",
    domainName: "DOMAIN NAME",
    typeTag: "TYPE / TAG",
    status: "STATUS",
    createdDate: "CREATED DATE",
    actions: "ACTIONS",

    profileSecurity: "Profile & Security",
    subscriptionPricing: "Subscription & Pricing",
    updateProfileDesc: "Update your display name and contact details.",
    displayName: "Display Name",
    contactPhone: "Contact Phone",
    emailAddress: "Email Address",
    saveProfileDetails: "Save Profile Details",
    companyProfile: "Company Profile",
    manageCompanyDesc: "Manage your company's public information and business rules.",
    companyName: "Company Name",
    companyNameUnique: "Company name is unique and cannot be changed.",
    descriptionBio: "Description / Bio",

    newOrder: "+ New Order",
    approve: "Approve",
    reject: "Reject",
    save: "Save Changes",
    cancel: "Cancel",
    close: "Close Portal",
    filter: "Filter",
    search: "Search...",
    autoRefresh: "Auto Refresh (60s)",
    startDriving: "Start Driving",
    beginWork: "Begin Work",
    submitCloseJob: "Submit & Close Job",
    saving: "Saving...",
    updating: "Updating...",
    allRoles: "All Roles",
    allStatuses: "All Statuses",

    appPreferences: "App Preferences",
    visualCustomization: "Visual Interface Customization",
    themeMode: "Theme & Brightness Modes",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    displayCurrency: "Display Currency",
    profileSettings: "Profile & Identity Settings",
    activeDevicesSessions: "Active Devices & Sessions",
    revokeOtherSessions: "Revoke Other Sessions",

    vendorOsEnvironment: "VendorOS Operational Environment",
    pressShortcuts: "Press \"?\" for Shortcuts",
    allRightsReserved: "VendorOS Systems. All Rights Reserved.",

    riskAnalysis: "Risk Analysis",
    riskScore: "Risk Score",
    expectedDelay: "Expected Delay",
    analyzeRisk: "Analyze Risk",
    predictedBy: "Engine",
  },
  hi: {
    vendorOS: "वेंडर-ओएस",
    signOut: "साइन आउट",
    signIn: "साइन इन करें",
    signUp: "अभी साइन अप करें",
    startCompany: "कंपनी शुरू करें",
    joinVendor: "वेंडर में शामिल हों",
    clientCustomer: "ग्राहक / यूजर",
    languageName: "हिन्दी",

    ownerDashboard: "मालिक डैशबोर्ड",
    managerDashboard: "प्रबंधक डैशबोर्ड",
    workerDashboard: "तकनीशियन डैशबोर्ड",
    customerDashboard: "ग्राहक पोर्टल",
    owner: "मालिक",
    manager: "प्रबंधक",
    worker: "तकनीशियन",
    customer: "ग्राहक",

    overview: "ओवरव्यू",
    domains: "कार्य क्षेत्र",
    team: "टीम सदस्य",
    dispatch: "डिसपैच कार्य",
    aiCopilot: "एआई सहायक",
    invoices: "चालान / बिल",
    trustScore: "विश्वसनीयता स्कोर",
    analytics: "विश्लेषण",
    pricingBilling: "मूल्य निर्धारण एवं बिलिंग",
    activityLog: "गतिविधि लॉग",
    settings: "सेटिंग्स",
    myJobs: "मेरे कार्य",
    customerRequests: "सेवा अनुरोध",

    operationalSuite: "ऑपरेशन्स सूट",
    ownerLevel: "मालिक स्तर",
    managerLevel: "प्रबंधक स्तर",
    workerLevel: "तकनीशियन स्तर",
    adminSystemProfile: "एडमिन सिस्टम प्रोफ़ाइल",
    realtimeArchitecture: "वेंडर-ओएस रियल-टाइम आर्किटेक्चर",
    realtimeArchitectureDesc: "आपकी टीम, परिचालन डोमेन, और सेवा अनुरोधों को प्रबंधित किया जाता है।",
    sessionStatus: "सत्र स्थिति",
    localActiveSimulation: "लोकल सक्रिय सिमुलेशन",
    systemClaimsState: "सिस्टम क्लेम स्थिति",
    ownerQuickOps: "मालिक त्वरित संचालन",
    addOpDomain: "कार्य क्षेत्र जोड़ें",
    addOpDomainDesc: "एचवीएसी, प्लंबिंग, या कस्टम श्रेणियां जोड़ें।",
    manageTeamMembers: "टीम सदस्यों का प्रबंधन करें",
    manageTeamDesc: "पंजीकृत प्रबंधकों और कर्मचारियों को देखें या सत्र प्रबंधित करें।",

    registeredOpDomains: "पंजीकृत परिचालन डोमेन",
    opDomainsDesc: "मालिक उन सेवा क्षेत्रों को परिभाषित करते हैं जो कंपनी ग्राहकों को प्रदान करती है।",
    createDomain: "डोमेन बनाएं",
    activeStatus: "सक्रिय",

    kpiTitle: "मुख्य प्रदर्शन संकेतक (KPI)",
    kpiSubtitle: "वास्तविक समय पूर्ति संकेत, रसद पाइपलाइन और महत्वपूर्ण इन्वेंट्री अलर्ट",
    activeWorkOrders: "सक्रिय कार्य आदेश",
    inventoryAlerts: "इन्वेंट्री अलर्ट",
    pendingShipments: "लंबित शिपमेंट",
    fulfillmentEfficiency: "पूर्ति दक्षता",
    atRiskOrders: "जोखिम में आदेश",
    belowMinThreshold: "न्यूनतम सीमा से कम",
    pendingApprovals: "लंबित स्वीकृतियां",
    liveQueue: "लाइव कतार",
    healthy: "सुरक्षित",
    logistics: "रसद",
    metric: "मापक",
    viewDispatch: "डिसपैच देखें >",
    restockParts: "पार्ट्स रीस्टॉक करें >",
    manageShipments: "शिपमेंट प्रबंधित करें >",
    partsStocked: "सभी महत्वपूर्ण पार्ट्स पर्याप्त मात्रा में उपलब्ध हैं",
    shipmentsTracking: "आवक या जावक पैकेज ट्रैकिंग के लिए लंबित",
    qualityStandard: "गुणवत्ता सेवा मानक बनाए रखा गया",
    pendingValue: "लंबित मूल्य",
    completedCount: "आदेश पूरे हुए",

    alertsAndStock: "अलर्ट और स्टॉक",
    shipmentsTab: "शिपमेंट",
    inventoryStockAlerts: "इन्वेंट्री स्टॉक और अलर्ट",
    logisticsShipments: "रसद शिपमेंट",
    activeOrderPipeline: "सक्रिय आदेश पाइपलाइन",
    addNewPart: "+ नया पार्ट जोड़ें",
    partDescription: "पार्ट विवरण / SKU",
    category: "श्रेणी",
    currentStock: "वर्तमान स्टॉक",
    warehouseLocation: "गोदाम का स्थान",
    fulfillmentRestock: "पूर्ति रीस्टॉक",
    domainName: "क्षेत्र का नाम",
    typeTag: "प्रकार / टैग",
    status: "स्थिति",
    createdDate: "बनाने की तिथि",
    actions: "कार्रवाई",

    profileSecurity: "प्रोफ़ाइल और सुरक्षा",
    subscriptionPricing: "सदस्यता और मूल्य निर्धारण",
    updateProfileDesc: "अपना प्रदर्शन नाम और संपर्क विवरण अपडेट करें।",
    displayName: "प्रदर्शन नाम",
    contactPhone: "संपर्क फोन",
    emailAddress: "ईमेल पता",
    saveProfileDetails: "प्रोफ़ाइल विवरण सहेजें",
    companyProfile: "कंपनी प्रोफ़ाइल",
    manageCompanyDesc: "अपनी कंपनी की सार्वजनिक जानकारी और व्यावसायिक नियमों का प्रबंधन करें।",
    companyName: "कंपनी का नाम",
    companyNameUnique: "कंपनी का नाम अद्वितीय है और इसे बदला नहीं जा सकता।",
    descriptionBio: "विवरण / बायो",

    newOrder: "+ नया आदेश",
    approve: "स्वीकृत करें",
    reject: "अस्वीकृत करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    close: "पोर्टल बंद करें",
    filter: "फ़िल्टर करें",
    search: "खोजें...",
    autoRefresh: "ऑटो रीफ्रेश (60 से.)",
    startDriving: "यात्रा शुरू करें",
    beginWork: "कार्य शुरू करें",
    submitCloseJob: "सबमिट और कार्य पूर्ण करें",
    saving: "सहेजा जा रहा है...",
    updating: "अपडेट हो रहा है...",
    allRoles: "सभी भूमिकाएं",
    allStatuses: "सभी स्थितियां",

    appPreferences: "ऐप प्राथमिकताएं",
    visualCustomization: "दृश्य इंटरफ़ेस अनुकूलन",
    themeMode: "थीम और ब्राइटनेस मोड",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    displayCurrency: "प्रदर्शित मुद्रा",
    profileSettings: "प्रोफ़ाइल और पहचान सेटिंग्स",
    activeDevicesSessions: "सक्रिय उपकरण और सत्र",
    revokeOtherSessions: "अन्य सत्र रद्द करें",

    vendorOsEnvironment: "वेंडर-ओएस परिचालन वातावरण",
    pressShortcuts: "शॉर्टकट के लिए \"?\" दबाएं",
    allRightsReserved: "वेंडर-ओएस सिस्टम। सर्वाधिकार सुरक्षित।",

    riskAnalysis: "जोखिम विश्लेषण",
    riskScore: "जोखिम स्कोर",
    expectedDelay: "अपेक्षित देरी",
    analyzeRisk: "जोखिम विश्लेषण करें",
    predictedBy: "इंजन",
  },
  pa: {
    vendorOS: "ਵੇਂਡਰ-ਓ.ਐਸ",
    signOut: "ਸਾਈਨ ਆਊਟ",
    signIn: "ਸਾਈਨ ਇਨ ਕਰੋ",
    signUp: "ਹੁਣੇ ਸਾਈਨ ਅੱਪ ਕਰੋ",
    startCompany: "ਕੰਪਨੀ ਸ਼ੁਰੂ ਕਰੋ",
    joinVendor: "ਵੇਂਡਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
    clientCustomer: "ਗਾਹਕ / ਯੂਜ਼ਰ",
    languageName: "ਪੰਜਾਬੀ",

    ownerDashboard: "ਮਾਲਕ ਡੈਸ਼ਬੋਰਡ",
    managerDashboard: "ਮੈਨੇਜਰ ਡੈਸ਼ਬੋਰਡ",
    workerDashboard: "ਤਕਨੀਸ਼ੀਅਨ ਡੈਸ਼ਬੋਰਡ",
    customerDashboard: "ਗਾਹਕ ਪੋਰਟਲ",
    owner: "ਮਾਲਕ",
    manager: "ਮੈਨੇਜਰ",
    worker: "ਤਕਨੀਸ਼ੀਅਨ",
    customer: "ਗਾਹਕ",

    overview: "ਓਵਰਵਿਊ",
    domains: "ਕਾਰਜ ਖੇਤਰ",
    team: "ਟੀਮ ਮੈਂਬਰ",
    dispatch: "ਡਿਸਪੈਚ ਕੰਮ",
    aiCopilot: "ਏ.ਆਈ. ਸਹਾਇਕ",
    invoices: "ਬਿੱਲ / ਚਲਾਨ",
    trustScore: "ਭਰੋਸੇਯੋਗਤਾ ਸਕੋਰ",
    analytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
    pricingBilling: "ਕੀਮਤਾਂ ਅਤੇ ਬਿਲਿੰਗ",
    activityLog: "ਗਤੀਵਿਧੀ ਲੌਗ",
    settings: "ਸੈਟਿੰਗਾਂ",
    myJobs: "ਮੇਰੇ ਕੰਮ",
    customerRequests: "ਸੇਵਾ ਬੇਨਤੀਆਂ",

    operationalSuite: "ਓਪਰੇਸ਼ਨਲ ਸੂਟ",
    ownerLevel: "ਮਾਲਕ ਪੱਧਰ",
    managerLevel: "ਮੈਨੇਜਰ ਪੱਧਰ",
    workerLevel: "ਤਕਨੀਸ਼ੀਅਨ ਪੱਧਰ",
    adminSystemProfile: "ਐਡਮਿਨ ਸਿਸਟਮ ਪ੍ਰੋਫਾਈਲ",
    realtimeArchitecture: "ਵੇਂਡਰ-ਓ.ਐਸ ਰੀਅਲ-ਟਾਈਮ ਆਰਕੀਟੈਕਚਰ",
    realtimeArchitectureDesc: "ਤੁਹਾਡੀ ਟੀਮ, ਓਪਰੇਸ਼ਨਲ ਡੋਮੇਨ ਅਤੇ ਸੇਵਾ ਬੇਨਤੀਆਂ ਨੂੰ ਪ੍ਰਬੰਧਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    sessionStatus: "ਸੈਸ਼ਨ ਸਥਿਤੀ",
    localActiveSimulation: "ਲੋਕਲ ਸਰਗਰਮ ਸਿਮੂਲੇਸ਼ਨ",
    systemClaimsState: "ਸਿਸਟਮ ਕਲੇਮ ਸਥਿਤੀ",
    ownerQuickOps: "ਮਾਲਕ ਤੁਰੰਤ ਕਾਰਜ",
    addOpDomain: "ਕਾਰਜ ਖੇਤਰ ਜੋੜੋ",
    addOpDomainDesc: "ਐਚ.ਵੀ.ਏ.ਸੀ, ਪਲੰਬਿੰਗ, ਜਾਂ ਕਸਟਮ ਸ਼੍ਰੇਣੀਆਂ ਜੋੜੋ।",
    manageTeamMembers: "ਟੀਮ ਮੈਂਬਰ ਪ੍ਰਬੰਧਿਤ ਕਰੋ",
    manageTeamDesc: "ਰਜਿਸਟਰਡ ਮੈਨੇਜਰਾਂ ਅਤੇ ਕਰਮਚਾਰੀਆਂ ਨੂੰ ਵੇਖੋ ਜਾਂ ਸੈਸ਼ਨ ਪ੍ਰਬੰਧਿਤ ਕਰੋ।",

    registeredOpDomains: "ਰਜਿਸਟਰਡ ਓਪਰੇਸ਼ਨਲ ਡੋਮੇਨ",
    opDomainsDesc: "ਮਾਲਕ ਉਹ ਸੇਵਾ ਖੇਤਰ ਨਿਰਧਾਰਤ ਕਰਦੇ ਹਨ ਜੋ ਕੰਪਨੀ ਗਾਹਕਾਂ ਨੂੰ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ।",
    createDomain: "ਖੇਤਰ ਬਣਾਓ",
    activeStatus: "ਸਰਗਰਮ",

    kpiTitle: "ਮੁੱਖ ਪ੍ਰਦਰਸ਼ਨ ਸੰਕੇਤਕ (KPI)",
    kpiSubtitle: "ਰੀਅਲ-ਟਾਈਮ ਪੂਰਤੀ ਮੈਟ੍ਰਿਕਸ, ਲੌਜਿਸਟਿਕਸ ਪਾਈਪਲਾਈਨ ਅਤੇ ਇਨਵੈਂਟਰੀ ਚੇਤਾਵਨੀਆਂ",
    activeWorkOrders: "ਚੱਲ ਰਹੇ ਆਰਡਰ",
    inventoryAlerts: "ਇਨਵੈਂਟਰੀ ਅਲਰਟ",
    pendingShipments: "ਬਕਾਇਆ ਸ਼ਿਪਮੈਂਟ",
    fulfillmentEfficiency: "ਪੂਰਤੀ ਦਰ",
    atRiskOrders: "ਖਤਰੇ ਵਿੱਚ ਆਰਡਰ",
    belowMinThreshold: "ਘੱਟੋ-ਘੱਟ ਸੀਮਾ ਤੋਂ ਘੱਟ",
    pendingApprovals: "ਬਕਾਇਆ ਮਨਜ਼ੂਰੀਆਂ",
    liveQueue: "ਲਾਈਵ ਕਤਾਰ",
    healthy: "ਸੁਰੱਖਿਅਤ",
    logistics: "ਲੌਜਿਸਟਿਕਸ",
    metric: "ਮਾਪਕ",
    viewDispatch: "ਡਿਸਪੈਚ ਵੇਖੋ >",
    restockParts: "ਪਾਰਟਸ ਮੁੜ ਭਰੋ >",
    manageShipments: "ਸ਼ਿਪਮੈਂਟ ਪ੍ਰਬੰਧਿਤ ਕਰੋ >",
    partsStocked: "ਸਾਰੇ ਮਹੱਤਵਪੂਰਨ ਪਾਰਟਸ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਟਾਕ ਵਿੱਚ ਹਨ",
    shipmentsTracking: "ਆਉਣ ਵਾਲੇ ਜਾਂ ਜਾਣ ਵਾਲੇ ਪੈਕੇਜ ਟ੍ਰੈਕਿੰਗ ਲਈ ਬਕਾਇਆ",
    qualityStandard: "ਗੁਣਵੱਤਾ ਸੇਵਾ ਮਿਆਰ ਬਣਾਇਆ ਰੱਖਿਆ ਗਿਆ",
    pendingValue: "ਬਕਾਇਆ ਮੁੱਲ",
    completedCount: "ਆਰਡਰ ਪੂਰੇ ਹੋਏ",

    alertsAndStock: "ਅਲਰਟ ਅਤੇ ਸਟਾਕ",
    shipmentsTab: "ਸ਼ਿਪਮੈਂਟ",
    inventoryStockAlerts: "ਇਨਵੈਂਟਰੀ ਸਟਾਕ ਅਤੇ ਅਲਰਟ",
    logisticsShipments: "ਲੌਜਿਸਟਿਕਸ ਸ਼ਿਪਮੈਂਟ",
    activeOrderPipeline: "ਸਰਗਰਮ ਆਰਡਰ ਪਾਈਪਲਾਈਨ",
    addNewPart: "+ ਨਵਾਂ ਪਾਰਟ ਜੋੜੋ",
    partDescription: "ਪਾਰਟ ਵੇਰਵਾ / SKU",
    category: "ਸ਼੍ਰੇਣੀ",
    currentStock: "ਮੌਜੂਦਾ ਸਟਾਕ",
    warehouseLocation: "ਗੋਦਾਮ ਦਾ ਸਥਾਨ",
    fulfillmentRestock: "ਪੂਰਤੀ ਰੀਸਟਾਕ",
    domainName: "ਖੇਤਰ ਦਾ ਨਾਂ",
    typeTag: "ਕਿਸਮ / ਟੈਗ",
    status: "ਸਥਿਤੀ",
    createdDate: "ਬਣਾਉਣ ਦੀ ਮਿਤੀ",
    actions: "ਕਾਰਵਾਈਆਂ",

    profileSecurity: "ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸੁਰੱਖਿਆ",
    subscriptionPricing: "ਗਾਹਕੀ ਅਤੇ ਕੀਮਤਾਂ",
    updateProfileDesc: "ਆਪਣਾ ਨਾਮ ਅਤੇ ਸੰਪਰਕ ਵੇਰਵੇ ਅੱਪਡੇਟ ਕਰੋ।",
    displayName: "ਦਰਸਾਉਣ ਵਾਲਾ ਨਾਮ",
    contactPhone: "ਸੰਪਰਕ ਫੋਨ",
    emailAddress: "ਈਮੇਲ ਪਤਾ",
    saveProfileDetails: "ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ ਸੰਭਾਲੋ",
    companyProfile: "ਕੰਪਨੀ ਪ੍ਰੋਫਾਈਲ",
    manageCompanyDesc: "ਆਪਣੀ ਕੰਪਨੀ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਨਿਯਮਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
    companyName: "ਕੰਪਨੀ ਦਾ ਨਾਂ",
    companyNameUnique: "ਕੰਪਨੀ ਦਾ ਨਾਂ ਵਿਲੱਖਣ ਹੈ ਅਤੇ ਬਦਲਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
    descriptionBio: "ਵੇਰਵਾ / ਬਾਇਓ",

    newOrder: "+ ਨਵਾਂ ਆਰਡਰ",
    approve: "ਮਨਜ਼ੂਰ ਕਰੋ",
    reject: "ਰੱਦ ਕਰੋ",
    save: "ਸੰਭਾਲੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    close: "ਪੋਰਟਲ ਬੰਦ ਕਰੋ",
    filter: "ਫਿਲਟਰ ਕਰੋ",
    search: "ਖੋਜੋ...",
    autoRefresh: "ਸਵੈ-ਤਾਜ਼ਾ (60 ਸਕਿੰਟ)",
    startDriving: "ਸਫਰ ਸ਼ੁਰੂ ਕਰੋ",
    beginWork: "ਕੰਮ ਸ਼ੁਰੂ ਕਰੋ",
    submitCloseJob: "ਜਮ੍ਹਾਂ ਕਰੋ ਅਤੇ ਕੰਮ ਪੂਰਾ ਕਰੋ",
    saving: "ਸੰਭਾਲਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    updating: "ਅੱਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ...",
    allRoles: "ਸਾਰੇ ਰੋਲ",
    allStatuses: "ਸਾਰੀਆਂ ਸਥਿਤੀਆਂ",

    appPreferences: "ਐਪ ਤਰਜੀਹਾਂ",
    visualCustomization: "ਦ੍ਰਿਸ਼ਟੀਗਤ ਇੰਟਰਫੇਸ ਅਨੁਕੂਲਨ",
    themeMode: "ਥੀਮ ਅਤੇ ਚਮਕ ਮੋਡ",
    darkMode: "ਡਾਰਕ ਮੋਡ",
    lightMode: "ਲਾਇਟ ਮੋਡ",
    displayCurrency: "ਮੁਦਰਾ ਵੇਖੋ",
    profileSettings: "ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਪਛਾਣ ਸੈਟਿੰਗਾਂ",
    activeDevicesSessions: "ਸਰਗਰਮ ਉਪਕਰਣ ਅਤੇ ਸੈਸ਼ਨ",
    revokeOtherSessions: "ਬਾਕੀ ਸੈਸ਼ਨ ਰੱਦ ਕਰੋ",

    vendorOsEnvironment: "ਵੇਂਡਰ-ਓ.ਐਸ ਓਪਰੇਸ਼ਨਲ ਵਾਤਾਵਰਣ",
    pressShortcuts: "ਸ਼ਾਰਟਕੱਟਾਂ ਲਈ \"?\" ਦਬਾਓ",
    allRightsReserved: "ਵੇਂਡਰ-ਓ.ਐਸ ਸਿਸਟਮ। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।",

    riskAnalysis: "ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਣ",
    riskScore: "ਜੋਖਮ ਸਕੋਰ",
    expectedDelay: "ਸੰਭਾਵਿਤ ਦੇਰੀ",
    analyzeRisk: "ਜੋਖਮ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    predictedBy: "ਇੰਜਣ",
  },
};
