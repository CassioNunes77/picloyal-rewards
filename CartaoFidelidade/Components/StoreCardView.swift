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
    var onTap: (() -> Void)? = nil
    
    var body: some View {
        Button(action: {
            onTap?()
        }) {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        // Nome e status — conforme imagem de referência
                        HStack(spacing: AppSpacing.sm) {
                            storeIcon
                            
                            Text(store.name)
                                .font(.system(size: 16, weight: .bold, design: .rounded))
                                .foregroundColor(.cardForeground)
                            
                            // Badge Ativa: light green pill com texto branco
                            if store.active {
                                Text("Ativa")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(.heroForeground)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.primary.opacity(0.8))
                                    .cornerRadius(10)
                            } else {
                                Text("Inativa")
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(.heroForeground)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.gray.opacity(0.6))
                                    .cornerRadius(10)
                            }
                        }
                        
                        // Endereço — ícone cinza
                        if !store.address.isEmpty {
                            HStack(spacing: AppSpacing.xs) {
                                Image(systemName: "mappin.circle.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                                Text(store.address)
                                    .font(.system(size: 13, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                        }
                        
                        // Cidade
                        if !store.city.isEmpty {
                            HStack(spacing: AppSpacing.xs) {
                                Text(store.city)
                                    .font(.system(size: 13, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                            .padding(.leading, 20)
                        }
                        
                        // Telefone
                        if !store.phone.isEmpty {
                            HStack(spacing: AppSpacing.xs) {
                                Image(systemName: "phone.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                                Text(store.phone)
                                    .font(.system(size: 13, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                        }
                        
                        // Horário
                        if !store.hours.isEmpty {
                            HStack(alignment: .top, spacing: AppSpacing.xs) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                                    .padding(.top, 2)
                                Text(summarizeBusinessHours(store.hours))
                                    .font(.system(size: 13, weight: .regular))
                                    .foregroundColor(.cardForeground)
                                    .lineLimit(2)
                            }
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.mutedForeground)
                }
            }
            .padding(AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .stroke(Color.border, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private var storeIcon: some View {
        Group {
            if let urlString = store.photoURL, let url = URL(string: urlString) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 24, height: 24)
                            .clipped()
                            .cornerRadius(6)
                    default:
                        Image(systemName: "storefront.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.primary)
                    }
                }
            } else {
                Image(systemName: "storefront.fill")
                    .font(.system(size: 16))
                    .foregroundColor(.primary)
            }
        }
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
        ),
        onEdit: { },
        onTap: { }
    )
    .padding()
}
