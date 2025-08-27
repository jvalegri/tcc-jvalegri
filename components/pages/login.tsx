import React, { useState } from "react"

type Props = {
  onLogin: (user: { email: string; name?: string; projects?: any[] }) => void
  goToSignup: () => void
}

export default function Login({ onLogin, goToSignup }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Faz uma chamada real para um endpoint de API para validar as credenciais
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Verifica se a resposta do backend foi bem-sucedida
      if (response.ok) {
        const user = await response.json()
        // Chama onLogin somente se o login for bem-sucedido
        onLogin(user)
      } else {
        // Se a resposta for um erro (e.g., 401 Unauthorized), exibe a mensagem do backend
        const errorData = await response.json()
        setError(errorData.message || "Email ou senha incorretos.")
      }
    } catch (err) {
      // Captura erros de rede ou outros problemas na requisição
      setError("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-800 p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Entrar</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" onClick={goToSignup} className="text-sm underline">
            Cadastre-se
          </button>
        </div>
      </form>
    </div>
  )
}