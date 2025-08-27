import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type Props = {
  onSignup: (user: { id: string; email: string; name?: string; projects?: any[] }) => void
  goToLogin: () => void
}

export default function Signup({ onSignup, goToLogin }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validação básica no frontend
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Por favor, preencha todos os campos obrigatórios.")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem.")
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.")
        setLoading(false)
        return
      }

      // Chamada para a API de cadastro
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password 
        }),
      })

      if (response.ok) {
        const user = await response.json()
        
        // Verificar se o usuário tem dados válidos
        if (user && user.id && user.email) {
          onSignup(user)
        } else {
          setError("Resposta inválida do servidor.")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Erro ao criar conta.")
      }
    } catch (err) {
      setError("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                type="text"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Seu nome completo"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha *</Label>
              <Input
                id="confirm-password"
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirme sua senha"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={goToLogin}
                  disabled={loading}
                  className="text-sm"
                >
                  Já tem uma conta? Faça login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
