const { Card, Tag } = require ('../models');

const tagController = {
  async getAll(req, res){
    
    try{
      
      // on s'appuie sur la couche modèle pour récupérer l'ensemble des tags    
      const tags = await Tag.findAll({        
        order: [        
          ['name', 'ASC'],
        ],
      });    
      // on retourne les tags au format json
      return res.json(tags);      
    }catch(error){ // en cas de problème
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }    
  },

  async getOne(req, res){

    try{
      // on récupère peuis le paramètre de route l'identifiant du tag à récupérer
      const tagId = Number(req.params.id);

      // on demande à la couche modèle le tag en question
      const foundTag = await Tag.findByPk(tagId);

      if (!foundTag){
        return res.status(404).json({ error: "Tag not found. Please verify the provided id." });
      }

      // on renvoie le tag trouvée
      return res.json(foundTag);

    }catch(error){ // en cas de problème
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }

  },

  async remove(req, res){
    try{
      const tagId = Number(req.params.id);

      const nbSuppressedTag = await Tag.destroy({
        where: {
          id: tagId,
        },
      });

      if (nbSuppressedTag === 0){
        return res.status('404').json({ error: "Tag not found. Please verify the provided id." });
      }

      return res.sendStatus(204);

    }catch (error){
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },

  async create(req, res){

    try{
      // on peut accéder à req.body car on a brancher le middleware express.urlencoded sur notre app dans le point d'entrée
    
      // avant d'insérer, on vérifie que les données reçues sont conforme
      if (!req.body.name){
        return res.status(400).json({ error: "Missing body parameter: name" });
      }

      // on récupère les informations concernant le à créer dans le body
      const tagData = {
        name: req.body.name,
      };

      // on crée le tag en s'appuyant sur la couche modèle
      const tag = await Tag.create(tagData);

      // on retourne les information du tag créé (notamment pour retourner l'id du tag créé)
      res.json(tag);
    }catch (error){
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }   

  },

  async update (req, res){
    try{
      // récupérer l'id du tag à modifier
      const tagId = Number(req.params.id);

      // vérifier que ce tag existe
      const foundTag = await Tag.findByPk(tagId);

      // gestion des erreurs
      if (!foundTag){
        return res.status(404).json({ error: "Tag not found. Please verify the provided id." });
      }

      if (typeof(req.body.name) !== "undefined" && typeof(req.body.name) !== "string"){
        return res.status(400).json({ error: "Invalid body parameter 'name'. Should provide a string." });
      }

      if (!req.body.name){
        return res.status(400).json({ "error": "Invalid body. Should provide a 'name' property" });
      }

      // préparation des données à mettre à jour avec les données reçues
      const tagNewData = {        
        name: req.body.name,
      };

      // mise à jour effective des données en s'appuyant sur la couche modèle
      await foundTag.update(tagNewData);

      // renvoyer les informations du tag modifié        
      return res.json(foundTag);
    }catch (error){
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }

  },

  async associateCard(req, res){
    
    const cardId =  Number(req.params.id);

    const foundCard = await Card.findByPk(cardId);

    if (!foundCard){
      return res.status(404).json({ error: "can't find this card"});
    }


    const tagId =  Number(req.body.tag_id);

    const foundTag = await Tag.findByPk(tagId);

    if (!foundTag){
      return res.status(404).json({ error: "can't find this tag"});
    }

    // cf https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
    await foundCard.addTag(foundTag);

    return res.json(foundCard);

  },

  async unassociateCard(req, res){
    
    const cardId =  Number(req.params.card_id);

    const foundCard = await Card.findByPk(cardId);

    if (!foundCard){
      return res.status(404).json({ error: "can't find this card"});
    }


    const tagId =  Number(req.params.tag_id);

    const foundTag = await Tag.findByPk(tagId);

    if (!foundTag){
      return res.status(404).json({ error: "can't find this tag"});
    }

    // cf https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
    await foundCard.removeTag(foundTag);

    return res.status(204).json(foundCard);

  },
};

module.exports = tagController;