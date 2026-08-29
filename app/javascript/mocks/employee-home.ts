import type { Dish, MenuDay } from '@/domain/menu'

/** Identidad y consumo mensual ficticios usados en la portada del empleado. */
export const employeePrototype = {
  name: 'Sofía',
  dateLabel: 'Lunes, 26 de mayo',
  benefit: {
    usedThisMonth: 8,
    monthlyLimit: 20,
    usedThisWeek: 2,
  },
}

/** Semana estática que permite probar la selección sin consultar una API. */
export const menuDays: MenuDay[] = [
  { id: 'lun-10', shortName: 'Lun', date: 10 },
  { id: 'mar-11', shortName: 'Mar', date: 11 },
  { id: 'mie-12', shortName: 'Mié', date: 12 },
  { id: 'jue-13', shortName: 'Jue', date: 13 },
  { id: 'vie-14', shortName: 'Vie', date: 14 },
]

/**
 * Catálogo ficticio del prototipo.
 * Los platos se relacionan con `menuDays` mediante `dayId`; el viernes se deja
 * intencionalmente sin registros para demostrar el estado vacío de la interfaz.
 */
export const dishes: Dish[] = [
  {
    id: 1,
    dayId: 'lun-10',
    providerId: 'endulzate',
    providerName: 'Endulzate by Noe',
    name: 'Wok de verduras + arroz',
    description: 'Salteado al wok con arroz blanco, morrón, cebolla, zanahoria y zucchini.',
    details: 'Preparado al momento con vegetales frescos y arroz blanco. Podés elegir el nivel de picante.',
    customizations: ['Sin picante', 'Picante suave', 'Picante medio'],
    price: 150,
  },
  {
    id: 2,
    dayId: 'lun-10',
    providerId: 'endulzate',
    providerName: 'Endulzate by Noe',
    name: 'Sorrentinos',
    description: 'Sorrentinos de jamón y queso o caprese, con salsa a elección.',
    details: 'Pasta rellena artesanal acompañada con pan casero. Elegí tu relleno preferido.',
    customizations: ['Jamón y queso', 'Caprese'],
    price: 150,
  },
  {
    id: 3,
    dayId: 'lun-10',
    providerId: 'tu-viandita',
    providerName: 'Tu Viandita',
    name: 'Milanesa de pollo',
    description: 'Milanesa de pechuga de pollo con puré de papas y ensalada fresca.',
    details: 'Pechuga de pollo empanada con guarnición a elección.',
    customizations: ['Puré de papas', 'Ensalada fresca'],
    price: 170,
  },
  {
    id: 4,
    dayId: 'mar-11',
    providerId: 'tu-viandita',
    providerName: 'Tu Viandita',
    name: 'Tarta de calabaza',
    description: 'Tarta casera de calabaza, queso y cebolla caramelizada con ensalada.',
    price: 160,
  },
  {
    id: 5,
    dayId: 'mar-11',
    providerId: 'endulzate',
    providerName: 'Endulzate by Noe',
    name: 'Pollo al curry',
    description: 'Pollo al curry suave con arroz y vegetales salteados.',
    price: 180,
  },
  {
    id: 6,
    dayId: 'mie-12',
    providerId: 'endulzate',
    providerName: 'Endulzate by Noe',
    name: 'Lasagna de verduras',
    description: 'Capas de vegetales, salsa de tomate y queso gratinado.',
    price: 170,
  },
  {
    id: 7,
    dayId: 'jue-13',
    providerId: 'tu-viandita',
    providerName: 'Tu Viandita',
    name: 'Carne al horno',
    description: 'Carne al horno con papas rústicas y vegetales de estación.',
    price: 190,
  },
]
