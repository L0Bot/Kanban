const router = require('express').Router();
const listController = require('./controllers/listController');
const cardController = require('./controllers/cardController');
const tagController = require('./controllers/tagController');

const path = require('path'); // permet de spécifier le dossier où se trouve assets

// Nos routes


// page d'accueil
router.get('/', (req, res) => {
    // on spécifie le chemin du fichier : 
    let filePath = path.join(__dirname, '../assets/index.html'); // on spécifie le chemin du fichier html, on a pas mis en place ejs qui permettait de spécifier simpelement le fichier
    // on envoie index.html
    res.sendFile(filePath);
})

// Lists
router.get('/lists', listController.getAll);
router.get('/lists/:id', listController.getOne);
router.post('/lists', listController.create);
router.patch('/lists/:id', listController.update);
router.delete('/lists/:id', listController.delete);

// Cards
router.get('/lists/:id/cards', cardController.getAllByListId);
router.get('/cards/:id', cardController.getOne);
router.post('/cards', cardController.create);
router.patch('/cards/:id', cardController.update);
router.delete('/cards/:id', cardController.remove);

// Tags
router.get('/tags', tagController.getAll);
router.get('/tags/:id', tagController.getOne);
router.post('/tags', tagController.create);
router.patch('/tags/:id', tagController.update);
router.delete('/tags/:id', tagController.remove);
router.post('/cards/:id/tag', tagController.associateCard);
router.delete('/cards/:card_id/tag/:tag_id', tagController.unassociateCard);

module.exports = router;
