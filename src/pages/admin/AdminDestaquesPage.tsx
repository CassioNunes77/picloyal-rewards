import { Star } from "lucide-react";

export default function AdminDestaquesPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Destaques</h1>
        <p className="text-sm text-muted-foreground">Gerencie lojas e ofertas em destaque na home.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Em breve: configuração de destaques.</p>
      </div>
    </div>
  );
}
