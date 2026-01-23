import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { petService, type PetListParams } from '../../services/petService'
import type { Pet, PageableResponse } from '../../types'
// import Loading from '../../components/Loading' // Não usado mais, usando inline styles
import { useAuth } from '../../hooks/useAuth'

export default function PetsList() {
  console.log('🚀 PetsList component montado!')
  console.log('📍 URL:', window.location.href)
  console.log('📍 Pathname:', window.location.pathname)
  
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  console.log('🔍 Hook useAuth retornou:', { isAuthenticated, authLoading })
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10
  
  console.log('🔍 Estado inicial do PetsList:', {
    isAuthenticated,
    authLoading,
    loading,
    petsCount: pets.length,
  })
  
  // Renderizar algo imediatamente para garantir que o componente está funcionando
  if (typeof window !== 'undefined') {
    console.log('✅ Window está disponível')
  }

  const loadPets = async (page: number = 0, nome?: string) => {
    try {
      setLoading(true)
      const params: PetListParams = {
        page,
        size: pageSize,
        ...(nome && nome.trim() && { nome: nome.trim() }),
      }
      
      console.log('🔍 Carregando pets com params:', params)
      const response: PageableResponse<Pet> = await petService.getPets(params)
      console.log('✅ Resposta completa da API:', response)
      console.log('✅ Pets carregados com sucesso:', {
        total: response.totalElements,
        content: response.content?.length || 0,
        pages: response.totalPages,
      })
      
      // Garantir que sempre temos um array
      const petsArray = response.content || []
      console.log('📋 Array de pets processado:', petsArray)
      
      setPets(petsArray)
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
      setCurrentPage(response.number || 0)
    } catch (error: any) {
      console.error('❌ Erro ao carregar pets:', error)
      console.error('📋 Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      })
      
      // Mesmo em erro, garantir que temos um array vazio
      setPets([])
      setTotalPages(0)
      setTotalElements(0)
      setCurrentPage(0)
    } finally {
      setLoading(false)
      console.log('🏁 Loading finalizado')
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect [isAuthenticated, authLoading] executado:', {
      isAuthenticated,
      authLoading,
      shouldLoad: isAuthenticated && !authLoading,
    })
    
    if (isAuthenticated && !authLoading) {
      console.log('✅ Condições atendidas, carregando pets...')
      loadPets(0, searchTerm)
    } else {
      console.log('⏸️ Aguardando autenticação...', {
        isAuthenticated,
        authLoading,
      })
    }
  }, [isAuthenticated, authLoading])

  // Debug: logar estados
  useEffect(() => {
    console.log('Estado atual:', {
      isAuthenticated,
      authLoading,
      loading,
      petsCount: pets.length,
      totalElements,
    })
  }, [isAuthenticated, authLoading, loading, pets.length, totalElements])

  const handleSearch = () => {
    setCurrentPage(0)
    loadPets(0, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    loadPets(newPage, searchTerm)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  console.log('🎨 Renderizando PetsList com estados:', {
    authLoading,
    isAuthenticated,
    loading,
    petsCount: pets.length,
  })

  // Renderizar algo básico imediatamente para garantir que está funcionando
  console.log('✅ Renderizando componente PetsList')

  if (authLoading) {
    console.log('⏳ Mostrando Loading (authLoading=true)')
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf9f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block',
            width: '64px',
            height: '64px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          <p style={{ color: '#374151', fontWeight: '500' }}>Carregando autenticação...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && !authLoading) {
    console.log('❌ Mostrando erro de autenticação')
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#faf9f6' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '32px', 
          borderRadius: '8px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          maxWidth: '448px' 
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <svg
              style={{ width: '32px', height: '32px', color: '#dc2626' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p style={{ color: '#dc2626', marginBottom: '8px', fontWeight: '600', fontSize: '18px' }}>
            Erro na autenticação
          </p>
          <p style={{ color: '#4b5563', marginBottom: '24px' }}>
            Não foi possível autenticar. Verifique o console para mais detalhes.
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Debug: isAuthenticated={String(isAuthenticated)}, authLoading={String(authLoading)}
          </p>
          <button
            onClick={() => {
              console.log('🔄 Limpando localStorage e recarregando...')
              localStorage.clear()
              window.location.reload()
            }}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#f97316', 
              color: 'white', 
              borderRadius: '8px', 
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ Renderizando conteúdo principal da lista de pets')

  // Fallback: sempre renderizar algo
  console.log('✅ Tentando renderizar conteúdo principal')
  
  try {
    console.log('✅ Renderizando conteúdo principal')
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative' 
      }}>

      {/* Header Moderno */}
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '20px 24px' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px', 
              textDecoration: 'none',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
              }}>
                <svg
                  style={{ width: '28px', height: '28px', color: 'white' }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'white',
                margin: 0,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                PetManager
              </h1>
            </Link>
            <button style={{ 
              padding: '10px 28px', 
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '40px 24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Debug Info Moderno - Remover em produção */}
        {import.meta.env.DEV && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)', 
            borderRadius: '16px', 
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isAuthenticated ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: isAuthenticated ? '0 0 8px rgba(16, 185, 129, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)'
                }}></div>
                <span style={{ color: '#4b5563', fontWeight: '600' }}>Auth:</span>
                <span style={{ 
                  color: isAuthenticated ? '#10b981' : '#ef4444',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {isAuthenticated ? '✓' : '✗'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: loading ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: loading ? '0 0 8px rgba(245, 158, 11, 0.5)' : '0 0 8px rgba(16, 185, 129, 0.5)',
                  animation: loading ? 'pulse 2s infinite' : 'none'
                }}></div>
                <span style={{ color: '#4b5563', fontWeight: '600' }}>Loading:</span>
                <span style={{ 
                  color: loading ? '#f59e0b' : '#10b981',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {loading ? '⏳' : '✓'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '8px'
              }}>
                <svg style={{ width: '16px', height: '16px', color: '#667eea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span style={{ color: '#667eea', fontWeight: '700', fontSize: '15px' }}>{pets.length}</span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>pets carregados</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'rgba(118, 75, 162, 0.1)',
                borderRadius: '8px'
              }}>
                <svg style={{ width: '16px', height: '16px', color: '#764ba2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span style={{ color: '#764ba2', fontWeight: '700', fontSize: '15px' }}>{totalElements}</span>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>total</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: authLoading ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: authLoading ? '0 0 8px rgba(245, 158, 11, 0.5)' : '0 0 8px rgba(16, 185, 129, 0.5)',
                  animation: authLoading ? 'pulse 2s infinite' : 'none'
                }}></div>
                <span style={{ color: '#4b5563', fontWeight: '600' }}>AuthLoad:</span>
                <span style={{ 
                  color: authLoading ? '#f59e0b' : '#10b981',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {authLoading ? '⏳' : '✓'}
                </span>
              </div>
            </div>
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        )}

        {/* Title Section Moderna */}
        <div style={{ 
          marginBottom: '40px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px',
              lineHeight: '1.2'
            }}>
              Nossos <span style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Pets</span>
            </h2>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '20px',
              fontWeight: '400',
              lineHeight: '1.6'
            }}>
              Gerencie todos os seus amiguinhos em um só lugar
            </p>
          </div>
          <button 
            onClick={() => console.log('Cadastrar pet')}
            style={{ 
              padding: '14px 32px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              borderRadius: '12px', 
              fontWeight: '600',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.39)',
              transition: 'all 0.3s',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(102, 126, 234, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(102, 126, 234, 0.39)'
            }}
          >
            + Cadastrar Pet
          </button>
        </div>

        {/* Search Section Moderna */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            position: 'relative',
            maxWidth: '600px'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: '20px', 
              display: 'flex', 
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              <svg
                style={{ width: '22px', height: '22px', color: '#9ca3af' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar pet por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ 
                display: 'block',
                width: '100%',
                paddingLeft: '56px',
                paddingRight: '20px',
                paddingTop: '18px',
                paddingBottom: '18px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                fontSize: '16px',
                transition: 'all 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </div>
        </div>

        {/* Results Count Moderno */}
        {!loading && (
          <div style={{ 
            marginBottom: '28px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            <p style={{ 
              color: '#4b5563',
              fontSize: '15px',
              margin: 0
            }}>
              <span style={{ 
                fontWeight: '700',
                color: '#667eea',
                fontSize: '18px'
              }}>{totalElements}</span> pets encontrados
            </p>
          </div>
        )}

        {/* Pets Grid */}
        {loading && pets.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '80px 0' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-block',
                width: '64px',
                height: '64px',
                border: '4px solid #fed7aa',
                borderTop: '4px solid #f97316',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <p style={{ color: '#4b5563', fontWeight: '500' }}>Carregando pets...</p>
            </div>
          </div>
        ) : pets.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            padding: '64px', 
            textAlign: 'center', 
            border: '1px solid #f3f4f6' 
          }}>
            <div style={{ 
              width: '96px', 
              height: '96px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px' 
            }}>
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p style={{ color: '#4b5563', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
              Nenhum pet encontrado
            </p>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {searchTerm 
                ? `Nenhum resultado para "${searchTerm}"`
                : 'Não há pets cadastrados no sistema'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  handleSearch()
                }}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '28px', 
              marginBottom: '40px' 
            }}>
              {pets.map((pet) => {
                console.log('🎨 Renderizando card do pet:', pet.id, pet.nome)
                return (
                <div
                  key={pet.id}
                  onClick={() => navigate(`/pets/${pet.id}`)}
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {/* Pet Image Moderna */}
                  <div style={{ 
                    position: 'relative', 
                    height: '220px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    overflow: 'hidden' 
                  }}>
                    {pet.foto?.url ? (
                      <img
                        src={pet.foto.url}
                        alt={pet.nome}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.4s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
                      }}>
                        <svg
                          style={{ width: '64px', height: '64px', color: 'rgba(255, 255, 255, 0.7)' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Species Tag Moderna */}
                    {pet.especie && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 2
                      }}>
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'white',
                            background: pet.especie.toLowerCase() === 'cachorro' || pet.especie.toLowerCase() === 'cão'
                              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          {pet.especie}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pet Info Moderna */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ 
                      fontSize: '22px', 
                      fontWeight: '700', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      {pet.nome}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#6b7280',
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                        borderRadius: '10px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px'
                        }}>
                          <svg
                            style={{ width: '18px', height: '18px', color: 'white' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '500' }}>
                          {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                        </span>
                      </div>
                      {pet.raca && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: '#6b7280',
                          padding: '8px 12px',
                          background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                          borderRadius: '10px'
                        }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                          }}>
                            <svg
                              style={{ width: '18px', height: '18px', color: 'white' }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                          <span style={{ fontSize: '15px', fontWeight: '500' }}>{pet.raca}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )
              })}
            </div>

            {/* Pagination Moderna */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '12px', 
                marginTop: '48px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                borderRadius: '16px'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  style={{ 
                    padding: '12px 20px', 
                    border: 'none', 
                    borderRadius: '12px', 
                    background: currentPage === 0 
                      ? 'rgba(0, 0, 0, 0.05)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: currentPage === 0 ? '#9ca3af' : 'white',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 0 ? 0.5 : 1,
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    boxShadow: currentPage === 0 ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 0) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 0) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)'
                    }
                  }}
                >
                  Anterior
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{ 
                          padding: '12px 18px', 
                          borderRadius: '12px',
                          background: page === currentPage 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'white',
                          color: page === currentPage ? 'white' : '#111827',
                          border: page === currentPage ? 'none' : '2px solid #e5e7eb',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s',
                          boxShadow: page === currentPage 
                            ? '0 4px 6px rgba(102, 126, 234, 0.3)'
                            : '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          if (page !== currentPage) {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.borderColor = '#667eea'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (page !== currentPage) {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        {page + 1}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  style={{ 
                    padding: '12px 20px', 
                    border: 'none', 
                    borderRadius: '12px', 
                    background: currentPage === totalPages - 1
                      ? 'rgba(0, 0, 0, 0.05)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: currentPage === totalPages - 1 ? '#9ca3af' : 'white',
                    cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    boxShadow: currentPage === totalPages - 1 ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages - 1) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages - 1) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)'
                    }
                  }}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    )
  } catch (error: any) {
    console.error('❌ Erro ao renderizar PetsList:', error)
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#faf9f6' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '32px', 
          borderRadius: '8px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          maxWidth: '448px' 
        }}>
          <p style={{ color: '#dc2626', marginBottom: '8px', fontWeight: '600', fontSize: '18px' }}>
            Erro ao renderizar
          </p>
          <p style={{ color: '#4b5563', marginBottom: '16px' }}>
            {error?.message || 'Erro desconhecido'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#f97316', 
              color: 'white', 
              borderRadius: '8px', 
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }
}
