//
//  ProfileView.swift
//  CartaoFidelidade
//
//  Tela de Perfil
//

import SwiftUI
import FirebaseAuth

struct ProfileView: View {
    @Binding var activeTab: String
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("userPhotoURL") private var userPhotoURL = ""
    @State private var notifications = true
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var showLogoutConfirmation = false

    @State private var profilePhone = ""
    @State private var profileAddress = ""
    @State private var profileBirthDate = ""
    @State private var profileDisplayName = ""
    @State private var showEmailSheet = false
    @State private var showPhoneSheet = false
    @State private var showDisplayNameSheet = false
    @State private var showAddressSheet = false
    @State private var showBirthDateSheet = false
    @State private var tempEmail = ""
    @State private var tempPassword = ""
    @State private var tempPhone = ""
    @State private var tempDisplayName = ""
    @State private var tempAddress = ""
    @State private var tempBirthDate = ""
    @State private var saving = false
    @State private var errorMessage: String?
    
    private var displayNameValue: String {
        !profileDisplayName.isEmpty ? profileDisplayName : userDisplayName
    }
    
    let userStats = [
        ("Pontos", "650", "star.fill", Color.primary),
        ("Carimbos", "7/10", "gift.fill", Color.secondary),
        ("Recompensas", "12", "star.fill", Color.accentForeground)
    ]
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                ZStack(alignment: .top) {
                    VStack(spacing: 0) {
                        // Back button and title
                        HStack {
                            Button(action: {
                                withAnimation {
                                    activeTab = "home"
                                }
                            }) {
                                ZStack {
                                    Circle()
                                        .fill(Color.heroOverlay)
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            Text("Perfil")
                                .font(.appTitle)
                                .foregroundColor(.heroForeground)
                            
                            Spacer()
                            
                            Button(action: { showLogoutConfirmation = true }) {
                                Text("Sair")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(.heroForeground)
                                    .padding(.horizontal, AppSpacing.md)
                                    .padding(.vertical, AppSpacing.sm)
                                    .background(Color.heroOverlay)
                                    .cornerRadius(AppRadius.lg)
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                        
                        // Profile Card
                        HStack(spacing: AppSpacing.md) {
                            ZStack(alignment: .bottomTrailing) {
                                Group {
                                    if let url = URL(string: userPhotoURL), !userPhotoURL.isEmpty {
                                        AsyncImage(url: url) { phase in
                                            switch phase {
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .aspectRatio(contentMode: .fill)
                                            case .failure(_), .empty:
                                                placeholderAvatar
                                            @unknown default:
                                                placeholderAvatar
                                            }
                                        }
                                        .frame(width: 96, height: 96)
                                        .clipShape(Circle())
                                    } else {
                                        placeholderAvatar
                                    }
                                }
                                .overlay(
                                    Circle()
                                        .stroke(Color.heroForegroundMuted.opacity(0.5), lineWidth: 2)
                                )
                                
                                Button(action: {}) {
                                    ZStack {
                                        Circle()
                                            .fill(Color.heroForeground)
                                            .frame(width: 32, height: 32)
                                        
                                        Image(systemName: "camera.fill")
                                            .foregroundColor(.primary)
                                            .font(.system(size: 16))
                                    }
                                }
                                .offset(x: 4, y: 4)
                            }
                            
                            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                                Text(displayNameValue.isEmpty ? "Usuário" : displayNameValue)
                                    .font(.appTitle)
                                    .foregroundColor(.heroForeground)
                                
                                Text(userEmail.isEmpty ? "—" : userEmail)
                                    .font(.appCaption)
                                    .foregroundStyle(Color.heroForeground)
                                
                                HStack(spacing: AppSpacing.sm) {
                                    Text("Membro VIP ⭐")
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(.heroForeground)
                                        .padding(.horizontal, AppSpacing.md)
                                        .padding(.vertical, 4)
                                        .background(Color.heroOverlay)
                                        .cornerRadius(AppRadius.md)
                                    
                                    Text("Desde 2023")
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(.heroForeground)
                                        .padding(.horizontal, AppSpacing.md)
                                        .padding(.vertical, 4)
                                        .background(Color.heroOverlay)
                                        .cornerRadius(AppRadius.md)
                                }
                            }
                            
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.bottom, AppSpacing.md)
                        .slideUp(delay: 0.1)
                    }
                    .padding(.bottom, AppSpacing.lg)
                    .background(AppGradients.card)
                    .ignoresSafeArea(edges: .top)
                }
                
                // Content
                ScrollView {
                    VStack(spacing: AppSpacing.md) {
                        // Stats
                        HStack(spacing: AppSpacing.md) {
                            ForEach(Array(userStats.enumerated()), id: \.offset) { index, stat in
                                VStack(spacing: AppSpacing.sm) {
                                    Image(systemName: stat.2)
                                        .foregroundColor(stat.3)
                                        .font(.system(size: 24))
                                    
                                    Text(stat.1)
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(.cardForeground)
                                    
                                    Text(stat.0)
                                        .font(.system(size: 12))
                                        .foregroundColor(.mutedForeground)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(AppSpacing.md)
                                .background(Color.card)
                                .cornerRadius(AppRadius.lg)
                                .appShadow(AppShadow.md)
                                .fadeIn(delay: 0.15 + Double(index) * 0.05)
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        
                        // Personal Information
                        ProfileSection(title: "Informações Pessoais") {
                            ProfileInfoItem(
                                icon: "person.fill",
                                label: "Nome",
                                value: displayNameValue.isEmpty ? "—" : displayNameValue,
                                delay: 0.25,
                                onEdit: {
                                    tempDisplayName = profileDisplayName.isEmpty ? userDisplayName : profileDisplayName
                                    showDisplayNameSheet = true
                                }
                            )
                            
                            ProfileInfoItem(
                                icon: "envelope.fill",
                                label: "E-mail",
                                value: userEmail.isEmpty ? "—" : userEmail,
                                delay: 0.3,
                                onEdit: {
                                    tempEmail = userEmail
                                    tempPassword = ""
                                    showEmailSheet = true
                                }
                            )
                            
                            ProfileInfoItem(
                                icon: "phone.fill",
                                label: "Telefone",
                                value: profilePhone.isEmpty ? "—" : profilePhone,
                                delay: 0.35,
                                onEdit: {
                                    tempPhone = profilePhone
                                    showPhoneSheet = true
                                }
                            )
                            
                            ProfileInfoItem(
                                icon: "location.fill",
                                label: "Endereço",
                                value: profileAddress.isEmpty ? "—" : profileAddress,
                                delay: 0.4,
                                onEdit: {
                                    tempAddress = profileAddress
                                    showAddressSheet = true
                                }
                            )
                            
                            ProfileInfoItem(
                                icon: "calendar",
                                label: "Data de Nascimento",
                                value: profileBirthDate.isEmpty ? "—" : profileBirthDate,
                                delay: 0.45,
                                onEdit: {
                                    tempBirthDate = profileBirthDate
                                    showBirthDateSheet = true
                                }
                            )
                        }
                        
                        // Account Settings
                        ProfileSection(title: "Configurações da Conta") {
                            ProfileActionItem(
                                icon: "creditcard.fill",
                                label: "Formas de Pagamento",
                                description: "Gerenciar cartões salvos",
                                delay: 0.55
                            ) {
                                showToast(message: "Abrindo formas de pagamento...")
                            }
                            
                            ProfileActionItem(
                                icon: "bell.fill",
                                label: "Notificações",
                                description: "Gerenciar alertas e notificações",
                                delay: 0.6,
                                rightElement: AnyView(
                                    Toggle("", isOn: $notifications)
                                        .toggleStyle(SwitchToggleStyle(tint: .primary))
                                        .onChange(of: notifications) { _, newValue in
                                            showToast(message: newValue ? "Notificações ativadas" : "Notificações desativadas")
                                        }
                                )
                            )
                            
                            ProfileActionItem(
                                icon: "shield.fill",
                                label: "Segurança",
                                description: "Senha e autenticação",
                                delay: 0.65
                            ) {
                                showToast(message: "Abrindo configurações de segurança...")
                            }
                        }
                        
                        // Activity
                        ProfileSection(title: "Atividade") {
                            ProfileActionItem(
                                icon: "gift.fill",
                                label: "Histórico de Recompensas",
                                description: "Ver todas as recompensas resgatadas",
                                delay: 0.75
                            ) {
                                showToast(message: "Abrindo histórico...")
                            }
                            
                            ProfileActionItem(
                                icon: "star.fill",
                                label: "Avaliações",
                                description: "Suas avaliações de estabelecimentos",
                                delay: 0.8
                            ) {
                                showToast(message: "Abrindo avaliações...")
                            }
                        }
                        
                        // Logout
                        Button(action: {
                            performLogout()
                            showToast(message: "Até logo! 👋")
                        }) {
                            HStack(spacing: AppSpacing.md) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md)
                                        .fill(Color.destructive.opacity(0.1))
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "arrow.right.square.fill")
                                        .foregroundColor(.destructive)
                                        .font(.system(size: 20))
                                }
                                
                                Text("Sair da Conta")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.destructive)
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.destructive)
                                    .font(.system(size: 20))
                            }
                            .padding(AppSpacing.md)
                            .background(Color.destructive.opacity(0.1))
                            .cornerRadius(AppRadius.lg)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .fadeIn(delay: 0.85)
                        
                        // Version
                        Text("Versão 1.0.0 • Core+")
                            .font(.system(size: 12))
                            .foregroundColor(.mutedForeground)
                            .padding(.top, AppSpacing.sm)
                            .fadeIn(delay: 0.9)
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.md)
                    .padding(.bottom, 100)
                }
                .background(Color.appBackground)
                .cornerRadius(AppRadius.xl, corners: [.topLeft, .topRight])
                .offset(y: -AppRadius.xl)
            }
            .onAppear {
                loadProfile()
                // Atualiza foto do usuário (ex.: Google) caso ainda não tenha sido salva no login
                if let url = Auth.auth().currentUser?.photoURL?.absoluteString, !url.isEmpty {
                    userPhotoURL = url
                }
            }
            
