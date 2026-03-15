import { useState, useEffect } from "react";
import { FileText, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getTermsOfUse, setTermsOfUse } from "@/services/contentService";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminTermsPage() {
  const { user: firebaseUser } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTermsOfUse();
        setText(data.text);
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar termos de uso.");
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
      await setTermsOfUse(text);
      toast.success("Termos de uso atualizados. As alterações aparecerão em todas as telas (app e web).");
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
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground">
            Edite o texto abaixo. Uma vez salvo, os mesmos termos serão exibidos para usuários e lojistas no app e na web.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-medium text-card-foreground">
          Texto dos termos (visível em todas as telas)
        </label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o conteúdo dos termos de uso..."
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
