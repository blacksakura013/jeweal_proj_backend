const bodyJsonSchema = {
  type: 'object',
  required: ['code','name','status'],

  properties: {

    code: { type: 'string' },
    name: { type: 'string' },
    enumKey: {
      type: 'string',
      enum: ['active', 'inactive']
    }
  }
}

const queryStringJsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    excitement: { type: 'integer' }
  }
}

// const headersJsonSchema = {
//   type: 'object',
//   properties: {
//     'x-foo': { type: 'string' }
//   },
//   required: ['x-foo']
// }

const schema = {
  body: bodyJsonSchema,
  querystring: queryStringJsonSchema,
  // params: paramsJsonSchema,
  // headers: headersJsonSchema
}