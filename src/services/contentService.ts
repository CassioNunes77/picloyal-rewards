import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

const APP_CONTENT_COLLECTION = "appContent";
const PRIVACY_POLICY_DOC = "privacyPolicy";

export interface PrivacyPolicyData {
  text: string;
  updatedAt: Timestamp | null;
}

const defaultPolicyText = `Política de Privacidade – Core+

Última atualização: conforme alterações no painel administrativo.

1. Coleta de dados
O Core+ coleta apenas os dados necessários para o funcionamento do programa de fidelidade: nome, e-mail, dados de uso do app e pontos de fidelidade.

2. Uso dos dados
Utilizamos seus dados para gerenciar sua conta, exibir ofertas e recompensas e melhorar a experiência no aplicativo.

3. Compartilhamento
Não vendemos seus dados. Podemos compartilhar informações apenas com lojas parceiras para aplicação de ofertas e pontos, dentro do escopo do programa.

4. Segurança
Adotamos medidas técnicas para proteger seus dados contra acesso não autorizado.

5. Seus direitos
Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato conosco.

6. Alterações
Esta política pode ser atualizada. O uso continuado do app após alterações constitui aceite da nova versão.`;

/**
 * Busca o texto da Política de Privacidade no Firestore.
 * Usado em: Web (usuário e lojista), iOS (usuário e lojista).
 */
export async function getPrivacyPolicy(): Promise<PrivacyPolicyData> {
  if (!firestore) {
    return { text: defaultPolicyText, updatedAt: null };
  }
  const ref = doc(firestore, APP_CONTENT_COLLECTION, PRIVACY_POLICY_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { text: defaultPolicyText, updatedAt: null };
  }
  const data = snap.data();
  return {
    text: typeof data?.text === "string" ? data.text : defaultPolicyText,
    updatedAt: (data?.updatedAt as PrivacyPolicyData["updatedAt"]) ?? null,
  };
}

/**
 * Atualiza o texto da Política de Privacidade (painel admin).
 * Requer usuário autenticado no Firebase para write.
 */
export async function setPrivacyPolicy(text: string): Promise<void> {
  if (!firestore) throw new Error("Firestore não configurado.");
  const ref = doc(firestore, APP_CONTENT_COLLECTION, PRIVACY_POLICY_DOC);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { text, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { text, updatedAt: serverTimestamp() });
  }
}
