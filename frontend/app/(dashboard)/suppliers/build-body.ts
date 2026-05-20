export function buildBody(formData: FormData) {
  return {
    company_name:  formData.get('company_name') || undefined,
    trade_name:    formData.get('trade_name') || null,
    cnpj:          formData.get('cnpj') || null,
    contact_name:  formData.get('contact_name') || null,
    email:         formData.get('email') || null,
    phone:         formData.get('phone') || null,
    website:       formData.get('website') || null,
    address:       formData.get('address') || null,
    city:          formData.get('city') || null,
    state:         formData.get('state') || null,
    zip_code:      formData.get('zip_code') || null,
    notes:         formData.get('notes') || null,
    is_active:     formData.get('is_active') === 'true',
  }
}
