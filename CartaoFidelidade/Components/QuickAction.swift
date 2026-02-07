//
//  QuickAction.swift
//  CartaoFidelidade
//
//  Botão de ação rápida
//

import SwiftUI

struct QuickAction: View {
    let icon: String
    let label: String
    let badge: Int?
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            withAnimation(.bounceSmall) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                isPressed = false
                action()
            }
        }) {
            VStack(spacing: AppSpacing.sm) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .fill(Color.card)
                        .frame(width: 56, height: 56)
                        .appShadow(isPressed ? AppShadow.sm : AppShadow.md)
                        .scaleEffect(isPressed ? 0.95 : 1.0)
                    
                    Image(systemName: icon)
                        .foregroundColor(.secondary)
                        .font(.system(size: 24))
                        .scaleEffect(isPressed ? 0.9 : 1.0)
                    
                    if let badge = badge, badge > 0 {
                        ZStack {
                            Circle()
                                .fill(Color.destructive)
                                .frame(width: 20, height: 20)
                            
                            Text(badge > 9 ? "9+" : "\(badge)")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.destructiveForeground)
                        }
                        .offset(x: 20, y: -20)
                        .scaleEffect(isPressed ? 0.9 : 1.0)
                    }
                }
                
                Text(label)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.appForeground)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    HStack {
        QuickAction(icon: "qrcode", label: "Escanear", badge: nil) {}
        QuickAction(icon: "clock", label: "Atividades", badge: nil) {}
        QuickAction(icon: "tag", label: "Ofertas", badge: 3) {}
        QuickAction(icon: "storefront", label: "Lojas", badge: nil) {}
    }
    .padding()
}
