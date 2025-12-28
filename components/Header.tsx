'use client'

import { useState, useEffect } from 'react'

interface IfepInfo {
  nom: string
  adresse: string
  telephone: string
  fax: string
  branches_professionnelles: string
}

export default function Header() {
  const [ifepInfo, setIfepInfo] = useState<IfepInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIfepInfo()
  }, [])

  const loadIfepInfo = async () => {
    try {
      const response = await fetch('/api/ifep-info')
      const data = await response.json()
      setIfepInfo(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <header className="bg-primary text-white p-5 rounded-lg mb-4 shadow-lg">
      <div className="header-content">
        {ifepInfo && (ifepInfo.nom || ifepInfo.branches_professionnelles) && (
          <div className="mb-4 pb-4 border-b border-white/20">
            {ifepInfo.nom && (
              <h2 className="text-2xl font-bold mb-2">{ifepInfo.nom}</h2>
            )}
            {ifepInfo.branches_professionnelles && (
              <div className="text-sm opacity-90">
                <span className="font-semibold">Branches professionnelles:</span> {ifepInfo.branches_professionnelles}
              </div>
            )}
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span>🎓</span> Direction des Études
        </h1>
        <p className="text-lg opacity-90 mb-1">Système de Gestion des Projets Pédagogiques</p>
        <p className="text-sm opacity-80">Dernière mise à jour: {currentDate}</p>
      </div>
    </header>
  )
}

