//
//  AppConfirmationDialog.swift
//  CartaoFidelidade
//
//  Diálogo de confirmação padrão do app (ex.: "Deseja sair da página?")
//

import SwiftUI

/// Botão de ação no diálogo (Cancelar / Destrutivo / Padrão)
enum AppConfirmationActionStyle {
    case cancel
    case destructive
    case `default`
}

/// Ação do diálogo de confirmação
struct AppConfirmationAction {
    let title: String
    let style: AppConfirmationActionStyle
    let action: () -> Void
}

/// Diálogo de confirmação com padrão visual do app (card, blur de fundo, botões).
struct AppConfirmationDialog: View {
    let title: String
    let message: String
    let primaryButton: AppConfirmationAction
    let secondaryButton: AppConfirmationAction?
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture { }
            
            VStack(spacing: 0) {
                VStack(alignment: .leading, spacing: AppSpacing.sm) {
                    Text(title)
                        .font(.appTitle)
                        .foregroundColor(.cardForeground)
                    
                    Text(message)
                        .font(.appBody)
                        .foregroundColor(.mutedForeground)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppSpacing.lg)
                
                Divider()
                    .background(Color.border)
                
                HStack(spacing: 0) {
                    if let secondary = secondaryButton {
                        Button(action: secondary.action) {
                            Text(secondary.title)
                                .font(.system(size: 16, weight: .semibold, design: .rounded))
                                .foregroundColor(secondary.style == .destructive ? .destructive : (secondary.style == .cancel ? .mutedForeground : .primary))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, AppSpacing.md)
                        }
                        .buttonStyle(PlainButtonStyle())
                        
                        Divider()
                            .frame(height: 44)
                            .background(Color.border)
                    }
                    
                    Button(action: primaryButton.action) {
                        Text(primaryButton.title)
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(primaryButton.style == .destructive ? .destructive : .primary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.md)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .background(Color.card)
            .cornerRadius(AppRadius.xl)
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.xl)
                    .stroke(Color.border, lineWidth: 1)
            )
            .appShadow(AppShadow.xl)
            .padding(.horizontal, AppSpacing.xl)
        }
    }
}

/// Overlay de confirmação controlado por binding (substitui .alert nativo).
struct AppConfirmationOverlay: ViewModifier {
    @Binding var isPresented: Bool
    let title: String
    let message: String
    let primaryTitle: String
    let primaryStyle: AppConfirmationActionStyle
    let primaryAction: () -> Void
    let secondaryTitle: String?
    let secondaryAction: (() -> Void)?
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            if isPresented {
                AppConfirmationDialog(
                    title: title,
                    message: message,
                    primaryButton: AppConfirmationAction(
                        title: primaryTitle,
                        style: primaryStyle,
                        action: {
                            primaryAction()
                            isPresented = false
                        }
                    ),
                    secondaryButton: secondaryTitle.map { title in
                        AppConfirmationAction(
                            title: title,
                            style: .cancel,
                            action: {
                                secondaryAction?()
                                isPresented = false
                            }
                        )
                    }
                )
                .transition(.opacity.combined(with: .scale(scale: 0.95)))
                .animation(.easeInOut(duration: 0.25), value: isPresented)
            }
        }
    }
}

extension View {
    /// Diálogo de confirmação no padrão visual do app (ex.: "Deseja sair da página?").
    func appConfirmation(
        isPresented: Binding<Bool>,
        title: String,
        message: String,
        primaryTitle: String,
        primaryStyle: AppConfirmationActionStyle = .default,
        primaryAction: @escaping () -> Void,
        secondaryTitle: String? = "Cancelar",
        secondaryAction: (() -> Void)? = nil
    ) -> some View {
        modifier(AppConfirmationOverlay(
            isPresented: isPresented,
            title: title,
            message: message,
            primaryTitle: primaryTitle,
            primaryStyle: primaryStyle,
            primaryAction: primaryAction,
            secondaryTitle: secondaryTitle,
            secondaryAction: secondaryAction
        ))
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State private var show = true
        var body: some View {
            Color.appBackground
                .ignoresSafeArea()
                .appConfirmation(
                    isPresented: $show,
                    title: "Sair da página?",
                    message: "Deseja realmente sair? As alterações não salvas podem ser perdidas.",
                    primaryTitle: "Sair",
                    primaryStyle: .destructive,
                    primaryAction: { },
                    secondaryTitle: "Cancelar",
                    secondaryAction: nil
                )
        }
    }
    return PreviewWrapper()
}
