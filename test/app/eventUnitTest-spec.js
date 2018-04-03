const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const testUtils = require('../helpers/utils');

const mongoose = require('mongoose');
require('sinon-mongoose');

//Importing our event model for our unit testing.
const Event = require('../../app/models/events');

describe.only("Get all events", function () {
  // Test will pass if we get all events
  it("should return all events", function (done) {
    const EventMock = sinon.mock(Event);
    const expectedResult = { status: true, event: [] };
    EventMock.expects('find').yields(null, expectedResult);
    Event.find(function (err, result) {
      EventMock.verify();
      EventMock.restore();
      expect(result.status).to.be.true;
      done();
    });
  });

  // Test will pass if we fail to get a event
  it("should return error", function (done) {
    const EventMock = sinon.mock(Event);
    const expectedResult = { status: false, error: "Something went wrong" };
    EventMock.expects('find').yields(expectedResult, null);
    Event.find(function (err, result) {
      EventMock.verify();
      EventMock.restore();
      done();
    });
  });

  // Test will pass if the event is saved
  describe("Post a new event", function () {
    it("should create new post", function (done) {
      const EventMock = sinon.mock(new Event(testUtils.testEventDetails));
      const event = EventMock.object;
      const expectedResult = { status: true };
      EventMock.expects('save').yields(null, expectedResult);
      event.save(function (err, result) {
        EventMock.verify();
        EventMock.restore();
        expect(result.status).to.be.true;
        done();
      });
    });
    // Test will pass if the event is not saved
    it("should return error, if post not saved", function (done) {
      const EventMock = sinon.mock(new Event(testUtils.testEventDetails));
      const event = EventMock.object;
      const expectedResult = { status: false };
      EventMock.expects('save').yields(expectedResult, null);
      event.save(function (err, result) {
        EventMock.verify();
        EventMock.restore();
        expect(err.status).to.not.be.true;
        done();
      });
    });
  });

  // Test will pass if the event is updated based on an ID
  describe("Update event details", function () {
    it("should updated an event ", function (done) {
      const EventMock = sinon.mock(new Event({ guestNo: "250" }));
      const event = EventMock.object;
      const expectedResult = { status: true };
      EventMock.expects('save').yields(null, expectedResult);
      event.save(function (err, result) {
        EventMock.verify();
        EventMock.restore();
        expect(result.status).to.be.true;
        done();
      });
    });
    // Test will pass if the event is not updated based on an ID
    it("should return error if update action is failed", function (done) {
      const EventMock = sinon.mock(new Event({ eventType: "wedding" }));
      const event = EventMock.object
      const expectedResult = { status: false };
      EventMock.expects('save').yields(expectedResult, null);
      event.save(function (err, result) {
        EventMock.verify();
        EventMock.restore();
        expect(err.status).to.not.be.true;
        done();
      });
    });
  });

  describe("Delete a event by id", function () {
    it("should delete a todo by id", function (done) {
      const EventMock = sinon.mock(Event);
      const expectedResult = { status: true };
      EventMock.expects('remove').withArgs({ _id: 15 }).yields(null, expectedResult);
      Event.remove({ _id: 15 }, function (err, result) {
        EventMock.verify();
        EventMock.restore();
        expect(result.status).to.be.true;
        done();
      });
    });
    // Test will pass if the Event is not deleted based on an ID
    it("should return error if delete action is failed", function (done) {
      const EventMock = sinon.mock(Event);
      const expectedResult = { status: false };
      EventMock.expects('remove').withArgs({ _id: 21 }).yields(expectedResult, null);
      Event.remove({ _id: 21 }, function (err, result) {
        EventMock.verify();
        EventMock.restore();
        expect(err.status).to.not.be.true;
        done();
      });
    });
  });

});