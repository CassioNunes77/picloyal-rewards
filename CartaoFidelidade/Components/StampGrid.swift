//
//  StampGrid.swift
//  CartaoFidelidade
//
//  Grade de carimbos
//

import SwiftUI

struct StampGrid: View {
    let currentStamps: Int
    let totalStamps: Int
    let reward: String
    var storeName: String? = nil
    
    @State private var pressedIndex: Int? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                Text(storeName ?? "Seus Carimbos")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.cardForeground)
                    .lineLimit(1)
                
                Spacer()
                
                Text("\(currentStamps)/\(totalStamps)")
                    .font(.appCaption)
                    .foregroundColor(.mutedForeground)
            }
            
            // Grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 5), spacing: 12) {
                ForEach(0..<totalStamps, id: \.self) { index in
                    StampCell(
                        index: index,
                        isStamped: index < currentStamps,
                        isReward: index == totalStamps - 1,
                        isPressed: pressedIndex == index,
                        onPress: { pressed in
                            pressedIndex = pressed ? index : nil
                        }
                    )
                    .scaleIn()
                }
            }
            
            // Reward message
            HStack {
                Image(systemName: "gift.fill")
                    .foregroundColor(.accentForeground)
                    .font(.system(size: 16))
                
                Text("Complete \(totalStamps) carimbos e ganhe: **\(reward)**")
                    .font(.appCaption)
                    .foregroundColor(.accentForeground)
            }
            .frame(maxWidth: .infinity)
            .padding(AppSpacing.md)
            .background(Color.accent)
            .cornerRadius(AppRadius.md)
        }
        .padding(AppSpacing.lg)
        .background(Color.card)
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.xl))
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.xl)
                .stroke(Color.border, lineWidth: 1)
        )
        .appShadow(AppShadow.lg)
        .fadeIn(delay: 0.25)
    }
}

struct StampCell: View {
    let index: Int
    let isStamped: Bool
    let isReward: Bool
    let isPressed: Bool
    let onPress: (Bool) -> Void
    
    var body: some View {
        Button(action: {}) {
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.md)
                    .fill(isReward ? 
                          (isStamped ? Color.primary : Color.secondary.opacity(0.1)) :
                          (isStamped ? Color.primary : Color.muted.opacity(0.5)))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.md)
                            .stroke(isReward ? 
                                   (isStamped ? Color.primary : Color.secondary) :
                                   (isStamped ? Color.primary : Color.border), lineWidth: 2)
                    )
                    .frame(width: 48, height: 48)
                    .scaleEffect(isPressed ? 0.9 : (isStamped ? 1.0 : 0.95))
                
                if isReward {
                    Image(systemName: "gift.fill")
                        .foregroundColor(isStamped ? .primaryForeground : .secondary)
                        .font(.system(size: 20))
                        .scaleEffect(isPressed ? 0.9 : 1.0)
                } else if isStamped {
                    Image(systemName: "checkmark")
                        .foregroundColor(.primaryForeground)
                        .font(.system(size: 20, weight: .bold))
                        .scaleEffect(isPressed ? 0.9 : 1.0)
                } else {
                    Text("\(index + 1)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.mutedForeground)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isPressed {
                        onPress(true)
                    }
                }
                .onEnded { _ in
                    onPress(false)
                }
        )
    }
}

#Preview {
    StampGrid(currentStamps: 7, totalStamps: 10, reward: "1 Café Grátis")
        .padding()
}
