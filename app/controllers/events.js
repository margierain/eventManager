/* eslint-disable no-param-reassign, no-shadow */
const utils = require('../utils');
const models = require('../models');
const sendEmail = require('../services').sendEmail;
const path = require('path');
const fs = require("fs");

const User = models.User;
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

      return Object.assign(event, req.body).save((err) => {
        if (err) {
          return resolveError(err, res);
        }

        eventUpdateEmail(event);

        return res.status(200).send(event);
      });
    });
}

function eventUpdateEmail(event) {

  function findFile(file) {
    const filePath = path.resolve(__dirname, file);
    let text = fs.readFileSync(filePath).toString('utf-8');
    text.split(" ");

    let replaceText = text;

    event.ownServiceProvider.map(service => {
      replaceText = replaceText
        .replace('{location}', `${service.location}`)
        .replace('{contactNo}', `${service.contactNo}`)
        .replace('{serviceRate}', `${service.serviceRate}`)
    });

    event.needServiceProvide.map(offer => {
      replaceText = replaceText
        .replace('{description}', `${offer.description}`);
    });


    replaceText = replaceText
      .replace('{name}', `${event.eventMaker.name}`)
      .replace('{email}', `${event.eventMaker.email}`)
      .replace('{phoneNo}', `${event.phoneNo}`)
      .replace('{eventType}', `${event.eventType}`)
      .replace('{guestNo}', `${event.guestNo}`)
      .replace('{eventDate}', `${event.eventDate}`)
      .replace('{budgetEstimate}', `${event.budgetEstimate}`);

    return replaceText
  };

  const textFormat = findFile('../template/event/eventUpdate.txt');
  const htmlFormat = findFile('../template/event/eventUpdate.html');

  let adminEmails = [];

  User
    .find({}, '-__v')
    .exec((err, users) => {
      if (err) {
        return resolveError(err, res);
      }
      users.map(user => {
        if (user.role && user.role.title === 'admin') {
          adminEmails.push(user.email);
        }
      });
      if (adminEmails.length > 0) {
        adminEmails.map(email => {
          sendEmail(email, 'Event updates', textFormat, htmlFormat);
        })
      }
    })

};

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