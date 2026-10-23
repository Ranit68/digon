export type AppointmentRequest = {
  name: string
  phone: string
  email: string
  requested: string
  collectionType: 'Centre visit' | 'Home sample collection'
  date?: string
  time?: string
  centre?: string
  address?: string
  postalCode?: string
  notes?: string
  consent: boolean
}

const appointmentApiUrl = import.meta.env.VITE_APPOINTMENT_API_URL?.trim()

export function isAppointmentApiConfigured() {
  return Boolean(appointmentApiUrl)
}

export async function submitAppointment(request: AppointmentRequest): Promise<void> {
  if (!appointmentApiUrl) {
    throw new Error('Appointment API is not configured.')
  }

  const endpoint = new URL(appointmentApiUrl, window.location.origin)
  const localDevelopment = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  if (endpoint.protocol !== 'https:' && !(localDevelopment && endpoint.protocol === 'http:')) {
    throw new Error('Configure the appointment service with an HTTPS URL.')
  }

  const response = await fetch(endpoint.href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`The appointment service returned ${response.status}. Please try again or contact the centre.`)
  }

  const result: unknown = await response.json()
  if (
    typeof result !== 'object' ||
    result === null ||
    !('confirmed' in result) ||
    result.confirmed !== true
  ) {
    throw new Error('The service did not confirm this request. No appointment is confirmed.')
  }
}
