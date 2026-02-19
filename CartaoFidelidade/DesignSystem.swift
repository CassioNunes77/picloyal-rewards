//
//  DesignSystem.swift
//  CartaoFidelidade
//
//  Design System baseado no site web React + Vite
//  Cores adaptativas para modo claro/escuro (alinhado com index.css .dark)
//

import SwiftUI
import UIKit

// MARK: - Colors (adaptativas para modo escuro via preferredColorScheme)
extension Color {
    // Background - light: hsl(250 20% 98%), dark: hsl(250 30% 8%)
    static let appBackground = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.05, green: 0.05, blue: 0.08, alpha: 1)
            : UIColor(red: 0.98, green: 0.98, blue: 0.99, alpha: 1)
    })
    static let appForeground = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.98, green: 0.98, blue: 0.98, alpha: 1)
            : UIColor(red: 0.1, green: 0.1, blue: 0.12, alpha: 1)
    })
    
    // Card - light: white, dark: hsl(250 25% 12%)
    static let card = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.08, green: 0.08, blue: 0.1, alpha: 1)
            : UIColor.white
    })
    static let cardForeground = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.98, green: 0.98, blue: 0.98, alpha: 1)
            : UIColor(red: 0.1, green: 0.1, blue: 0.12, alpha: 1)
    })
    
    // Primary (verde) - mantém similar em ambos
    static let primary = Color(red: 0.2, green: 0.8, blue: 0.4)
    static let primaryForeground = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.05, green: 0.05, blue: 0.08, alpha: 1)
            : UIColor.white
    })
    
    // Secondary (roxo)
    static let secondary = Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0)
    static let secondaryForeground = Color.white
    
    // Muted - light: hsl(250 15% 90%), dark: hsl(250 20% 20%)
    static let muted = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.18, green: 0.18, blue: 0.2, alpha: 1)
            : UIColor(red: 0.9, green: 0.9, blue: 0.92, alpha: 1)
    })
    static let mutedForeground = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.65, green: 0.65, blue: 0.7, alpha: 1)
            : UIColor(red: 0.45, green: 0.45, blue: 0.5, alpha: 1)
    })
    
    // Accent - light: hsl(155 60% 95%), dark: hsl(155 50% 15%)
    static let accent = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.08, green: 0.15, blue: 0.1, alpha: 1)
            : UIColor(red: 0.95, green: 0.98, blue: 0.96, alpha: 1)
    })
    static let accentForeground = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.4, green: 0.85, blue: 0.45, alpha: 1)
            : UIColor(red: 0.3, green: 0.8, blue: 0.3, alpha: 1)
    })
    
    // Destructive
    static let destructive = Color(red: 0.9, green: 0.2, blue: 0.2)
    static let destructiveForeground = Color.white
    
    // Border - light: hsl(250 15% 90%), dark: hsl(250 20% 20%)
    static let border = Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.18, green: 0.18, blue: 0.2, alpha: 1)
            : UIColor(red: 0.9, green: 0.9, blue: 0.92, alpha: 1)
    })
    
    // Hero (área roxa) - texto e ícones sempre brancos (roxo mantém mesmo tom em ambos os modos)
    static let heroForeground = Color.white
    static let heroForegroundMuted = Color(white: 1, opacity: 0.8)
    static let heroForegroundSubtle = Color(white: 1, opacity: 0.6)
    /// Overlay para círculos/botões na área hero
    static let heroOverlay = Color(white: 1, opacity: 0.2)
}

// MARK: - Gradients
struct AppGradients {
    // Primary Gradient (verde)
    static let primary = LinearGradient(
        colors: [
            Color(red: 0.2, green: 0.8, blue: 0.4), // hsl(155 80% 40%)
            Color(red: 0.25, green: 0.85, blue: 0.45) // hsl(170 70% 45%)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Secondary Gradient (roxo) - alinhado com WEB
    static let secondary = LinearGradient(
        colors: [
            Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0), // hsl(270 70% 55%) = #A82AE0
            Color(red: 128/255.0, green: 26/255.0, blue: 179/255.0) // hsl(290 60% 50%) = #801BB3
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Hero Gradient (roxo vertical) - mesmo tom de roxo em modo claro e escuro
    static let hero = LinearGradient(
        colors: [
            Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0), // #A82AE0
            Color(red: 138/255.0, green: 45/255.0, blue: 184/255.0)  // #801BB3
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    // Card Gradient (roxo para verde) - alinhado com WEB
    // Gradiente diagonal 145deg: hsl(270 70% 55%) -> hsl(155 80% 40%)
    static let card = LinearGradient(
        colors: [
            Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0), // hsl(270 70% 55%) = #A82AE0 - roxo claro
            Color(red: 51/255.0, green: 204/255.0, blue: 102/255.0) // hsl(155 80% 40%) = #33CC66 - verde
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - Typography
extension Font {
    static let appTitle = Font.system(size: 20, weight: .bold, design: .rounded)
    static let appHeadline = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let appBody = Font.system(size: 16, weight: .regular, design: .rounded)
    static let appCaption = Font.system(size: 12, weight: .medium, design: .rounded)
}

// MARK: - Spacing
struct AppSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
}

// MARK: - Corner Radius
struct AppRadius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
}

// MARK: - Shadows
struct AppShadow {
    static let sm = Shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    static let md = Shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    static let lg = Shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
    static let xl = Shadow(color: .black.opacity(0.1), radius: 20, x: 0, y: 8)
}

struct Shadow {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

extension View {
    func appShadow(_ shadow: Shadow) -> some View {
        self.shadow(color: shadow.color, radius: shadow.radius, x: shadow.x, y: shadow.y)
    }
}

// MARK: - Bottom-rounded shape (evita depender de UnevenRoundedRectangle / dyld)
struct BottomRoundedShape: Shape {
    var radius: CGFloat
    func path(in rect: CGRect) -> Path {
        Path {
            $0.move(to: CGPoint(x: rect.minX, y: rect.minY))
            $0.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
            $0.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - radius))
            $0.addArc(tangent1End: CGPoint(x: rect.maxX, y: rect.maxY), tangent2End: CGPoint(x: rect.maxX - radius, y: rect.maxY), radius: radius)
            $0.addLine(to: CGPoint(x: rect.minX + radius, y: rect.maxY))
            $0.addArc(tangent1End: CGPoint(x: rect.minX, y: rect.maxY), tangent2End: CGPoint(x: rect.minX, y: rect.maxY - radius), radius: radius)
            $0.closeSubpath()
        }
    }
}
