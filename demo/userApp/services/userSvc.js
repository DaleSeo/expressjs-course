const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const MONGODB_URI = 'mongodb://user:pass@ds139791.mlab.com:39791/ltcs-todo'
//const MONGODB_URI = 'mongodb://localhost:27017/blog'
const bcrypt = require('bcryptjs')

let userCollection

function list(query, cb) {
  getUserCollection(coll => {
    coll.find(query).toArray((err, users) => {
      cb(err, users)
    })
  })
}

function create(user, cb) {
  if (!user.role) {
    user.role = 'Guest'
  }
  user.created = new Date()
  delete user.confirmPassword
  getUserCollection(coll => {
    coll.insertOne(user, (err, res) => {
      if (err) {
        return cb(err)
      }
      cb(null, res.ops[0]._id)
    })
  })
}

function detail(id, cb) {
  getUserCollection(coll => {
    coll.findOne({_id: ObjectID(id)}, (err, user) => {
      cb(err, user)
    })
  })
}

function findOneByEmail(email, cb) {
  getUserCollection(coll => {
    coll.findOne({email: email}, (err, user) => {
      cb(err, user)
    })
  })
}

function remove(id, cb) {
  getUserCollection(coll => {
    coll.removeOne({_id: ObjectID(id)}, (err, res) => {
      if (res.result.n === 1) {
        cb(err, true)
      } else {
        cb(err, false)
      }
    })
  })
}

function modify(id, user, cb) {
  getUserCollection(coll => {
    coll.updateOne({_id: ObjectID(id)}, {$set: user},(err, res) => {
      if (res.result.n === 1) {
        cb(err, true)
      } else {
        cb(err, false)
      }
    })
  })
}

function getUserCollection(cb) {
  MongoClient.connect(MONGODB_URI, (err, db) => {
    let userCollection = db.collection('users')
    cb(userCollection)
  })
}

const SALT_ROUNDS = 10

function genHash(password, cb) {
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    if (err) return console.error('Failed to get a salt', err)
    console.log('#salt:', salt)
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return console.error('Failed to make a hash', err)
      console.log('#hash:', hash)
      cb(err, hash)
    })
  })
}

module.exports = {
  list, create, detail, remove, modify, findOneByEmail, genHash
}
