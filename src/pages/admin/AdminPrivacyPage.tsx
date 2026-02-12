import { useState, useEffect } from "react";
import { Shield, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getPrivacyPolicy, setPrivacyPolicy } from "@/services/contentService";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPrivacyPage() {
  const { user: firebaseUser } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPrivacyPolicy();
        setText(data.text);
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar política de privacidade.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!firebaseUser) {
      toast.error("Faça login com uma conta Firebase (app ou web) para poder salvar.");
      return;
    }
    setSaving(true);
    try {
      await setPrivacyPolicy(text);
      toast.success("Política de privacidade atualizada. As alterações aparecerão em todas as telas (app e web).");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar. Verifique se está logado no Firebase.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">
            Edite o texto abaixo. Uma vez salvo, a mesma política será exibida para usuários e lojistas no app e na web.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-medium text-card-foreground">
          Texto da política (visível em todas as telas)
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o conteúdo da política de privacidade..."
          className="min-h-[320px] resize-y font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar alterações
        </Button>
        {!firebaseUser && (
          <span className="text-sm text-muted-foreground">
            Faça login no app ou na área do usuário (Firebase) para poder salvar.
          </span>
        )}
      </div>
    </div>
  );
}
