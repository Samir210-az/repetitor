import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/qeydiyyat" element={<Auth />} />
        <Route path="/giris" element={<Auth />} />
        <Route path="/panel" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
