
const eventsController = require('../controllers').eventsController;
const customMiddleware = require('../middleware');

module.exports = (router) => {
  /**
 * Create a new event.
 */
  router.post('/events', (req, res, next) => customMiddleware
    .validatePost(req, res, next, {
      requiredFields: ['phoneNo', 'eventType', 'guestNo', 'eventDate', 'ownServiceProvider',
        'needServiceProvide', 'budgetEstimate']
    }
    ), eventsController.create);

  /**
  * List all events accessible by this user.
  */
  router.get('/events', eventsController.list);

  /**
   * Fetch a single event.
   */
  router.get('/events/:events_id', eventsController.retrieve);

  /**
   * Update a event.
   */
  router.put('/events/:events_id', eventsController.update);

  /**
   * Delete a single event.
   */
  router.delete('/events/:events_id', eventsController.deleteEvent);


};
