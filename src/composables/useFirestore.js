import { db } from "src/boot/firebase.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const racesCollection = collection(db, "races");
const teamsCollection = collection(db, "teams");
const appointmentsCollection = collection(db, "appointments");
const faqCollection = collection(db, "faq");
const helpCollection = collection(db, "help");

const createSegment = (index = 1) => ({
  id: `segment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: `Tappa ${index}`,
  distance: 0,
  type: "solo",
});

const normalizeSegments = (segments = []) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return [createSegment(1)];
  }

  return segments.map((segment, index) => ({
    id: segment.id || createSegment(index + 1).id,
    name: segment.name || `Tappa ${index + 1}`,
    distance: Number(segment.distance) || 0,
    type: segment.type === "group" ? "group" : "solo",
  }));
};

const normalizeRace = (snapshotOrRace) => {
  if (!snapshotOrRace) return null;

  const data =
    typeof snapshotOrRace.data === "function"
      ? snapshotOrRace.data()
      : snapshotOrRace;

  return {
    id: snapshotOrRace.id || data.id,
    name: data.name ?? "",
    location: data.location ?? "",
    date: data.date ?? "",
    startTime: data.startTime || "08:00",
    defaultStartDelay: Number(data.defaultStartDelay) || 0,
    isDefault: data.isDefault === true,
    segments: normalizeSegments(data.segments),
  };
};

const pickDefaultRace = (races = []) => {
  if (!races.length) return null;
  return races.find((race) => race.isDefault) || races[0];
};

export function useFirestore() {
  const getRaces = async () => {
    const snapshot = await getDocs(racesCollection);
    return snapshot.docs.map(normalizeRace);
  };

  const getRace = async (raceId) => {
    if (!raceId) return null;
    const raceRef = doc(db, "races", raceId);
    const raceSnap = await getDoc(raceRef);
    return raceSnap.exists() ? normalizeRace(raceSnap) : null;
  };

  const getDefaultRace = async () => {
    const races = await getRaces();
    return pickDefaultRace(races);
  };

  const createRace = async (raceData) => {
    const races = await getRaces();
    const nextRace = {
      name: raceData.name ?? "",
      location: raceData.location ?? "",
      date: raceData.date ?? "",
      startTime: raceData.startTime || "08:00",
      defaultStartDelay: Number(raceData.defaultStartDelay) || 0,
      isDefault: races.length === 0,
      segments: normalizeSegments(raceData.segments),
    };

    const docRef = await addDoc(racesCollection, nextRace);
    return docRef.id;
  };

  const updateRace = async (raceId, data) => {
    const raceRef = doc(db, "races", raceId);
    await updateDoc(raceRef, {
      ...data,
      defaultStartDelay: Number(data.defaultStartDelay) || 0,
      segments: normalizeSegments(data.segments),
    });
  };

  const deleteRace = async (raceId) => {
    const races = await getRaces();
    const raceToDelete = races.find((race) => race.id === raceId);

    await deleteDoc(doc(db, "races", raceId));

    const remainingRaces = races.filter((race) => race.id !== raceId);
    if (raceToDelete?.isDefault && remainingRaces.length > 0) {
      await setDefaultRace(remainingRaces[0].id);
    }
  };

  const setDefaultRace = async (raceId) => {
    const races = await getRaces();
    const batch = writeBatch(db);

    races.forEach((race) => {
      batch.update(doc(db, "races", race.id), {
        isDefault: race.id === raceId,
      });
    });

    await batch.commit();
  };

  const getRacesListener = (onUpdate, onError = () => {}) => {
    return onSnapshot(
      racesCollection,
      (snapshot) => {
        const races = snapshot.docs.map(normalizeRace);
        onUpdate(races);
      },
      onError
    );
  };

  const getTeams = async () => {
    const snapshot = await getDocs(teamsCollection);
    return snapshot.docs.map((teamDoc) => ({
      id: teamDoc.id,
      ...teamDoc.data(),
    }));
  };

  const getTeamsListener = (onUpdate, onError = () => {}) => {
    return onSnapshot(
      teamsCollection,
      (snapshot) => {
        const teams = snapshot.docs.map((teamDoc) => ({
          id: teamDoc.id,
          ...teamDoc.data(),
        }));
        onUpdate(teams);
      },
      onError
    );
  };

  const createTeam = async (teamData) => {
    const docRef = await addDoc(teamsCollection, teamData);
    return docRef.id;
  };

  const updateTeam = async (teamId, data) => {
    const teamRef = doc(db, "teams", teamId);
    await updateDoc(teamRef, data);
  };

  const deleteTeam = async (teamId) => {
    if (!teamId) return;
    await deleteDoc(doc(db, "teams", teamId));
  };

  const getUser = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  };

  const setUser = async (userId, data) => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data);
  };

  const normalizeAppointment = (snapshotOrAppointment) => {
    if (!snapshotOrAppointment) return null;

    const data =
      typeof snapshotOrAppointment.data === "function"
        ? snapshotOrAppointment.data()
        : snapshotOrAppointment;

    return {
      id: snapshotOrAppointment.id || data.id,
      title: data.title ?? "",
      titleEn: data.titleEn ?? "",
      date: data.date ?? "",
      time: data.time ?? "",
      location: data.location ?? "",
      locationEn: data.locationEn ?? "",
      description: data.description ?? "",
      descriptionEn: data.descriptionEn ?? "",
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  };

  const normalizeFaq = (snapshotOrFaq) => {
    if (!snapshotOrFaq) return null;

    const data =
      typeof snapshotOrFaq.data === "function"
        ? snapshotOrFaq.data()
        : snapshotOrFaq;

    return {
      id: snapshotOrFaq.id || data.id,
      question: data.question ?? "",
      questionEn: data.questionEn ?? "",
      answer: data.answer ?? "",
      answerEn: data.answerEn ?? "",
      hidden: data.hidden === true,
      order: Number(data.order) || 0,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  };

  const getAppointments = async () => {
    const snapshot = await getDocs(appointmentsCollection);
    return snapshot.docs.map(normalizeAppointment);
  };

  const getAppointmentsListener = (onUpdate, onError = () => {}) => {
    return onSnapshot(
      appointmentsCollection,
      (snapshot) => {
        const appointments = snapshot.docs.map(normalizeAppointment);
        onUpdate(appointments);
      },
      onError
    );
  };

  const createAppointment = async (appointmentData) => {
    const docRef = await addDoc(appointmentsCollection, {
      title: appointmentData.title ?? "",
      titleEn: appointmentData.titleEn ?? "",
      date: appointmentData.date ?? "",
      time: appointmentData.time ?? "",
      location: appointmentData.location ?? "",
      locationEn: appointmentData.locationEn ?? "",
      description: appointmentData.description ?? "",
      descriptionEn: appointmentData.descriptionEn ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  };

  const updateAppointment = async (appointmentId, data) => {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteAppointment = async (appointmentId) => {
    await deleteDoc(doc(db, "appointments", appointmentId));
  };

  const normalizeHelp = (snapshotOrHelp) => {
    if (!snapshotOrHelp) return null;

    const data =
      typeof snapshotOrHelp.data === "function"
        ? snapshotOrHelp.data()
        : snapshotOrHelp;

    return {
      id: snapshotOrHelp.id || data.id,
      title: data.title ?? "",
      titleEn: data.titleEn ?? "",
      body: data.body ?? "",
      bodyEn: data.bodyEn ?? "",
      hidden: data.hidden === true,
      order: Number(data.order) || 0,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  };

  const getFaqs = async () => {
    const snapshot = await getDocs(faqCollection);
    const faqs = snapshot.docs.map(normalizeFaq);
    return faqs.sort((a, b) => a.order - b.order);
  };

  const getFaqsListener = (onUpdate, onError = () => {}) => {
    return onSnapshot(
      faqCollection,
      (snapshot) => {
        const faqs = snapshot.docs
          .map(normalizeFaq)
          .sort((a, b) => a.order - b.order);
        onUpdate(faqs);
      },
      onError
    );
  };

  const createFaq = async (faqData) => {
    const existingFaqs = await getFaqs();
    const maxOrder =
      existingFaqs.length > 0
        ? Math.max(...existingFaqs.map((f) => f.order))
        : -1;

    const docRef = await addDoc(faqCollection, {
      question: faqData.question ?? "",
      questionEn: faqData.questionEn ?? "",
      answer: faqData.answer ?? "",
      answerEn: faqData.answerEn ?? "",
      hidden: faqData.hidden === true,
      order:
        faqData.order === undefined || faqData.order === null
          ? maxOrder + 1
          : Number(faqData.order),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  };

  const updateFaq = async (faqId, data) => {
    const faqRef = doc(db, "faq", faqId);
    await updateDoc(faqRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteFaq = async (faqId) => {
    await deleteDoc(doc(db, "faq", faqId));
  };

  const getHelps = async () => {
    const snapshot = await getDocs(helpCollection);
    const helps = snapshot.docs.map(normalizeHelp);
    return helps.sort((a, b) => a.order - b.order);
  };

  const getHelpsListener = (onUpdate, onError = () => {}) => {
    return onSnapshot(
      helpCollection,
      (snapshot) => {
        const helps = snapshot.docs
          .map(normalizeHelp)
          .sort((a, b) => a.order - b.order);
        onUpdate(helps);
      },
      onError
    );
  };

  const createHelp = async (helpData) => {
    const existingHelps = await getHelps();
    const maxOrder =
      existingHelps.length > 0
        ? Math.max(...existingHelps.map((h) => h.order))
        : -1;

    const docRef = await addDoc(helpCollection, {
      title: helpData.title ?? "",
      titleEn: helpData.titleEn ?? "",
      body: helpData.body ?? "",
      bodyEn: helpData.bodyEn ?? "",
      hidden: helpData.hidden === true,
      order:
        helpData.order === undefined || helpData.order === null
          ? maxOrder + 1
          : Number(helpData.order),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  };

  const updateHelp = async (helpId, data) => {
    const helpRef = doc(db, "help", helpId);
    await updateDoc(helpRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteHelp = async (helpId) => {
    await deleteDoc(doc(db, "help", helpId));
  };

  const reorderHelps = async (helps) => {
    const batch = writeBatch(db);
    helps.forEach((help, index) => {
      batch.update(doc(db, "help", help.id), { order: index });
    });
    await batch.commit();
  };

  const reorderFaqs = async (faqs) => {
    const batch = writeBatch(db);
    faqs.forEach((faq, index) => {
      batch.update(doc(db, "faq", faq.id), { order: index });
    });
    await batch.commit();
  };

  return {
    createSegment,
    normalizeSegments,
    getRace,
    getRaces,
    getDefaultRace,
    createRace,
    updateRace,
    deleteRace,
    setDefaultRace,
    getRacesListener,
    getTeams,
    getTeamsListener,
    createTeam,
    updateTeam,
    deleteTeam,
    getUser,
    setUser,
    getAppointments,
    getAppointmentsListener,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getFaqs,
    getFaqsListener,
    createFaq,
    updateFaq,
    deleteFaq,
    reorderFaqs,
    getHelps,
    getHelpsListener,
    createHelp,
    updateHelp,
    deleteHelp,
    reorderHelps,
  };
}
