import { useAuth } from '../context/AuthContext'
import { Field, PhoneInput, SelectField, InfoCard, DocCard,
         Alert, NextBtn, Spinner, Modal, FloatInput } from './_shared'
export default function DashboardPage() {
  const { supplier, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Bonjour, {supplier?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm">Dashboard fournisseur</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-red-500 transition"
        >
          Déconnexion
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
        Dashboard en construction... 🚧
      </div>
    </div>
  )
}