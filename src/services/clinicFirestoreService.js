import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../Firebase/config";
import { normalizeRole, ROLES } from "../constants/roles";
import { normalizePlan, PLANS } from "../constants/subscription";

const COLLECTIONS = {
  USERS: "users",
  APPOINTMENTS: "appointments",
  PRESCRIPTIONS: "prescriptions",
  DIAGNOSES: "diagnoses",
  SUBSCRIPTIONS: "subscriptions",
  NOTIFICATIONS: "notifications",
  PAYMENTS: "payments",
};

const nowIso = () => new Date().toISOString();

const sortByNewest = (items) =>
  [...items].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt || b.date || 0) - new Date(a.updatedAt || a.createdAt || a.date || 0)
  );

const readCollection = async (collectionName, constraints = []) => {
  const baseRef = collection(db, collectionName);
  const ref = constraints.length ? query(baseRef, ...constraints) : baseRef;
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const createUserProfile = async (userId, userData) => {
  const role = normalizeRole(userData?.role) || ROLES.PATIENT;
  const defaultPlan = role === ROLES.ADMIN ? PLANS.PRO : PLANS.FREE;
  const subscriptionPlan = normalizePlan(userData?.subscriptionPlan || defaultPlan);
  const payload = {
    ...userData,
    role,
    subscriptionPlan,
    isVerified: role === ROLES.PATIENT ? true : Boolean(userData?.isVerified),
    createdAt: userData?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  await setDoc(doc(db, COLLECTIONS.USERS, userId), payload, { merge: true });
};

export const updateUserProfile = async (userId, updates) => {
  const nextRole = updates?.role ? normalizeRole(updates.role) : undefined;
  const nextPlan = updates?.subscriptionPlan
    ? normalizePlan(updates.subscriptionPlan)
    : undefined;
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...updates,
    ...(nextRole ? { role: nextRole } : {}),
    ...(nextPlan ? { subscriptionPlan: nextPlan } : {}),
    updatedAt: nowIso(),
  });
};

export const getUserProfile = async (userId) => {
  const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  const role = normalizeRole(data?.role) || data?.role;
  const defaultPlan = role === ROLES.ADMIN ? PLANS.PRO : PLANS.FREE;
  const subscriptionPlan = normalizePlan(data?.subscriptionPlan || defaultPlan);
  return { id: docSnap.id, ...data, role, subscriptionPlan };
};

export const getAllUsers = async () =>
  sortByNewest(await readCollection(COLLECTIONS.USERS)).map((item) => ({
    ...item,
    subscriptionPlan: normalizePlan(
      item.subscriptionPlan || (item.role === ROLES.ADMIN ? PLANS.PRO : PLANS.FREE)
    ),
  }));

export const getUsersByRole = async (role) => {
  const normalizedRole = normalizeRole(role);
  const users = await readCollection(COLLECTIONS.USERS, [where("role", "==", normalizedRole)]);
  return sortByNewest(users);
};

export const getDoctors = async () => getUsersByRole(ROLES.DOCTOR);
export const getReceptionists = async () => getUsersByRole(ROLES.RECEPTIONIST);
export const getPatients = async () => getUsersByRole(ROLES.PATIENT);

export const createPatientRecord = async (patientData, createdBy) => {
  const payload = {
    ...patientData,
    role: ROLES.PATIENT,
    subscriptionPlan: normalizePlan(patientData?.subscriptionPlan || PLANS.FREE),
    isVerified: true,
    createdBy: createdBy || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.USERS), payload);
  return docRef.id;
};

export const getAllAppointments = async () =>
  sortByNewest(await readCollection(COLLECTIONS.APPOINTMENTS));

export const getDoctorAppointments = async (doctorId) => {
  if (!doctorId) return [];
  const rows = await readCollection(COLLECTIONS.APPOINTMENTS, [where("doctorId", "==", doctorId)]);
  return sortByNewest(
    rows.filter(
      (item) =>
        !["pending_reception", "rejected_reception"].includes(item.status)
    )
  );
};

export const getPatientAppointments = async (patientId) => {
  if (!patientId) return [];
  const rows = await readCollection(COLLECTIONS.APPOINTMENTS, [where("patientId", "==", patientId)]);
  return sortByNewest(rows);
};

export const createAppointment = async (appointmentData) => {
  const payload = {
    ...appointmentData,
    status: appointmentData?.status || "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), payload);
  return docRef.id;
};

export const updateAppointment = async (appointmentId, updates) => {
  await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), {
    ...updates,
    updatedAt: nowIso(),
  });
};

