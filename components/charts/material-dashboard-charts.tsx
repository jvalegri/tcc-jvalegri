"use client"

import React, { useState } from 'react'
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

type PeriodOption = '7d' | '1m' | '3m'

export function MaterialDashboardCharts({ materials, movements }: MaterialDashboardChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('7d')
  
  // Validar dados de entrada
  const safeMaterials = materials || []
  const safeMovements = movements || []
  
  // Calcular métricas financeiras
  const totalValue = safeMaterials.reduce((sum, material) => 
    sum + ((material.quantity || 0) * (material.price || 0)), 0
  )

  const lowStockCount = safeMaterials.filter(material => 
    (material.quantity || 0) <= (material.minStock || 0)
  ).length

  const totalMovements = safeMovements.length
  const entryMovements = safeMovements.filter(m => m.actionType === 'entrada').length
  const exitMovements = safeMovements.filter(m => m.actionType === 'saída').length

  // Dados para gráfico de valor por categoria
  const categoryData = safeMaterials.reduce((acc, material) => {
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

  // Função para obter dados baseado no período selecionado
  const getPeriodData = () => {
    const now = new Date()
    let periods: string[] = []
    let labels: string[] = []
    
    switch (selectedPeriod) {
      case '7d':
        periods = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          return date.toISOString().slice(0, 10) // YYYY-MM-DD
        }).reverse()
        labels = periods.map(date => {
          const d = new Date(date)
          return `${d.getDate()}/${d.getMonth() + 1}`
        })
        break
        
      case '1m':
        periods = Array.from({ length: 4 }, (_, i) => {
          const date = new Date(now)
          date.setDate(date.getDate() - (i * 7))
          return date.toISOString().slice(0, 10)
        }).reverse()
        labels = periods.map((_, i) => `Semana ${4 - i}`)
        break
        
      case '3m':
        periods = Array.from({ length: 3 }, (_, i) => {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          return date.toISOString().slice(0, 7) // YYYY-MM
        }).reverse()
        labels = periods.map(month => {
          const [year, monthNum] = month.split('-')
          const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
          return `${monthNames[parseInt(monthNum) - 1]} ${year}`
        })
        break
    }
    
    return { periods, labels }
  }

  const { periods, labels } = getPeriodData()

  // Dados para gráfico de movimentações baseado no período selecionado
  const periodMovements = periods.map(period => {
    const periodMovements = safeMovements.filter(movement => {
      if (!movement.timestamp) return false
      try {
        const movementDate = new Date(movement.timestamp)
        
        if (selectedPeriod === '7d') {
          // Comparar por dia
          const movementDateStr = movementDate.toISOString().slice(0, 10)
          return movementDateStr === period
        } else if (selectedPeriod === '1m') {
          // Comparar por semana (aproximado)
          const periodDate = new Date(period)
          const weekStart = new Date(periodDate)
          weekStart.setDate(weekStart.getDate() - 7)
          return movementDate >= weekStart && movementDate <= periodDate
        } else {
          // Comparar por mês
          const movementMonth = movementDate.toISOString().slice(0, 7)
          return movementMonth === period
        }
      } catch (error) {
        console.warn('Data inválida encontrada:', movement.timestamp)
        return false
      }
    })
    return periodMovements.length
  })

  // Dados para gráfico de valor total do estoque baseado no período selecionado
  const periodStockValues = periods.map(period => {
    // Filtrar movimentações até o período atual
    const movementsUpToPeriod = safeMovements.filter(movement => {
      if (!movement.timestamp) return false
      try {
        const movementDate = new Date(movement.timestamp)
        
        if (selectedPeriod === '7d') {
          const movementDateStr = movementDate.toISOString().slice(0, 10)
          return movementDateStr <= period
        } else if (selectedPeriod === '1m') {
          const periodDate = new Date(period)
          return movementDate <= periodDate
        } else {
          const movementMonth = movementDate.toISOString().slice(0, 7)
          return movementMonth <= period
        }
      } catch (error) {
        console.warn('Data inválida encontrada:', movement.timestamp)
        return false
      }
    })

    // Calcular valor total do estoque considerando movimentações até o período
    const stockValue = safeMaterials.reduce((totalValue, material) => {
      // Calcular quantidade atual considerando movimentações até o período
      let currentQuantity = material.quantity || 0
      
      // Aplicar movimentações até o período
      movementsUpToPeriod.forEach(movement => {
        if (movement.materialId === material.id) {
          if (movement.actionType === 'entrada') {
            currentQuantity += movement.quantity
          } else if (movement.actionType === 'saída') {
            currentQuantity -= movement.quantity
          }
        }
      })
      
      // Calcular valor (quantidade * preço)
      const materialValue = currentQuantity * (material.price || 0)
      return totalValue + materialValue
    }, 0)

    return stockValue
  })

  // Dados para gráfico de status de estoque
  const stockStatusData = {
    'Em Estoque': safeMaterials.filter(m => (m.quantity || 0) > (m.minStock || 0)).length,
    'Estoque Baixo': safeMaterials.filter(m => (m.quantity || 0) <= (m.minStock || 0) && (m.quantity || 0) > 0).length,
    'Sem Estoque': safeMaterials.filter(m => (m.quantity || 0) === 0).length,
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
    labels: labels,
    datasets: [
      {
        label: 'Movimentações',
        data: periodMovements,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const stockValueChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Valor do Estoque (R$)',
        data: periodStockValues,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                <p className="text-2xl font-bold">{safeMaterials.length}</p>
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

      {/* Gráficos de Análise Temporal */}
      <div className="space-y-6">
        {/* Movimentações por Período */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Movimentações - {
                  selectedPeriod === '7d' ? 'Últimos 7 Dias' :
                  selectedPeriod === '1m' ? 'Último Mês' :
                  'Últimos 3 Meses'
                }
              </CardTitle>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodOption)}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value="7d">7 Dias</option>
                <option value="1m">1 Mês</option>
                <option value="3m">3 Meses</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={movementsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Valor do Estoque por Período */}
        <Card>
          <CardHeader>
            <CardTitle>
              Valor Total do Estoque - {
                selectedPeriod === '7d' ? 'Últimos 7 Dias' :
                selectedPeriod === '1m' ? 'Último Mês' :
                'Últimos 3 Meses'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={stockValueChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed.y
                        return `Valor: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })
                      }
                    }
                  }
                }
              }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
