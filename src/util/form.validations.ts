/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-len */
import { check } from 'express-validator'

export const signUpValidator = [
  check('firstName').notEmpty().withMessage('Firstname is required').isLength({ min: 2 }).withMessage('Firtname must not be less than 2 characters'),
  check('lastName').notEmpty().withMessage('Lastname is required').isLength({ min: 2 }).withMessage('Lastname must not be less than 2 characters'),
  check('password').isStrongPassword(),
  check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  check('role').notEmpty().withMessage('Role is required').isIn(['USER', 'ADMIN']),
  check('avatar').optional().isString().withMessage('Avatar must be a string')
]

export const signInValidator = [
  check('password').isStrongPassword(),
  check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email')
]

export const updateUserValidator = [
  check('firstName').optional().isString().withMessage('Firstname must be a string').isLength({ min: 2 }).withMessage('Firtname must not be less than 2 characters'),
  check('lastName').optional().isString().withMessage('Lastname must be a string').isLength({ min: 2 }).withMessage('Lastname must not be less than 2 characters'),
  check('email').optional().isEmail().withMessage('Invalid email'),
  check('role').optional().isString().withMessage('Role must be a string').isIn(['USER', 'ADMIN']),
  check('avatar').optional().isString().withMessage('Avatar must be a string')
]

export const createEventValidator = [
  check('title').notEmpty().withMessage('Title is required').isLength({ min: 2 }).withMessage('Title must not be less than 2 characters'),
  check('description').optional().isLength({ min: 2 }).withMessage('Description must not be less than 2 characters'),
  check('category').optional().isIn(['MUSIC', 'VISUAL_ARTS', 'PERFORMING_ARTS',
    'FILM', 'LECTURES_AND_BOOKS',
    'FASHION', 'FOOD_AND_DRINK', 'FESTIVALS_AND_FAIRS',
    'CHARITIES', 'SPORTS_AND_ACTIVE_LIFE',
    'NIGHTLIFE',
    'FAMILY_AND_KIDS', 'OTHER']),
  check('tags').optional().isArray().withMessage('Tags should be an array'),
  check('media').notEmpty().withMessage('Media is required').isArray().withMessage('Media should be an array'),
  check('maxGuests').optional().isNumeric().withMessage('MaxGuests should be a number'),
  check('location').notEmpty().withMessage('Location is required').isString().withMessage('Location must be a string'),
  check('city').notEmpty().withMessage('City is required').isString().withMessage('City should be a string'),
  check('country').notEmpty().withMessage('Country is required').isString().withMessage('Country must be a string'),
  check('countryCode').notEmpty().withMessage('CountryCode is required').isString().withMessage('CountryCode must be a string'),
  check('latitude').optional().isString().withMessage('Latitude should be a string'),
  check('longitude').optional().isString().withMessage('Longitude must be a string'),
  check('isFree').notEmpty().withMessage('isFree is required').isBoolean().withMessage('isFree must be a boolean'),
  check('draft').notEmpty().withMessage('Draft is required').isBoolean().withMessage('Draft should be a boolean'),
  check('tickets.*.ticketName').notEmpty().withMessage('Ticket name is required').isString().withMessage('Ticket name must be a string'),
  check('tickets.*.ticketDescription').optional().isString().withMessage('Ticket description must be a string'),
  check('tickets.*.ticketPrice').notEmpty().withMessage('Ticket price is required').isString().withMessage('Ticket price must be a string'),
  check('tickets.*.currency').notEmpty().withMessage('Currency is required').isString().withMessage('Currency must be a string'),
  check('tickets.*.maxTickets').notEmpty().withMessage('Max tickets is required').isNumeric().withMessage('Max tickets should be a number'),
  check('tickets.*.ticketType').notEmpty().withMessage('Ticket type is required').isIn(['VIP', 'VVIP', 'EARLY_BIRD', 'REGULAR', 'COUPLES', 'GROUPS']),
  check('tickets.*.endOfSaleDate').notEmpty().withMessage('End of sale date is required').isISO8601().toDate().withMessage('Invalid date received').custom((endOfSaleDate, { req }) => {
    const index = req.body.tickets.indexOf(req.body.tickets.find((date: { endOfSaleDate: any }) => date.endOfSaleDate === endOfSaleDate))
    if (new Date(endOfSaleDate) > new Date(req.body.tickets[index].eventStartDate) || new Date(endOfSaleDate) > new Date(req.body.tickets[index].eventEndDate)) {
      throw new Error('end of sale date must be less than start date and end date')
    }
    return true
  }),
  check('tickets.*.eventStartDate').notEmpty().withMessage('Start Date is required').isISO8601().toDate().withMessage('Invalid date received'),
  check('tickets.*.eventEndDate').notEmpty().withMessage('End Date is required').isISO8601().toDate().withMessage('Invalid date received').custom((endDate, { req }) => {
    const index = req.body.tickets.indexOf(req.body.tickets.find((date: { eventEndDate: any }) => date.eventEndDate === endDate))
    if (new Date(endDate) < new Date(req.body.tickets[index].eventStartDate)) {
      throw new Error('end date must be greater than start date')
    }
    return true
  })
]

