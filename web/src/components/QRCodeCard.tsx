import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface QRCodeCardProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeData?: string;
}

const QRCodeCard = ({ isOpen, onClose, qrCodeData = "CARTEIRA:4589" }: QRCodeCardProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Card */}
      <div
        className="relative bg-card rounded-3xl p-8 shadow-2xl max-w-sm w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-semibold text-card-foreground">Meu QR Code</h2>
          
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={qrCodeData}
              size={250}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Card Number */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Cartão Fidelidade</p>
            <p className="text-lg font-semibold font-mono text-card-foreground">
              **** **** **** 4589
            </p>
          </div>

          {/* Info */}
          <p className="text-sm text-muted-foreground text-center px-4">
            Apresente este QR Code no estabelecimento para acumular pontos
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeCard;
