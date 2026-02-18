//
//  AppToast.swift
//  CartaoFidelidade
//
//  Mensagem flutuante padrão do app (toast)
//

import SwiftUI

/// Toast flutuante com padrão visual do app (card, sombra, tipografia).
struct AppToast: View {
    let message: String
    var duration: Double = 2.5
    var onDismiss: (() -> Void)?
    
    var body: some View {
        Text(message)
            .font(.appBody)
            .foregroundColor(.cardForeground)
            .multilineTextAlignment(.center)
            .padding(.horizontal, AppSpacing.lg)
            .padding(.vertical, AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .stroke(Color.border, lineWidth: 1)
            )
            .appShadow(AppShadow.lg)
            .padding(.horizontal, AppSpacing.lg)
            .padding(.bottom, 100)
    }
}

/// Modificador para exibir um toast controlado por binding.
struct AppToastModifier: ViewModifier {
    @Binding var isPresented: Bool
    var message: String
    var duration: Double = 2.5
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            if isPresented {
                VStack {
                    Spacer()
                    AppToast(message: message)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.easeInOut(duration: 0.25), value: isPresented)
            }
        }
        .onChange(of: isPresented) { _, newValue in
            if newValue { scheduleDismiss() }
        }
        .onAppear {
            if isPresented { scheduleDismiss() }
        }
    }
    
    private func scheduleDismiss() {
        DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
            withAnimation(.easeInOut(duration: 0.2)) {
                isPresented = false
            }
        }
    }
}

extension View {
    /// Exibe mensagem flutuante (toast) no padrão visual do app.
    func appToast(isPresented: Binding<Bool>, message: String, duration: Double = 2.5) -> some View {
        modifier(AppToastModifier(isPresented: isPresented, message: message, duration: duration))
    }
}

#Preview {
    ZStack {
        Color.appBackground.ignoresSafeArea()
        VStack { Spacer() }
            .appToast(isPresented: .constant(true), message: "Alterações salvas com sucesso!")
    }
}
