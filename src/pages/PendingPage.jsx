import { useNavigate } from 'react-router-dom'
import { Field, PhoneInput, SelectField, InfoCard, DocCard,
         Alert, NextBtn, Spinner, Modal, FloatInput } from './_shared'
export default function PendingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-24 h-24 bg-orange-50 border-2 border-orange-200 rounded-full
                        flex items-center justify-center text-5xl mx-auto mb-6">⏳</div>
        <h1 className="text-2xl font-black text-gray-900 mb-3">Candidature envoyée !</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Votre dossier est en cours de vérification.<br />
          Notre équipe vous contactera sous 24-48h.
        </p>
        <div className="space-y-2 mb-8 text-left">
          {[
            ['1', 'Dossier reçu ✅'],
            ['2', 'Vérification en cours ⏳'],
            ['3', 'Validation admin'],
            ['4', 'Accès fournisseur activé'],
          ].map(([n, text]) => (
            <div key={n} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200
                              flex items-center justify-center text-xs font-black text-orange-500">
                {n}
              </div>
              <span className="text-sm text-gray-600 font-medium">{text}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/login')}
          className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">
          Retourner à la connexion
        </button>
      </div>
    </div>
  )
}