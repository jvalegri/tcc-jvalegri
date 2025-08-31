import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { InviteAcceptanceDialog } from "@/components/invite-acceptance-dialog"

type Props = {
  onLogin: (user: { id: string; email: string; name?: string; projects?: any[] }) => void
  goToSignup: () => void
}

interface Invite {
  id: string
  token: string
  project: {
    id: string
    name: string
    description?: string
  }
  role: string
  sentBy: {
    name?: string
    email: string
  }
  expiresAt: string
}

export default function Login({ onLogin, goToSignup }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([])
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const checkPendingInvites = async (userId: string) => {
    try {
      const response = await fetch(`/api/invites/pending?userId=${userId}`)
      if (response.ok) {
        const invites = await response.json()
        if (invites.length > 0) {
          setPendingInvites(invites)
          setShowInviteDialog(true)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar convites pendentes:', error)
    }
  }

  const handleAcceptInvite = async (invite: Invite) => {
    try {
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invite.token,
          userId: invite.userId || ''
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao aceitar convite')
      }

      // Atualizar a lista de convites pendentes
      setPendingInvites(prev => prev.filter(i => i.id !== invite.id))
    } catch (error) {
      console.error('Erro ao aceitar convite:', error)
      throw error
    }
  }

  const handleDeclineInvite = async (invite: Invite) => {
    try {
      // Por enquanto, apenas remove da lista local
      // Você pode implementar uma rota para recusar convites se necessário
      setPendingInvites(prev => prev.filter(i => i.id !== invite.id))
    } catch (error) {
      console.error('Erro ao recusar convite:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validação básica no frontend
      if (!email.trim() || !password.trim()) {
        setError("Por favor, preencha todos os campos.")
        setLoading(false)
        return
      }

      // Chamada para a API de login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (response.ok) {
        const user = await response.json()
        
        // Verificar se o usuário tem dados válidos
        if (user && user.id && user.email) {
          // Verificar convites pendentes antes de fazer login
          await checkPendingInvites(user.id)
          
          // Chama onLogin somente se o login for bem-sucedido
          onLogin(user)
        } else {
          setError("Resposta inválida do servidor.")
        }
      } else {
        // Se a resposta for um erro, exibe a mensagem do backend
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
    <>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
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
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={goToSignup}
                    disabled={loading}
                    className="text-sm"
                  >
                    Não tem uma conta? Cadastre-se
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {showInviteDialog && (
        <InviteAcceptanceDialog
          invites={pendingInvites}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          onClose={() => setShowInviteDialog(false)}
        />
      )}
    </>
  )
}