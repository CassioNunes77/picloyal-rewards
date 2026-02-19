import { useState, useEffect } from "react";
import { Loader2, Shield, Info } from "lucide-react";
import { getAllAdmins } from "@/services/adminsService";
import { toast } from "sonner";

const AdminAdminsPage = () => {
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getAllAdmins();
        setAdmins(list);
      } catch (err: any) {
        console.error("Erro ao carregar administradores:", err);
        toast.error(err?.message || "Erro ao carregar administradores");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Administradores</h1>
        <p className="text-sm text-muted-foreground">
          Usuários com acesso ao painel administrativo
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <span className="ml-3 text-muted-foreground">Carregando...</span>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-4 text-sm font-medium text-card-foreground">
                      E-mail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td className="py-8 text-center text-muted-foreground">
                        Nenhum administrador cadastrado
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-card-foreground font-medium">
                              {admin.email || "(sem e-mail)"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-muted/30 rounded-2xl border border-border p-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-card-foreground">Como adicionar um novo administrador</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Firebase Console → Authentication → Users → Add user (e-mail e senha)
                  </li>
                  <li>
                    Copie o UID do usuário criado
                  </li>
                  <li>
                    Firestore Database → Coleção <code className="bg-muted px-1 rounded">admins</code> → Add document
                  </li>
                  <li>
                    Document ID = UID do usuário; campo <code className="bg-muted px-1 rounded">email</code> (string) = e-mail
                  </li>
                </ol>
                <p className="pt-2">
                  Ou use o script: <code className="bg-muted px-1 rounded text-xs">scripts/create-admin-user.mjs</code>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAdminsPage;
