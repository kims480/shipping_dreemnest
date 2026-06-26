/** English locale strings — example set covering the screens scaffolded in this foundation. */
const en = {
  common: {
    appName: "Dreem Nest",
    login: "Log in",
    logout: "Log out",
    continueAsGuest: "Continue as guest",
    save: "Save",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading…",
    identifier: "Phone or email",
    password: "Password",
  },
  driver: {
    loginTitle: "Driver Login",
    loginSubtitle: "Sign in to start receiving jobs",
    myJobs: "My Jobs",
    myJobsSubtitle: "Pickup and delivery legs assigned to you",
    jobDetail: "Job Detail",
    noJobs: "No jobs assigned yet — check back soon.",
  },
  dfp: {
    loginTitle: "DFP Login",
    loginSubtitle: "Sign in to manage your zone's queue",
    dashboard: "Zone Dashboard",
    dashboardSubtitle: "Live work-order queue with SLA countdowns",
    signOff: "Delivery Sign-off",
    signOffSubtitle: "Capture confirmation and satisfaction questionnaire",
    customerName: "Recipient name",
    satisfied: "Satisfied",
    notSatisfied: "Not satisfied",
    remarks: "Remarks (optional)",
    closeWorkOrder: "Close work order",
  },
  customer: {
    loginTitle: "Welcome to Dreem Nest",
    loginSubtitle: "Track your deliveries and returns in real time",
    myDeliveries: "My Deliveries",
    myDeliveriesSubtitle: "Track every shipment, stage by stage",
    profile: "Profile & Addresses",
    profileSubtitle: "Manage your address book and preferences",
    defaultAddress: "Default",
  },
  woType: {
    NEW: "New",
    RETURN: "Return",
  },
  sla: {
    ON_TRACK: "On track",
    AT_RISK: "At risk",
    BREACHED: "Breached",
  },
} as const;

export default en;
