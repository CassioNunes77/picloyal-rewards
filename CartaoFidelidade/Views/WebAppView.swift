//
//  WebAppView.swift
//  CartaoFidelidade
//
//  WebView que carrega o app web (src). Usa recursos nativos via bridge.
//

import AuthenticationServices
import FirebaseCore
import GoogleSignIn
import SwiftUI
@preconcurrency import WebKit

// MARK: - Apple Sign-In Delegate (modelo APPLE_LOGIN_IOS_WEBAPP.md)
private final class AppleSignInDelegate: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private weak var anchorWindow: ASPresentationAnchor?
    private let completion: (Result<String, Error>) -> Void

    init(anchorWindow: ASPresentationAnchor, completion: @escaping (Result<String, Error>) -> Void) {
        self.anchorWindow = anchorWindow
        self.completion = completion
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let idToken = String(data: tokenData, encoding: .utf8) else {
            completion(.failure(NSError(domain: "AppleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Token não disponível"])))
            return
        }
        completion(.success(idToken))
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        completion(.failure(error))
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        anchorWindow ?? ASPresentationAnchor()
    }
}

/// URL base do app web (cardcorevo.netlify.app ou localhost para dev)
private var webAppBaseURL: String {
    Bundle.main.object(forInfoDictionaryKey: "WEB_APP_BASE_URL") as? String
        ?? "https://cardcorevo.netlify.app"
}

struct WebAppView: View {
    @StateObject private var coordinator = WebViewCoordinator()
    
    var body: some View {
        ZStack {
            WebViewRepresentable(
                url: URL(string: webAppBaseURL)!,
                coordinator: coordinator
            )
            .ignoresSafeArea()
            
            if coordinator.isLoading {
                Color.appBackground
                    .ignoresSafeArea()
                ProgressView()
                    .scaleEffect(1.2)
            }
        }
        .onAppear {
            coordinator.setupBridge()
        }
        .onOpenURL { url in
            if url.host == "cardcorevo.netlify.app" {
                // Deep links do app — futuro: atualizar URL da WebView
            } else {
                _ = GIDSignIn.sharedInstance.handle(url)
            }
        }
    }
}

/// Script injetado em didFinish — modelo Locus (GOOGLE_LOGIN_IOS_WEBAPP.md)
private let bridgeScript = """
(function() {
    if (window.__nativeBridge) return;
    window.__nativeBridge = {
        isIOSWebView: true,
        onAppleSignIn: null,
        onGoogleSignIn: null,
        onPurchaseResult: null,
        onRestoreResult: null
    };
    window.__nativeBridge.requestGoogleSignIn = function() {
        if (window.webkit?.messageHandlers?.requestGoogleSignIn) {
            window.webkit.messageHandlers.requestGoogleSignIn.postMessage({});
        }
    };
    window.__nativeBridge.requestAppleSignIn = function() {
        if (window.webkit?.messageHandlers?.requestAppleSignIn) {
            window.webkit.messageHandlers.requestAppleSignIn.postMessage({});
        }
    };
    console.log('[Core+] Native bridge ready');
})();
"""

// MARK: - WKWebView Representable
struct WebViewRepresentable: UIViewRepresentable {
    let url: URL
    @ObservedObject var coordinator: WebViewCoordinator
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.allowsInlineMediaPlayback = true
        
        // Injetar flag ANTES de qualquer script da página — garante detecção mesmo com cache
        let injectFlag = WKUserScript(
            source: "window.__corePlusNativeApp=true;",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(injectFlag)
        
        let controller = config.userContentController
        controller.add(coordinator, name: "requestAppleSignIn")
        controller.add(coordinator, name: "requestGoogleSignIn")
        controller.add(coordinator, name: "purchasePremium")
        controller.add(coordinator, name: "restorePurchases")
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.bounces = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = UIColor(white: 0.973, alpha: 1)
        webView.scrollView.backgroundColor = UIColor(white: 0.973, alpha: 1)
        
        coordinator.webView = webView
        
        var request = URLRequest(url: url)
        request.cachePolicy = .reloadIgnoringLocalCacheData
        webView.load(request)
        
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {}
    
    func makeCoordinator() -> WebViewNavigationDelegate {
        WebViewNavigationDelegate(coordinator: coordinator)
    }
}

// MARK: - Navigation Delegate
class WebViewNavigationDelegate: NSObject, WKNavigationDelegate {
    let coordinator: WebViewCoordinator
    
