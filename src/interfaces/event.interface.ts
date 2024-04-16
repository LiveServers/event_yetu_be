type EventCategory = 'MUSIC' |
'VISUAL_ARTS' |
'PERFORMING_ARTS' |
'FILM' | 'LECTURES_AND_BOOKS' |
'FASHION' | 'FOOD_AND_DRINK' | 'FESTIVALS_AND_FAIRS'
| 'CHARITIES' | 'SPORTS_AND_ACTIVE_LIFE'
| 'NIGHTLIFE'
| 'FAMILY_AND_KIDS' | 'OTHER'

type TicketType = 'VIP' | 'VVIP' | 'EARLY_BIRD' | 'REGULAR' | 'COUPLES' | 'GROUPS'

export interface Ticket {
  ticketName: string
  ticketDescription?: string
  ticketPrice: string
  currency: string
  maxTickets: number
  endOfSaleDate: Date
  ticketType: TicketType
  eventStartDate: Date
  eventEndDate: Date
  creationDate: Date
  updateTime: Date
}

export interface CreateEvent {
  title: string
  description?: string
  category?: EventCategory
  tags?: string[]
  media: string[]
  maxGuests?: number
  location: string
  city: string
  country: string
  countryCode: string
  latitude?: string
  longitude?: string
  isFree: boolean
  draft?: boolean
  creationDate: Date
  updateTime: Date
  creatorId: number
  tickets: Ticket[]
}

export interface EditTicket {
  id: number
  ticketName: string
  ticketDescription?: string
  ticketPrice: string
  currency: string
  maxTickets: number
  endOfSaleDate: Date
  ticketType: TicketType
  eventStartDate: Date
  eventEndDate: Date
  updateTime: Date
}

export interface EditEvent {
  title: string
  description: string
  category: EventCategory
  tags: string[]
  media: string[]
  maxGuests?: number
  location: string
  city: string
  country: string
  countryCode: string
  latitude?: string
  longitude?: string
  updateTime: Date
  tickets: EditTicket[]
}
