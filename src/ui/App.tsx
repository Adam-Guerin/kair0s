import { ErrorBoundary } from './components/feedback/ErrorBoundary'
import { Container } from './components/layout/Container'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { KPIDashboard } from './components/business/KPIDashboard'
import { SessionStatus } from './components/business/SessionStatus'
import './index.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <Container className="flex-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">Kair0s</h1>
                <SessionStatus />
              </div>
              
              <div className="grid gap-6">
                <KPIDashboard />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export { App }
