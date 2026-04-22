import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import MyEvents from "./pages/MyEvents";
import MyBookings from "./pages/MyBookings";
import CustomerDashboard from "./pages/CustomerDashboard";
import CreateEventFAB from "./components/CreateEventFAB";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import "./index.css";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <CreateEventFAB />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page — standalone with its own nav */}
          <Route path="/" element={<Landing />} />
          {/* /events redirects back to landing (featured section) */}
          <Route path="/events" element={<Navigate to="/#featured" replace />} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
          <Route path="/my-events" element={<MainLayout><MyEvents /></MainLayout>} />
          <Route path="/events/create" element={<MainLayout><CreateEvent /></MainLayout>} />
          <Route path="/events/:id" element={<MainLayout><EventDetails /></MainLayout>} />
          <Route path="/bookings" element={<MainLayout><MyBookings /></MainLayout>} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
