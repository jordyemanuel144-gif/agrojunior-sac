import { Layout } from '@/components/layout/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Bienvenido al sistema de Sam José Avícola</p>
      </div>
    </Layout>
  )
}
