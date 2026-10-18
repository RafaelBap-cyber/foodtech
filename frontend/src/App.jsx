import Mapa from './components/map/Mapa'
import './App.css'

function App() {
  const ongs = [
    {
      id: 1,
      nome: 'ONG Exemplo',
      latitude: -22.9056,
      longitude: -47.0608,
      endereco: 'Campinas, SP',
      alimentos: 'Frutas e verduras',
    },
    {
      id: 2,
      nome: 'ONG Esperança',
      latitude: -22.9005,
      longitude: -47.055,
      endereco: 'Campinas, SP',
      alimentos: 'Pães e alimentos não perecíveis',
    },
    {
      id: 3,
      nome: 'ONG Solidária',
      latitude: -22.915,
      longitude: -47.065,
      endereco: 'Campinas, SP',
      alimentos: 'Leite e produtos básicos',
    },
  ]

  return (
    <main className="pagina">
      <header className="cabecalho">
        <div>
          <span className="marca">FoodTech</span>
          <h1>Encontre ONGs perto de você</h1>
          <p>
            Conectando alimentos a quem precisa.
          </p>
        </div>
      </header>

      <section className="secao-mapa">
        <div className="titulo-secao">
          <h2>Mapa de instituições</h2>
          <span>{ongs.length} instituições</span>
        </div>

        <Mapa ongs={ongs} />
      </section>

      <section className="secao-ongs">
        <h2>Instituições cadastradas</h2>

        <div className="lista-ongs">
          {ongs.map((ong) => (
            <article className="card-ong" key={ong.id}>
              <div className="icone-ong">📍</div>

              <div className="informacoes-ong">
                <h3>{ong.nome}</h3>
                <p>{ong.endereco}</p>

                <span className="etiqueta">
                  {ong.alimentos}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        FoodTech · Conectando pessoas e alimentos
      </footer>
    </main>
  )
}

export default App
