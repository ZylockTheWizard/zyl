import React from "react"
import ReactDOM from "react-dom/client"

const App: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>💖 Welcome to React in Electron!</h1>
      <p>Your React app is running.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
