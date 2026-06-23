// Crée ce fichier et importe dans toutes les pages src pages _shared.jsx

export function Field({ label, icon, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-orange-400 transition bg-white overflow-hidden">
        <span className="pl-4 text-base">{icon}</span>
        <input {...props} className="flex-1 px-3 py-3 text-sm focus:outline-none text-gray-900 placeholder-gray-300" />
      </div>
    </div>
  )
}

export function PhoneInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone *</label>
      <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-orange-400 bg-white overflow-hidden">
        <span className="pl-3 pr-2 py-3 text-sm font-bold text-gray-700 bg-gray-100 border-r border-gray-200">
          🇹🇳 +216
        </span>
        <input type="tel" value={value} onChange={onChange} maxLength={8}
          placeholder="XX XXX XXX"
          className="flex-1 px-3 py-3 text-sm focus:outline-none text-gray-900" />
      </div>
    </div>
  )
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 outline-none text-sm bg-white">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function InfoCard({ emoji, title, subtitle }) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="font-bold text-gray-800 text-sm">{title}</div>
        <div className="text-gray-500 text-xs">{subtitle}</div>
      </div>
    </div>
  )
}

export function DocCard({ title, subtitle, emoji, file, required, onPick }) {
  return (
    <button type="button" onClick={onPick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
        file ? 'bg-green-50 border-green-400' :
        required ? 'bg-white border-gray-200 hover:border-orange-300' :
                   'bg-gray-50 border-dashed border-gray-300 hover:border-orange-300'
      }`}>
      {file
        ? <img src={URL.createObjectURL(file)} className="w-12 h-12 rounded-lg object-cover" />
        : <span className="text-2xl">{emoji}</span>}
      <div className="flex-1">
        <div className="font-bold text-gray-800 text-sm">{title}</div>
        <div className="text-gray-400 text-xs">{subtitle}</div>
        {file && <div className="text-green-600 text-xs font-bold mt-0.5">✓ Fichier sélectionné</div>}
      </div>
      <span className={`text-xl ${file ? 'text-green-500' : 'text-gray-300'}`}>
        {file ? '✅' : '📎'}
      </span>
    </button>
  )
}

export function Alert({ msg }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mt-3 text-sm">{msg}</div>
  )
}

export function NextBtn({ label = 'Étape suivante →' }) {
  return (
    <button type="submit"
      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4
                 rounded-2xl transition shadow-lg shadow-orange-200 text-sm">
      {label}
    </button>
  )
}

export function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Chargement...
    </span>
  )
}

export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <button onClick={onClose} className="float-right text-gray-400 hover:text-gray-600 text-xl mb-2">✕</button>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  )
}

export function FloatInput({ label, icon, ...props }) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-gray-500 z-10">{label}</label>
      <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-orange-400 transition bg-white overflow-hidden">
        <span className="pl-4 text-base">{icon}</span>
        <input {...props} required className="flex-1 px-3 py-3.5 text-sm focus:outline-none text-gray-900 placeholder-gray-300" />
      </div>
    </div>
  )
}