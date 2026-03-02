import { useCallback, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../Firebase/config";

export const useFirestore = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const add = useCallback(async (data) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      setLoading(false);
      return docRef.id;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName]);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, collectionName, id), data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName]);

  const queryData = useCallback(async (conditions = []) => {
    setLoading(true);
    try {
      let q = collection(db, collectionName);
      conditions.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName]);

  return { add, update, remove, queryData, loading, error };
};
