export default function OngLogin() {
  const campo =
    "w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-green-600 focus:outline-none";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center p-6">
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Login de ONG</h1>
        <p className="mt-1 text-sm text-gray-500">
          Entre com sua conta para acessar o painel da sua ONG.
        </p>

        <div className="mt-6 space-y-4">
          <input type="email" placeholder="E-mail" className={campo} />
          <input type="password" placeholder="Senha" className={campo} />

          <button className="w-full rounded-lg bg-green-600 p-3 font-medium text-white hover:bg-green-700">
            Entrar
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Ainda não tem cadastro?{" "}
          <a href="#" className="font-medium text-green-700 hover:underline">
            Cadastre sua ONG
          </a>
        </p>
      </div>
    </div>
  );
}