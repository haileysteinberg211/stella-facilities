import { useState } from "react";
import Header from "./components/Header.jsx";
import Dashboard from "./components/Dashboard.jsx";
import UnitBoard from "./components/UnitBoard.jsx";
import LeadPipeline from "./components/LeadPipeline.jsx";
import ROICalculator from "./components/ROICalculator.jsx";
import "./index.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "units" && <UnitBoard />}
        {activeTab === "leads" && <LeadPipeline />}
        {activeTab === "roi" && <ROICalculator />}
      </main>
    </div>
  );
}