    init(coordinator: WebViewCoordinator) {
        self.coordinator = coordinator
    }
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.coordinator.isLoading = true
        }
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.async {
            self.coordinator.isLoading = false
            self.coordinator.injectBridgeScript()
        }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        DispatchQueue.main.async {
            self.coordinator.isLoading = false
        }
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        if url.scheme == "tel" || url.scheme == "mailto" {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }
        guard url.scheme == "http" || url.scheme == "https" else {
            decisionHandler(.allow)
            return
        }
        // URLs de OAuth: cancelar sem abrir Safari (evita abrir firebaseapp.com/__/auth/iframe ao iniciar)
        if isAuthURL(url) {
            decisionHandler(.cancel)
            return
        }
        // URLs externas (links): abrir no Safari
        if !shouldLoadInWebView(url.host, path: url.path) {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }
    
    private func isAuthURL(_ url: URL) -> Bool {
        let host = url.host ?? ""
        let path = url.path
        return path.contains("/__/auth/") || host.contains("accounts.google.com")
    }

    private func shouldLoadInWebView(_ host: String?, path: String?) -> Bool {
        guard let host else { return false }
        if let path, path.contains("/__/auth/") { return false }
        if host.contains("accounts.google.com") { return false }
        let base = (Bundle.main.object(forInfoDictionaryKey: "WEB_APP_BASE_URL") as? String) ?? "https://cardcorevo.netlify.app"
        guard let baseHost = URL(string: base)?.host else { return true }
        if host == baseHost { return true }
        if host.hasSuffix(".firebaseapp.com") || host == "firebaseapp.com" { return true }
        return false
    }
}

// MARK: - Coordinator (Bridge JS ↔ Swift)
class WebViewCoordinator: NSObject, ObservableObject, WKScriptMessageHandler {
    weak var webView: WKWebView?
    @Published var isLoading = true
    private var appleSignInDelegate: AppleSignInDelegate?
    
    func setupBridge() {}
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        let name = message.name
        let body = message.body as? [String: Any]
        
