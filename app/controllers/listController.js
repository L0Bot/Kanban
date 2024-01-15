const sanitizeHtml = require ('sanitize-html');

const { List } = require('../models');

const listControler = {
  getAll: async (req, res) => {
    try {
      console.log('GET /lists');

      // Il faut qu'on recup nos listes => On passe par la couche modèle
      // On en porfites pour les ordonner par leur position
      const lists = await List.findAll({
        include: {
          association: 'cardList',
          include: 'tags'
        },
      });


      // Une fois qu'on a nos listes, on les retroune au format JSON
      return res.json(lists);
    } catch (error) { // en cas de problème
      console.trace(error)
      // On retourne un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },

  getOne: async (req, res) => {
    try {
      // On recup l'id passé en param
      const listId = Number(req.params.id);

      // On demande à la couche modèle la liste
      const foundList = await List.findByPk(listId);

      if (!foundList) {
        return res.status(404).json({ error: "List not found. Please verify the provided id." });
      }

      // On retroune la liste trouvée
      return res.json(foundList);
    } catch (error) {
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },

  create: async (req, res) => {
    try {
      // On peut recup les données d'une requête POST avec req.body
      // Et ça nous ait possible car on a branché le middleware express.urlencoded sur notre app dans le point d'entrée

      // Avant d'insérer, on vérifie que les données reçus sont conforme
      if (!req.body.name) {
        return res.status(400).json({ error: "Missing body parameter: name" });
      }

      if (req.body.position !== undefined && isNaN(req.body.position)) {
        return res.status(400).json({ error: "Invalid type: position should be a number" });
      }

      // On recup les infos concernant la liste à créer dans le body de la requête
      const listData = {
        // Le module sanitizeHtml permet de nettoyer les balises HTML
        // => On se prémunit des failles XSS
        // Si on veut garder seulement les tags img
        // name: sanitizeHtml(req.body.name, { allowedTags: ['img'] })
        name: sanitizeHtml(req.body.name),
        // position: isNaN(Number(req.body.position)) ? 0 : Number(req.body.position),
      };

      // on indique la position seulement si elle est définie
      if (req.body.position){
        listData.position = Number(req.body.position);
      }

      // On crée la liste en s'appuyant sur la couche modèle
      const newList = await List.create(listData);

      // On retourne la liste fraichement crée (notamment pour retourner son id)
      // On en profite pour retourner le bon code HTTP (201 created)
      return res.status(201).json(newList);
    } catch (error) {
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },

  delete: async (req, res) => {
    try {
      const listId = Number(req.params.id);

      // on récupère la liste à supprimer
      /*
      const foundList = await List.findByPk(listId);
      if (!foundList){
        return res.status('404').json({ error: "List not found. Please verify the provided id." });
      }
      await foundList.destroy();
      */

      const suppressedList = await List.destroy({
        where: {
          id: listId,
        }
      });

      if (suppressedList === 0) {
        return res.status(404).json({ error: "List not found. Please verify the provided id" });
      }

      return res.sendStatus(204);

    } catch (error) {
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },

  update: async (req, res) => {
    try {
      // récupérer l'id de la liste à modifier
      const listId = Number(req.params.id);

      // vérifier que cette liste existe
      const foundList = await List.findByPk(listId);

      // gestion des erreurs
      if (!foundList){
        res.status(404).json({ error: "List not found. Please verify the provided id." });
      }

      if (typeof(req.body.name) !== "undefined" && typeof(req.body.name) !== "string"){
        return res.status(400).json({ error: "Invalid body parameter 'name'. Should provide a string." });
      }

      if (req.body.position !== undefined && isNaN(req.body.position)){
        return res.status(400).json({ error: "Invalid body parameter 'position'. Should provide a number." });
      }

      if ((!req.body.name && !req.body.position) && req.body.position !== 0){
        return res.status(400).json({ error: "Invalid body. Should provide at least a 'name' or 'position' property" });
      }

      // Prémaration des données à mettre à jour avaec les données reçus
      const listNewData = {};

      if (req.body.name) {
        listNewData.name = req.body.name;
      }

      if (req.body.position) {
        listNewData.position = Number(req.body.position);
      }

      // MaJ effective des données en s'appuyant sur la couche modèle
      await foundList.update(listNewData);

      // On retourne la liste mise à jour
      return res.json(foundList);

    } catch (error) {
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },
};

module.exports = listControler;
