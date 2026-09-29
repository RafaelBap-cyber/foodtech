export default function OngProfile() {
  const campo =
    "w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-600 focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Perfil da ONG</h1>
        <button className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50">
          Editar perfil
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-500">Nome da ONG</label>
            <input defaultValue="ONG Esperança" className={campo} disabled />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">Descrição</label>
            <textarea
              defaultValue="Distribui cestas básicas e alimentos para famílias em situação de vulnerabilidade."
              rows={3}
              className={campo}
              disabled
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">Endereço</label>
            <input defaultValue="Rua das Flores, 100, Campinas - SP" className={campo} disabled />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-500">Telefone</label>
              <input defaultValue="(19) 99999-0000" className={campo} disabled />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500">E-mail</label>
              <input defaultValue="contato@ongesperanca.org" className={campo} disabled />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">Alimentos aceitos</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Frutas</span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Verduras</span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Leite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}