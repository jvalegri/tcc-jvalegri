"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Mail,
  Database,
  Activity,
  Shield,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettings {
  criticalOnly: boolean
  lowStock: boolean
  outOfStock: boolean
  largeWithdrawal: boolean
  inviteAccepted: boolean
  generalUpdates: boolean
  aiDetection: boolean
}

interface NotificationEvent {
  id: string
  type: 'critical' | 'general'
  title: string
  description: string
  timestamp: Date
  project: string
  material?: string
  user?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface DataManagementProps {
  projectId?: string
  userEmail?: string
}

export function DataManagement({ projectId, userEmail }: DataManagementProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotificationSettings>({
    criticalOnly: true,
    lowStock: true,
    outOfStock: true,
    largeWithdrawal: true,
    inviteAccepted: true,
    generalUpdates: false,
    aiDetection: true
  })

  const [recentEvents, setRecentEvents] = useState<NotificationEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Buscar eventos reais do sistema
  useEffect(() => {
    const fetchRealEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/events/real?projectId=${projectId || 'current'}&limit=10`)
        if (response.ok) {
          const events = await response.json()
          setRecentEvents(events)
        } else {
          console.error('Erro ao buscar eventos:', response.statusText)
          setRecentEvents([])
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
        setRecentEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealEvents()
    
    // Atualizar eventos a cada 30 segundos
    const interval = setInterval(fetchRealEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Se ativar "críticas apenas", desativar atualizações gerais
    if (key === 'criticalOnly' && value) {
      setSettings(prev => ({ ...prev, generalUpdates: false }))
    }
    
    // Se ativar atualizações gerais, desativar "críticas apenas"
    if (key === 'generalUpdates' && value) {
      setSettings(prev => ({ ...prev, criticalOnly: false }))
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testNotification = async () => {
    if (!userEmail) {
      toast({
        title: "Erro",
        description: "Email do usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🧪 Testando envio de email para:', userEmail)
      
      const response = await fetch('/api/test-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail
        })
      })
      
      const result = await response.json()
      console.log('📧 Resultado do teste:', result)
      
      if (response.ok) {
        toast({
          title: "Email de teste enviado",
          description: `Email enviado com sucesso! ID: ${result.emailId}`,
        })
      } else {
        console.error('❌ Erro detalhado:', result)
        toast({
          title: "Erro no teste",
          description: `${result.error}: ${result.details || 'Verifique os logs do console'}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Erro no teste de notificação:', error)
      toast({
        title: "Erro no teste",
        description: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  // Calcular métricas reais
  const criticalEvents = recentEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length
  const totalEvents = recentEvents.length
  const detectionRate = totalEvents > 0 ? Math.round((criticalEvents / totalEvents) * 100) : 0

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Info className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestão de Dados
          </h1>
          <p className="text-muted-foreground">
            Configure notificações inteligentes e monitore eventos do sistema
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Sistema Ativo
        </Badge>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Configure suas preferências de notificação. O sistema detecta eventos críticos automaticamente.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="critical-only">Somente Notificações Críticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba apenas alertas de alta prioridade
                    </p>
                  </div>
                  <Switch
                    id="critical-only"
                    checked={settings.criticalOnly}
                    onCheckedChange={(checked) => handleSettingChange('criticalOnly', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Notificações Críticas
                  </h4>
                  
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="low-stock">Estoque Baixo</Label>
                        <p className="text-sm text-muted-foreground">
                          Quando material atinge estoque mínimo
                        </p>
                      </div>
                      <Switch
                        id="low-stock"
                        checked={settings.lowStock}
                        onCheckedChange={(checked) => handleSettingChange('lowStock', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="out-of-stock">Falta de Produto</Label>
                        <p className="text-sm text-muted-foreground">
                          Quando estoque chega a zero
                        </p>
                      </div>
                      <Switch
                        id="out-of-stock"
                        checked={settings.outOfStock}
                        onCheckedChange={(checked) => handleSettingChange('outOfStock', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="large-withdrawal">Retirada em Grande Escala</Label>
                        <p className="text-sm text-muted-foreground">
                          Retiradas superiores a 80% do estoque
                        </p>
                      </div>
                      <Switch
                        id="large-withdrawal"
                        checked={settings.largeWithdrawal}
                        onCheckedChange={(checked) => handleSettingChange('largeWithdrawal', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="invite-accepted">Convite Aceito</Label>
                        <p className="text-sm text-muted-foreground">
                          Quando colaborador aceita convite para projeto
                        </p>
                      </div>
                      <Switch
                        id="invite-accepted"
                        checked={settings.inviteAccepted}
                        onCheckedChange={(checked) => handleSettingChange('inviteAccepted', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="system-detection">Detecção Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Eventos críticos detectados pelo sistema
                        </p>
                      </div>
                      <Switch
                        id="system-detection"
                        checked={settings.aiDetection}
                        onCheckedChange={(checked) => handleSettingChange('aiDetection', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="general-updates">Todas as Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclui atualizações gerais e movimentações menores
                    </p>
                  </div>
                  <Switch
                    id="general-updates"
                    checked={settings.generalUpdates}
                    onCheckedChange={(checked) => handleSettingChange('generalUpdates', checked)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveSettings} disabled={isLoading}>
                  <Settings className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
                <Button variant="outline" onClick={testNotification}>
                  <Mail className="mr-2 h-4 w-4" />
                  Testar Notificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Eventos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Carregando eventos...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(event.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Projeto: {event.project}</span>
                        {event.material && <span>Material: {event.material}</span>}
                        {event.user && <span>Usuário: {event.user}</span>}
                        <span>{event.timestamp.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eventos Críticos (24h)
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{criticalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Últimas 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notificações Enviadas
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Total de eventos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Detecção
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{detectionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Taxa de detecção
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Insights do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalEvents > 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Alerta:</strong> {criticalEvents} evento(s) crítico(s) detectado(s). 
                      Verifique os materiais com estoque baixo e movimentações grandes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Status:</strong> Sistema funcionando normalmente. 
                      Nenhum evento crítico detectado.
                    </AlertDescription>
                  </Alert>
                )}
                
                {totalEvents > 0 && (
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Atividade:</strong> {totalEvents} evento(s) registrado(s) recentemente. 
                      Sistema monitorando continuamente.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
