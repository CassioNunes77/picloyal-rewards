//
//  CapacitorBridgeView.swift
//  App
//
//  Created by Cássio Nunes on 21/01/26.
//

import SwiftUI
import Capacitor
import WebKit

struct CapacitorBridgeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> CapacitorViewController {
        let viewController = CapacitorViewController()
        viewController.webView?.allowsBackForwardNavigationGestures = true
        return viewController
    }
    
    func updateUIViewController(_ uiViewController: CapacitorViewController, context: Context) {
        // Atualizações podem ser feitas aqui se necessário
    }
}
