'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Dashboard from '@/components/Dashboard'
import Projets from '@/components/Projets'
import Etapes from '@/components/Etapes'
import Formateurs from '@/components/Formateurs'
import Validations from '@/components/Validations'
import Rapports from '@/components/Rapports'
import Utilitaires from '@/components/Utilitaires'

type Tab = 'dashboard' | 'projets' | 'etapes' | 'formateurs' | 'validations' | 'rapports' | 'utilitaires'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="container mx-auto px-4 py-4">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-4">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'projets' && <Projets />}
        {activeTab === 'etapes' && <Etapes />}
        {activeTab === 'formateurs' && <Formateurs />}
        {activeTab === 'validations' && <Validations />}
        {activeTab === 'rapports' && <Rapports />}
        {activeTab === 'utilitaires' && <Utilitaires />}
      </div>
      
      <Footer />
    </div>
  )
}

