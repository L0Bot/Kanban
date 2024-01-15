// On pense à executer la méthode config() du module dotenv pour avoir accès aux variables d'environnements
require('dotenv').config();

const { Card, List, Tag } = require('./models');

// Fonction pour tester nos modèles
async function run() {
  // =====
  // Lists
  // =====

  // Lecture
  const lists = await List.findAll();
  console.log(lists);

  // Insertion
  // const result = await List.create({ name: "troisième liste" });
  // console.log(result);

  // Mise à jour
  const list3 = await List.findByPk(3);
  if (list3) {
    list3.set({ name: "ma nouvelle liste" });
    await list3.save();
  }
  console.log(list3);


  // Suppression
  if (list3) {
    list3.destroy();
  }
}

run();
