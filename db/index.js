const fs = require("fs");

/**
 * @typedef {Object} User
 * @property {number} id - The user's ID.
 * @property {string} name - The user's name.
 */

const schema = {
  users: [
    {
      id: "number",
      name: "string",
    },
  ],
};

const namespaces = Object.keys(schema);

const readDb = () => {
  return JSON.parse(fs.readFileSync("./db/db.json"));
};

const updateDb = (data) => {
  fs.writeFileSync("./db/db.json", JSON.stringify(data, null, 2));
};

const get = (db, namespace) => {
  return db[namespace];
};

const getById = (db, namespace, id) => {
  return db[namespace].find((record) => record.id === id);
};

const post = (db, namespace, data) => {
  const nextId = db[namespace][db[namespace].length - 1].id + 1;

  db[namespace] = db[namespace].concat({
    ...data,
    id: nextId,
  });

  return nextId;
};

const put = (db, namespace, data) => {
  const index = db[namespace].findIndex((record) => record.id === data.id);

  db[namespace][index] = data;

  return data;
};

const remove = (db, namespace, id) => {
  let found = false;

  db[namespace] = db[namespace].filter((record) => {
    if (record.id !== id) return true;

    found = true;
    return false;
  });

  if (!found) {
    throw new Error(`Record with ID ${id} not found`);
  }

  return true;
};

/**
 * @template T
 * @typedef {Object} NamespaceMethods
 * @property {function(): Array<T>} get - Function to get all records.
 * @property {function(number): T} getById - Function to get a record by ID.
 * @property {function(T): number} post - Function to add a new record.
 * @property {function(T): T} put - Function to update a record.
 * @property {function(number): boolean} remove - Function to remove a record.
 */

/**
 * @typedef {Object} Database
 * @property {NamespaceMethods<User>} users - The users namespace.
 */

/**
 * @returns {Database} An object with methods for each namespace.
 */
const connect = (_db) => {
  console.log("[db] connection established");

  const db =
    _db ||
    new Proxy(readDb(), {
      set: (obj, prop, value) => {
        obj[prop] = value;

        updateDb(obj);

        return true;
      },
    });

  const methods = namespaces.reduce((acc, namespace) => {
    acc[namespace] = {
      get: () => get(db, namespace),
      getById: (id) => getById(db, namespace, id),
      post: (data) => post(db, namespace, data),
      put: (data) => put(db, namespace, data),
      remove: (id) => remove(db, namespace, id),
    };

    return acc;
  }, {});

  return methods;
};

module.exports = {
  connect,
};
