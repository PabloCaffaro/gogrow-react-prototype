import type { AdminEmployee, AdminPayment } from '@/domain/admin'

/** Información ficticia centralizada para recorrer el panel sin persistencia. */
export const adminProfile = {
  name: 'Martina',
  fullName: 'Martina Rodríguez',
  initials: 'MR',
  company: 'GoGrow Uruguay',
}

export const adminEmployees: AdminEmployee[] = [
  {
    id: 1,
    name: 'Sofía Méndez',
    initials: 'SM',
    email: 'sofia.mendez@gogrow.com',
    team: 'Producto',
    monthlyAllowance: 20,
    companyContribution: 50,
    ordersThisMonth: 17,
    temporaryBenefit: {
      monthlyAllowance: 20,
      companyContribution: 75,
      startsOn: '2026-05-20',
      endsOn: '2026-06-20',
      reason: 'Apoyo temporal acordado con RR. HH.',
    },
    orders: [
      { id: 'PED-1062', date: '26 may', provider: 'Endulzate by Noe', dish: 'Wok de verduras + arroz', amount: 300, companyShare: 225, employeeShare: 75 },
      { id: 'PED-1054', date: '23 may', provider: 'Tu Viandita', dish: 'Milanesa de pollo', amount: 360, companyShare: 270, employeeShare: 90 },
      { id: 'PED-1047', date: '21 may', provider: 'Endulzate by Noe', dish: 'Sorrentinos artesanales', amount: 320, companyShare: 240, employeeShare: 80 },
    ],
    balances: [
      { provider: 'Endulzate by Noe', generated: 465, paid: 300, debt: 165 },
      { provider: 'Tu Viandita', generated: 290, paid: 290, debt: 0 },
    ],
  },
  {
    id: 2,
    name: 'Lucas Pereira',
    initials: 'LP',
    email: 'lucas.pereira@gogrow.com',
    team: 'Tecnología',
    monthlyAllowance: 20,
    companyContribution: 60,
    ordersThisMonth: 12,
    orders: [
      { id: 'PED-1059', date: '26 may', provider: 'Tu Viandita', dish: 'Pollo al curry', amount: 360, companyShare: 216, employeeShare: 144 },
      { id: 'PED-1039', date: '19 may', provider: 'Endulzate by Noe', dish: 'Lasagna de verduras', amount: 340, companyShare: 204, employeeShare: 136 },
    ],
    balances: [
      { provider: 'Tu Viandita', generated: 520, paid: 376, debt: 144 },
      { provider: 'Endulzate by Noe', generated: 420, paid: 284, debt: 136 },
    ],
  },
  {
    id: 3,
    name: 'Camila Díaz',
    initials: 'CD',
    email: 'camila.diaz@gogrow.com',
    team: 'Operaciones',
    monthlyAllowance: 20,
    companyContribution: 50,
    ordersThisMonth: 8,
    orders: [
      { id: 'PED-1053', date: '24 may', provider: 'Endulzate by Noe', dish: 'Wok de verduras + arroz', amount: 300, companyShare: 150, employeeShare: 150 },
    ],
    balances: [
      { provider: 'Endulzate by Noe', generated: 600, paid: 600, debt: 0 },
    ],
  },
  {
    id: 4,
    name: 'Federico Costa',
    initials: 'FC',
    email: 'federico.costa@gogrow.com',
    team: 'Comercial',
    monthlyAllowance: 20,
    companyContribution: 50,
    ordersThisMonth: 0,
    orders: [],
    balances: [
      { provider: 'Tu Viandita', generated: 180, paid: 0, debt: 180 },
    ],
  },
]

export const adminPayments: AdminPayment[] = [
  { id: 'LIQ-0526-01', provider: 'Endulzate by Noe', period: 'Mayo 2026', orders: 136, grossAmount: 85680, employeeShare: 42840, amount: 42840, status: 'pending' },
  { id: 'LIQ-0526-02', provider: 'Tu Viandita', period: 'Mayo 2026', orders: 172, grossAmount: 112640, employeeShare: 56320, amount: 56320, status: 'validated' },
  { id: 'LIQ-0526-03', provider: 'Sabores del Sur', period: 'Mayo 2026', orders: 48, grossAmount: 30400, employeeShare: 15000, amount: 15100, adjustment: -100, status: 'observed' },
  { id: 'LIQ-0426-01', provider: 'Endulzate by Noe', period: 'Abril 2026', orders: 126, grossAmount: 79500, employeeShare: 39750, amount: 39750, status: 'paid' },
]

export const adminActivity = [
  { title: 'Beneficio temporal creado', detail: 'Sofía Méndez · 75% hasta el 20 de junio', time: 'Hace 20 min' },
  { title: 'Liquidación recibida', detail: 'Tu Viandita · Mayo 2026', time: 'Hace 2 h' },
  { title: 'Aporte permanente actualizado', detail: 'Lucas Pereira · 60%', time: 'Ayer' },
]
