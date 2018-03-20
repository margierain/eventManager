# EventManager

Is an API backend  API that supports an event management system with the following functionalities:

1. Users can create, retrieve, modify and delete events - by providing key details about the events they want help planning for.

2. Admin is able to confirm service they are able to offer to aid in the event planing level

For more info go through the below end points.


The API resources are accessible at [localhost:8080/api/v1.0/](http://127.0.0.1:8080/api/v1.0/). They include:

| Resource URL | Methods | Description |
| -------- | ------------- | --------- |
| `/api/v.1/` | GET  | The index |
| `/api/v.1/users/` | POST  | User registration |
| `/api/v.1/users/login` | POST | Obtain login token |
| `/api/v.1/events/` | POST | Create a event  |
| `/api/v.1/events/` | GET | Retrieve all events |
| `/api/v.1/events/?&limit=1` | GET | Retrieves one event per page|
| `/api/v.1/events/<events_id>/` | GET |  A single event |
| `/api/v.1/events/<events_id>/` | PUT | Update a single event  |
| `/api/v.1/events/<events_id>/` | DELETE | Delete a single bucket list |



| Method | Description |
|------- | ----------- |
| GET | Retrieves a resource(s) |
| POST | Creates a new resource |
| PUT | Updates an existing resource |
| DELETE | Deletes an existing resource |


###### The key **libraries** used include;
[NodeJS](https://nodejs.org/en/download/),
[MongoDB](https://docs.mongodb.org/manual/installation/),

## Installation
**__Clone this repo__**
```shell
$ git clone git@github.com:margierain/eventManager.git
```

**__Install the project's dependencies__**
```shell
$ npm install
```

**__Run Project__**
```shell
$ npm start
```

**__Testing__**
You can run tests by ensuring you have the project set up then running:
```shell
$ npm test
```

