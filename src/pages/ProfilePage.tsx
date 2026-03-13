import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Gift, 
  Star,
  Edit,
  ChevronRight,
  Camera,
  Bell,
  LogOut,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserData } from "@/services/usersService";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { fetchStates, fetchCitiesByState } from "@/services/ibgeService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading, signOut, updateEmail, getProfile, updatePhone, updateDisplayName, updateAddress, updateBirthDate } = useAuth();
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [editDialog, setEditDialog] = useState<"email" | "phone" | "displayName" | "address" | "birthDate" | null>(null);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempDisplayName, setTempDisplayName] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempState, setTempState] = useState("");
  const [tempStateCode, setTempStateCode] = useState("");
  const [tempBirthDate, setTempBirthDate] = useState("");
  const [addressStates, setAddressStates] = useState<{ id: string; name: string; sigla: string }[]>([]);
  const [addressCities, setAddressCities] = useState<{ id: string; name: string }[]>([]);
  const [loadingAddressStates, setLoadingAddressStates] = useState(false);
  const [loadingAddressCities, setLoadingAddressCities] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "premium">("free");
  const [memberSince, setMemberSince] = useState("Desde —");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatBirthDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers
        .replace(/^(\d{2})(\d)/, "$1/$2")
        .replace(/^(\d{2})\/(\d{2})(\d*)/, "$1/$2/$3");
    }
    return value;
  };

  useEffect(() => {
    if (!user || !getProfile) return;
    getProfile()
      .then((p) => {
        if (p && typeof p === "object") {
          setProfilePhone(formatPhone(p.phone ?? ""));
          setProfileAddress(p.address ?? "");
          setProfileCity(p.city ?? "");
          setProfileState(p.state ?? "");
          setProfileBirthDate(formatBirthDate(p.birthDate ?? ""));
          setProfileDisplayName(p.displayName ?? "");
        }
      })
      .catch((err) => {
        console.warn("Failed to load profile:", err);
      });
  }, [user, getProfile]);

  useEffect(() => {
    if (!user?.uid) return;
    getUserData(user.uid)
      .then((data) => {
        setUserPlan(data?.plan === "premium" ? "premium" : "free");
        if (data?.createdAt) {
          const monthLabel = data.createdAt
            .toLocaleDateString("pt-BR", { month: "short" })
            .replace(".", "");
          const monthCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
          setMemberSince(`Desde ${monthCapitalized}/${data.createdAt.getFullYear()}`);
        } else {
          setMemberSince("Desde —");
        }
      })
      .catch(() => {});
  }, [user?.uid]);

  const userStats = [
    { label: "Pontos", value: "650", icon: Star, color: "text-primary" },
    { label: "Carimbos", value: "7/10", icon: Gift, color: "text-secondary" },
    { label: "Recompensas", value: "12", icon: Star, color: "text-accent-foreground" },
  ];

  const closeEditDialog = () => {
    setEditDialog(null);
    setTempEmail("");
    setTempPassword("");
    setTempPhone("");
    setTempDisplayName("");
    setTempAddress("");
    setTempCity("");
    setTempState("");
    setTempStateCode("");
    setTempBirthDate("");
  };

  // Carregar estados IBGE ao montar (para o autocomplete de endereço)
  useEffect(() => {
    if (addressStates.length === 0) {
      setLoadingAddressStates(true);
      fetchStates()
        .then((data) =>
          setAddressStates(
            data.map((s) => ({
              id: s.id.toString(),
              name: s.nome,
              sigla: s.sigla,
            }))
          )
        )
        .catch(() => {})
        .finally(() => setLoadingAddressStates(false));
    }
  }, []);

  // Ao abrir dialog de endereço, definir tempStateCode a partir do profileState (quando states já carregaram)
  useEffect(() => {
    if (editDialog === "address" && profileState && !tempStateCode && addressStates.length > 0) {
      const found = addressStates.find((s) => s.name === profileState || s.sigla === profileState);
      if (found) setTempStateCode(found.sigla);
    }
  }, [editDialog, profileState, addressStates, tempStateCode]);

  // Carregar cidades IBGE quando estado for selecionado
  useEffect(() => {
    if (!tempStateCode || editDialog !== "address") {
      setAddressCities([]);
      return;
    }
    setLoadingAddressCities(true);
    fetchCitiesByState(tempStateCode)
      .then((data) =>
        setAddressCities(
          data.map((c) => ({
            id: c.id.toString(),
            name: c.nome,
          }))
        )
      )
      .catch(() => toast.error("Erro ao carregar cidades"))
      .finally(() => setLoadingAddressCities(false));
  }, [tempStateCode, editDialog === "address"]);

  const handleSaveEmail = async () => {
    if (!tempEmail.trim()) {
      toast.error("Informe o novo e-mail.");
      return;
    }
    if (!tempPassword) {
      toast.error("Informe sua senha atual para confirmar.");
      return;
    }
    setSaving(true);
    try {
      await updateEmail(tempEmail.trim(), tempPassword);
      toast.success("E-mail atualizado.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar e-mail.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhone = async () => {
    const trimmed = tempPhone.trim();
    setSaving(true);
    try {
      await updatePhone(trimmed);
      setProfilePhone(trimmed);
      toast.success("Telefone atualizado.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar telefone.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDisplayName = async () => {
    const trimmed = tempDisplayName.trim();
    if (!trimmed) {
      toast.error("Informe o nome.");
      return;
    }
    setSaving(true);
    try {
      await updateDisplayName(trimmed);
      setProfileDisplayName(trimmed);
      toast.success("Nome atualizado.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar nome.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      await updateAddress(tempAddress.trim(), tempCity.trim() || undefined, tempState.trim() || undefined);
      setProfileAddress(tempAddress.trim());
      setProfileCity(tempCity.trim());
      setProfileState(tempState.trim());
      toast.success("Endereço atualizado.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar endereço.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatAddressDisplay = () => {
    const parts = [profileAddress].filter(Boolean);
    if (profileCity || profileState) {
      parts.push([profileCity, profileState].filter(Boolean).join(", "));
    }
    return parts.length > 0 ? parts.join(" - ") : "—";
  };

  const handleSaveBirthDate = async () => {
    setSaving(true);
    try {
      await updateBirthDate(tempBirthDate.trim());
      setProfileBirthDate(tempBirthDate.trim());
      toast.success("Data de nascimento atualizada.");
      closeEditDialog();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar data de nascimento.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await signOut();
      toast.success("Até logo!");
    } catch {
      toast.error("Erro ao sair.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    navigate("/", { replace: true });
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  const profileHeader = (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary flex items-center justify-center ring-2 ring-border">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="h-12 w-12 text-primary-foreground" />
          )}
        </div>
        <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center shadow transition-all active:scale-90">
          <Camera className="h-4 w-4 text-primary" />
        </button>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-primary-foreground mb-1">
          {profileDisplayName || user.displayName || user.email?.split("@")[0] || "Usuário"}
        </h2>
        <p className="text-sm text-primary-foreground/90 mb-2">{user.email}</p>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${userPlan === "premium" ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"}`}>
          {userPlan === "premium" ? "Premium ⭐" : "Free"}
        </span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">{memberSince}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isMobile ? (
        <div className="min-h-full bg-background w-full">
          <div className="pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Perfil</h1>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Coluna Esquerda: Informações Iniciais e Pessoais */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">{profileHeader}</div>
              <div className="grid grid-cols-3 gap-4">
                {userStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-card rounded-xl p-4 text-center shadow-md border border-border">
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                      <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Informações Pessoais</h3>
                <div className="space-y-2">
                  <ProfileInfoItem icon={User} label="Nome" value={profileDisplayName || user.displayName || "—"} delay={0} onEdit={() => {
                    setTempDisplayName(profileDisplayName || user.displayName || "");
                    setEditDialog("displayName");
                  }} />
                  <ProfileInfoItem icon={Mail} label="E-mail" value={user.email ?? ""} delay={0} onEdit={() => {
                    setTempEmail(user?.email ?? "");
                    setTempPassword("");
                    setEditDialog("email");
                  }} />
                  <ProfileInfoItem icon={Phone} label="Telefone" value={profilePhone || "—"} delay={0} onEdit={() => {
                    setTempPhone(profilePhone);
                    setEditDialog("phone");
                  }} />
                  <ProfileInfoItem icon={MapPin} label="Endereço" value={formatAddressDisplay()} delay={0} onEdit={() => {
                    setTempAddress(profileAddress);
                    setTempCity(profileCity);
                    setTempState(profileState);
                    setTempStateCode(addressStates.find((s) => s.name === profileState || s.sigla === profileState)?.sigla ?? "");
                    setEditDialog("address");
                  }} />
                  <ProfileInfoItem icon={Calendar} label="Data de Nascimento" value={profileBirthDate || "—"} delay={0} onEdit={() => {
                    setTempBirthDate(profileBirthDate);
                    setEditDialog("birthDate");
                  }} />
                </div>
              </div>
            </div>

            {/* Coluna Direita: Configurações da Conta e Atividade */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Configurações da Conta</h3>
                <div className="space-y-2">
                  <ProfileActionItem
                    icon={Settings}
                    label="Configurações"
                    description="Preferências do aplicativo"
                    delay={0}
                    onClick={() => navigate("/settings")}
                  />
                  <ProfileActionItem
                    icon={CreditCard}
                    label="Formas de Pagamento"
                    description="Gerenciar cartões salvos"
                    delay={0}
                    onClick={() => toast.info("Abrindo formas de pagamento...")}
                  />
                  <ProfileActionItem
                    icon={Bell}
                    label="Notificações"
                    description="Gerenciar alertas e notificações"
                    delay={0}
                    onClick={() => navigate("/notification-settings")}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Atividade</h3>
                <div className="space-y-2">
                  <ProfileActionItem
                    icon={Gift}
                    label="Histórico de Recompensas"
                    description="Ver todas as recompensas resgatadas"
                    delay={0}
                    onClick={() => toast.info("Abrindo histórico...")}
                  />
                  <ProfileActionItem
                    icon={Star}
                    label="Avaliações"
                    description="Suas avaliações de estabelecimentos"
                    delay={0}
                    onClick={() => toast.info("Abrindo avaliações...")}
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 text-destructive
                           transition-all duration-200 hover:bg-destructive/20"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
                    <LogOut className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Sair da Conta</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-destructive shrink-0" />
                </button>
              </div>
              {/* Version */}
              <p className="text-center text-xs text-muted-foreground pt-2">
                Versão 1.0.0 • Core+
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="gradient-card">
            <header className="px-6 pt-12 pb-6">
              <div className="flex items-center gap-4 mb-4">
                <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-all duration-200 active:scale-90 active:bg-primary-foreground/30">
                  <ChevronRight className="h-5 w-5 text-primary-foreground rotate-180" />
                </Link>
                <h1 className="text-xl font-bold text-primary-foreground flex-1">Perfil</h1>
              </div>
              <div>{profileHeader}</div>
            </header>
          </div>
          <div className="relative -mt-4 rounded-t-3xl bg-background px-6 pt-6">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
              {userStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-xl p-4 text-center shadow-md transition-all duration-200 active:scale-95"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Personal Information */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
                Informações Pessoais
              </h3>
              <div className="space-y-2">
                <ProfileInfoItem
                  icon={User}
                  label="Nome"
                  value={profileDisplayName || user.displayName || "—"}
                  delay={350}
                  onEdit={() => {
                    setTempDisplayName(profileDisplayName || user.displayName || "");
                    setEditDialog("displayName");
                  }}
                />
                <ProfileInfoItem
                  icon={Mail}
                  label="E-mail"
                  value={user.email ?? ""}
                  delay={400}
                  onEdit={() => {
                    setTempEmail(user?.email ?? "");
                    setTempPassword("");
                    setEditDialog("email");
                  }}
                />
                <ProfileInfoItem
                  icon={Phone}
                  label="Telefone"
                  value={profilePhone || "—"}
                  delay={450}
                  onEdit={() => {
                    setTempPhone(profilePhone);
                    setEditDialog("phone");
                  }}
                />
                <ProfileInfoItem
                  icon={MapPin}
                  label="Endereço"
                  value={formatAddressDisplay()}
                  delay={500}
                  onEdit={() => {
                    setTempAddress(profileAddress);
                    setTempCity(profileCity);
                    setTempState(profileState);
                    setTempStateCode(addressStates.find((s) => s.name === profileState || s.sigla === profileState)?.sigla ?? "");
                    setEditDialog("address");
                  }}
                />
                <ProfileInfoItem
                  icon={Calendar}
                  label="Data de Nascimento"
                  value={profileBirthDate || "—"}
                  delay={550}
                  onEdit={() => {
                    setTempBirthDate(profileBirthDate);
                    setEditDialog("birthDate");
                  }}
                />
              </div>
            </div>

            {/* Account Settings */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1 animate-fade-in" style={{ animationDelay: '550ms' }}>
                Configurações da Conta
              </h3>
              <div className="space-y-2">
                <ProfileActionItem
                  icon={Settings}
                  label="Configurações"
                  description="Preferências do aplicativo"
                  delay={600}
                  onClick={() => navigate("/settings")}
                />
                <ProfileActionItem
                  icon={CreditCard}
                  label="Formas de Pagamento"
                  description="Gerenciar cartões salvos"
                  delay={650}
                  onClick={() => toast.info("Abrindo formas de pagamento...")}
                />
                <ProfileActionItem
                  icon={Bell}
                  label="Notificações"
                  description="Gerenciar alertas e notificações"
                  delay={650}
                  onClick={() => navigate("/notification-settings")}
                />
              </div>
            </div>

            {/* Activity */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 animate-fade-in" style={{ animationDelay: '750ms' }}>
                Atividade
              </h3>
              <div className="space-y-2">
                <ProfileActionItem
                  icon={Gift}
                  label="Histórico de Recompensas"
                  description="Ver todas as recompensas resgatadas"
                  delay={800}
                  onClick={() => toast.info("Abrindo histórico...")}
                />
                <ProfileActionItem
                  icon={Star}
                  label="Avaliações"
                  description="Suas avaliações de estabelecimentos"
                  delay={850}
                  onClick={() => toast.info("Abrindo avaliações...")}
                />
              </div>
            </div>

            {/* Logout */}
            <div className="mb-4">
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 text-destructive
                         transition-all duration-200 active:scale-[0.98] active:bg-destructive/20
                         animate-fade-in"
                style={{ animationDelay: '900ms' }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/20">
                  <LogOut className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Sair da Conta</p>
                </div>
                <ChevronRight className="h-4 w-4 text-destructive shrink-0" />
              </button>
            </div>

            {/* Version */}
            <p className="text-center text-xs text-muted-foreground pb-2 animate-fade-in" style={{ animationDelay: '950ms' }}>
              Versão 1.0.0 • Core+
            </p>
          </div>
        </div>
      )}

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair da sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você precisará fazer login novamente para acessar o app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => void handleLogout()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialog !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDialog === "email" && "Alterar e-mail"}
              {editDialog === "phone" && "Alterar telefone"}
              {editDialog === "displayName" && "Alterar nome"}
              {editDialog === "address" && "Alterar endereço"}
              {editDialog === "birthDate" && "Alterar data de nascimento"}
            </DialogTitle>
            <DialogDescription>
              {editDialog === "email" && "Altere apenas o e-mail da sua conta. Informe sua senha atual para confirmar a alteração."}
              {editDialog === "phone" && "Informe o novo número de telefone."}
              {editDialog === "displayName" && "Este nome será exibido no app."}
              {editDialog === "address" && "Informe seu endereço completo."}
              {editDialog === "birthDate" && "Formato: dia/mês/ano (ex: 15/03/1990)"}
            </DialogDescription>
          </DialogHeader>
          {editDialog === "email" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Novo e-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Senha atual (confirmação)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
          {editDialog === "phone" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          )}
          {editDialog === "displayName" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-displayName">Nome</Label>
                <Input
                  id="edit-displayName"
                  type="text"
                  value={tempDisplayName}
                  onChange={(e) => setTempDisplayName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}
          {editDialog === "address" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Rua, número e bairro</Label>
                <Input
                  id="edit-address"
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Rua Exemplo, 123 - Centro"
                />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <LocationAutocomplete
                  value={tempState}
                  onChange={(name, code) => {
                    setTempState(name);
                    setTempStateCode(code ?? "");
                    setTempCity("");
                  }}
                  options={addressStates}
                  placeholder="Digite o estado..."
                  loading={loadingAddressStates}
                />
              </div>
              <div className="grid gap-2">
                <Label>Cidade</Label>
                {tempStateCode ? (
                  <LocationAutocomplete
                    value={tempCity}
                    onChange={(name) => setTempCity(name)}
                    options={addressCities}
                    placeholder="Digite a cidade..."
                    loading={loadingAddressCities}
                    disabled={!tempStateCode}
                  />
                ) : (
                  <Input
                    type="text"
                    disabled
                    placeholder="Selecione um estado primeiro"
                    className="bg-muted cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          )}
          {editDialog === "birthDate" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-birthDate">Data de nascimento</Label>
                <Input
                  id="edit-birthDate"
                  type="text"
                  value={tempBirthDate}
                  onChange={(e) => setTempBirthDate(formatBirthDate(e.target.value))}
                  placeholder="dd/MM/yyyy"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={
                editDialog === "email" ? handleSaveEmail :
                editDialog === "phone" ? handleSavePhone :
                editDialog === "displayName" ? handleSaveDisplayName :
                editDialog === "address" ? handleSaveAddress :
                editDialog === "birthDate" ? handleSaveBirthDate :
                () => {}
              }
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ProfileInfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delay?: number;
  onEdit?: () => void;
}

const ProfileInfoItem = ({ icon: Icon, label, value, delay = 0, onEdit }: ProfileInfoItemProps) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-sm
                 transition-all duration-200 active:scale-[0.98]
                 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Icon className="h-4 w-4 text-accent-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{value || "—"}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 p-1.5 rounded-lg bg-muted transition-all duration-200 active:scale-90"
        >
          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

interface ProfileActionItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  delay?: number;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

const ProfileActionItem = ({
  icon: Icon,
  label,
  description,
  delay = 0,
  onClick,
  rightElement
}: ProfileActionItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card shadow-sm
               transition-all duration-200 active:scale-[0.98] hover:shadow-md
               animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Icon className="h-4 w-4 text-accent-foreground" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-card-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {rightElement || <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </button>
  );
};

export default ProfilePage;
