'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// ─── Translation map ───────────────────────────────────────────────────────────

const translations = {
  en: {
    // ── Nav ────────────────────────────────────────────────────────────────
    'nav.admin':     'Admin & Dispatch',
    'nav.warehouse': 'Warehouse',
    'nav.payments':  'Payments & COD',
    'nav.dfp':       'DFP Operations',
    'nav.merchant':  'Merchant Portal',
    'nav.track':     'Track Delivery',
    'nav.settings':  'Settings',
    'nav.signIn':    'Sign in',
    'nav.signOut':   'Sign out',

    // ── Common actions ──────────────────────────────────────────────────────
    'action.save':    'Save',
    'action.cancel':  'Cancel',
    'action.edit':    'Edit',
    'action.add':     'Add',
    'action.create':  'Create',
    'action.refresh': 'Refresh',
    'action.search':  'Search',
    'action.close':   'Close',
    'action.submit':  'Submit',
    'action.resolve': 'Resolve',
    'action.assign':  'Assign',
    'action.advance': 'Advance',
    'action.confirm': 'Confirm',

    // ── Common labels ───────────────────────────────────────────────────────
    'label.loading':    'Loading…',
    'label.active':     'Active',
    'label.inactive':   'Inactive',
    'label.reference':  'Reference',
    'label.customer':   'Customer',
    'label.merchant':   'Merchant',
    'label.status':     'Status',
    'label.stage':      'Stage',
    'label.action':     'Action',
    'label.type':       'Type',
    'label.zone':       'Zone',
    'label.name':       'Name',
    'label.phone':      'Phone',
    'label.email':      'Email',
    'label.role':       'Role',
    'label.notes':      'Notes',
    'label.amount':     'Amount',
    'label.method':     'Method',
    'label.createdAt':  'Created',
    'label.all':        'All',
    'label.sla':        'SLA',
    'label.new':        'New',
    'label.return':     'Return',
    'label.pending':    'Pending',
    'label.inProgress': 'In Progress',
    'label.delivered':  'Delivered',
    'label.problem':    'Problem',
    'label.cancelled':  'Cancelled',
    'label.noData':     'No records found.',

    // ── SLA ────────────────────────────────────────────────────────────────
    'sla.overdue':   'Overdue',
    'sla.left':      'left',
    'sla.delivered': 'Delivered',

    // ── Admin page ─────────────────────────────────────────────────────────
    'admin.title':         'Admin & Dispatch',
    'admin.subtitle':      'Live work order queue, SLA monitoring, and problem management.',
    'admin.kpi.active':    'Active Work Orders',
    'admin.kpi.breaches':  'SLA Breaches',
    'admin.kpi.problems':  'Open Problems',
    'admin.kpi.today':     'Delivered Today',
    'admin.createWo':      'Create Work Order',
    'admin.woTable':       'Work Orders',
    'admin.zones':         'Zones & DFPs',
    'admin.problems':      'Open Problems',
    'admin.filterAll':     'All',
    'admin.advance':       'Advance',

    // ── Work order creation modal ───────────────────────────────────────────
    'wo.createTitle':    'Create Work Order',
    'wo.type':           'Type',
    'wo.merchantName':   'Merchant name',
    'wo.reference':      'Reference (optional)',
    'wo.slaHours':       'SLA hours',
    'wo.customerName':   'Customer full name',
    'wo.customerPhone':  'Customer phone',
    'wo.customerEmail':  'Email (optional)',
    'wo.addrLabel':      'Address label',
    'wo.addrLine':       'Address line',
    'wo.addrCity':       'City',
    'wo.creating':       'Creating…',

    // ── DFP page ───────────────────────────────────────────────────────────
    'dfp.title':         'DFP Operations',
    'dfp.subtitle':      'Manage your zone\'s work order queue, advance stages, and confirm deliveries.',
    'dfp.kpi.queue':     'In Queue',
    'dfp.kpi.breached':  'SLA Breached',
    'dfp.kpi.delivered': 'Delivered Today',
    'dfp.confirmTitle':  'Confirm Delivery',
    'dfp.signedBy':      'Signed by (recipient name)',
    'dfp.condition':     'Package condition',
    'dfp.conditionGood': 'Good',
    'dfp.conditionDmg':  'Damaged',
    'dfp.onTime':        'Arrived on time',
    'dfp.remarks':       'Remarks (optional)',
    'dfp.navigate':      'Navigate',
    'dfp.confirmBtn':    'Confirm Delivery',
    'dfp.confirming':    'Confirming…',
    'dfp.noOrders':      'No work orders in your queue.',

    // ── Merchant page ──────────────────────────────────────────────────────
    'merchant.title':        'Merchant Portal',
    'merchant.subtitle':     'Create shipments and track your orders through the e-flow.',
    'merchant.kpi.active':   'Active',
    'merchant.kpi.today':    'Delivered Today',
    'merchant.kpi.pending':  'Pending',
    'merchant.kpi.returns':  'Returns',
    'merchant.createShip':   'Create Shipment',
    'merchant.eflow':        'E-Flow Stages',
    'merchant.orders':       'Your Orders',
    'merchant.filterAll':    'All orders',
    'merchant.noOrders':     'No orders found.',

    // ── Track page ─────────────────────────────────────────────────────────
    'track.title':       'Track Delivery',
    'track.subtitle':    'Enter your shipment reference to see its live status.',
    'track.placeholder': 'e.g. DN-123456',
    'track.search':      'Track',
    'track.searching':   'Searching…',
    'track.notFound':    'No shipment found for that reference.',
    'track.rateBtn':     'Rate Delivery',
    'track.complainBtn': 'Raise Complaint',
    'track.rateTitle':   'Rate Your Delivery',
    'track.rateScore':   'Score (1–5)',
    'track.rateComment': 'Comment (optional)',
    'track.complain':    'Raise a Complaint',
    'track.category':    'Category',
    'track.description': 'Description',
    'track.submitting':  'Submitting…',

    // ── Warehouse page ─────────────────────────────────────────────────────
    'warehouse.title':      'Warehouse Console',
    'warehouse.subtitle':   'Manage inbound scanning, processing, and outbound dispatch.',
    'warehouse.inbound':    'Inbound',
    'warehouse.processing': 'Processing',
    'warehouse.outbound':   'Outbound',
    'warehouse.scanIn':     'Scan In',
    'warehouse.dispatch':   'Dispatch Outbound',
    'warehouse.handOff':    'Hand to DFP',
    'warehouse.emptyIn':    'No orders awaiting inbound scan.',
    'warehouse.emptyProc':  'No orders currently in processing.',
    'warehouse.emptyOut':   'Outbound queue is clear.',

    // ── Payments page ──────────────────────────────────────────────────────
    'payments.title':        'Payments & COD',
    'payments.subtitle':     'Track cash-on-delivery collections and reconciliation.',
    'payments.kpi.pending':  'COD Pending',
    'payments.kpi.collected':'COD Collected',
    'payments.kpi.reconciled':'Reconciled (all)',
    'payments.record':       'Record Payment',
    'payments.reconcile':    'Reconcile',
    'payments.allStatus':    'All',
    'payments.pendingCod':   'Pending COD',
    'payments.collected':    'Collected',
    'payments.reconciled':   'Reconciled',
    'payments.refunded':     'Refunded',
    'payments.allMethods':   'All methods',
    'payments.codOnly':      'COD only',
    'payments.onlineOnly':   'Online only',
    'payments.woId':         'Work Order ID',
    'payments.currency':     'Currency',
    'payments.reconciledAt': 'Reconciled at',
    'payments.recording':    'Recording…',

    // ── Settings page ──────────────────────────────────────────────────────
    'settings.title':    'System Settings',
    'settings.subtitle': 'Configure zones, DFPs, users, SLA rules, and notification templates.',
    'settings.zones':    'Zones & SLA',
    'settings.dfps':     'DFPs',
    'settings.users':    'Users',
    'settings.templates':'Notification Templates',
    'settings.addDfp':   '+ Add DFP',
    'settings.createUser':'+ Create user',
    'settings.newTpl':   '+ New Template',
    'settings.editDfp':  'Edit DFP',
    'settings.editTpl':  'Edit Template',
    'settings.newTplTitle':'New Notification Template',
    'settings.pingMin':  'Location ping (min)',
    'settings.kind':     'Kind',
    'settings.inHouse':  'In-house',
    'settings.subcontractor': 'Subcontractor',
    'settings.defaultSla': 'Default SLA',
    'settings.hours':    'hours',
    'settings.lastSeen': 'Last seen',
    'settings.dfpsInZone': 'DFPs in zone',
    'settings.event':    'Event',
    'settings.channel':  'Channel',
    'settings.locale':   'Locale',
    'settings.subject':  'Subject',
    'settings.body':     'Body',
    'settings.saveTpl':  'Save template',
    'settings.creating': 'Creating…',
    'settings.saving':   'Saving…',
    'settings.active':   'Active (used for dispatch)',
    'settings.password': 'Password',
    'settings.fullName': 'Full name',
    'settings.noZone':   '— No zone —',
    'settings.createUserTitle': 'Create user',

    // ── Reports page ───────────────────────────────────────────────────────
    'nav.reports':           'Analytics & Reports',
    'reports.title':         'Analytics & Reports',
    'reports.subtitle':      'SLA compliance, stage cycle times, zone performance, and problem trends.',
    'reports.refresh':       'Refresh',
    'reports.totalWos':      'Total WOs',
    'reports.slaCompliance': 'SLA Compliance',
    'reports.avgCompletion': 'Avg Completion',
    'reports.deliveredToday':'Delivered Today',
    'reports.thisWeek':      'This Week',
    'reports.openProblems':  'Open Problems',
    'reports.statusBreakdown': 'Status breakdown',
    'reports.volumeTrend':   'Volume trend (14 days)',
    'reports.volumeHint':    'Purple = total · Red overlay = breached',
    'reports.zonePerf':      'Zone performance',
    'reports.zone':          'Zone',
    'reports.wos':           'WOs',
    'reports.slaBreaches':   'SLA Breaches',
    'reports.breachRate':    'Breach rate',
    'reports.avgCompl':      'Avg completion',
    'reports.stageCycle':    'Stage cycle times',
    'reports.stage':         'Stage',
    'reports.samples':       'Samples',
    'reports.avgTime':       'Avg time in stage',
    'reports.problemsByStatus':'Problems by status',
    'reports.avgResolution': 'Avg resolution',
    'reports.problemsBySource':'Problems by source',
    'reports.noZone':        'No zone data yet.',
    'reports.noStage':       'No stage timing data yet.',

    // ── Integrations page ──────────────────────────────────────────────────
    'nav.integrations':      'Integrations',
    'integrations.title':    'Integrations & API Config',
    'integrations.subtitle': 'Configure third-party connections: payment gateways, messaging providers, and e-commerce connectors.',
    'integrations.save':     'Save',
    'integrations.saving':   'Saving…',
    'integrations.saved':    'Saved',
    'integrations.reveal':   'Reveal',
    'integrations.mode':     'Mode',
    'integrations.test':     'Test',
    'integrations.live':     'Live',
  },

  ar: {
    // ── Nav ────────────────────────────────────────────────────────────────
    'nav.admin':     'الإدارة والإيفاد',
    'nav.warehouse': 'المستودع',
    'nav.payments':  'المدفوعات والدفع عند الاستلام',
    'nav.dfp':       'عمليات نقطة التسليم',
    'nav.merchant':  'بوابة التاجر',
    'nav.track':     'تتبع الشحنة',
    'nav.settings':  'الإعدادات',
    'nav.signIn':    'تسجيل الدخول',
    'nav.signOut':   'تسجيل الخروج',

    // ── Common actions ──────────────────────────────────────────────────────
    'action.save':    'حفظ',
    'action.cancel':  'إلغاء',
    'action.edit':    'تعديل',
    'action.add':     'إضافة',
    'action.create':  'إنشاء',
    'action.refresh': 'تحديث',
    'action.search':  'بحث',
    'action.close':   'إغلاق',
    'action.submit':  'إرسال',
    'action.resolve': 'حل',
    'action.assign':  'تعيين',
    'action.advance': 'تقدم',
    'action.confirm': 'تأكيد',

    // ── Common labels ───────────────────────────────────────────────────────
    'label.loading':    'جارٍ التحميل…',
    'label.active':     'نشط',
    'label.inactive':   'غير نشط',
    'label.reference':  'المرجع',
    'label.customer':   'العميل',
    'label.merchant':   'التاجر',
    'label.status':     'الحالة',
    'label.stage':      'المرحلة',
    'label.action':     'الإجراء',
    'label.type':       'النوع',
    'label.zone':       'المنطقة',
    'label.name':       'الاسم',
    'label.phone':      'الهاتف',
    'label.email':      'البريد الإلكتروني',
    'label.role':       'الدور',
    'label.notes':      'ملاحظات',
    'label.amount':     'المبلغ',
    'label.method':     'الطريقة',
    'label.createdAt':  'تاريخ الإنشاء',
    'label.all':        'الكل',
    'label.sla':        'مستوى الخدمة',
    'label.new':        'جديد',
    'label.return':     'مرتجع',
    'label.pending':    'معلق',
    'label.inProgress': 'قيد التنفيذ',
    'label.delivered':  'تم التسليم',
    'label.problem':    'مشكلة',
    'label.cancelled':  'ملغى',
    'label.noData':     'لا توجد سجلات.',

    // ── SLA ────────────────────────────────────────────────────────────────
    'sla.overdue':   'متأخر',
    'sla.left':      'متبقٍ',
    'sla.delivered': 'تم التسليم',

    // ── Admin page ─────────────────────────────────────────────────────────
    'admin.title':         'الإدارة والإيفاد',
    'admin.subtitle':      'قائمة طلبات العمل المباشرة ومراقبة مستوى الخدمة وإدارة المشكلات.',
    'admin.kpi.active':    'طلبات العمل النشطة',
    'admin.kpi.breaches':  'تجاوزات مستوى الخدمة',
    'admin.kpi.problems':  'المشكلات المفتوحة',
    'admin.kpi.today':     'تم التسليم اليوم',
    'admin.createWo':      'إنشاء طلب عمل',
    'admin.woTable':       'طلبات العمل',
    'admin.zones':         'المناطق ونقاط التسليم',
    'admin.problems':      'المشكلات المفتوحة',
    'admin.filterAll':     'الكل',
    'admin.advance':       'تقدم',

    // ── Work order creation modal ───────────────────────────────────────────
    'wo.createTitle':    'إنشاء طلب عمل',
    'wo.type':           'النوع',
    'wo.merchantName':   'اسم التاجر',
    'wo.reference':      'المرجع (اختياري)',
    'wo.slaHours':       'ساعات مستوى الخدمة',
    'wo.customerName':   'الاسم الكامل للعميل',
    'wo.customerPhone':  'هاتف العميل',
    'wo.customerEmail':  'البريد الإلكتروني (اختياري)',
    'wo.addrLabel':      'تسمية العنوان',
    'wo.addrLine':       'سطر العنوان',
    'wo.addrCity':       'المدينة',
    'wo.creating':       'جارٍ الإنشاء…',

    // ── DFP page ───────────────────────────────────────────────────────────
    'dfp.title':         'عمليات نقطة التسليم',
    'dfp.subtitle':      'إدارة قائمة انتظار طلبات العمل وتأكيد التسليم.',
    'dfp.kpi.queue':     'في قائمة الانتظار',
    'dfp.kpi.breached':  'تجاوز مستوى الخدمة',
    'dfp.kpi.delivered': 'تم التسليم اليوم',
    'dfp.confirmTitle':  'تأكيد التسليم',
    'dfp.signedBy':      'تم الاستلام من قِبل (اسم المستلم)',
    'dfp.condition':     'حالة الطرد',
    'dfp.conditionGood': 'جيدة',
    'dfp.conditionDmg':  'تالف',
    'dfp.onTime':        'وصل في الوقت المحدد',
    'dfp.remarks':       'ملاحظات (اختياري)',
    'dfp.navigate':      'التنقل',
    'dfp.confirmBtn':    'تأكيد التسليم',
    'dfp.confirming':    'جارٍ التأكيد…',
    'dfp.noOrders':      'لا توجد طلبات عمل في قائمتك.',

    // ── Merchant page ──────────────────────────────────────────────────────
    'merchant.title':        'بوابة التاجر',
    'merchant.subtitle':     'أنشئ شحنات وتابع طلباتك عبر مراحل التنفيذ.',
    'merchant.kpi.active':   'نشط',
    'merchant.kpi.today':    'تم التسليم اليوم',
    'merchant.kpi.pending':  'معلق',
    'merchant.kpi.returns':  'المرتجعات',
    'merchant.createShip':   'إنشاء شحنة',
    'merchant.eflow':        'مراحل التنفيذ',
    'merchant.orders':       'طلباتك',
    'merchant.filterAll':    'جميع الطلبات',
    'merchant.noOrders':     'لا توجد طلبات.',

    // ── Track page ─────────────────────────────────────────────────────────
    'track.title':       'تتبع الشحنة',
    'track.subtitle':    'أدخل رقم مرجع شحنتك لمعرفة حالتها الآنية.',
    'track.placeholder': 'مثال: DN-123456',
    'track.search':      'تتبع',
    'track.searching':   'جارٍ البحث…',
    'track.notFound':    'لم يُعثر على شحنة بهذا الرقع المرجعي.',
    'track.rateBtn':     'تقييم التسليم',
    'track.complainBtn': 'تقديم شكوى',
    'track.rateTitle':   'قيّم تجربة التسليم',
    'track.rateScore':   'التقييم (1–5)',
    'track.rateComment': 'تعليق (اختياري)',
    'track.complain':    'تقديم شكوى',
    'track.category':    'الفئة',
    'track.description': 'الوصف',
    'track.submitting':  'جارٍ الإرسال…',

    // ── Warehouse page ─────────────────────────────────────────────────────
    'warehouse.title':      'وحدة التحكم بالمستودع',
    'warehouse.subtitle':   'إدارة استلام الشحنات وفرزها وإرسالها للتسليم.',
    'warehouse.inbound':    'الوارد',
    'warehouse.processing': 'المعالجة',
    'warehouse.outbound':   'الصادر',
    'warehouse.scanIn':     'مسح الوارد',
    'warehouse.dispatch':   'إرسال للصادر',
    'warehouse.handOff':    'تسليم لنقطة التسليم',
    'warehouse.emptyIn':    'لا توجد طلبات تنتظر مسح الوارد.',
    'warehouse.emptyProc':  'لا توجد طلبات قيد المعالجة.',
    'warehouse.emptyOut':   'قائمة الصادر فارغة.',

    // ── Payments page ──────────────────────────────────────────────────────
    'payments.title':        'المدفوعات والدفع عند الاستلام',
    'payments.subtitle':     'تتبع تحصيلات الدفع عند الاستلام وحالات التسوية.',
    'payments.kpi.pending':  'الدفع عند الاستلام المعلق',
    'payments.kpi.collected':'الدفع عند الاستلام المحصّل',
    'payments.kpi.reconciled':'إجمالي المسوّى',
    'payments.record':       'تسجيل دفعة',
    'payments.reconcile':    'تسوية',
    'payments.allStatus':    'الكل',
    'payments.pendingCod':   'معلق (الدفع عند الاستلام)',
    'payments.collected':    'محصّل',
    'payments.reconciled':   'مسوّى',
    'payments.refunded':     'مسترد',
    'payments.allMethods':   'جميع الطرق',
    'payments.codOnly':      'الدفع عند الاستلام فقط',
    'payments.onlineOnly':   'الدفع الإلكتروني فقط',
    'payments.woId':         'معرّف طلب العمل',
    'payments.currency':     'العملة',
    'payments.reconciledAt': 'تاريخ التسوية',
    'payments.recording':    'جارٍ التسجيل…',

    // ── Settings page ──────────────────────────────────────────────────────
    'settings.title':    'إعدادات النظام',
    'settings.subtitle': 'ضبط المناطق ونقاط التسليم والمستخدمين وقواعد مستوى الخدمة وقوالب الإشعارات.',
    'settings.zones':    'المناطق ومستوى الخدمة',
    'settings.dfps':     'نقاط التسليم',
    'settings.users':    'المستخدمون',
    'settings.templates':'قوالب الإشعارات',
    'settings.addDfp':   '+ إضافة نقطة تسليم',
    'settings.createUser':'+ إنشاء مستخدم',
    'settings.newTpl':   '+ قالب جديد',
    'settings.editDfp':  'تعديل نقطة التسليم',
    'settings.editTpl':  'تعديل القالب',
    'settings.newTplTitle':'قالب إشعار جديد',
    'settings.pingMin':  'فترة تحديث الموقع (دقيقة)',
    'settings.kind':     'النوع',
    'settings.inHouse':  'داخلي',
    'settings.subcontractor': 'مقاول من الباطن',
    'settings.defaultSla': 'مستوى الخدمة الافتراضي',
    'settings.hours':    'ساعات',
    'settings.lastSeen': 'آخر ظهور',
    'settings.dfpsInZone': 'نقاط التسليم في المنطقة',
    'settings.event':    'الحدث',
    'settings.channel':  'القناة',
    'settings.locale':   'اللغة',
    'settings.subject':  'الموضوع',
    'settings.body':     'النص',
    'settings.saveTpl':  'حفظ القالب',
    'settings.creating': 'جارٍ الإنشاء…',
    'settings.saving':   'جارٍ الحفظ…',
    'settings.active':   'نشط (يُستخدم للإرسال)',
    'settings.password': 'كلمة المرور',
    'settings.fullName': 'الاسم الكامل',
    'settings.noZone':   '— بدون منطقة —',
    'settings.createUserTitle': 'إنشاء مستخدم',

    // ── Reports page ───────────────────────────────────────────────────────
    'nav.reports':           'التقارير والتحليلات',
    'reports.title':         'التقارير والتحليلات',
    'reports.subtitle':      'معدلات الالتزام بمستوى الخدمة، ومدد دورة المراحل، وأداء المناطق، واتجاهات المشكلات.',
    'reports.refresh':       'تحديث',
    'reports.totalWos':      'إجمالي طلبات العمل',
    'reports.slaCompliance': 'الالتزام بمستوى الخدمة',
    'reports.avgCompletion': 'متوسط وقت الإنجاز',
    'reports.deliveredToday':'تم التسليم اليوم',
    'reports.thisWeek':      'هذا الأسبوع',
    'reports.openProblems':  'المشكلات المفتوحة',
    'reports.statusBreakdown': 'توزيع الحالات',
    'reports.volumeTrend':   'اتجاه الحجم (14 يوم)',
    'reports.volumeHint':    'البنفسجي = الإجمالي · الأحمر = المتجاوز',
    'reports.zonePerf':      'أداء المناطق',
    'reports.zone':          'المنطقة',
    'reports.wos':           'طلبات العمل',
    'reports.slaBreaches':   'تجاوزات مستوى الخدمة',
    'reports.breachRate':    'معدل التجاوز',
    'reports.avgCompl':      'متوسط وقت الإنجاز',
    'reports.stageCycle':    'مدد دورة المراحل',
    'reports.stage':         'المرحلة',
    'reports.samples':       'العينات',
    'reports.avgTime':       'متوسط الوقت في المرحلة',
    'reports.problemsByStatus':'المشكلات حسب الحالة',
    'reports.avgResolution': 'متوسط وقت الحل',
    'reports.problemsBySource':'المشكلات حسب المصدر',
    'reports.noZone':        'لا توجد بيانات مناطق بعد.',
    'reports.noStage':       'لا توجد بيانات توقيت بعد.',

    // ── Integrations page ──────────────────────────────────────────────────
    'nav.integrations':      'التكاملات',
    'integrations.title':    'التكاملات وإعدادات API',
    'integrations.subtitle': 'ضبط الاتصالات بجهات خارجية: بوابات الدفع، ومزودي الرسائل، وموصلات التجارة الإلكترونية.',
    'integrations.save':     'حفظ',
    'integrations.saving':   'جارٍ الحفظ…',
    'integrations.saved':    'تم الحفظ',
    'integrations.reveal':   'إظهار',
    'integrations.mode':     'الوضع',
    'integrations.test':     'تجريبي',
    'integrations.live':     'مباشر',
  },
} as const;

type Locale = 'en' | 'ar';
type TranslationKey = keyof typeof translations.en;

// ─── Context ──────────────────────────────────────────────────────────────────

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleCtx>({
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
  isRtl: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem('dn_locale') as Locale | null;
    if (stored === 'ar' || stored === 'en') setLocaleState(stored);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem('dn_locale', l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  function t(key: TranslationKey): string {
    return (translations[locale] as Record<string, string>)[key] ?? (translations.en as Record<string, string>)[key] ?? key;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isRtl: locale === 'ar' }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLocale() {
  return useContext(LocaleContext);
}
