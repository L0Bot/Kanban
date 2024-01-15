require('dotenv').config();
const cors = require('cors');
const express = require('express');
const router = require('./app/router');
const multer = require('multer');
const bodyParser = multer();



const app = express();
const PORT = process.env.PORT || 3001;

/** CORS
 * 
 * - Si on ne branche pas le middleware cors, les requêtes cross-origin ne sont pas autorisées,
 * - Si on le branche sans option, les requêtes cross-origin depuis TOUTES les origines sont autorisées
 * ==> app.use(cors());
 * - Si on le branche avec une valeur pour origin dans les options, seule celle-ci sera autorisée
 * ==> app.use(cors({ origin: 'http://localhost:5000' }));
 * - Si on le branche avec plusieurs valeurs pour origin dans les options, seules celles-ci seront autorisées
 * app.use(cors({ origin: ['http://localhost:5000', 'http://toto.com'] }));
 * 
 * */
 app.use( bodyParser.none() );

// on met les assets (pour le front) en statique
app.use( express.static('assets') );

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(PORT, () => {
  console.log(`Okanban REST API listening on port ${PORT}`);
});
