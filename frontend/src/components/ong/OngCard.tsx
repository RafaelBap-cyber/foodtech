export interface Ong {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  latitude: number;
  longitude: number;
  descricao: string;
  alimentosAceitos: string[];
}

interface OngCardProps {
  ong: Ong;
}

export default function OngCard({ ong }: OngCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{ong.nome}</h2>
      <p className="mt-1 text-sm text-gray-600">{ong.descricao}</p>
      <p className="mt-2 text-sm text-gray-500">{ong.endereco}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ong.alimentosAceitos.map((alimento) => (
          <span
            key={alimento}
            className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
          >
            {alimento}
          </span>
        ))}
      </div>
    </div>
  );
}