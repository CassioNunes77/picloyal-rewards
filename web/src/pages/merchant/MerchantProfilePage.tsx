import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import MerchantBottomNav from "@/components/merchant/MerchantBottomNav";

export default function MerchantProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero pb-8 pt-12 px-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/merchant/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Perfil
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Informações da sua conta
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6 pb-8">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">
              {user?.displayName || user?.email?.split("@")[0] || "Lojista"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.email}
            </p>
          </div>

          {/* Informações */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium text-card-foreground">
                  {user?.email || "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-base font-medium text-card-foreground">
                  {user?.displayName || "Não informado"}
                </p>
              </div>
            </div>

            {user?.phoneNumber && (
              <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="text-base font-medium text-card-foreground">
                    {user.phoneNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MerchantBottomNav />
    </div>
  );
}
