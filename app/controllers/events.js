/* eslint-disable no-param-reassign, no-shadow */
const utils = require('../utils');
const models = require('../models');

const Event = models.Event;

const runQuery = utils.runQuery;
const resolveError = utils.resolveError;

/**
 * Create a event.
 */
function create(req, res) {
  const data = req.body;

  return Event
    .create({
      phoneNo: data.phoneNo,
      eventType: data.eventType,
      guestNo: data.guestNo,
      eventMaker: req.decoded._id,
      eventDate: data.eventDate,
      updatedAt: data.updatedAt,
      budgetEstimate: data.budgetEstimate,
      ownServiceProvider: data.ownServiceProvider,
      needServiceProvide: data.needServiceProvide
    }, (err, event) => {
      if (err) {
        return resolveError(err, res);
      }
      return Event
        .findOne({ _id: event._id })
        .exec((e, eventObj) => {
          if (e) {
            return resolveError(e, res);
          }
          return res.status(201).send(eventObj);
        });
    });
};

/**
 * List all events according to the given criteria.
 */
function list(req, res) {
  const queryParams = req.query;
  const query = Event.find({})
    .limit(Number(queryParams.limit) || null)
    .sort('-updatedAt'); // Sort the events in descending order.

  return runQuery(req, query)
    .then((events) => {
      return res.status(200).send(events)
    })
    .catch((err) => resolveError(err, res, 400));
}

/**
 * Fetch a single event.
 */
function retrieve(req, res) {
  Event.findOne({ _id: req.params.events_id }).exec((err, event) => {
    if (err) {
      return resolveError(err, res);
    }
    if (!event) {
      return res.status(404).send({
        message: 'Event not found.'
      });
    }
    return res.status(200).send(event);
  });
}

/**
 * Update a events.
 */
function update(req, res) {
  Event.findOne({ _id: req.params.events_id })
    .exec((err, event) => {
      if (err) {
        return resolveError(err, res);
      }
      if (!event) {
        return res.status(404).send({
          message: 'Event not found.'
        });
      }

      if (req.body.phoneNo) event.phoneNo = req.body.phoneNo;
      if (req.body.eventType) event.eventType = req.body.eventType;
      if (req.body.guestNo) event.guestNo = req.body.guestNo;
      if (req.body.eventMaker) event.eventMaker = req.body.eventMaker;
      if (req.body.eventDate) event.eventDate = req.body.eventDate;
      if (req.body.budgetEstimate) event.budgetEstimate = req.body.budgetEstimate;
      if (req.body.ownServiceProvider) event.ownServiceProvider = req.body.ownServiceProvider;
      if (req.body.needServiceProvide) event.needServiceProvide = req.body.needServiceProvide;
      if (req.body.eventType) event.eventType = req.body.eventType;

      return event.save((err) => {
        if (err) {
          return resolveError(err, res);
        }
        return res.status(200).send(event);
      });
    });
}

/**
 * Delete a single event.
 */
function deleteEvent(req, res) {
  Event
    .findOne({ _id: req.params.events_id })
    .remove()
    .exec((err, eventsRemoved) => {
      if (err) {
        return resolveError(err, res);
      }
      if (!eventsRemoved) {
        return res.status(404).send({
          message: 'Event not found.'
        });
      }
      return res.status(204).send({
        message: 'Event successfully deleted'
      });
    });
}


module.exports = { create, list, retrieve, update, deleteEvent }