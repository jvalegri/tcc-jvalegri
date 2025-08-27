import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { message: 'ID do projeto é obrigatório.' },
        { status: 400 }
      )
    }

    // Buscar materiais do projeto específico
    const projectMaterials = await prisma.projectMaterial.findMany({
      where: {
        projectId: projectId
      },
      include: {
        material: true
      }
    })

    // Transformar dados para o formato esperado pelo frontend
    const materials = projectMaterials.map(pm => ({
      id: pm.material.id,
      name: pm.material.name,
      category: pm.material.type || 'Geral',
      supplier: pm.material.supplier || 'Fornecedor',
      quantity: pm.material.currentQuantity,
      unit: pm.material.unit,
      price: pm.material.price || 0,
      status: pm.material.currentQuantity <= 0 
        ? "Sem Estoque" 
        : pm.material.currentQuantity <= (pm.material.minStock || 5)
        ? "Estoque Baixo" 
        : "Em Estoque",
      minStock: pm.material.minStock || 5,
      notes: pm.material.description || undefined
    }))

    return NextResponse.json(materials)

  } catch (error) {
    console.error('Erro ao buscar materiais:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, type, currentQuantity, unit, isConsumable, projectId, price, supplier, minStock } = await request.json()

    // Validação dos campos obrigatórios
    if (!name || currentQuantity === undefined || !unit || !projectId) {
      return NextResponse.json(
        { message: 'Nome, quantidade, unidade e ID do projeto são obrigatórios.' },
        { status: 400 }
      )
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Projeto não encontrado.' },
        { status: 404 }
      )
    }

    // Criar novo material
    const newMaterial = await prisma.material.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type?.trim() || null,
        currentQuantity: parseFloat(currentQuantity),
        unit: unit.trim(),
        price: parseFloat(price || 0),
        supplier: supplier?.trim() || null,
        minStock: parseFloat(minStock || 5),
        isConsumable: isConsumable || false
      }
    })

    // Associar material ao projeto
    await prisma.projectMaterial.create({
      data: {
        projectId: projectId,
        materialId: newMaterial.id
      }
    })

    // Retornar material criado no formato esperado pelo frontend
    const materialResponse = {
      id: newMaterial.id,
      name: newMaterial.name,
      category: newMaterial.type || 'Geral',
      supplier: newMaterial.supplier || 'Fornecedor',
      quantity: newMaterial.currentQuantity,
      unit: newMaterial.unit,
      price: newMaterial.price || 0,
      status: newMaterial.currentQuantity <= 0 
        ? "Sem Estoque" 
        : newMaterial.currentQuantity <= (newMaterial.minStock || 5)
        ? "Estoque Baixo" 
        : "Em Estoque",
      minStock: newMaterial.minStock || 5,
      notes: newMaterial.description || undefined
    }

    return NextResponse.json(materialResponse, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar material:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('PUT /api/materials - Body recebido:', body)
    
    const { id, name, description, type, currentQuantity, unit, price, supplier, minStock } = body

    // Validação dos campos obrigatórios
    if (!id || !name || currentQuantity === undefined || !unit) {
      console.log('PUT /api/materials - Validação falhou:', { id, name, currentQuantity, unit })
      return NextResponse.json(
        { message: 'ID, nome, quantidade e unidade são obrigatórios.' },
        { status: 400 }
      )
    }

    // Verificar se o material existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id: id }
    })

    if (!existingMaterial) {
      console.log('PUT /api/materials - Material não encontrado:', id)
      return NextResponse.json(
        { message: 'Material não encontrado.' },
        { status: 404 }
      )
    }

    console.log('PUT /api/materials - Material encontrado:', existingMaterial)
    console.log('PUT /api/materials - Dados para atualização:', {
      name: name.trim(),
      description: description?.trim() || null,
      type: type?.trim() || null,
      currentQuantity: parseFloat(currentQuantity),
      unit: unit.trim(),
      price: parseFloat(price || 0),
      supplier: supplier?.trim() || null,
      minStock: parseFloat(minStock || 5)
    })

    // Atualizar material
    const updatedMaterial = await prisma.material.update({
      where: { id: id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type?.trim() || null,
        currentQuantity: parseFloat(currentQuantity),
        unit: unit.trim(),
        price: parseFloat(price || 0),
        supplier: supplier?.trim() || null,
        minStock: parseFloat(minStock || 5)
      }
    })

    console.log('PUT /api/materials - Material atualizado com sucesso:', updatedMaterial)

    // Retornar material atualizado no formato esperado pelo frontend
    const materialResponse = {
      id: updatedMaterial.id,
      name: updatedMaterial.name,
      category: updatedMaterial.type || 'Geral',
      supplier: updatedMaterial.supplier || 'Fornecedor',
      quantity: updatedMaterial.currentQuantity,
      unit: updatedMaterial.unit,
      price: updatedMaterial.price || 0,
      status: updatedMaterial.currentQuantity <= 0 
        ? "Sem Estoque" 
        : updatedMaterial.currentQuantity <= (updatedMaterial.minStock || 5)
        ? "Estoque Baixo" 
        : "Em Estoque",
      minStock: updatedMaterial.minStock || 5,
      notes: updatedMaterial.description || undefined
    }

    return NextResponse.json(materialResponse)

  } catch (error) {
    console.error('PUT /api/materials - Erro ao atualizar material:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
