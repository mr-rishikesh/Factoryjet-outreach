import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import ContactDetail from "./pages/ContactDetail";
import Sequences from "./pages/Sequences";
import Analytics from "./pages/Analytics";
import Compliance from "./pages/Compliance";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EnhancedDashboard />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
        <Route path="/sequences" element={<Sequences />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/compliance" element={<Compliance />} />
      </Route>
    </Routes>
  );
}

export default App;
