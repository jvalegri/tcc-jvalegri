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

export function DataManagement() {
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

  // Simular eventos recentes
  useEffect(() => {
    const mockEvents: NotificationEvent[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Estoque Baixo Detectado',
        description: 'Material "Tijolo" está abaixo do estoque mínimo (5/10 unidades)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
        project: 'Projeto Alpha',
        material: 'Tijolo',
        severity: 'high'
      },
      {
        id: '2',
        type: 'general',
        title: 'Movimentação Registrada',
        description: 'João Silva registrou entrada de 50 unidades de Cimento',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1h atrás
        project: 'Projeto Alpha',
        user: 'João Silva',
        material: 'Cimento',
        severity: 'low'
      },
      {
        id: '3',
        type: 'critical',
        title: 'Retirada em Grande Escala',
        description: 'Retirada de 85% do estoque total de Areia detectada',
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5h atrás
        project: 'Projeto Alpha',
        material: 'Areia',
        severity: 'critical'
      }
    ]
    setRecentEvents(mockEvents)
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
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      
      if (response.ok) {
        toast({
          title: "Notificação de teste enviada",
          description: "Verifique seu email para confirmar o recebimento.",
        })
      } else {
        throw new Error('Falha no envio')
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação de teste.",
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
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  +1 desde ontem
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Esta semana
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
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">
                  Precisão de detecção
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
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Padrão Detectado:</strong> Retiradas de Areia aumentaram 40% nas últimas 2 semanas. 
                    Considere aumentar o estoque mínimo para este material.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recomendação:</strong> Sistema funcionando dentro dos parâmetros normais. 
                    Nenhuma ação imediata necessária.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