export const createPrescription = async (prescriptionData) => {
  const payload = {
    ...prescriptionData,
    medications: prescriptionData?.medications || [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.PRESCRIPTIONS), payload);
  return docRef.id;
};

export const getPatientPrescriptions = async (patientId) => {
  if (!patientId) return [];
  const rows = await readCollection(COLLECTIONS.PRESCRIPTIONS, [where("patientId", "==", patientId)]);
  return sortByNewest(rows);
};

export const getAllPrescriptions = async () =>
  sortByNewest(await readCollection(COLLECTIONS.PRESCRIPTIONS));

export const createDiagnosis = async (diagnosisData) => {
  const payload = {
    ...diagnosisData,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.DIAGNOSES), payload);
  return docRef.id;
};

export const getPatientDiagnoses = async (patientId) => {
  if (!patientId) return [];
  const rows = await readCollection(COLLECTIONS.DIAGNOSES, [where("patientId", "==", patientId)]);
  return sortByNewest(rows);
};

export const getCreatedPatientsByUser = async (createdBy) => {
  if (!createdBy) return [];
  const rows = await readCollection(COLLECTIONS.USERS, [where("createdBy", "==", createdBy)]);
  return sortByNewest(rows.filter((item) => normalizeRole(item.role) === ROLES.PATIENT));
};

export const getAllDiagnoses = async () =>
  sortByNewest(await readCollection(COLLECTIONS.DIAGNOSES));

export const getPatientTimeline = async (patientId) => {
  const [appointments, prescriptions, diagnoses] = await Promise.all([
    getPatientAppointments(patientId),
    getPatientPrescriptions(patientId),
    getPatientDiagnoses(patientId),
  ]);

  const timeline = [
    ...appointments.map((item) => ({
      id: `apt-${item.id}`,
      type: "appointment",
      title: `${item.status || "pending"} appointment`,
      description: `${item.type || "consultation"} with Dr. ${item.doctorName || "-"}`,
      timestamp: item.updatedAt || item.createdAt || item.date,
    })),
    ...diagnoses.map((item) => ({
      id: `diag-${item.id}`,
      type: "diagnosis",
      title: item.title || "Diagnosis added",
      description:
        item.notes || item.diagnosis || item.riskLevel
          ? `${item.notes || item.diagnosis || "Clinical notes saved"}${
              item.riskLevel ? ` (Risk: ${item.riskLevel})` : ""
            }`
          : "Clinical notes saved",
      timestamp: item.updatedAt || item.createdAt || item.date,
    })),
    ...prescriptions.map((item) => ({
      id: `rx-${item.id}`,
      type: "prescription",
      title: "Prescription created",
      description: item.medications?.length
        ? `${item.medications.length} medicine(s) prescribed${
            item.aiExplanation ? " + AI explanation generated" : ""
          }`
        : "Medication details updated",
      timestamp: item.updatedAt || item.createdAt || item.date,
    })),
  ];

  return sortByNewest(timeline);
};

export const getSubscriptionPlans = async () =>
  sortByNewest(await readCollection(COLLECTIONS.SUBSCRIPTIONS));

export const saveSubscriptionPlan = async (planId, payload) => {
  const planRef = planId
    ? doc(db, COLLECTIONS.SUBSCRIPTIONS, planId)
    : doc(collection(db, COLLECTIONS.SUBSCRIPTIONS));
  await setDoc(
    planRef,
    {
      ...payload,
      updatedAt: nowIso(),
      createdAt: payload?.createdAt || nowIso(),
    },
    { merge: true }
  );
  return planRef.id;
};

export const getSubscriptionPlanById = async (planId) => {
  if (!planId) return null;
  const snapshot = await getDoc(doc(db, COLLECTIONS.SUBSCRIPTIONS, planId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const createPaymentRecord = async (paymentData) => {
  const payload = {
    ...paymentData,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), payload);
  return docRef.id;
};

export const createNotification = async (notificationData) => {
  const payload = {
    ...notificationData,
    isRead: Boolean(notificationData?.isRead),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), payload);
  return docRef.id;
};

export const getUserNotifications = async (userId) => {
  if (!userId) return [];
  const rows = await readCollection(COLLECTIONS.NOTIFICATIONS, [
    where("recipientId", "==", userId),
  ]);
  return sortByNewest(rows);
};

export const markNotificationAsRead = async (notificationId) => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
    isRead: true,
    readAt: nowIso(),
    updatedAt: nowIso(),
  });
};

export const markAllNotificationsAsRead = async (userId) => {
  const notifications = await getUserNotifications(userId);
  const unread = notifications.filter((item) => !item.isRead);
  if (!unread.length) return;

  await Promise.all(unread.map((item) => markNotificationAsRead(item.id)));
};
