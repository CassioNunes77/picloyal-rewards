import { useState, useRef } from "react";
import { Store, X, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadImageToImgBB, fileToBase64 } from "@/services/imgbbService";

interface StorePhotoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export default function StorePhotoUpload({ value, onChange, disabled }: StorePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Imagem muito grande. Máximo ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const url = await uploadImageToImgBB(base64);
      if (url) {
        onChange(url);
        toast.success("Foto enviada com sucesso!");
      } else {
        toast.error("Erro ao enviar foto. Verifique a chave ImgBB no .env");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar foto. Tente novamente.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-card-foreground">Logo da Loja</Label>
      <div
        className={`
          relative border-2 border-dashed rounded-xl overflow-hidden
          min-h-[120px] flex items-center justify-center
          transition-all duration-200
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
        `}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Enviando...</span>
          </div>
        ) : value ? (
          <div className="relative w-full h-full min-h-[120px] flex items-center justify-center p-4">
            <img
              src={value}
              alt="Logo da loja"
              className="max-h-32 object-contain rounded-lg"
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
              <Store className="h-7 w-7" />
            </div>
            <p className="text-sm text-center px-4">
              Clique para enviar logo ou arraste aqui
            </p>
            <p className="text-xs opacity-80">JPG, PNG ou WebP • Máx. {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
