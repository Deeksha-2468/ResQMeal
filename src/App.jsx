import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import RestaurantDashboard from "./pages/RestaurantDashboard.jsx";
import NgoDashboard from "./pages/NgoDashboard.jsx";
import VolunteerDashboard from "./pages/VolunteerDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="restaurant" element={<RestaurantDashboard />} />
        <Route path="ngo" element={<NgoDashboard />} />
        <Route path="volunteer" element={<VolunteerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
