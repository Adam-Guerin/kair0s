import { Outlet } from 'react-router-dom'
import { Container, Header, Sidebar } from '../../components'
import { LegalNavigation } from './LegalNavigation'

export function LegalLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <Container className="flex-1">
          <div className="max-w-6xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <LegalNavigation />
              </div>
              <div className="lg:col-span-3">
                <Outlet />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
