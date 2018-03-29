
const eventsController = require('../controllers').eventsController;
const customMiddleware = require('../middleware');

module.exports = (app) => {
  /**
 * Create a new event.
 */
  app.post('/api/v.1/events', (req, res, next) => customMiddleware
    .validatePost(req, res, next, {
      requiredFields: ['phoneNo', 'eventType', 'guestNo', 'eventDate', 'ownServiceProvider',
        'needServiceProvide', 'budgetEstimate']
    }
    ), eventsController.create);

  /**
  * List all events accessible by this user.
  */
  app.get('/api/v.1/events', eventsController.list);

  /**
   * Fetch a single event.
   */
  app.get('/api/v.1/events/:events_id', eventsController.retrieve);

  /**
   * Update a event.
   */
  app.put('/api/v.1/events/:events_id', eventsController.update);

  /**
   * Delete a single event.
   */
  app.delete('/api/v.1/events/:events_id', eventsController.deleteEvent);


};
