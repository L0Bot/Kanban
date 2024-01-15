const { Card, List } = require ('../models');

const COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const DEFAULT_COLOR = "#000000";

const cardController = {

  async getAllByListId(req, res){
    
    try{
      
      const listId = Number(req.params.id);

      const foundList = await List.findByPk(listId);

      if (!foundList){
        return res.status(404).json({ error: "List not found. Please verify the provided id." });
      }

      // on s'appuie sur la couche modèle pour récupérer l'ensemble des listes    
      const lists = await Card.findAll({
        where: {
          list_id: listId,
        },
        include: 'tags',
        order: [        
          ['position', 'ASC'],          
          ['tags', 'name', 'ASC'],
        ],
      });    

      // on retourne les cartes au format json
      return res.json(lists);      

    }catch(error){ // en cas de problème
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }    
  },

  async getOne(req, res){

    try{

        const cardId = Number(req.params.id);

        const foundCard = await Card.findByPk(cardId, { 
            // on souhaite inclure ce qui est au bout de l'association dont l'alias est tags
            include: 'tags',
            // on veut classer nos résultats par nom de tag croissant
            order: [
              ['tags', 'name', 'ASC'],
            ],
        });

        if (!foundCard){
          return res.status(404).json({ error: "Card not found. Please verify the provided id." });
        }

        return res.json(foundCard);
      }catch (error){
        console.log(error);
        console.trace();
        return res.status(500).json({ error: "Unexpected server error. Please try again later." });
      }

  },

  async create(req, res){

    try{
      // on peut accéder à req.body car on a brancher le middleware express.urlencoded sur notre app dans le point d'entrée
    
      // avant d'insérer, on vérifie que les données reçues sont conforme
      if (!req.body.title){
        return res.status(400).json({ error: "Missing body parameter: title" });
      }

      if ((req.body.position !== undefined && isNaN(req.body.position)) || req.body.position === ""){
        return res.status(400).json({ error: "Invalid type: position should be a number" });
      }

      if (req.body.color !== undefined && !req.body.color.match(COLOR_REGEX)){
        return res.status(400).json({ error: "Invalid color: should be a valid hexa color" });
      }

      const listId = Number(req.body.list_id);

      if (isNaN(listId)){
        return res.status(400).json({ error: "Should provide a valid list_id" });
      }

      const foundList = await List.findByPk(listId);

      if (!foundList){
        return res.status(400).json({ error: "Invalid list_id: should be an existant list_id" });
      }      

      // on récupère les informations concernant la cars à créer dans le body
      const cardData = {
        title: req.body.title,
        list_id: listId,        
      };

      // on indique la position seulement si elle est définie
      if (req.body.position){
        cardData.position = Number(req.body.position);
      }

      // on indique la couleur si elle est définie, noir sinon
      if (req.body.color){
        cardData.color = req.body.color;
      }else{
        cardData.color = DEFAULT_COLOR;
      }

      // on crée la carte en s'appuyant sur la couche modèle
      const card = await Card.create(cardData);     
      

      // on retourne les information de la carte créée (notamment pour retourner l'id de la carte créée)
      res.status(201).json(card);
    }catch (error){
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }   

  },

  async update (req, res){
    try{
      // récupérer l'id de la carte à modifier
      const cardId = Number(req.params.id);

      // vérifier que cette carte existe
      const foundCard = await Card.findByPk(cardId);

      // gestion des erreurs
      if (!foundCard){
        return res.status(404).json({ error: "Card not found. Please verify the provided id." });
      }

      if (typeof(req.body.list_id) != "undefined"){
        const listId = Number(req.body.list_id);

        if (isNaN(listId)){
          return res.status(400).json({ error: "Should provide a valid list_id" });
        }
  
        const foundList = await List.findByPk(listId);
  
        if (!foundList){
          return res.status(400).json({ error: "Invalid list_id: should be an existant list_id" });
        }      
      }

      if (typeof(req.body.title) !== "undefined" && typeof(req.body.title) !== "string"){
        return res.status(400).json({ error: "Invalid body parameter 'title'. Should provide a string." });
      }

      if ((req.body.position !== undefined && isNaN(req.body.position)) || req.body.position === ""){
        return res.status(400).json({ error: "Invalid body parameter 'position'. Should provide a number." });
      }

      if (req.body.color !== undefined && !req.body.color.match(COLOR_REGEX)){
        return res.status(400).json({ error: "Invalid body parameter 'position'. Should provide a valid hexa color." });
      }

      // la deusième partie du test && req.body.position !== 0
      // permet la mise à jour de la liste si on a seulement la valeur 0 pour position
      // nécessaire car 0 est falsy
      if ((!req.body.list_id && !req.body.title && !req.body.position && !req.body.color) && req.body.position !== 0){
        return res.status(400).json({ "error": "Invalid body. Should provide at least a 'title', 'color' or 'position' property" });
      }

      // préparation des données à mettre à jour avec les données reçues
      const cardNewData = {        
      };

      if (req.body.list_id){
        cardNewData.list_id = Number(req.body.list_id);
      } 

      if (req.body.title){
        cardNewData.title = req.body.title;
      } 

      if (req.body.position || Number(req.body.position) === 0){
        cardNewData.position = Number(req.body.position);
      }

      if (req.body.color){
        cardNewData.color = req.body.color;
      }

      // mise à jour effective des données en s'appuyant sur la couche modèle
      await foundCard.update(cardNewData);

      // renvoyer les informations de la carte modifiée        
      return res.json(foundCard);
    }catch (error){
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }

  },

  async remove(req, res){
    try{
      const cardId = Number(req.params.id);      

      const nbSuppressedCard = await Card.destroy({
        where: {
          id: cardId,
        },
      });

      if (nbSuppressedCard === 0){
        return res.status('404').json({ error: "Card not found. Please verify the provided id." });
      }

      return res.sendStatus(204);

    }catch (error){
      console.log(error);
      console.trace();
      // on renvoie un code erreur 500 et un message expliquant le problème
      return res.status(500).json({ error: "Unexpected server error. Please try again later." });
    }
  },
};

module.exports = cardController;