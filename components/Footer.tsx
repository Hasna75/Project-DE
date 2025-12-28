'use client'

import { useState, useEffect } from 'react'

interface IfepInfo {
  nom: string
  adresse: string
  telephone: string
  fax: string
  branches_professionnelles: string
}

export default function Footer() {
  const [ifepInfo, setIfepInfo] = useState<IfepInfo | null>(null)

  useEffect(() => {
    loadIfepInfo()
  }, [])

  const loadIfepInfo = async () => {
    try {
      const response = await fetch('/api/ifep-info')
      const data = await response.json()
      setIfepInfo(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (!ifepInfo || (!ifepInfo.adresse && !ifepInfo.telephone && !ifepInfo.fax)) {
    return null
  }

  return (
    <footer className="bg-gray-100 border-t border-gray-300 mt-8 p-5 rounded-lg">
      <div className="text-center text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ifepInfo.adresse && (
            <div>
              <span className="font-semibold">Adresse:</span> {ifepInfo.adresse}
            </div>
          )}
          {ifepInfo.telephone && (
            <div>
              <span className="font-semibold">Téléphone:</span> {ifepInfo.telephone}
            </div>
          )}
          {ifepInfo.fax && (
            <div>
              <span className="font-semibold">Fax:</span> {ifepInfo.fax}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

