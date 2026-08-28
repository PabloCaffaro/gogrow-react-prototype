export type ProviderId = 'endulzate' | 'tu-viandita'

export type MenuDay = {
  id: string
  shortName: string
  date: number
}

export type Dish = {
  id: number
  dayId: MenuDay['id']
  providerId: ProviderId
  providerName: string
  name: string
  description: string
  details?: string
  customizations?: string[]
  price: number
}
