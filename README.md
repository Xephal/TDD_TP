Story 1
En tant que Rider,
Je souhaite réserver une course pouvant m’amener à ma destination
De sorte à assurer une alternative efficace aux transports en commun.
Acceptance
Le Rider doit avoir suffisamment de fonds sur son compte pour réserver une course.
Tant qu’un Driver n’est pas assigné à une réservation en cours, le Rider ne peut pas effectuer une autre réservation.
Si le Rider souhaite faire une autre réservation, il doit d’abord annuler la précédente.
- Prix de base :
Paris -> Paris : 2 euros
Extérieur de Paris -> Paris : 0 euro
Paris -> Extérieur de Paris : 10 euros
Prix par kilomètre : 0.5 euro.

---

Story 2
En tant que Rider,
Je souhaite annuler une course
Car le Driver met trop de temps à venir
Acceptance
Si le Rider annule une course alors que le Driver est déjà en chemin, cela coûtera 5 euros de pénalité.
Un Ride déjà annulé ne peut pas être annulé à nouveau.
Si c’est l’anniversaire du Rider alors l’annulation est offerte quelle que soit la raison

---

Story 3
Il est temps de faire votre choix sur le système de stockage. Pour ce projet, une base de données Postgresql semble
un choix judicieux.
Ajoutez une base de données pour le stockage de vos Rider, Ride et Driver.
Utiliser le query builder Knex (https://knexjs.org)
Pour créer une migration, utiliser la commande “npm run knex migrate:make NOM_DE_LA_MIGRATION”
Chaque fonction de la classe devra être testé pas un test d’integration

---

Story 4
En tant que Rider,
Je souhaite lister tout l’historique de mes courses avec mention des Drivers respectifs
De sorte à pouvoir me figurer la fréquence de mon utilisation

---

Story 5
En tant que Driver,
Je souhaite facturer ma course plus cher le jour de Noël
Jour (ou soirée) de Noël : Double du montant total

---

Story 6
En tant que Driver,
Je souhaite facturer mon service uberX 5 euro
Afin de proposer un service premium
Supplément UberX : +5 euros au total
Offert le jour de l'anniversaire du Rider

---

Story 7
Le calcule à la main des distances n’est plus possible à ce stade, on peut se tourner vers les API de Google pour faire
cela à notre place.
Ajoutez un scanner utilisant l’API de Google pour les distances et l’information sur la ville d’une adresse

@googlemaps/google-maps-services-js
Créer votre clé api (https://developers.google.com/maps/documentation/javascript/get-api-key?hl=fr)

---

Story 8
Consommation de l’application via une API
Peu importe votre choix d’API, vous devrez rendre disponibles les 3 usecases à vos utilisateurs et implementer les
test e2e qui vont avec

---

Story 8 - Bonus
En tant que Rider,
Je veux gagner un point de fidélité pour chaque ride effectué
Afin de proposer un service de fidélisation
On devra effectuer et tester une transaction sur le process de booking du ride
Si le point ne s’ajoute pas alors on ne sauvegarde pas le ride