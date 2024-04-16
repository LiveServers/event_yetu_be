/* eslint-disable @typescript-eslint/no-dynamic-delete */
const excludeFields = (entity: any, fields: any) => {
  for (let i = 0; i < fields.length; i++) {
    delete entity[fields[i]]
  }
  return entity
}

export default excludeFields
