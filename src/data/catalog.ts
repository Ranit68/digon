export type DiagnosticTest = {
  name: string
  slug: string
  category: string
  code: string
  description: string
  price: number
}

export const tests: DiagnosticTest[] = [
  { name: 'Complete Blood Count', slug: 'complete-blood-count', category: 'Hematology', code: 'DEMO-001', description: 'A group of measurements related to blood cells. The purpose and relevance should be discussed with a qualified healthcare professional.', price: 450 },
  { name: 'Fasting Blood Glucose', slug: 'fasting-blood-glucose', category: 'Diabetes', code: 'DEMO-002', description: 'A blood glucose measurement. Confirm any preparation requirements with the laboratory and your healthcare professional.', price: 180 },
  { name: 'HbA1c', slug: 'hba1c', category: 'Diabetes', code: 'DEMO-003', description: 'A measurement related to average blood glucose over a period of time. Discuss its use and interpretation with a qualified healthcare professional.', price: 550 },
  { name: 'Lipid Profile', slug: 'lipid-profile', category: 'Biochemistry', code: 'DEMO-004', description: 'A group of measurements related to blood lipids. Ask the laboratory whether preparation is needed for the specific service.', price: 650 },
  { name: 'Thyroid Profile', slug: 'thyroid-profile', category: 'Thyroid', code: 'DEMO-005', description: 'A group of measurements related to thyroid function. A healthcare professional can advise whether this testing is appropriate.', price: 700 },
  { name: 'Liver Function Test', slug: 'liver-function-test', category: 'Liver Function', code: 'DEMO-006', description: 'A group of measurements that may be used as part of clinical assessment. Results need interpretation in context by a qualified professional.', price: 850 },
  { name: 'Kidney Function Test', slug: 'kidney-function-test', category: 'Kidney Function', code: 'DEMO-007', description: 'A group of measurements related to kidney function. Discuss test selection and results with a qualified healthcare professional.', price: 800 },
  { name: 'Vitamin B12', slug: 'vitamin-b12', category: 'Vitamins and Minerals', code: 'DEMO-008', description: 'A measurement of vitamin B12 in a sample. Suitability and interpretation should be discussed with a qualified healthcare professional.', price: 950 },
  { name: 'Vitamin D', slug: 'vitamin-d', category: 'Vitamins and Minerals', code: 'DEMO-009', description: 'A measurement related to vitamin D status. Discuss whether testing is appropriate with a qualified healthcare professional.', price: 1100 },
  { name: 'Urine Routine Examination', slug: 'urine-routine-examination', category: 'Urine Investigations', code: 'DEMO-010', description: 'A general examination of a urine sample. Confirm sample collection and handling instructions with the laboratory.', price: 250 },
  { name: 'Hormone Panel Inquiry', slug: 'hormone-panel-inquiry', category: 'Hormonal Tests', code: 'DEMO-011', description: 'A placeholder for a hormone test inquiry. Specific tests, sample requirements and availability must be confirmed.', price: 1200 },
  { name: 'Microbiology Test Inquiry', slug: 'microbiology-test-inquiry', category: 'Microbiology', code: 'DEMO-012', description: 'A placeholder for a microbiology test inquiry. Services and sample instructions vary and must be confirmed with the laboratory.', price: 700 },
]

export const packages = [
  { name: 'Basic Health Checkup', description: 'A sample bundle for an initial preventive health discussion.', price: 799, inclusions: ['Complete Blood Count', 'Fasting Blood Glucose', 'Lipid Profile'] },
  { name: 'Comprehensive Health Checkup', description: 'A broader sample bundle. Discuss individual suitability with a clinician.', price: 1999, inclusions: ['Complete Blood Count', 'Glucose testing', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Thyroid testing'] },
  { name: 'Senior Health Checkup', description: 'An illustrative package concept; inclusions require clinical and laboratory review.', price: 2499, inclusions: ['Complete Blood Count', 'Glucose testing', 'Kidney Function Test', 'Lipid Profile', 'Additional tests: confirm suitability'] },
  { name: 'Custom Test Package', description: 'Ask about a combination of tests; availability and clinical suitability need confirmation.', price: 'Request a quotation', inclusions: ['Choose tests to discuss', 'No combination is confirmed until reviewed'] },
]

export type Centre = {
  name: string
  address: string
  hours: string
  phone: string
  verified: boolean
  services: string[]
  homeCollection: string
}

export const centres: Centre[] = []

export const contact = {
  phone: '',
  email: '',
  whatsappNumber: '',
  address: '',
  openingHours: '',
}

export const images = {
  hero: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1500&q=90',
  collection: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=85',
  about: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=85',
}

export const faqs = [
  { question: 'How can I book a diagnostic test?', answer: 'Use the inquiry form to prepare a request. In this demo, no request is sent or saved. A real centre must confirm availability and the appointment.' },
  { question: 'Can I request home sample collection?', answer: 'You can select home collection in the inquiry form. Serviceability by postal code, the collection slot and test suitability all need confirmation.' },
  { question: 'Do all tests require fasting?', answer: 'No single preparation instruction applies to every test. Confirm the requirements for your specific test with the laboratory and your healthcare professional.' },
  { question: 'How can I confirm test preparation?', answer: 'Contact the laboratory using its verified official channel before your visit. Preparation information on this demo site is not configured.' },
  { question: 'How long will my report take?', answer: 'Reporting times have not been verified or configured. Please confirm the expected timeframe with the centre when arranging your test.' },
  { question: 'How can I access my reports?', answer: 'Secure report access is unavailable in this demo. Contact the centre directly through a verified official channel; reports should not be shared through public links.' },
  { question: 'What payment methods are accepted?', answer: 'Payment methods are not configured. Confirm accepted methods and any charges with the centre before your visit.' },
  { question: 'Can I visit the centre without an appointment?', answer: 'Walk-in availability and opening hours have not been confirmed. Contact the centre before travelling.' },
  { question: 'How do I find the nearest collection centre?', answer: 'Verified centre locations have not been added yet. Please confirm the address directly with the diagnostic centre.' },
  { question: 'Can someone explain my report?', answer: 'A qualified healthcare professional can discuss results in the context of your health. A laboratory report alone is not a clinical evaluation.' },
  { question: 'What should I do if my report is delayed?', answer: 'Contact the centre using its verified official support channel and provide only the minimum information needed to locate your request.' },
]
