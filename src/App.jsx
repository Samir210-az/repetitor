import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SuperAdmin from "./pages/SuperAdmin.jsx";
import ExamTake from "./pages/ExamTake.jsx";
import ErrorBoundary from "./lib/ErrorBoundary.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/qeydiyyat" element={<Auth />} />
          <Route path="/giris" element={<Auth />} />
          <Route path="/panel" element={<Dashboard />} />
          <Route path="/master" element={<SuperAdmin />} />
          <Route path="/imtahan/:tenantId/:testId" element={<ExamTake />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