            // Toast
            if showToast {
                VStack {
                    Spacer()
                    
                    Text(toastMessage)
                        .font(.appBody)
                        .foregroundColor(.cardForeground)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.md)
                        .padding(.bottom, 100)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .appConfirmation(
            isPresented: $showLogoutConfirmation,
            title: "Sair da conta?",
            message: "Deseja realmente sair da sua conta?",
            primaryTitle: "Sair",
            primaryStyle: .destructive,
            primaryAction: {
                performLogout()
                showToast(message: "Até logo! 👋")
            },
            secondaryTitle: "Cancelar",
            secondaryAction: nil
        )
        .sheet(isPresented: $showEmailSheet) {
            editEmailSheet
        }
        .sheet(isPresented: $showPhoneSheet) {
            editPhoneSheet
        }
        .sheet(isPresented: $showDisplayNameSheet) {
            editDisplayNameSheet
        }
        .sheet(isPresented: $showAddressSheet) {
            editAddressSheet
        }
        .sheet(isPresented: $showBirthDateSheet) {
            editBirthDateSheet
        }
        .appConfirmation(
            isPresented: .init(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } }),
            title: "Erro",
            message: errorMessage ?? "",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { errorMessage = nil },
            secondaryTitle: nil,
            secondaryAction: nil
        )
        .ignoresSafeArea(edges: .top)
    }

    private func loadProfile() {
        Task {
            do {
                let profile = try await ProfileService.shared.getProfile()
                await MainActor.run {
                    profilePhone = profile.phone ?? ""
                    profileAddress = profile.address ?? ""
                    profileBirthDate = profile.birthDate ?? ""
                    profileDisplayName = profile.displayName ?? ""
                    if !profileDisplayName.isEmpty {
                        userDisplayName = profileDisplayName
                    }
                }
            } catch {}
        }
    }

    private var editEmailSheet: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Novo e-mail", text: $tempEmail)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                        .keyboardType(.emailAddress)
                    SecureField("Senha atual", text: $tempPassword)
                        .textContentType(.password)
                } header: {
                    Text("Alterar e-mail")
                } footer: {
                    Text("Informe o novo e-mail e sua senha atual para confirmar.")
                }
            }
            .navigationTitle("Alterar e-mail")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") {
                        showEmailSheet = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") {
                        saveEmail()
                    }
                    .disabled(saving || tempEmail.trimmingCharacters(in: .whitespaces).isEmpty || tempPassword.isEmpty)
                }
            }
            .disabled(saving)
        }
    }

    private var editPhoneSheet: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Telefone", text: $tempPhone)
                        .textContentType(.telephoneNumber)
                        .keyboardType(.phonePad)
                } header: {
                    Text("Alterar telefone")
                } footer: {
                    Text("Informe o novo número de telefone.")
                }
            }
            .navigationTitle("Alterar telefone")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") {
                        showPhoneSheet = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") {
                        savePhone()
                    }
                    .disabled(saving)
                }
            }
            .disabled(saving)
        }
    }

    private var editDisplayNameSheet: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Nome", text: $tempDisplayName)
                        .textContentType(.name)
                } header: {
                    Text("Alterar nome")
                } footer: {
                    Text("Este nome será exibido no app.")
                }
            }
            .navigationTitle("Alterar nome")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { showDisplayNameSheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") { saveDisplayName() }
                        .disabled(saving || tempDisplayName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .disabled(saving)
        }
    }

    private var editAddressSheet: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Endereço", text: $tempAddress)
                        .textContentType(.fullStreetAddress)
                } header: {
                    Text("Alterar endereço")
                }
            }
            .navigationTitle("Alterar endereço")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { showAddressSheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") { saveAddress() }
                        .disabled(saving)
                }
            }
            .disabled(saving)
        }
    }

    private var editBirthDateSheet: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Data de nascimento (dd/MM/yyyy)", text: $tempBirthDate)
                        .textContentType(.dateTime)
                        .keyboardType(.numbersAndPunctuation)
                } header: {
                    Text("Alterar data de nascimento")
                } footer: {
                    Text("Formato: dia/mês/ano (ex: 15/03/1990)")
                }
            }
            .navigationTitle("Alterar data de nascimento")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { showBirthDateSheet = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") { saveBirthDate() }
                        .disabled(saving)
                }
            }
            .disabled(saving)
        }
    }

    private func saveEmail() {
        let email = tempEmail.trimmingCharacters(in: .whitespaces)
        guard !email.isEmpty, !tempPassword.isEmpty else { return }
        saving = true
        Task {
            do {
                try await ProfileService.shared.updateEmail(newEmail: email, currentPassword: tempPassword)
                await MainActor.run {
                    showEmailSheet = false
                    showToast(message: "Enviamos um e-mail de confirmação para \(email). Acesse o link no e-mail para concluir a alteração.")
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
            await MainActor.run { saving = false }
        }
    }

    private func savePhone() {
        saving = true
        Task {
            do {
                try await ProfileService.shared.updatePhone(tempPhone.trimmingCharacters(in: .whitespaces))
                await MainActor.run {
                    profilePhone = tempPhone.trimmingCharacters(in: .whitespaces)
                    showPhoneSheet = false
                    showToast(message: "Telefone atualizado.")
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
            await MainActor.run { saving = false }
        }
    }

    private func saveDisplayName() {
        let name = tempDisplayName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        saving = true
        Task {
            do {
                try await ProfileService.shared.updateDisplayName(name)
                await MainActor.run {
                    profileDisplayName = name
                    userDisplayName = name
                    showDisplayNameSheet = false
                    showToast(message: "Nome atualizado.")
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
            await MainActor.run { saving = false }
        }
    }

    private func saveAddress() {
        saving = true
        Task {
            do {
                try await ProfileService.shared.updateAddress(tempAddress.trimmingCharacters(in: .whitespaces))
                await MainActor.run {
                    profileAddress = tempAddress.trimmingCharacters(in: .whitespaces)
                    showAddressSheet = false
                    showToast(message: "Endereço atualizado.")
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
            await MainActor.run { saving = false }
        }
    }

    private func saveBirthDate() {
        saving = true
        Task {
            do {
                try await ProfileService.shared.updateBirthDate(tempBirthDate.trimmingCharacters(in: .whitespaces))
                await MainActor.run {
                    profileBirthDate = tempBirthDate.trimmingCharacters(in: .whitespaces)
                    showBirthDateSheet = false
                    showToast(message: "Data de nascimento atualizada.")
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
            await MainActor.run { saving = false }
        }
    }
    
    private func showToast(message: String) {
        toastMessage = message
        withAnimation {
            showToast = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                showToast = false
            }
        }
    }
    
    private func performLogout() {
        try? Auth.auth().signOut()
        userDisplayName = ""
        userEmail = ""
        userPhotoURL = ""
        isLoggedIn = false
    }

    private var placeholderAvatar: some View {
        ZStack {
            Circle()
                .fill(AppGradients.primary)
                .frame(width: 96, height: 96)
            Image(systemName: "person.fill")
                .foregroundColor(.primaryForeground)
                .font(.system(size: 48))
        }
    }
}

struct ProfileSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.mutedForeground)
                .textCase(.uppercase)
                .tracking(1)
                .padding(.horizontal, 4)
            
            VStack(spacing: AppSpacing.sm) {
                content
            }
        }
        .padding(.horizontal, AppSpacing.lg)
    }
}

struct ProfileInfoItem: View {
    let icon: String
    let label: String
    let value: String
    let delay: Double
    var onEdit: (() -> Void)?
    @State private var isPressed = false
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.md)
                    .fill(Color.accent)
                    .frame(width: 40, height: 40)
                
                Image(systemName: icon)
                    .foregroundColor(.accentForeground)
                    .font(.system(size: 20))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
                
                Text(value)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.cardForeground)
                    .lineLimit(1)
            }
            
            Spacer()
            
            if let onEdit = onEdit {
                Button(action: onEdit) {
                    ZStack {
                        RoundedRectangle(cornerRadius: AppRadius.sm)
                            .fill(Color.muted)
                            .frame(width: 32, height: 32)
                        
                        Image(systemName: "pencil")
                            .foregroundColor(.mutedForeground)
                            .font(.system(size: 14))
                    }
                }
            }
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .appShadow(AppShadow.md)
        .fadeIn(delay: delay)
    }
}

struct ProfileActionItem: View {
    let icon: String
    let label: String
    let description: String?
    let delay: Double
    let action: () -> Void
    let rightElement: AnyView?
    
    @State private var isPressed = false
    
    init(
        icon: String,
        label: String,
        description: String? = nil,
        delay: Double = 0,
        rightElement: AnyView? = nil,
        action: @escaping () -> Void = {}
    ) {
        self.icon = icon
        self.label = label
        self.description = description
        self.delay = delay
        self.rightElement = rightElement
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: AppSpacing.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.md)
                        .fill(Color.accent)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: icon)
                        .foregroundColor(.accentForeground)
                        .font(.system(size: 20))
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.cardForeground)
                    
                    if let description = description {
                        Text(description)
                            .font(.appCaption)
                            .foregroundColor(.mutedForeground)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                if let rightElement = rightElement {
                    rightElement
                } else {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.mutedForeground)
                        .font(.system(size: 20))
                }
            }
            .padding(AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.lg)
            .appShadow(isPressed ? AppShadow.sm : AppShadow.md)
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .fadeIn(delay: delay)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isPressed {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    isPressed = false
                }
        )
    }
}

#Preview {
    ProfileView(activeTab: .constant("profile"))
}
