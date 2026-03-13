import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTermsOfUse } from "@/services/contentService";

interface TermsOfUsePageProps {
  backLabel?: string;
  onBack?: () => void;
}

export default function TermsOfUsePage({ backLabel = "Voltar", onBack }: TermsOfUsePageProps) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTermsOfUse();
        setText(data.text);
      } catch {
        setText("Não foi possível carregar os termos de uso.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero pb-8 pt-12 px-6 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Termos de Uso
                </h1>
                <p className="text-white/90 text-sm mt-0.5">
                  Core+
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-12 max-w-3xl mx-auto">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-card-foreground">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {text}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
