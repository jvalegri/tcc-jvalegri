import React, { useState, useEffect } from "react"

type Project = {
  id: string
  name: string
}

type Props = {
  user: { email: string; name?: string } | null
  onSelectProject: (projectId: string) => void
}

export default function ProjectSelection({ user, onSelectProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    // Em um cenário real, você faria uma chamada API para buscar os projetos
    // associados ao usuário. Para este exemplo, usamos dados simulados.
    // fetchProjects(user.id).then(data => setProjects(data))
    if (user) {
      const fetchedProjects: Project[] = [
        { id: "proj-1", name: "Projeto A" },
        { id: "proj-2", name: "Projeto B" },
      ]
      setProjects(fetchedProjects)
      if (fetchedProjects.length > 0) {
        setSelected(fetchedProjects[0].id)
      }
    }
  }, [user])

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white dark:bg-slate-800 p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Olá{user?.name ? `, ${user.name}` : ""}</h2>
      <p className="mb-4">Selecione o projeto relacionado à sua conta ou crie um novo:</p>
      
      {projects.length > 0 && (
        <>
          <ul className="space-y-2 mb-4">
            {projects.map((p) => (
              <li key={p.id}>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="project" checked={selected === p.id} onChange={() => setSelected(p.id)} />
                  <span>{p.name}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-primary text-white rounded"
              onClick={() => {
                if (selected) onSelectProject(selected)
              }}
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {projects.length === 0 && (
        <p className="mb-4">Você ainda não tem projetos. Crie um para começar.</p>
      )}

      <div className="mt-6 border-t pt-4">
        <button
          className="w-full px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600"
          onClick={() => {
            // Lógica para criar um novo projeto.
            console.log("Navegar para a página de criação de novo projeto.")
          }}
        >
          + Novo Projeto
        </button>
      </div>
    </div>
  )
}