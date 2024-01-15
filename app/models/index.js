const List = require('./list');
const Card = require('./card');
const Tag = require('./tag');


// Association carte - liste
// Une liste peut avoir plusieurs card
List.hasMany(Card, {
  as: 'cardList', // je donne un petit nom à ma relation (un alias).
  foreignKey: 'list_id', // le nom de la clé étrangère qui fait le lien entre les 2
});

// Une card apprtient à une liste
Card.belongsTo(List, {
  as: 'list', // quand je récupère une liste qui contient mes cards, j'aimerai que ça s'apelle "list"
  foreignKey: 'list_id',
});



// Association carte - label
// ici on a une relation particulière : N/N
// une carte a plusieurs tags
Card.belongsToMany(Tag, {
  through: 'card_has_tag', // cette relation existe "à travers" la table de liaision card_has_tag
  foreignKey: 'card_id', // le nom de la clé de Card dans la table de liaison
  otherKey: 'tag_id', // le nom de "l'autre" (donc Tag)
  as: 'tags', // alias de l'association
  timestamps: true, // On gère les timestamps sur les relationss
  updatedAt: false, // Mais pas le champ updated_at
});

// un tag a plusieurs cards
Tag.belongsToMany(Card, {
  through: 'card_has_tag',
  foreignKey: 'tag_id',
  otherKey: 'card_id',
  as: 'cards',
  timestamps: true,
  updatedAt: false,
});



// On export le tout
module.exports = {
  List,
  Card,
  Tag,
};
