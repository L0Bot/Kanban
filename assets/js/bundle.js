(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const utilsModule = require('./js/utils')
const tagModule = require('./js/tag')
const cardModule = require('./js/card')
const listModule = require('./js/list')

// on objet qui contient des fonctions
const app = {


  /* - INIT -------------------------------- */
  // fonction d'initialisation, lancée au chargement de la page
  // fonction ayant pour but de lancer tous les écouteurs et tout ce qui aurait besoin d'être lancé pour que la page puisse fonctionner correctement
  init: function () {
    console.log('app.init !');

    // on récupère les données de l'API 
    app.getListFromAPI();

    // on appelle la méthode qui lance les écouteurs
    app.addListenerToActions();
  },


  /* GETTERS ------------------------------------------*/

  async getListFromAPI() {
    // on lance un essai de communication avec la BDD
    try {

      // on fait un fetch, on contacte l'API de la S06 pour récupérer les données(les listes) stockées dans la BDD 
      const response = await fetch(`${utilsModule.base_url}/lists`);
      // on convertit les données en objet
      const lists = await response.json();
      console.log(lists);
      // on trie les listes : 
      const orderedLists = lists.sort((listA, listB) => {return (listA.position - listB.position)})
      // on a récupéré un tableau d'objets : 
      // on affiche les données manquantes
      for (const list of orderedLists) {
        console.log(list);
        listModule.makeListInDOM(list);
        // on trie les cartes avant de les afficher dans le DOM
        // à noter qu'on peut aussi faire le tri côté back
        console.log("list " , list);
        const orderedCards =  list.cardList.sort((firstCard, secondCard) => {return (firstCard.position - secondCard.position)})
        for (const card of orderedCards) { // les listes contiennent des tableaux de cartes
          cardModule.makeCardInDom(card);
          console.log(card);
            for (const tag of card.tags) {
              tagModule.makeTagInDOM(tag);
            }
        }
      }
    } catch (e) {
      console.trace(e);
      alert("Erreur lors de la récupération des données")
    }

  },

  /* - ECOUTEURS -------------------------------- */

  addListenerToActions: function () {
    // - ajouter une liste -
    // on récupère le bouton sur lequel on souhaite rajouter une réaction
    const buttonCreateListElem = document.querySelector('#addListButton');
    // on lui ajoute un écouteur avec un callback qui ouvre la modale
    buttonCreateListElem.addEventListener('click', listModule.handleButtonshowListModalElem);

    // !! A factoriser 
    // - fermer la modale -
    // on récupère les 2 boutons permettant de fermer la modale
    const closeButtonsElems = document.querySelectorAll('#addListModal .close');
    // on a récupéré un tableau d'éléments, on va rajouter un écouteur sur chacun de ces éléments
    for (const button of closeButtonsElems) {
      button.addEventListener('click', listModule.handleButtonsHideModalElem);
    }
    // pour fermer la modale lorsqu'on clique sur le background on peut rajouter : 
    document.querySelector('.modal-background').addEventListener('click', listModule.handleButtonsHideModalElem);

    // - fermer la modale card - 
    const closeButtons = document.querySelectorAll('#addCardModal .close');
    for (const button of closeButtons) {
      button.addEventListener('click', cardModule.handleButtonsHideCardModalElem);
    }
    const modalBGS = document.querySelectorAll('.modal-background');
    for (const button of modalBGS) {
      button.addEventListener('click', cardModule.handleButtonsHideCardModalElem);
    }


    // !! 
    // - valider le formulaire permettant d'ajouter une liste - 
    // on récupère le formulaire 
    // on lui ajoute un écouteur
    document.querySelector('#addListModal form').addEventListener('submit', listModule.handleAddListForm);

    // -valider le formulaire permettant d'ajouter une carte - 
    document.querySelector('#addCardModal form').addEventListener('submit', cardModule.handleAddCardForm);


    // - afficher de la modale permettant de créer des cartes
    // on récupère tous les boutons '+'
    const displayCardModalButtons = document.querySelectorAll('.panel .is-pulled-right');
    // on rajoute un écouteur d'évènement sur chaque bouton
    for (const button of displayCardModalButtons) {
      button.addEventListener('click', cardModule.handleButtonShowCardModal)
    }

    // on récupère l'élément sur lequel on veut écouter le drag 'n' drop des listes
    const boardElem = document.querySelector('.card-lists');

    // Ajout de sortable sur l'ensemble des listes
    new Sortable(boardElem, {
      group: 'board',
      draggable: '.panel', 
      onEnd: listModule.handleDragList
  })

  },

}




// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init);










},{"./js/card":2,"./js/list":3,"./js/tag":4,"./js/utils":5}],2:[function(require,module,exports){
const utilsModule = require('./utils');

const cardModule = {


    // data contient les données du formulaire
    makeCardInDom(data) {
        console.log(data);
        const templateCardElem = document.querySelector('#card-template');
        const cloneTemplateElem = templateCardElem.content.cloneNode(true);

        cloneTemplateElem.querySelector('.box').style.backgroundColor = data.color;

        cloneTemplateElem.querySelector('.box .column').textContent = data.title;
        cloneTemplateElem.querySelector('.box').setAttribute('data-card-id', data.id);

        // on ajoute un écouteur sur le bouton permettant d'éditer une carte
        cloneTemplateElem.querySelector('.edit-card-icon').addEventListener('click', cardModule.handleDisplayEditCardForm)

        // on ajoute un écouteur sur le bouton permettant de supprimer une carte
        cloneTemplateElem.querySelector('.delete-card-icon').addEventListener('click', cardModule.handleDeleteCard);

        // on ajoute un écouteur au formulaire caché
        cloneTemplateElem.querySelector('form').addEventListener('submit', cardModule.handleEditSubmitForm)

        // on ajoute l'id de la carte au formulaire 
        cloneTemplateElem.querySelector('input').value = data.id;

          // on ajoute la couleur de la carte
          const color = data.color;
          cloneTemplateElem.querySelector('.is-small').nextElementSibling.value = color;

        // on souhaite récupérer la liste qui a souhaité créer une carte, on va ensuite lui ajouter une carte en tant qu'enfant
        console.log("DATA", data);
        console.log(data.list_id);
        document.querySelector(`[data-list-id="${data.list_id}"] .has-background-light`).appendChild(cloneTemplateElem);
    },


    handleDisplayEditCardForm: function (event) {

        const columnsElem = event.target.closest('.columns')
        // on affiche le formulaire
        columnsElem.querySelector('form').classList.remove('is-hidden');
        // on cache le nom de la carte
        columnsElem.querySelector('.column').classList.add('is-hidden');
        
        // on ajoute le titre de la carte au formulaire
        const title = columnsElem.querySelector('.column').textContent
    

        // on ajoute le titre et la couleur dans les chalmps du formulaire
        const secondInputElem = event.target.closest('.columns').querySelector('.is-small')
        secondInputElem.value = title;
        console.log(secondInputElem.nextElementSibling);
    

    },

    // fonction qui ressemble beaucoup à handleDeleteList, s'y référer pour avoir des commentaires + détaillés
    handleDeleteCard: async function(event) {

        event.preventDefault();

        if (!confirm('voulez-vous vraiment supprimer cette carte ? ')) {
            return
        }
        const cardId = event.target.closest('.box').dataset.cardId;

        try {

            const response = await fetch(`${utilsModule.base_url}/cards/${cardId}`, {
                method: 'DELETE',
            })
            
            if (response.status === 204) {
                // le serveur nous confirme la suppression de la liste, on peut donc l'enlever du front
                event.target.closest('.box').remove();
            }

        }catch(error) {
            console.log(error);

        }

    },


    handleAddCardForm: async function (event) {
        // mêmes actions que pour handleAddListForm, se référer à la fonction d'en dessous pour les commentaires
        event.preventDefault();
        const data = new FormData(event.target);
        cardModule.handleButtonsHideCardModalElem();
        try {
            // on poste la liste en BDD
            const response = await fetch(`${utilsModule.base_url}/cards`, {
                method: 'POST',
                body: data
            })
            console.log("rep", response);

            // si le résultat est positif : 
            if (response.status === 201) {

                // la carte a été créée côté BDD, on peut donc l'afficher côté front 
                // pour se faire : on convertit la réponse du serveur en objet
                const card = await response.json();
                // on envoie les données à la fonction qui crée des listes
                cardModule.makeCardInDom(card);
            } else {
                throw new Error('POST API issue');
            }
        } catch (error) { // si on a une erreur : 
            console.log(error);
        }
    },


    handleEditSubmitForm: async function (event) {
        event.preventDefault();
        // on récupère les données du formulaire
        const cardForm = new FormData(event.target);
        // on consulte l'API
        try {
            console.log('on passe là ');
            // est ce qu'on a bien récupéré le nouveau title de la carte ? 
            if (!cardForm.get('title')) {
                alert('Form issue');
                throw new Error('form issue');
            }
            // on appelle l'API

            const response = await fetch(`${utilsModule.base_url}/cards/${cardForm.get('card-id')}`, {
                method: 'PATCH',
                body: cardForm
            })
            const convertedAnswer = await response.json();
            event.target.closest('.columns').querySelector('.column').textContent = convertedAnswer.title;
            event.target.closest('.box').style.backgroundColor = convertedAnswer.color;

        } catch (error) {
            console.log(error);
        }
        // on modifie le front

        //on cache le formulaire
        event.target.closest('.columns').querySelector('form').classList.add('is-hidden');
        // on affiche le titre
        event.target.closest('.columns').querySelector('.column').classList.remove('is-hidden');
    },


    handleButtonsHideCardModalElem: function () {
        const modalElem = document.querySelector('#addCardModal');
        modalElem.classList.remove('is-active');
    },


    handleButtonShowCardModal: function (event) {
        // on récupère la modale des cartes
        const cardModalElem = document.querySelector('#addCardModal')
        // on ajoute l'id de la liste qui a appelé cette modale dans le formulaire
        const listId = event.target.closest('.panel').getAttribute('data-list-id');
        cardModalElem.querySelector('#input-card-id').value = listId;
        // on rajoute is active à cet élément
        cardModalElem.classList.add('is-active');
    },


}

module.exports = cardModule;
},{"./utils":5}],3:[function(require,module,exports){
const cardModule = require('./card');
const utilsModule = require('./utils');


const listModule = {


    // créer des listes dans le DOM
    makeListInDOM(data) {

        // on récupère le template dans le DOM
        const templateListElem = document.querySelector('#list-template');
        // on clone le template
        // !! le true passé entre les parenthèses permet de récupérer les enfants du template
        const cloneTemplateElem = templateListElem.content.cloneNode(true);
        console.log(cloneTemplateElem);;
        // on modifie le titre de la liste
        // data est une instance de FormData, de ce fait on peut utiliser la méthode get pour récupérer une clé 
        cloneTemplateElem.querySelector('h2').textContent = data.name;
        // on ajoute l'id approprié à la liste : 
        cloneTemplateElem.querySelector('.is-one-quarter').setAttribute('data-list-id', data.id);

        // on ajoute l'id de la liste dans le formulaire caché
        cloneTemplateElem.querySelector('input').value = data.id;

        // on ajoute un écouteur sur le bouton '+' 
        const displayCardModalButton = cloneTemplateElem.querySelector('.panel .is-pulled-right');
        // on rajoute un écouteur d'évènement sur chaque bouton
        displayCardModalButton.addEventListener('click', cardModule.handleButtonShowCardModal);

        // on rajoute un écouteur pour afficher la modale
        cloneTemplateElem.querySelector('h2').addEventListener('dblclick', listModule.handleShowEditForm)

        // on ajoute un écouteur permettant de modifier le nom de la liste
        cloneTemplateElem.querySelector('form').addEventListener('submit', listModule.handleSubmitEditList)

        // on rajoute un écouteur sur le bouton permettant de supprimer une liste
        cloneTemplateElem.querySelector('.delete-list').addEventListener('click', listModule.handleDeleteList)


        // On met en place sortable
        listModule.initDragNDrop(cloneTemplateElem);

        // on ajoute la liste dans le DOM
        // 1 - on récupère l'élément parent 2 - on ajoute un enfant à cet élément
        // prepend fait la même chose que appendChild, hormis que l'élément ajouté sera le premier enfant et pas le dernier
        document.querySelector('.card-lists').appendChild(cloneTemplateElem);
    },


    initDragNDrop: function (cloneTemplateElem) {
        // on récupère l'élément qui va contenir toutes les cartes 
        const containerElem = cloneTemplateElem.querySelector('.panel-block');

        // On crée une instance de sortable qui entoure la liste, ainsi tous les éléments enfant de cet élément pourront être déplacés
        new Sortable(containerElem, {
            group: 'lists', // le fait de nommer le groupe auquel cet élément appartient, va permettre de déplacer les cartes d'une liste à une autre
            draggable: '.box', // pour s'assurer que c'est bien les cartes qui sont déplacables (facultatif dans notre situation, parce que les listes contiennent uniquement des cartes)
            onEnd: listModule.handleDragCard
        })

    },


    // on recoit une liste de cartes ainsi que l'id de la liste concernée par ces cartes
    updateCardPosition: async function (cards, listId) {

        try {
            // on stocke les données dans un FormData
            const cardForm = new FormData(); // le FormData est actuelement vide

            let index = 1;
            // on envoie les données au serveur 
            for (const card of cards) {

                // on récuoère l'id de la carte
                //const cardId = card.dataset.cardId;
                // alternative avec getAttribute
                const cardId = card.getAttribute('data-card-id');
                console.log(cardId);
                // on remplit de formData
                cardForm.set('id', cardId);
                cardForm.set('position', index); //!! Information capitale pour changer la position de la carte ! 
                cardForm.set('list_id', listId)

                // on appelle l'API
                const response = await fetch(`${utilsModule.base_url}/cards/${cardId}`, {
                    method: 'PATCH',
                    body: cardForm
                });

                index++;
            }
        } catch (error) {
            console.log(error);
        }

    },

    /* CALLBACKS ----------------------------------------- */

    // gère l'évènement drag sur une liste
    handleDragList: async function (event) {
        // on récupère toutes nos listes
        const listsElems = document.querySelectorAll('.panel')
        const listData = new FormData();



        // pour chaque liste récupérée : 
        // on utilise l'index fourni par forEach, qui va nous servir à indiquer la position de chaque liste par rapport aux autres 
        // index est incrémenté automatiquement avec forEach (/!\, index commence à 0, et les positions commencent à 1)
        listsElems.forEach(async (list, index) => {
            console.log(index); // 0
            // avant de faire un fetch, on remplit le FormData
            listData.set('position', (index));
            listData.set('id', list.dataset.listId);

            await fetch(`${utilsModule.base_url}/lists/${list.dataset.listId}`, {
                method: 'PATCH',
                body: listData


            })
        })
    },

    handleButtonshowListModalElem: function () {
        // on récupère l'élément concerné
        const modalElem = document.querySelector('#addListModal');
        // on rajoute la classe is-active sur l'élément
        modalElem.classList.add('is-active');
    },

    // callback déclenché lors du déplacement d'une carte
    handleDragCard(event) {
        // on récupère la liste concernée (la liste d'origine)
        const oldList = event.from;
        console.log(event);

        // on va récupérer toutes les cartes de la liste côté front 
        // via ce querySelectorAll on connaît l'ordre des cartes
        const cardsFromOldList = oldList.querySelectorAll('.box');


        // on récupère l'id de la liste
        const oldListId = event.from.closest('.panel').dataset.listId;
        // on appelle une méthode mettant à jour l'ordre des cartes
        listModule.updateCardPosition(cardsFromOldList, oldListId);

        // on regarde si la carte a été déplacée d'une liste à une autre
        // si l'origine et la destination (de la carte) sont différentes :
        if (event.from !== event.to) {
            // si c'est le cas, on va update la nouvelle liste
            const newList = event.to;

            const cardsFromNewListElem = newList.querySelectorAll('.box');

            const newListId = newList.closest('.panel').dataset.listId;


            listModule.updateCardPosition(cardsFromNewListElem, newListId);
        }

    },


    handleShowEditForm: function (event) {
        // on affiche l'input cachée
        // on cache le h2
        event.target.classList.add('is-hidden');
        // on affiche le formulaire
        event.target.nextElementSibling.classList.remove('is-hidden');


    },

    handleDeleteList: async function (event) {
        // preventDefault
        event.preventDefault();
        // on demande à l'utilisateur si il veut vraiment supprimer la liste
        if (!confirm('voulez-vous vraiment supprimer cette liste ? ')) {
            return
        }
        // on récupère l'id de la liste
        // Ici on utilise l'objet dataset, il contient tous les dataset de l'élément concerné, chaque clé écrite en keba-case côté HTML sera convertie côté JS en camelCase (d'où la clé listId qui s'écrit data-list-id côté HTML)
        const listId = event.target.closest('.is-one-quarter').dataset.listId;
        console.log("dataset", event.target.closest('.is-one-quarter').dataset);
        console.log("LIST ID : ", listId);

        // on appelle la BDD pour supprimer la liste
        try {
            const response = await fetch(`${utilsModule.base_url}/lists/${listId}`, {
                method: 'DELETE',
            })

            if (response.status === 204) {
                // le serveur nous confirme la suppression de la liste, on peut donc l'enlever du front
                event.target.closest('.is-one-quarter').remove();
            }
        } catch (error) {
            console.log(error);
        }
    },

    handleSubmitEditList: async function (event) {
        event.preventDefault();
        // on récupère les données du formulaire qu'on met dans un FormData

        const listForm = new FormData(event.target);


        try {
            // est ce qu'on a bien récupéré le nouveau nom de la liste ? 
            if (!listForm.get('name')) {
                alert('Form issue');
                throw new Error('form issue');
            }
            // on fetch l'API
            const response = await fetch(`${utilsModule.base_url}/lists/${listForm.get('list-id')}`, {
                method: 'PATCH',
                body: listForm
            })

            // on convertit la réponse 
            const convertedAnswer = await response.json();
            // si le serveur a validé l'édition  : on change le titre en front
            if (response.status === 200) {
                event.target.previousElementSibling.textContent = convertedAnswer.name;
            }
        } catch (error) {
            console.log(error);
        }
        // on cache le formulaire
        event.target.classList.add('is-hidden');
        // on affiche le titre
        event.target.previousElementSibling.classList.remove('is-hidden');

    },


    handleAddListForm: async function (event) {

        // on prévient le comportement par défaut 
        event.preventDefault();
        // on récupère les données du formulaire
        // ici on a récupéré les données dans une instance possédant des getters et des setters
        const data = new FormData(event.target);
        // avant de créer les listes, on va cacher la modale
        listModule.handleButtonsHideModalElem();

        try {
            // on poste la liste en BDD
            const response = await fetch(`${utilsModule.base_url}/lists`, {
                method: 'POST',
                body: data
            })
            console.log(response);
            // si le résultat est positif : 
            if (response.status === 201) {

                // la liste a été créée côté BDD, on peut donc l'afficher côté front 
                // pour se faire : on convertit la réponse du serveur en objet
                const list = await response.json();
                // on envoie les données à la fonction qui crée des listes
                listModule.makeListInDOM(list);

            } else {
                throw new Error('POST API issue');
            }
        } catch (error) { // si on a une erreur : 
            console.log(error);
        }
    },


    handleButtonsHideModalElem: function () {
        // on récupère la modale
        const modalElem = document.querySelector('#addListModal');
        // on lui enlève la classe is-active
        modalElem.classList.remove('is-active');
    },
}

module.exports = listModule;
},{"./card":2,"./utils":5}],4:[function(require,module,exports){
const utilsModule = require('./utils');

const tagModule = {


    makeTagInDOM: function(tag) {
      // on crée l'élément tag
      const tagElem = document.createElement('span')
     // on lui rajoute une classe
    tagElem.classList.add('tag');
     // on lui rajoute une couleur
     tagElem.style.backgroundColor = tag.color; 
     // on lui rajoute un nom
     tagElem.textContent = tag.name;
     // on ajoute l'id de la carte dans le tag
     // POUR LE BONUS !!
     tagElem.setAttribute('data-tag-id', tag.id);
     // - on l'ajoute dans le DOM - 
     // 1 : on récupère l'id de la carte
     const cardId = tag.card_has_tag.card_id;
    // 2 : on récupère l'élément carte via son ID
    const cardElem = document.querySelector(`.columns [data-card-id="${cardId}"] .tags`);
    // 2 : on ajoute un écouteur sur le tag, afin qu'il soit supprimé lors d'un double click
    cardElem.addEventListener('dblclick', tagModule.handleDeleteTagFromCard);
    // 4 : on ajoute le tag à l'élément parent
    cardElem.appendChild(tagElem);
    },

    handleDeleteTagFromCard: async function(event) {
        if (!confirm('voulez vous vraiment supprimer cette carte ? ')) {
            return;
        }
        // on cherche la carte concernée
        const cardElem = event.target.closest('.box');
        // on récupère l'id de la carte
        const cardId = cardElem.getAttribute('data-card-id');
        // on récupère l'id du tag
        const tagId = event.target.getAttribute('data-tag-id');
        // alternative :
        // const tagId = event.target.dataset.tagId;
        
        // maintenant qu'on a toutes les infos, on va essayer de le supprimer côté back
        try {

        const result = await fetch(`${utilsModule.base_url}/cards/${cardId}/tag/${tagId}`, {
            method: 'DELETE'
        })
        console.log(result);
        if (result.status === 204) {
         // on supprime l'élément tag via la méthode remove
         event.target.remove();

        }

        } catch(e) {
            console.log(e);
        }
    }
}


module.exports = tagModule;
},{"./utils":5}],5:[function(require,module,exports){



const utilsModule = {
    base_url: 'http://localhost:5000',
}

module.exports = utilsModule;
},{}]},{},[1]);
