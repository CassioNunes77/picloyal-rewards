//
//  SplashScreenView.swift
//  CartaoFidelidade
//
//  Splash screen global que aparece sempre ao abrir o app
//

import SwiftUI

struct SplashScreenView: View {
    var onComplete: () -> Void
    
    @State private var splashAnimated = false
    @State private var splashVisible = true
    @State private var fadeOut = false
    
    private let splashDuration: Double = 2.0
    
    var body: some View {
        if splashVisible {
            ZStack {
                AppGradients.hero
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Logo Core+ centralizado com animação
                    Image("CorePlusLogo")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(maxWidth: 280, maxHeight: 280)
                        .scaleEffect(splashAnimated ? (fadeOut ? 1.2 : 1.0) : 0.3)
                        .opacity(fadeOut ? 0.0 : (splashAnimated ? 1.0 : 0.0))
                        .blur(radius: fadeOut ? 10 : 0)
                        .animation(
                            .spring(response: 0.8, dampingFraction: 0.6)
                            .delay(0.1),
                            value: splashAnimated
                        )
                        .animation(
                            .easeOut(duration: 0.5),
                            value: fadeOut
                        )
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, AppSpacing.lg)
                .opacity(fadeOut ? 0 : 1)
                .animation(
                    .easeOut(duration: 0.5),
                    value: fadeOut
                )
            }
            .onAppear {
                // Iniciar animação quando a view aparecer
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    withAnimation {
                        splashAnimated = true
                    }
                }
                
                // Iniciar fade out antes de esconder
                DispatchQueue.main.asyncAfter(deadline: .now() + splashDuration - 0.5) {
                    withAnimation(.easeOut(duration: 0.5)) {
                        fadeOut = true
                    }
                }
                
                // Esconder splash após duração
                DispatchQueue.main.asyncAfter(deadline: .now() + splashDuration) {
                    splashVisible = false
                    onComplete()
                }
            }
        }
    }
}

#Preview {
    SplashScreenView(onComplete: { })
}
