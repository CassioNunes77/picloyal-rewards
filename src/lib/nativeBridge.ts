/**
 * Bridge para comunicação Web ↔ iOS nativo (WKWebView)
 *
 * Quando o app web roda dentro do app iOS (WebView), usa recursos nativos:
 * - Login com Apple / Google (em vez de popup)
 * - Compra Premium via StoreKit (em vez de Stripe)
 */

declare global {
  interface Window {
    /** Flag injetada pelo app iOS no document start — garante detecção mesmo com cache */
    __corePlusNativeApp?: boolean;
    __nativeBridge?: {
      isIOSWebView: boolean;
      onAppleSignIn: ((data: { idToken: string; rawNonce: string } | { error: string }) => void) | null;
      onGoogleSignIn: ((data: { idToken: string; accessToken: string } | { error: string }) => void) | null;
      onPurchaseResult: ((data: { success: boolean; error?: string; cancelled?: boolean }) => void) | null;
      onRestoreResult: ((data: { success: boolean; error?: string }) => void) | null;
    };
    __locusGoogleSignInToken?: ((idToken: string) => void) | null;
    __locusGoogleSignInError?: ((msg: string) => void) | null;
    webkit?: {
      messageHandlers?: {
        loginWithApple?: { postMessage: (body?: unknown) => void };
        requestGoogleSignIn?: { postMessage: (body?: unknown) => void };
        purchasePremium?: { postMessage: (body: { userId: string }) => void };
        restorePurchases?: { postMessage: (body: { userId: string }) => void };
      };
    };
  }
}

/** Detecta app iOS WebView — flag injetada pelo nativo OU messageHandlers */
export function isIOSWebView(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.__corePlusNativeApp || !!window.webkit?.messageHandlers;
}

export function loginWithAppleNative(): Promise<{ idToken: string; rawNonce: string }> {
  return new Promise((resolve, reject) => {
    const handler = window.webkit?.messageHandlers?.loginWithApple;
    if (!handler) {
      reject(new Error("Bridge não disponível"));
      return;
    }
    if (!window.__nativeBridge) window.__nativeBridge = { isIOSWebView: true, onAppleSignIn: null, onGoogleSignIn: null, onPurchaseResult: null, onRestoreResult: null };
    const original = window.__nativeBridge.onAppleSignIn;
    window.__nativeBridge.onAppleSignIn = (data) => {
      window.__nativeBridge!.onAppleSignIn = original;
      if ("error" in data) {
        if (data.error === "cancelled") reject(new Error("auth/cancelled-popup-request"));
        else reject(new Error(data.error));
      } else {
        resolve({ idToken: data.idToken, rawNonce: data.rawNonce });
      }
    };
    handler.postMessage({});
  });
}

/** Login Google via SDK nativo (modelo Locus) — alerta do sistema, depois navegador */
export function loginWithGoogleNative(): Promise<{ idToken: string }> {
  return new Promise((resolve, reject) => {
    const handler = window.webkit?.messageHandlers?.requestGoogleSignIn;
    if (!handler) {
      reject(new Error("Bridge não disponível"));
      return;
    }
    const onToken = (idToken: string) => {
      window.__locusGoogleSignInToken = null;
      window.__locusGoogleSignInError = null;
      resolve({ idToken });
    };
    const onError = (msg: string) => {
      window.__locusGoogleSignInToken = null;
      window.__locusGoogleSignInError = null;
      reject(new Error(msg || "Login cancelado"));
    };
    window.__locusGoogleSignInToken = onToken;
    window.__locusGoogleSignInError = onError;
    try {
      handler.postMessage({});
    } catch (e) {
      window.__locusGoogleSignInToken = null;
      window.__locusGoogleSignInError = null;
      reject(e);
    }
  });
}

export function purchasePremiumNative(userId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const handler = window.webkit?.messageHandlers?.purchasePremium;
    if (!handler) {
      reject(new Error("Bridge não disponível"));
      return;
    }
    if (!window.__nativeBridge) window.__nativeBridge = { isIOSWebView: true, onAppleSignIn: null, onGoogleSignIn: null, onPurchaseResult: null, onRestoreResult: null };
    const original = window.__nativeBridge.onPurchaseResult;
    window.__nativeBridge.onPurchaseResult = (data) => {
      window.__nativeBridge!.onPurchaseResult = original;
      if (data.cancelled) reject(new Error("Compra cancelada"));
      else if (data.success) resolve(true);
      else reject(new Error(data.error ?? "Erro na compra"));
    };
    handler.postMessage({ userId });
  });
}

export function restorePurchasesNative(userId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const handler = window.webkit?.messageHandlers?.restorePurchases;
    if (!handler) {
      reject(new Error("Bridge não disponível"));
      return;
    }
    if (!window.__nativeBridge) window.__nativeBridge = { isIOSWebView: true, onAppleSignIn: null, onGoogleSignIn: null, onPurchaseResult: null, onRestoreResult: null };
    const original = window.__nativeBridge.onRestoreResult;
    window.__nativeBridge.onRestoreResult = (data) => {
      window.__nativeBridge!.onRestoreResult = original;
      if (data.success) resolve(true);
      else reject(new Error(data.error ?? "Erro ao restaurar"));
    };
    handler.postMessage({ userId });
  });
}
