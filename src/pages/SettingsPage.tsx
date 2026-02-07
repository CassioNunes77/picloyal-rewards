import { useNavigate } from "react-router-dom";
import SettingsScreen from "@/components/SettingsScreen";

export default function SettingsPage() {
  const navigate = useNavigate();
  return <SettingsScreen onBack={() => navigate(-1)} />;
}
