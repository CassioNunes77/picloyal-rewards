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
                        .scaleEffect(splashAnimated ? 1.0 : 0.3)
                        .opacity(splashAnimated ? 1.0 : 0.0)
                        .animation(
                            .spring(response: 0.8, dampingFraction: 0.6)
                            .delay(0.1),
                            value: splashAnimated
                        )
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, AppSpacing.lg)
            }
            .onAppear {
                // Iniciar animação quando a view aparecer
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    withAnimation {
                        splashAnimated = true
                    }
                }
                
                // Esconder splash após duração
                DispatchQueue.main.asyncAfter(deadline: .now() + splashDuration) {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        splashVisible = false
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        onComplete()
                    }
                }
            }
        }
    }
}

#Preview {
    SplashScreenView(onComplete: { })
}
