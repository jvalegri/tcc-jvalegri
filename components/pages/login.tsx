import React, { useState } from "react"

type Props = {
  onLogin: (user: { email: string; name?: string }) => void
  goToSignup: () => void
}

export default function Login({ onLogin, goToSignup }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // validação simples (substituir por chamada ao backend)
    if (!email || !password) {
      setError("Preencha email e senha.")
      return
    }
    // simular login bem-sucedido
    onLogin({ email })
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
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
            Entrar
          </button>
          <button type="button" onClick={goToSignup} className="text-sm underline">
            Cadastre-se
          </button>
        </div>
      </form>
    </div>
  )
}
