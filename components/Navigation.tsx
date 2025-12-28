type Tab = 'dashboard' | 'projets' | 'etapes' | 'formateurs' | 'validations' | 'rapports' | 'utilitaires'

interface NavigationProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'projets', label: 'Gestion des Projets', icon: '📁' },
    { id: 'etapes', label: 'Gestion des Étapes', icon: '✅' },
    { id: 'formateurs', label: 'Gestion des Formateurs', icon: '👥' },
    { id: 'validations', label: 'Gestion des Validations', icon: '✔️' },
    { id: 'rapports', label: 'Rapports et Statistiques', icon: '📈' },
    { id: 'utilitaires', label: 'Utilitaires', icon: '🔧' },
  ]

  return (
    <nav className="flex gap-2 mb-4 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-[150px] px-5 py-3 rounded-lg font-semibold transition-all ${
            activeTab === tab.id
              ? 'bg-white text-primary border-2 border-primary shadow-md'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

