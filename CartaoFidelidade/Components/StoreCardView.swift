//
//  StoreCardView.swift
//  CartaoFidelidade
//
//  Componente para exibir card de loja no painel do lojista
//

import SwiftUI

struct StoreCardView: View {
    let store: FirebaseStore
    var onEdit: (() -> Void)? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    // Nome e status
                    HStack(spacing: AppSpacing.sm) {
                        Image(systemName: "storefront.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.primary)
                        
                        Text(store.name)
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        
                        // Badge de status
                        if store.active {
                            Text("Ativa")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.green)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.green.opacity(0.1))
                                .cornerRadius(AppRadius.sm)
                        } else {
                            Text("Inativa")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.gray)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(AppRadius.sm)
                        }
                    }
                    
                    // Endereço
                    if !store.address.isEmpty {
                        HStack(spacing: AppSpacing.xs) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                            Text(store.address)
                                .font(.system(size: 13, weight: .regular))
                                .foregroundColor(.mutedForeground)
                        }
                    }
                    
                    // Cidade
                    if !store.city.isEmpty {
                        HStack(spacing: AppSpacing.xs) {
                            Text(store.city)
                                .font(.system(size: 13, weight: .regular))
                                .foregroundColor(.mutedForeground)
                        }
                        .padding(.leading, 20) // Alinhar com endereço
                    }
                    
                    // Telefone
                    if !store.phone.isEmpty {
                        HStack(spacing: AppSpacing.xs) {
                            Image(systemName: "phone.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                            Text(store.phone)
                                .font(.system(size: 13, weight: .regular))
                                .foregroundColor(.mutedForeground)
                        }
                    }
                    
                    // Horário
                    if !store.hours.isEmpty {
                        HStack(alignment: .top, spacing: AppSpacing.xs) {
                            Image(systemName: "clock.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                                .padding(.top, 2)
                            Text(store.hours)
                                .font(.system(size: 13, weight: .regular))
                                .foregroundColor(.mutedForeground)
                                .lineLimit(2)
                        }
                    }
                }
                
                Spacer()
                
                HStack(spacing: AppSpacing.sm) {
                    if let onEdit = onEdit {
                        Button(action: onEdit) {
                            Image(systemName: "pencil.circle.fill")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(.primary)
                        }
                    }
                    
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.mutedForeground)
                }
            }
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
        .appShadow(AppShadow.sm)
    }
}

#Preview {
    StoreCardView(
        store: FirebaseStore(
            id: "1",
            merchantId: "merchant1",
            name: "Loja Exemplo",
            cnpj: "12.345.678/0001-90",
            address: "Rua Exemplo, 123",
            city: "São Paulo - SP",
            phone: "(11) 1234-5678",
            hours: "Segunda a Sexta: 9h às 18h",
            photoURL: nil,
            active: true,
            createdAt: Date(),
            updatedAt: Date()
        )
    )
    .padding()
}
