import { useEffect, useState } from "react";
import OngCard from "../../components/ong/OngCard";
import type { Ong } from "../../components/ong/OngCard";
import { listarOngs } from "../../services/ongService";

export default function OngList() {
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [alimento, setAlimento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");
    listarOngs(alimento.trim() || undefined)
      .then(setOngs)
      .catch(() => setErro("Não foi possível carregar as ONGs."))
      .finally(() => setCarregando(false));
  }, [alimento]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold text-gray-800">ONGs cadastradas</h1>

      <input
        type="text"
        value={alimento}
        onChange={(e) => setAlimento(e.target.value)}
        placeholder="Filtrar por alimento aceito (ex.: arroz)"
        className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-600 focus:outline-none"
      />

      {carregando && <p className="mt-6 text-gray-500">Carregando...</p>}
      {erro && <p className="mt-6 text-red-600">{erro}</p>}

      {!carregando && !erro && ongs.length === 0 && (
        <p className="mt-6 text-gray-500">Nenhuma ONG encontrada.</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ongs.map((ong) => (
          <OngCard key={ong.id} ong={ong} />
        ))}
      </div>
    </div>
  );
}