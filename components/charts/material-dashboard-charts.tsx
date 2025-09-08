"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react'
import type { Material, MovementRecord } from '@/lib/types'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface MaterialDashboardChartsProps {
  materials: Material[]
  movements: MovementRecord[]
}

export function MaterialDashboardCharts({ materials, movements }: MaterialDashboardChartsProps) {
  // Calcular métricas financeiras
  const totalValue = materials.reduce((sum, material) => 
    sum + ((material.quantity || 0) * (material.price || 0)), 0
  )

  const lowStockCount = materials.filter(material => 
    (material.quantity || 0) <= (material.minStock || 0)
  ).length

  const totalMovements = movements.length
  const entryMovements = movements.filter(m => m.actionType === 'entrada').length
  const exitMovements = movements.filter(m => m.actionType === 'saída').length

  // Dados para gráfico de valor por categoria
  const categoryData = materials.reduce((acc, material) => {
    const category = material.category || 'Outros'
    const value = (material.quantity || 0) * (material.price || 0)
    
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += value
    
    return acc
  }, {} as Record<string, number>)

  const categoryLabels = Object.keys(categoryData)
  const categoryValues = Object.values(categoryData)

  // Dados para gráfico de movimentações por mês (últimos 6 meses)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().slice(0, 7) // YYYY-MM
  }).reverse()

  const monthlyMovements = last6Months.map(month => {
    const monthMovements = movements.filter(movement => {
      const movementDate = new Date(movement.timestamp).toISOString().slice(0, 7)
      return movementDate === month
    })
    return monthMovements.length
  })

  // Dados para gráfico de status de estoque
  const stockStatusData = {
    'Em Estoque': materials.filter(m => (m.quantity || 0) > (m.minStock || 0)).length,
    'Estoque Baixo': materials.filter(m => (m.quantity || 0) <= (m.minStock || 0) && (m.quantity || 0) > 0).length,
    'Sem Estoque': materials.filter(m => (m.quantity || 0) === 0).length,
  }

  // Configurações dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  // Dados dos gráficos
  const categoryChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Valor Total (R$)',
        data: categoryValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const movementsChartData = {
    labels: last6Months.map(month => {
      const [year, monthNum] = month.split('-')
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`
    }),
    datasets: [
      {
        label: 'Movimentações',
        data: monthlyMovements,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const stockStatusChartData = {
    labels: Object.keys(stockStatusData),
    datasets: [
      {
        data: Object.values(stockStatusData),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Materiais</p>
                <p className="text-2xl font-bold">{materials.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Movimentações</p>
                <p className="text-2xl font-bold">{totalMovements}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {entryMovements} Entradas
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {exitMovements} Saídas
                  </Badge>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valor por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Valor por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={categoryChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Status do Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={stockStatusChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimentações por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações dos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={movementsChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
