"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, UserPlus, Mail, Shield, Calendar, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UserRole, UserStatus, ProjectMember, ProjectInvite } from "@/lib/types"

interface UserManagementProps {
  projectId: string
  currentUserRole: UserRole
  currentUserId: string
}

export function UserManagement({ projectId, currentUserRole, currentUserId }: UserManagementProps) {
  const { toast } = useToast()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [invites, setInvites] = useState<ProjectInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "COLABORADOR" as UserRole
  })
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    fetchMembers()
    fetchInvites()
  }, [projectId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("Erro ao buscar membros:", error)
    }
  }

  const fetchInvites = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/invites`)
      if (response.ok) {
        const data = await response.json()
        setInvites(data)
      }
    } catch (error) {
      console.error("Erro ao buscar convites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteData.name.trim() || !inviteData.email.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setSendingInvite(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...inviteData,
          sentById: currentUserId
        }),
      })

      if (response.ok) {
        toast({
          title: "Convite enviado",
          description: "O convite foi enviado com sucesso!",
        })
        
        setInviteData({ name: "", email: "", role: "COLABORADOR" })
        setShowInviteDialog(false)
        fetchInvites()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao enviar convite")
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar convite",
        description: error instanceof Error ? error.message : "Não foi possível enviar o convite.",
        variant: "destructive",
      })
    } finally {
      setSendingInvite(false)
    }
  }

  const handleToggleUserStatus = async (memberId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === "ATIVO" ? "INATIVO" : "ATIVO"
    const action = newStatus === "ATIVO" ? "ativar" : "desativar"

    if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Status atualizado",
          description: `Usuário ${action} com sucesso!`,
        })
        fetchMembers()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao atualizar status")
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o status.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveUser = async (memberId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o usuário ${name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Usuário removido",
          description: `Usuário ${name} removido com sucesso!`,
        })
        fetchMembers()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao remover usuário")
      }
    } catch (error) {
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Não foi possível remover o usuário.",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: UserRole) => {
    return role === "GESTOR" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  }

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "ATIVO":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "INATIVO":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (currentUserRole !== "GESTOR") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">Apenas gestores podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Carregando usuários...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e convites do projeto
          </p>
        </div>
        
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuários do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Entrada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user?.name || "Nome não informado"}
                  </TableCell>
                  <TableCell>{member.user?.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`status-${member.id}`} className="text-sm">
                          {member.status === "ATIVO" ? "Ativo" : "Inativo"}
                        </Label>
                        <Switch
                          id={`status-${member.id}`}
                          checked={member.status === "ATIVO"}
                          onCheckedChange={() => handleToggleUserStatus(member.id, member.status)}
                          disabled={member.user?.role === "GESTOR"} // Não pode desativar gestores
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(member.id, member.user?.name || "Usuário")}
                        disabled={member.user?.id === currentUserId} // Não pode remover a si mesmo
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {members.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invites Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data do Convite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.name}</TableCell>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(invite.role)}>
                      {invite.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invite.status as UserStatus)}>
                      {invite.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(invite.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {invites.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum convite pendente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite para um novo usuário participar do projeto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-name">Nome *</Label>
              <Input
                id="invite-name"
                value={inviteData.name}
                onChange={(e) => setInviteData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo do usuário"
                disabled={sendingInvite}
              />
            </div>
            
            <div>
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                disabled={sendingInvite}
              />
            </div>
            
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value: UserRole) => setInviteData(prev => ({ ...prev, role: value }))}
                disabled={sendingInvite}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                  <SelectItem value="GESTOR">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              disabled={sendingInvite}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={sendingInvite}
            >
              {sendingInvite ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
