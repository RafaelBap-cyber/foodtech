export default function OngRegister() {
  const campo =
    "w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-600 focus:outline-none";

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800">Cadastro de ONG</h1>
      <p className="mt-1 text-sm text-gray-500">
        Preencha os dados para cadastrar sua ONG na plataforma.
      </p>

      <div className="mt-6 space-y-4">
        <input placeholder="Nome da ONG" className={campo} />
        <input type="email" placeholder="E-mail" className={campo} />
        <input type="password" placeholder="Senha" className={campo} />
        <input placeholder="Telefone / contato" className={campo} />
        <input placeholder="Endereço completo" className={campo} />
        <textarea placeholder="Descrição da ONG" rows={3} className={campo} />
        <input placeholder="Alimentos aceitos (ex.: arroz, feijão)" className={campo} />

        <button className="w-full rounded-lg bg-green-600 p-3 font-medium text-white hover:bg-green-700">
          Cadastrar ONG
        </button>
      </div>
    </div>
  );
}