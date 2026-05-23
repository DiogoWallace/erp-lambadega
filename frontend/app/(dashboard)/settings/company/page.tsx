import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { CompanyForm } from './company-form'

interface Company {
  id: string
  name: string
  trade_name: string | null
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
  address_number: string | null
  address_complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
}

export default async function CompanySettingsPage() {
  const meRes = await apiFetch('/auth/me')
  const { data: user } = await meRes.json()
  const permissions: string[] = user?.permissions ?? []

  if (!permissions.includes('settings.view')) {
    redirect('/dashboard')
  }

  const canEdit = permissions.includes('settings.edit')

  const res = await apiFetch('/establishment')
  const { data: company }: { data: Company } = await res.json()

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Empresa</h1>
          <p className="page-subtitle">Dados cadastrais do estabelecimento.</p>
        </div>
      </div>

      <CompanyForm company={company} canEdit={canEdit} />
    </div>
  )
}
