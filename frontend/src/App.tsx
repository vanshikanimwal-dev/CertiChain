import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { CertificateDetailPage } from "./pages/admin/CertificateDetailPage";
import { CertificateFormPage } from "./pages/admin/CertificateFormPage";
import { CertificatesPage } from "./pages/admin/CertificatesPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { HistoryPage } from "./pages/admin/HistoryPage";
import { StudentsPage } from "./pages/admin/StudentsPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyPage } from "./pages/verify/VerifyPage";
import { useRecords } from "./state/records";

function RequireAuth() {
  const { session } = useRecords();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify/:certificateId" element={<VerifyPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/certificates/new" element={<CertificateFormPage />} />
        <Route path="/certificates/:certificateId" element={<CertificateDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
