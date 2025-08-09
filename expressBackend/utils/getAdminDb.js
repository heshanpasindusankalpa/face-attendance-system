const mongoose = require('mongoose');
const connections = {};

function getAdminDb(adminId) {
  const dbName = `admin_${adminId}`;

  if (connections[dbName]) return connections[dbName];

  const uri = `mongodb+srv://pasindusankalpa2021:QF5WTOkietfbnoLV@cluster0.u3yt5.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  const conn = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  connections[dbName] = conn;
  return conn;
}

module.exports = getAdminDb;
