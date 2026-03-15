import { Megaphone } from "lucide-react";

export default function AdminCampaignsPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Campanhas</h1>
        <p className="text-sm text-muted-foreground">Gerencie campanhas promocionais e ações especiais.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Em breve: criação e edição de campanhas.</p>
      </div>
    </div>
  );
}
