# another-express-crud

Let you avoid all the boilerplates to create a crud route

## Installation

## Example usage

```javascript
import express from 'express';
import { crud } from 'another-express-crud';

const app = express();
const operations = {
  create: (params) => ...,
  read: (params) => ...,
  update: (params) => ...,
  delete: (params) => ...,
}

const crudRoutes = crud({
  path: '/user',
  operations,
  policy: {
    update: 'owner',
    delete: 'owner'
  },
  hooks: {
    before: {
      create: (params) => { success: true },
    },
    after: {
      update: (result, req) => { message: 'update done' },
    }
  }
});
app.use('/api', crudRoutes);
```

This resulting app is :

operation | route
--------- | -----
create | POST `/api/user`
read | GET `/api/user`
read by id | GET `/api/user/:id`
update | PUT `/api/user/:id`
update | PATCH `/api/user/:id`
delete | DELETE `/api/user/:id`

## Path

A string to provide a path prefix to the route. Default is '/'.

## Request data

The parameter `getRequestData` is a function to get data provided by the express request that will be passed to most hooks and policy checks.
It should be of the form :

```javascript
type CrudOptions = {
  id: string,
  data: any,
  user: any,
  files: any
}

const getRequestData: (req: Request) => CrudOptions
```

Notes:
No middleware is integrated to parse the body of the requests.
You  could use for example

* [body-parser](https://www.npmjs.com/package/body-parser) to get data from json objects and
* [express-form-data](https://www.npmjs.com/package/express-form-data) to get data from FormData objects

```javascript
import formData from 'express-form-data';
import bodyParser from 'body-parser';
import express from 'express'

const app = express();

// multi-part form data
app.use(formData.parse({ autoFiles: true }));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());

// json body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```

## Operations

You should provide an object with at least theese 4 functions:

* create
* read
* update
* delete

All 4 functions should implement the interface :
`(CrudOptions) => Promise<any>`

Note: If you want a good REST implementation you should differentiate the case when:

* read receives id parameters (/test/id) to return only 1 result (if the result is undefined, the route will pass an error to the next middleware with message 'NotFound')
* read receives query parameter (/test?name=john) to return an array of result

Note2:
The result of the operation should be returned in the promise (an object or a list of object).
If `undefined` is returned, an error with a message 'NotFound' will be passed to the next middleware.

## Hooks

### Before

All before hooks take an object CrudOptions in parameter and should return an object indicating if everything is fine and if it's not, the error associated to pass to the next middleware:
`{ success: boolean, error?: Error }`

### After

All after middlewares take the result of the operation and the request object. They should return a new result or `undefined` to pass to the afterAll middleware or the response formatter.
If the result is `undefined` the previous result will be used.

## Policies

The optional policy object should contain :

property | type | description
-------- | ---- | -----------
create | string | policy used for create operations
read | string | policy used for read operations
update | string | policy used for update operations
delete | string | policy used for delete operations
isOwner | `(CrudOptions) => boolean` | function to determine if a user is the owner of the ressource
isAdmin | `(CrudOptions) => boolean` | function to determine if a user has access to all contents

You can specify 4 types of policies :

* `guest`: no permission needed to use the operation
* `user`: only an authenticated user can access the operation
* `owner`: only the owner of the ressource can access it
* `admin`: the ressource is restricted to admin privilege

You can provide `isAuthenticated`, `isOwner` and `isAdmin` functions to customize when the access should be granted.

By default, all policies are `guest` if no policy is provided.

Note: if the user object is not undefined, the permission of the request will be at least user (see Request data to know how to get user from request)

## Todo

* [ ] More Policy tests
* [ ] Response formatter tests
* [ ] Clearer README with more examples
