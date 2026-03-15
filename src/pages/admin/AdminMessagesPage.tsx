import { Mail } from "lucide-react";

export default function AdminMessagesPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Mensagens</h1>
        <p className="text-sm text-muted-foreground">Gerencie mensagens e comunicação com usuários e lojistas.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Em breve: envio e histórico de mensagens.</p>
      </div>
    </div>
  );
}
