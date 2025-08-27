import React, { useState } from "react"

type Props = {
  onSignup: (user: { email: string; name?: string }) => void
  goToLogin: () => void
}

export default function Signup({ onSignup, goToLogin }: Props) {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [dataNasc, setDataNasc] = useState("")
  const [profissao, setProfissao] = useState("")
  const [titulo, setTitulo] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!nome || !cpf || !dataNasc || !email || !senha) {
      setError("Preencha os campos obrigatórios.")
      return
    }
    // simular cadastro bem-sucedido
    onSignup({ email, name: nome })
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white dark:bg-slate-800 p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Cadastro</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">CPF</label>
          <input value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Data de Nasc</label>
          <input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Profissão</label>
          <input value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex items-center justify-between mt-2">
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
            Cadastrar
          </button>
          <button type="button" onClick={goToLogin} className="text-sm underline">
            Voltar ao login
          </button>
        </div>
      </form>
    </div>
  )
}
