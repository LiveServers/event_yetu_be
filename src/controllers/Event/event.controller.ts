/**
 * contains functions that:
 * - create events - DONE - in another MVP, we will add the agenda and faq sections when creating an event. Also for the tickets,
 * I forgort to add ticket per order(minimun and maximum, like how many tickets can one person buy per ticket category?),
 * also a ticket category can be free, we will add that
 * - update events - DONE
 * - delete events - we will only delete an event that has had no bookings
 * - search events - DONE
 * - fetch events - DONE
 * - purchase tickets
 * - s3 uploads - DONE
 */
import { type Request, type Response, type NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { validationResult } from 'express-validator'
import { type CreateEvent, type EditEvent } from '../../interfaces/event.interface'
import excludeFields from '../../util/excludeFields'
import AlgoliaSearch from '../../util/algoliaSearch'

const algolia = new AlgoliaSearch()

const prisma = new PrismaClient()

interface Result {
  next: any
  previous: any
  data: any[]
}

/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.body - The request body
 * @returns {Promise<void> | void}
 */
const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TO-DO:- before creating an event, you need to upload the images to s3 first and also ensure that the user has paid if it is not a free event, send out emails of event details as well
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const eventBody: CreateEvent = req.body
      // for event
      eventBody.creationDate = new Date()
      eventBody.updateTime = new Date()
      eventBody.creatorId = req.id
      // for tickets
      for (const ticket of eventBody.tickets) {
        ticket.creationDate = new Date()
        ticket.updateTime = new Date()
      }
      const tickets = [...eventBody.tickets]
      const newEventbody = Object.fromEntries(Object.entries(eventBody).filter(item => item[0] !== 'tickets')) as CreateEvent
      const result = await prisma.event.create({
        data: {
          ...newEventbody,
          tickets: {
            createMany: { data: [...tickets] }
          }
        },
        include: {
          tickets: {
            select: {
              id: true,
              ticketName: true,
              ticketDescription: true,
              ticketPrice: true,
              currency: true,
              maxTickets: true,
              ticketsBought: true,
              endOfSaleDate: true,
              ticketType: true,
              eventStartDate: true,
              eventEndDate: true,
              updateTime: true
            }
          }
        }
      })
      algolia.uploadRecord(result)
      res.status(200).json({
        status: 200,
        message: 'Event successfully created',
        body: { ...result }
      })
    } else {
      res.status(422).json({ errors: errors.array() })
    }
  } catch (e) {
    next(e)
  }
}
/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.query.pageSize - The pageSize
 * @param {Object} req.query.pageNumber - The pageNumber
 * @returns {Promise<void> | void}
 */
const fetchEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req)
    const result: Result = {
      next: {},
      previous: {},
      data: []
    }
    if (errors.isEmpty()) {
      // TO-DO:- add memcached/ redis -> as the db grows, we don't want to keep calling the db for this count
      const eventRecordCount = await prisma.event.count()
      const pageNumber: number = Number(req.query.pageNumber)
      const pageSize: number = Number(req.query.pageSize)
      const skip: number = (pageNumber - 1) * pageSize
      const endIndex = pageSize * pageNumber
      if (endIndex < eventRecordCount) {
        result.next = {
          pageNumber: Number(pageNumber + 1),
          limit: Number(pageSize)
        }
      }
      if (skip > 0) {
        result.previous = {
          pageNumber: Number(pageNumber - 1),
          limit: Number(pageSize)
        }
      }
      const response = await prisma.event.findMany({
        skip,
        take: pageSize,
        orderBy: {
          id: 'asc'
        },
        include: {
          tickets: {
            select: {
              id: true,
              ticketName: true,
              ticketDescription: true,
              ticketPrice: true,
              currency: true,
              maxTickets: true,
              ticketsBought: true,
              endOfSaleDate: true,
              ticketType: true,
              eventStartDate: true,
              eventEndDate: true,
              updateTime: true
            }
          }
        }
      })
      for (const event of response) {
        result.data.push(excludeFields(event, ['creatorId', 'creationDate', 'bookingId']))
      }
      res.status(200).json({
        status: 200,
        message: 'Events successfully fetched',
        body: { ...result }
      })
    } else {
      res.status(422).json({ errors: errors.array() })
    }
  } catch (e) {
    next(e)
  }
}

/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.body - The request body
 * @param {Object} req.query.id - The id
 * @returns {Promise<void> | void}
 */

const editEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TO-DO:- make sure before updating the tickets that you have validated that the tickets has not been purchased by
    // anyone. Use ticketsBought
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const eventBody: EditEvent = req.body
      eventBody.updateTime = new Date()
      for (const ticket of eventBody.tickets) {
        ticket.updateTime = new Date()
      }
      const tickets = [...eventBody.tickets]
      const newEventbody = Object.fromEntries(Object.entries(eventBody).filter(item => item[0] !== 'tickets')) as EditEvent
      const result = await prisma.event.update({
        where: { id: Number(req.query.eventId) },
        data: { ...newEventbody,
          tickets: { updateMany: tickets.map(ticket => ({
            where: { id: ticket.id },
            data: { ...excludeFields(ticket, ['id']) }
          })) } },
        include: {
          tickets: {
            select: {
              id: true,
              ticketName: true,
              ticketDescription: true,
              ticketPrice: true,
              currency: true,
              maxTickets: true,
              ticketsBought: true,
              endOfSaleDate: true,
              ticketType: true,
              eventStartDate: true,
              eventEndDate: true,
              updateTime: true
            }
          }
        }
      })
      algolia.uploadRecord(result)
      res.status(200).json({
        status: 200,
        message: 'Event updated successfully'
      })
    } else {
      res.status(422).json({ errors: errors.array() })
    }
  } catch (e) {
    next(e)
  }
}

/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.query.search - The search parameter
 * @returns {Promise<void> | void}
 */
const searchEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const { search } = req.query // Extract search query from request query parameters
      const response = await algolia.index.search(search)
      const hitsWithoutHighlight = response?.hits.map((hit: any) => {
        const { _highlightResult, objectID, ...rest } = hit
        return rest
      })
      response.hits = hitsWithoutHighlight
      res.status(200).json({
        status: 200,
        message: 'Events successfully fetched',
        body: { ...response }
      })
    } else {
      res.status(422).json({ errors: errors.array() })
    }
  } catch (e) {
    next(e)
  }
}

export default {
  createEvent,
  fetchEvents,
  editEvent,
  searchEvents
}
