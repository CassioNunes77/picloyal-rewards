//
//  ContentView.swift
//  CartaoFidelidade
//
//  View principal - equivalente ao Index.tsx
//

import SwiftUI

struct ContentView: View {
    @State private var activeTab = "home"
    @State private var showSettings = false
    @State private var showQRCode = false
    
    var body: some View {
        ZStack {
            // Main Content
            Group {
                if showSettings {
                    SettingsScreen(onBack: { showSettings = false })
                        .transition(.move(edge: .trailing))
                } else {
                    switch activeTab {
                    case "home":
                        HomeView(showSettings: $showSettings, activeTab: $activeTab, showQRCode: $showQRCode)
                            .transition(.move(edge: .leading))
                    case "stores":
                        StoresView(activeTab: $activeTab)
                            .transition(.move(edge: .leading))
                    case "offers":
                        OffersView(activeTab: $activeTab)
                            .transition(.move(edge: .leading))
                    case "profile":
                        ProfileView(activeTab: $activeTab)
                            .transition(.move(edge: .leading))
                    case "notifications":
                        NotificationsView(activeTab: $activeTab)
                            .transition(.move(edge: .leading))
                    case "rewards":
                        RewardsView(activeTab: $activeTab)
                            .transition(.move(edge: .leading))
                    default:
                        HomeView(showSettings: $showSettings, activeTab: $activeTab, showQRCode: $showQRCode)
                            .transition(.move(edge: .leading))
                    }
                }
            }
            
            // Bottom Navigation (only show if not in settings)
            if !showSettings {
                BottomNav(activeTab: $activeTab, showQRCode: $showQRCode)
            }
            
            // QR Code Card
            if showQRCode {
                QRCodeCard(isPresented: $showQRCode, qrCodeData: "CARTEIRA:4589")
            }
        }
        .animation(.easeInOut(duration: 0.3), value: showSettings)
        .animation(.easeInOut(duration: 0.3), value: activeTab)
    }
}

#Preview {
    ContentView()
}
