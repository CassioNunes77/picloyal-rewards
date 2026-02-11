//
//  DesignSystem.swift
//  CartaoFidelidade
//
//  Design System baseado no site web React + Vite
//

import SwiftUI

// MARK: - Colors
extension Color {
    // Background
    static let appBackground = Color(red: 0.98, green: 0.98, blue: 0.99) // hsl(250 20% 98%)
    static let appForeground = Color(red: 0.1, green: 0.1, blue: 0.12) // hsl(250 30% 10%)
    
    // Card
    static let card = Color.white
    static let cardForeground = Color(red: 0.1, green: 0.1, blue: 0.12)
    
    // Primary (verde)
    static let primary = Color(red: 0.2, green: 0.8, blue: 0.4) // hsl(155 80% 40%)
    static let primaryForeground = Color.white
    
    // Secondary (roxo) - alinhado com WEB
    static let secondary = Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0) // hsl(270 70% 55%) = #A82AE0
    static let secondaryForeground = Color.white
    
    // Muted
    static let muted = Color(red: 0.9, green: 0.9, blue: 0.92) // hsl(250 15% 90%)
    static let mutedForeground = Color(red: 0.45, green: 0.45, blue: 0.5) // hsl(250 15% 45%)
    
    // Accent
    static let accent = Color(red: 0.95, green: 0.98, blue: 0.96) // hsl(155 60% 95%)
    static let accentForeground = Color(red: 0.3, green: 0.8, blue: 0.3) // hsl(155 80% 30%)
    
    // Destructive
    static let destructive = Color(red: 0.9, green: 0.2, blue: 0.2) // hsl(0 72% 50%)
    static let destructiveForeground = Color.white
    
    // Border
    static let border = Color(red: 0.9, green: 0.9, blue: 0.92)
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
    
    // Hero Gradient (roxo vertical) - alinhado com WEB
    static let hero = LinearGradient(
        colors: [
            Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0), // hsl(270 70% 55%) = #A82AE0 - roxo claro
            Color(red: 138/255.0, green: 45/255.0, blue: 184/255.0) // hsl(280 60% 45%) = #8A2DB8 - roxo escuro
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    // Card Gradient (roxo para verde) - alinhado com WEB
    static let card = LinearGradient(
        colors: [
            Color(red: 168/255.0, green: 42/255.0, blue: 224/255.0), // hsl(270 70% 55%) = #A82AE0
            Color(red: 0.2, green: 0.8, blue: 0.4) // hsl(155 80% 40%)
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
