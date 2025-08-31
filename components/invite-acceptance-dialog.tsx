import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

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

interface InviteAcceptanceDialogProps {
  invites: Invite[]
  onAccept: (invite: Invite) => Promise<void>
  onDecline: (invite: Invite) => Promise<void>
  onClose: () => void
}

export function InviteAcceptanceDialog({ invites, onAccept, onDecline, onClose }: InviteAcceptanceDialogProps) {
  const [currentInviteIndex, setCurrentInviteIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedInvites, setProcessedInvites] = useState<Set<string>>(new Set())

  const currentInvite = invites[currentInviteIndex]
  const isLastInvite = currentInviteIndex === invites.length - 1

  const handleAccept = async () => {
    if (!currentInvite) return
    
    setIsProcessing(true)
    try {
      await onAccept(currentInvite)
      setProcessedInvites(prev => new Set([...prev, currentInvite.id]))
      
      if (isLastInvite) {
        onClose()
      } else {
        setCurrentInviteIndex(prev => prev + 1)
      }
    } catch (error) {
      console.error('Erro ao aceitar convite:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!currentInvite) return
    
    setIsProcessing(true)
    try {
      await onDecline(currentInvite)
      setProcessedInvites(prev => new Set([...prev, currentInvite.id]))
      
      if (isLastInvite) {
        onClose()
      } else {
        setCurrentInviteIndex(prev => prev + 1)
      }
    } catch (error) {
      console.error('Erro ao recusar convite:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  if (!currentInvite) {
    return null
  }

  const roleColor = currentInvite.role === 'GESTOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  const expiresDate = new Date(currentInvite.expiresAt)
  const isExpired = expiresDate < new Date()

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Convite para Projeto
          </DialogTitle>
          <DialogDescription>
            Você foi convidado para participar de um projeto no EasyStock
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{currentInvite.project.name}</CardTitle>
              <CardDescription>
                {currentInvite.project.description || 'Projeto no EasyStock'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Função:</span>
                <Badge className={roleColor}>
                  {currentInvite.role}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Convidado por:</span>
                <span className="text-sm font-medium">
                  {currentInvite.sentBy.name || currentInvite.sentBy.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expira em:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                    {expiresDate.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {invites.length > 1 && (
            <div className="text-center text-sm text-gray-500">
              Convite {currentInviteIndex + 1} de {invites.length}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Recusar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Aceitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
