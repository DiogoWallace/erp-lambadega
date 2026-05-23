import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

const ALLOWED = new Set(['sales', 'top-products', 'cash-flow', 'accounts'])

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  if (!type || !ALLOWED.has(type)) {
    return new Response('Invalid report type', { status: 400 })
  }

  const token = (await cookies()).get('token')?.value
  if (!token) return new Response('Unauthorized', { status: 401 })

  const params = new URLSearchParams(url.searchParams)
  params.delete('type')
  params.set('format', 'csv')

  const upstream = await fetch(`${API_BASE}/api/reports/${type}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv',
    },
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return new Response('Failed to fetch report', { status: upstream.status })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'text/csv; charset=UTF-8',
      'Content-Disposition':
        upstream.headers.get('Content-Disposition') ?? `attachment; filename="${type}.csv"`,
    },
  })
}
