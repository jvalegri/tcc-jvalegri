import React, { useState } from "react"

type Props = {
  user: { email: string; name?: string } | null
  onSelectProject: (projectId: string) => void
}

export default function ProjectSelection({ user, onSelectProject }: Props) {
  // lista de projetos simulada; em produção, carregue do backend usando user
  const mockProjects = [
    { id: "proj-1", name: "Projeto A" },
    { id: "proj-2", name: "Projeto B" },
    { id: "proj-3", name: "Projeto C" },
  ]

  const [selected, setSelected] = useState<string | null>(mockProjects[0].id)

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white dark:bg-slate-800 p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Olá{user?.name ? `, ${user.name}` : ""}</h2>
      <p className="mb-4">Selecione o projeto relacionado à sua conta:</p>
      <ul className="space-y-2 mb-4">
        {mockProjects.map((p) => (
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
    </div>
  )
}
