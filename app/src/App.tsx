import './App.css'

function App() {
  return (
    <main className="start-screen">
      <section className="start-card" aria-labelledby="game-title">
        <p className="eyebrow">SDGs 永續行動遊戲</p>
        <h1 id="game-title">地球守護隊：能量大作戰</h1>
        <p className="intro">
          組裝能量工具、找出環境問題，和地球守護隊一起完成任務。
        </p>
        <button className="start-button" type="button">
          開始任務
        </button>
      </section>
    </main>
  )
}

export default App
