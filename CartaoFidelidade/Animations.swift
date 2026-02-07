//
//  Animations.swift
//  CartaoFidelidade
//
//  Animações replicando as do site web
//

import SwiftUI

// MARK: - Animation Extensions
extension Animation {
    // Fade In
    static let fadeIn = Animation.easeOut(duration: 0.3)
    
    // Slide Up
    static let slideUp = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.4)
    
    // Scale In
    static let scaleIn = Animation.easeOut(duration: 0.2)
    
    // Bounce Small
    static let bounceSmall = Animation.easeInOut(duration: 0.15)
}

// MARK: - View Modifiers for Animations
struct FadeInModifier: ViewModifier {
    let delay: Double
    @State private var opacity: Double = 0
    @State private var offset: CGFloat = 10
    
    func body(content: Content) -> some View {
        content
            .opacity(opacity)
            .offset(y: offset)
            .onAppear {
                withAnimation(.fadeIn.delay(delay)) {
                    opacity = 1
                    offset = 0
                }
            }
    }
}

struct SlideUpModifier: ViewModifier {
    let delay: Double
    @State private var opacity: Double = 0
    @State private var offset: CGFloat = 100
    
    func body(content: Content) -> some View {
        content
            .opacity(opacity)
            .offset(y: offset)
            .onAppear {
                withAnimation(.slideUp.delay(delay)) {
                    opacity = 1
                    offset = 0
                }
            }
    }
}

struct ScaleInModifier: ViewModifier {
    @State private var scale: CGFloat = 0.95
    @State private var opacity: Double = 0
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .opacity(opacity)
            .onAppear {
                withAnimation(.scaleIn) {
                    scale = 1
                    opacity = 1
                }
            }
    }
}

extension View {
    func fadeIn(delay: Double = 0) -> some View {
        modifier(FadeInModifier(delay: delay))
    }
    
    func slideUp(delay: Double = 0) -> some View {
        modifier(SlideUpModifier(delay: delay))
    }
    
    func scaleIn() -> some View {
        modifier(ScaleInModifier())
    }
}

// MARK: - Transição entre telas (apenas fade — evita salto ao remover offset)
extension AnyTransition {
    /// Fade suave; sem offset para não haver reposicionamento/salto ao finalizar.
    static var slideFadeShort: AnyTransition {
        .opacity
    }
}

// MARK: - Press Animation
struct PressModifier: ViewModifier {
    @State private var isPressed = false
    let action: () -> Void
    
    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? 0.9 : 1.0)
            .animation(.bounceSmall, value: isPressed)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !isPressed {
                            isPressed = true
                        }
                    }
                    .onEnded { _ in
                        isPressed = false
                        action()
                    }
            )
    }
}

extension View {
    func pressAnimation(action: @escaping () -> Void) -> some View {
        modifier(PressModifier(action: action))
    }
}
