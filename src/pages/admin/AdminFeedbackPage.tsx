import { useState } from "react";
import { MessageSquare, User, Store, Star, Search, CheckCircle, XCircle, Filter } from "lucide-react";
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-card-foreground mb-1">Feedback</h1>
        <p className="text-sm text-muted-foreground">Gerenciar feedback de usuários e lojistas</p>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "pending", "read", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
            >
              {status === "all" ? "Todos" : getStatusLabel(status)}
            </button>
          ))}
          {(["all", "user", "store"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

      <div className="space-y-2">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-card rounded-xl border border-border px-4 py-3 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    feedback.type === "user" ? "bg-primary/10" : "bg-secondary/10"
                  }`}
                >
                  {feedback.type === "user" ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Store className="h-4 w-4 text-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-card-foreground">{feedback.author}</h3>
                    {feedback.rating != null && (
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {feedback.rating}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{feedback.date}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusLabel(feedback.status)}
                    </span>
                  </div>
                  <p className="text-sm text-card-foreground mt-1 line-clamp-2">{feedback.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                {feedback.status !== "pending" && (
                  <button
                    onClick={() => handleStatusChange(feedback.id, "pending")}
                    className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all"
                  >
                    Pendente
                  </button>
                )}
                {feedback.status !== "read" && (
                  <button
                    onClick={() => handleStatusChange(feedback.id, "read")}
                    className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                  >
                    Lido
                  </button>
                )}
                {feedback.status !== "resolved" && (
                  <button
                    onClick={() => handleStatusChange(feedback.id, "resolved")}
                    className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all"
                  >
                    Resolvido
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
