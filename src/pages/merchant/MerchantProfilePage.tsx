import { useAuth } from "@/contexts/AuthContext";

export default function MerchantProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero pb-8 pt-12 px-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Perfil
        </h1>
      </div>

      <div className="px-6 -mt-6 pb-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground mb-2">
                Informações da Conta
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-base text-card-foreground">
                    {user?.displayName || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base text-card-foreground">
                    {user?.email || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
