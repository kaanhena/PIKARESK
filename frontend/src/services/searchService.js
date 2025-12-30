import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../firebase";
import { marketSearchIndex } from "../data/marketSearchIndex.js";

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

function uniqueById(list) {
  const seen = new Set();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function searchUsers(prefix, maxResults = 6) {
  const term = normalize(prefix);
  if (!term) return [];
  const usersRef = collection(db, "users");
  const displayQuery = query(
    usersRef,
    orderBy("displayNameLower"),
    startAt(term),
    endAt(`${term}\uf8ff`),
    limit(maxResults)
  );
  const emailQuery = query(
    usersRef,
    orderBy("emailLower"),
    startAt(term),
    endAt(`${term}\uf8ff`),
    limit(maxResults)
  );
  const [displaySnap, emailSnap] = await Promise.all([
    getDocs(displayQuery),
    getDocs(emailQuery),
  ]);

  const results = [
    ...displaySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ...emailSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  ];

  return uniqueById(results).slice(0, maxResults);
}

export function searchProducts(prefix, maxResults = 6) {
  const term = normalize(prefix);
  if (!term) return [];
  return marketSearchIndex
    .filter((product) => {
      const name = normalize(product.name);
      const desc = normalize(product.description);
      return name.startsWith(term) || desc.includes(term);
    })
    .slice(0, maxResults);
}
