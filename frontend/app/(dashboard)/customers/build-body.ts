export function buildBody(formData: FormData) {
  return {
    type: formData.get('type') || undefined,
    name: formData.get('name') || undefined,
    trade_name: formData.get('trade_name') || null,
    document: formData.get('document') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    address: formData.get('address') || null,
    address_number: formData.get('address_number') || null,
    address_complement: formData.get('address_complement') || null,
    neighborhood: formData.get('neighborhood') || null,
    city: formData.get('city') || null,
    state: formData.get('state') || null,
    zip_code: formData.get('zip_code') || null,
    notes: formData.get('notes') || null,
    is_active: formData.get('is_active') === 'true',
  }
}