        switch name {
        case "requestAppleSignIn":
            handleRequestAppleSignIn()
        case "requestGoogleSignIn":
            handleRequestGoogleSignIn()
        case "purchasePremium":
            let userId = body?["userId"] as? String ?? ""
            handlePurchasePremium(userId: userId)
        case "restorePurchases":
            let userId = body?["userId"] as? String ?? ""
            handleRestorePurchases(userId: userId)
        default:
            break
        }
    }
    
    private func handleRequestAppleSignIn() {
        Task { @MainActor in
            await performAppleSignIn()
        }
    }

    @MainActor
    private func performAppleSignIn() async {
        guard let webView = webView else { return }
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first else {
            sendAppleSignInError(to: webView, message: "Janela indisponível para login Apple")
            return
        }
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        let controller = ASAuthorizationController(authorizationRequests: [request])
        let delegate = AppleSignInDelegate(anchorWindow: window) { [weak self, weak webView] result in
            self?.appleSignInDelegate = nil
            guard let webView else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self, weak webView] in
                guard let webView else { return }
                switch result {
                case .success(let idToken):
                    self?.sendAppleSignInToken(to: webView, idToken: idToken)
                case .failure(let error):
                    let msg = (error as NSError).domain == ASAuthorizationError.errorDomain && (error as NSError).code == ASAuthorizationError.canceled.rawValue ? "Login cancelado" : error.localizedDescription
                    self?.sendAppleSignInError(to: webView, message: msg)
                }
            }
        }
        appleSignInDelegate = delegate
        controller.delegate = delegate
        controller.presentationContextProvider = delegate
        controller.performRequests()
    }

    private func sendAppleSignInToken(to webView: WKWebView, idToken: String) {
        let escaped = idToken
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\r", with: "\\r")
            .replacingOccurrences(of: "\n", with: "\\n")
        let script = "(function(){if(typeof window.__locusAppleSignInToken==='function'){window.__locusAppleSignInToken('\(escaped)');}return 1;})()"
        webView.evaluateJavaScript(script) { _, error in
            if let error = error {
                NSLog("Core+ Apple SignIn: evaluateJavaScript failed %@", error.localizedDescription)
            }
        }
    }

    private func sendAppleSignInError(to webView: WKWebView, message: String) {
        let escaped = message
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\r", with: " ")
            .replacingOccurrences(of: "\n", with: " ")
        let script = "(function(){if(typeof window.__locusAppleSignInError==='function'){window.__locusAppleSignInError('\(escaped)');}return 1;})()"
        webView.evaluateJavaScript(script) { _, error in
            if let error = error {
                NSLog("Core+ Apple SignIn: evaluateJavaScript error failed %@", error.localizedDescription)
            }
        }
    }
    
    private func handleRequestGoogleSignIn() {
        Task { @MainActor in
            await performGoogleSignIn()
        }
    }

    @MainActor
    private func performGoogleSignIn() async {
        guard let webView = webView else { return }
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            sendGoogleSignInError(to: webView, message: "Client ID não configurado")
            return
        }
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootVC = windowScene.windows.first?.rootViewController else {
            sendGoogleSignInError(to: webView, message: "Janela indisponível")
            return
        }
        do {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootVC)
            guard let idToken = result.user.idToken?.tokenString else {
                sendGoogleSignInError(to: webView, message: "Token não disponível")
                return
            }
            sendGoogleSignInToken(to: webView, idToken: idToken)
        } catch {
            sendGoogleSignInError(to: webView, message: error.localizedDescription)
        }
    }

    private func sendGoogleSignInToken(to webView: WKWebView, idToken: String) {
        let escaped = idToken.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
        let script = "if(typeof window.__locusGoogleSignInToken==='function'){window.__locusGoogleSignInToken('\(escaped)');}"
        webView.evaluateJavaScript(script)
    }

    private func sendGoogleSignInError(to webView: WKWebView, message: String) {
        let escaped = message.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'").replacingOccurrences(of: "\n", with: " ")
        let script = "if(typeof window.__locusGoogleSignInError==='function'){window.__locusGoogleSignInError('\(escaped)');}"
        webView.evaluateJavaScript(script)
    }
    
    private func handlePurchasePremium(userId: String) {
        guard !userId.isEmpty else {
            callWeb("onPurchaseResult", json: "{\"success\":false,\"error\":\"userId obrigatório\"}")
            return
        }
        Task { @MainActor in
            do {
                let success = try await StoreKitService.shared.purchasePremiumForWebBridge(userId: userId)
                callWeb("onPurchaseResult", json: "{\"success\":\(success)}")
            } catch StoreKitError.userCancelled {
                callWeb("onPurchaseResult", json: "{\"success\":false,\"cancelled\":true}")
            } catch {
                callWeb("onPurchaseResult", json: "{\"success\":false,\"error\":\"\(error.localizedDescription.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\""))\"}")
            }
        }
    }
    
    private func handleRestorePurchases(userId: String) {
        guard !userId.isEmpty else {
            callWeb("onRestoreResult", json: "{\"success\":false,\"error\":\"userId obrigatório\"}")
            return
        }
        Task { @MainActor in
            do {
                let success = try await StoreKitService.shared.restorePurchasesForWebBridge(userId: userId)
                callWeb("onRestoreResult", json: "{\"success\":\(success)}")
            } catch {
                callWeb("onRestoreResult", json: "{\"success\":false,\"error\":\"\(error.localizedDescription.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\""))\"}")
            }
        }
    }
    
    private func callWeb(_ callback: String, json: String) {
        let script = "window.__nativeBridge?.\(callback)?.(\(json));"
        webView?.evaluateJavaScript(script)
    }
    
    private func toJSON(_ dict: [String: String]) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: dict),
              let str = String(data: data, encoding: .utf8) else { return "{}" }
        return str
    }
    
    func injectBridgeScript() {
        // Bridge injetado em didFinish — modelo Locus (evita sandbox/subframe)
        webView?.evaluateJavaScript(bridgeScript)
    }
}

#Preview {
    WebAppView()
}
