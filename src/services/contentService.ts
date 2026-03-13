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
const TERMS_OF_USE_DOC = "termsOfUse";

export interface PrivacyPolicyData {
  text: string;
  updatedAt: Timestamp | null;
}

export interface TermsOfUseData {
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

const defaultTermsText = `Termos de Uso – Core+

Última atualização: conforme alterações no painel administrativo.

1. Aceitação dos Termos
Ao utilizar o aplicativo Core+, você concorda com estes Termos de Uso. Se não concordar, não utilize o aplicativo.

2. Descrição do Serviço
O Core+ é um aplicativo de programa de fidelidade que permite aos usuários acumular pontos, resgatar recompensas e acessar ofertas exclusivas em estabelecimentos parceiros.

3. Cadastro e Conta
Você é responsável por manter a confidencialidade de suas credenciais de acesso. Todas as atividades realizadas em sua conta são de sua responsabilidade.

4. Uso Adequado
Você concorda em utilizar o aplicativo apenas para fins lícitos e de acordo com estes termos. É proibido:
- Usar o app para atividades fraudulentas
- Tentar acessar áreas restritas do sistema
- Compartilhar sua conta com terceiros

5. Pontos e Recompensas
Os pontos acumulados não têm valor monetário e não podem ser trocados por dinheiro. As recompensas estão sujeitas à disponibilidade e podem ser alteradas sem aviso prévio.

6. Propriedade Intelectual
Todo o conteúdo do aplicativo, incluindo marca, design e código, é de propriedade do Core+ e está protegido por leis de propriedade intelectual.

7. Limitação de Responsabilidade
O Core+ não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso do aplicativo.

8. Modificações
Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado do app após alterações constitui aceite dos novos termos.

9. Encerramento
Podemos encerrar ou suspender sua conta a qualquer momento, sem aviso prévio, por violação destes termos.

10. Contato
Para dúvidas sobre estes termos, entre em contato conosco através do aplicativo.`;

/**
 * Busca o texto dos Termos de Uso no Firestore.
 */
export async function getTermsOfUse(): Promise<TermsOfUseData> {
  if (!firestore) {
    return { text: defaultTermsText, updatedAt: null };
  }
  const ref = doc(firestore, APP_CONTENT_COLLECTION, TERMS_OF_USE_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { text: defaultTermsText, updatedAt: null };
  }
  const data = snap.data();
  return {
    text: typeof data?.text === "string" ? data.text : defaultTermsText,
    updatedAt: (data?.updatedAt as TermsOfUseData["updatedAt"]) ?? null,
  };
}

/**
 * Atualiza o texto dos Termos de Uso (painel admin).
 */
export async function setTermsOfUse(text: string): Promise<void> {
  if (!firestore) throw new Error("Firestore não configurado.");
  const ref = doc(firestore, APP_CONTENT_COLLECTION, TERMS_OF_USE_DOC);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { text, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { text, updatedAt: serverTimestamp() });
  }
}
