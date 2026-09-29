export default function OngDetails() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">ONG Esperança</h1>
        <p className="mt-1 text-sm text-gray-500">Campinas - SP</p>

        <p className="mt-4 text-gray-700">
          Descrição completa da ONG, contando sua história, missão e como atua na comunidade.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Contato</h2>
            <p className="mt-1 text-sm text-gray-700">(19) 99999-0000</p>
            <p className="text-sm text-gray-700">contato@ongesperanca.org</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500">Endereço</h2>
            <p className="mt-1 text-sm text-gray-700">Rua das Flores, 100, Campinas - SP</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500">Alimentos aceitos</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Frutas</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Verduras</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Leite</span>
          </div>
        </div>

        <button className="mt-6 w-full rounded-lg bg-green-600 p-3 font-medium text-white hover:bg-green-700">
          Fazer uma doação
        </button>
      </div>
    </div>
  );
}