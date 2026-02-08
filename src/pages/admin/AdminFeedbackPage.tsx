import { useState } from "react";
import { MessageSquare, User, Store, Star, Search, CheckCircle, XCircle, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface Feedback {
  id: string;
  type: "user" | "store";
  author: string;
  message: string;
  rating?: number;
  date: string;
  status: "pending" | "read" | "resolved";
}

const AdminFeedbackPage = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "read" | "resolved">("all");
  const [filterType, setFilterType] = useState<"all" | "user" | "store">("all");

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: "1",
      type: "user",
      author: "João Silva",
      message: "Ótimo app! Facilita muito na hora de acumular pontos.",
      rating: 5,
      date: "2025-02-07 14:30",
      status: "pending",
    },
    {
      id: "2",
      type: "store",
      author: "Café Central",
      message: "Gostaria de adicionar mais categorias de produtos.",
      date: "2025-02-07 10:15",
      status: "read",
    },
    {
      id: "3",
      type: "user",
      author: "Maria Santos",
      message: "O sistema de resgate está muito bom, parabéns!",
      rating: 5,
      date: "2025-02-06 18:45",
      status: "resolved",
    },
    {
      id: "4",
      type: "store",
      author: "Restaurante Sabor",
      message: "Precisamos de ajuda para configurar as ofertas.",
      date: "2025-02-06 09:20",
      status: "pending",
    },
  ]);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || feedback.status === filterStatus;
    const matchesType = filterType === "all" || feedback.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (id: string, newStatus: Feedback["status"]) => {
    setFeedbacks(feedbacks.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));
    toast.success("Status atualizado");
  };

  const getStatusColor = (status: Feedback["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "read":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: Feedback["status"]) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "read":
        return "Lido";
      case "resolved":
        return "Resolvido";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-card-foreground mb-2">Feedback</h1>
        <p className="text-sm text-muted-foreground">Gerenciar feedback de usuários e lojistas</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "read", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {status === "all" ? "Todos" : getStatusLabel(status)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "user", "store"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterType === type
                  ? "bg-secondary text-secondary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {type === "all" ? "Todos" : type === "user" ? "Usuários" : "Lojistas"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    feedback.type === "user" ? "bg-primary/10" : "bg-secondary/10"
                  }`}
                >
                  {feedback.type === "user" ? (
                    <User className="h-5 w-5 text-primary" />
                  ) : (
                    <Store className="h-5 w-5 text-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-card-foreground">{feedback.author}</h3>
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{feedback.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{feedback.date}</p>
                  <p className="text-card-foreground">{feedback.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(feedback.status)}`}
                >
                  {getStatusLabel(feedback.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              {feedback.status !== "pending" && (
                <button
                  onClick={() => handleStatusChange(feedback.id, "pending")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all"
                >
                  Marcar como Pendente
                </button>
              )}
              {feedback.status !== "read" && (
                <button
                  onClick={() => handleStatusChange(feedback.id, "read")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                >
                  Marcar como Lido
                </button>
              )}
              {feedback.status !== "resolved" && (
                <button
                  onClick={() => handleStatusChange(feedback.id, "resolved")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all"
                >
                  Marcar como Resolvido
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
