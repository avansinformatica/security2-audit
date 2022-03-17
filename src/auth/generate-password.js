/*
This file contains a stand-alone script to generate a salted hash
of a password with bcrypt.

We need this script as long as there is no database to store users
with working register endpoint.
*/

const bcrypt = require('bcryptjs');

const passwd = '';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(passwd, salt);

console.log(hash);