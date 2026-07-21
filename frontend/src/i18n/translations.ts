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

  // Tabs
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

  // KPI Metrics
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

    overview: "Overview",
    domains: "Domains",
    team: "Team",
    dispatch: "Dispatch",
    aiCopilot: "AI Copilot",
    invoices: "Invoices",
    trustScore: "Trust Score",
    analytics: "Analytics",
    pricingBilling: "Pricing & Billing",
    activityLog: "Activity Log",
    settings: "Settings",
    myJobs: "My Jobs",

    kpiTitle: "Key Performance Indicators",
    kpiSubtitle: "Real-time fulfillment metrics, logistics pipeline, & critical inventory triggers",
    activeWorkOrders: "Active Work Orders",
    inventoryAlerts: "Inventory Alerts",
    pendingShipments: "Pending Shipments",
    fulfillmentEfficiency: "Fulfillment Efficiency",
    atRiskOrders: "Orders At Risk",
    belowMinThreshold: "Below Min. Threshold",
    pendingApprovals: "Pending Approvals",
    liveQueue: "Live Queue",
    healthy: "Healthy",
    logistics: "Logistics",
    metric: "Metric",
    viewDispatch: "View Dispatch >",
    restockParts: "Restock Parts >",
    manageShipments: "Manage Shipments >",

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
  },
};