export const fetchEventsValidator = [
  check('pageSize').notEmpty().withMessage('Page size should be provided').isNumeric().withMessage('Page size should be a number').custom((size, { req }) => {
    if (size < 1) {
      throw new Error('Page size should be greater than 0')
    }
    return true
  }),
  check('pageNumber').notEmpty().withMessage('Page number should be provided').isNumeric().withMessage('Page number should be a number').custom((page, { req }) => {
    if (page < 1) {
      throw new Error('Page number should be greater than 0')
    }
    return true
  })
]

export const editEventValidator = [
  check('title').notEmpty().withMessage('Title is required').isLength({ min: 2 }).withMessage('Title must not be less than 2 characters'),
  check('description').notEmpty().withMessage('Description is required').isLength({ min: 2 }).withMessage('Description must not be less than 2 characters'),
  check('category').optional().isIn(['MUSIC', 'VISUAL_ARTS', 'PERFORMING_ARTS',
    'FILM', 'LECTURES_AND_BOOKS',
    'FASHION', 'FOOD_AND_DRINK', 'FESTIVALS_AND_FAIRS',
    'CHARITIES', 'SPORTS_AND_ACTIVE_LIFE',
    'NIGHTLIFE',
    'FAMILY_AND_KIDS', 'OTHER']).withMessage('Invalid Category'),
  check('tags').optional().isArray().withMessage('Tags should be an array'),
  check('media').optional().isArray().withMessage('Media should be an array'),
  check('maxGuests').optional().isNumeric().withMessage('MaxGuests should be a number'),
  check('location').optional().isString().withMessage('Location must be a string'),
  check('city').optional().isString().withMessage('City should be a string'),
  check('country').optional().isString().withMessage('Country must be a string'),
  check('countryCode').optional().isString().withMessage('CountryCode must be a string'),
  check('latitude').optional().isString().withMessage('Latitude should be a string'),
  check('longitude').optional().isString().withMessage('Longitude must be a string'),
  check('eventId').notEmpty().withMessage('Event id should be provided').isNumeric().withMessage('Event id should be a number'),
  check('tickets.*.id').if((_, { req }) => Object.values(req.body.tickets).length > 0).notEmpty().withMessage('Ticket id is required').isNumeric().withMessage('Id must be a number'),
  check('tickets.*.ticketName').notEmpty().withMessage('Ticket name is required').isString().withMessage('Ticket name must be a string'),
  check('tickets.*.ticketDescription').optional().isString().withMessage('Ticket description must be a string'),
  check('tickets.*.ticketPrice').notEmpty().withMessage('Ticket price is required').isString().withMessage('Ticket price must be a string'),
  check('tickets.*.currency').notEmpty().withMessage('Currency is required').isString().withMessage('Currency must be a string'),
  check('tickets.*.maxTickets').notEmpty().withMessage('Max Tickets is required').isNumeric().withMessage('Max tickets should be a number'),
  check('tickets.*.ticketType').notEmpty().withMessage('Ticket type is required').isIn(['VIP', 'VVIP', 'EARLY_BIRD', 'REGULAR', 'COUPLES', 'GROUPS']).withMessage('Invalid Ticket Type'),
  check('tickets.*.endOfSaleDate').notEmpty().withMessage('endOfSaleDate is required').isISO8601().toDate().withMessage('Invalid date received').custom((endOfSaleDate, { req }) => {
    const index = req.body.tickets.indexOf(req.body.tickets.find((date: { endOfSaleDate: any }) => date.endOfSaleDate === endOfSaleDate))
    if (new Date(endOfSaleDate) > new Date(req.body.tickets[index].eventStartDate) || new Date(endOfSaleDate) > new Date(req.body.tickets[index].eventEndDate)) {
      throw new Error('end of sale date must be less than start date and end date')
    }
    return true
  }),
  check('tickets.*.eventStartDate').notEmpty().withMessage('eventStartDate is required').isISO8601().toDate().withMessage('Invalid date received'),
  check('tickets.*.eventEndDate').notEmpty().withMessage('eventEndDate is required').isISO8601().toDate().withMessage('Invalid date received').custom((endDate, { req }) => {
    const index = req.body.tickets.indexOf(req.body.tickets.find((date: { eventEndDate: any }) => date.eventEndDate === endDate))
    if (new Date(endDate) < new Date(req.body.tickets[index].eventStartDate)) {
      throw new Error('end date must be greater than start date')
    }
    return true
  })
]
