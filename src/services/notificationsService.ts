import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const NOTIFICATIONS_COLLECTION = "notifications";

export type NotificationType = "offer" | "points" | "reward" | "system";

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  /** Ícone sugerido: tag | star | gift | check | clock | sparkles */
  icon?: string;
  /** Payload opcional para navegação (ex: offerId, storeId) */
  data?: Record<string, string>;
}

function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (typeof (value as { toDate?: () => Date })?.toDate === "function")
    return (value as { toDate: () => Date }).toDate();
  if (typeof (value as { seconds?: number })?.seconds === "number")
    return new Date((value as { seconds: number }).seconds * 1000);
  return new Date();
}

/**
 * Busca notificações do usuário (mais recentes primeiro).
 * Query sem orderBy para não exigir índice composto; ordena em memória.
 */
export async function getNotifications(
  userId: string,
  limitCount: number = 50
): Promise<NotificationData[]> {
  if (!firestore) return [];
  try {
    const q = query(
      collection(firestore, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        userId: String(d?.userId ?? ""),
        type: (d?.type as NotificationType) ?? "system",
        title: String(d?.title ?? ""),
        message: String(d?.message ?? ""),
        isRead: d?.isRead === true,
        createdAt: toDate(d?.createdAt),
        icon: d?.icon as string | undefined,
        data: d?.data as Record<string, string> | undefined,
      };
    });
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return items.slice(0, limitCount);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

/**
 * Marca uma notificação como lida (apenas se pertence ao usuário)
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  if (!firestore) return;
  const ref = doc(firestore, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(ref, { isRead: true });
}

/**
 * Marca todas as notificações do usuário como lidas
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  if (!firestore) return;
  const q = query(
    collection(firestore, NOTIFICATIONS_COLLECTION),
    where("userId", "==", userId),
    where("isRead", "==", false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(firestore);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { isRead: true });
  });
  if (snapshot.docs.length > 0) await batch.commit();
}

/**
 * Conta notificações não lidas do usuário
 */
export async function getUnreadCount(userId: string): Promise<number> {
  if (!firestore) return 0;
  try {
    const q = query(
      collection(firestore, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error);
    return 0;
  }
}

/**
 * Cria uma notificação para um usuário.
 * Usado quando o lojista confirma um resgate (merchant panel).
 * Requer que o chamador seja merchant (regra Firestore).
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  data?: Record<string, string>;
}): Promise<string> {
  if (!firestore) throw new Error("Firestore não configurado");
  const ref = collection(firestore, NOTIFICATIONS_COLLECTION);
  const docRef = await addDoc(ref, {
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    isRead: false,
    createdAt: Timestamp.now(),
    icon: params.icon ?? iconForType(params.type),
    data: params.data ?? {},
  });
  return docRef.id;
}

function iconForType(type: NotificationType): string {
  switch (type) {
    case "offer":
      return "tag";
    case "points":
      return "star";
    case "reward":
      return "gift";
    default:
      return "check";
  }
}
