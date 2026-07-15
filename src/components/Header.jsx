export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Agent Dashboard" },
    { id: "units", label: "Unit Board" },
    { id: "leads", label: "Lead Pipeline" },
    { id: "roi", label: "ROI Calculator" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">S</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Stella for Facilities</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-500 text-xs">Maplewood Senior Living</span>
        </div>
        <nav className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeTab === t.id
                  ? "bg-violet-50 text-violet-700 font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
