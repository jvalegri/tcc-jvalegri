import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"

type Project = {
  id: string
  name: string
  description?: string
}

type Props = {
  user: { id: string; email: string; name?: string } | null
  onSelectProject: (projectId: string) => void
}

export default function ProjectSelection({ user, onSelectProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingProject, setCreatingProject] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Buscar projetos reais do usuário
        const response = await fetch(`/api/auth/projects?userId=${user.id}`)
        
        if (response.ok) {
          const fetchedProjects = await response.json()
          setProjects(fetchedProjects)
          
          // Selecionar o primeiro projeto se existir
          if (fetchedProjects.length > 0) {
            setSelected(fetchedProjects[0].id)
          }
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Erro ao carregar projetos.")
        }
      } catch (err) {
        setError("Erro ao conectar com o servidor.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  const handleCreateProject = async () => {
    if (!user?.id || !newProjectName.trim()) return

    try {
      setCreatingProject(true)
      setError(null)

      const response = await fetch("/api/auth/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || null,
          userId: user.id
        }),
      })

      if (response.ok) {
        const newProject = await response.json()
        
        // Adicionar o novo projeto à lista
        setProjects(prev => [...prev, newProject])
        
        // Selecionar o novo projeto
        setSelected(newProject.id)
        
        // Limpar formulário e fechar dialog
        setNewProjectName("")
        setNewProjectDescription("")
        setShowCreateDialog(false)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Erro ao criar projeto.")
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.")
    } finally {
      setCreatingProject(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando projetos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo{user?.name ? `, ${user.name}` : ""}</CardTitle>
          <CardDescription>
            Selecione um projeto para continuar ou crie um novo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.length > 0 ? (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Selecione um projeto:</Label>
                <div className="grid gap-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selected === project.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelected(project.id)}
                    >
                      <input
                        type="radio"
                        name="project"
                        checked={selected === project.id}
                        onChange={() => setSelected(project.id)}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (selected) onSelectProject(selected)
                  }}
                  disabled={!selected}
                >
                  Continuar
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                Você ainda não tem projetos cadastrados.
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Crie seu primeiro projeto para começar a usar o sistema.
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo projeto
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Nome do Projeto *</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Digite o nome do projeto"
                      disabled={creatingProject}
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Descrição (opcional)</Label>
                    <Textarea
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Descreva o projeto"
                      disabled={creatingProject}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    disabled={creatingProject}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || creatingProject}
                  >
                    {creatingProject ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Projeto"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}