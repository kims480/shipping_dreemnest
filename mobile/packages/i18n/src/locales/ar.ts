/** Arabic (RTL) locale strings — mirrors `en.ts` key-for-key. */
const ar = {
  common: {
    appName: "دريم نِست",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    continueAsGuest: "المتابعة كزائر",
    save: "حفظ",
    submit: "إرسال",
    cancel: "إلغاء",
    loading: "جارٍ التحميل…",
    identifier: "رقم الجوال أو البريد الإلكتروني",
    password: "كلمة المرور",
  },
  driver: {
    loginTitle: "تسجيل دخول السائق",
    loginSubtitle: "سجّل الدخول لبدء استلام المهام",
    myJobs: "مهامي",
    myJobsSubtitle: "مهام الاستلام والتوصيل المسندة إليك",
    jobDetail: "تفاصيل المهمة",
    noJobs: "لا توجد مهام مسندة بعد — تحقق لاحقًا.",
  },
  dfp: {
    loginTitle: "تسجيل دخول مسؤول التسليم",
    loginSubtitle: "سجّل الدخول لإدارة قائمة منطقتك",
    dashboard: "لوحة المنطقة",
    dashboardSubtitle: "قائمة طلبات العمل الحيّة مع العد التنازلي لاتفاقية مستوى الخدمة",
    signOff: "تأكيد التسليم",
    signOffSubtitle: "توثيق التأكيد واستبيان الرضا",
    customerName: "اسم المستلم",
    satisfied: "راضٍ",
    notSatisfied: "غير راضٍ",
    remarks: "ملاحظات (اختياري)",
    closeWorkOrder: "إغلاق طلب العمل",
  },
  customer: {
    loginTitle: "مرحبًا بك في دريم نِست",
    loginSubtitle: "تتبّع شحناتك ومرتجعاتك لحظة بلحظة",
    myDeliveries: "توصيلاتي",
    myDeliveriesSubtitle: "تتبّع كل شحنة، مرحلة بمرحلة",
    profile: "الملف الشخصي والعناوين",
    profileSubtitle: "إدارة دفتر العناوين والتفضيلات",
    defaultAddress: "افتراضي",
  },
  woType: {
    NEW: "جديد",
    RETURN: "مرتجع",
  },
  sla: {
    ON_TRACK: "ضمن الوقت",
    AT_RISK: "في خطر التأخير",
    BREACHED: "تجاوز الموعد",
  },
} as const;

export default ar;
