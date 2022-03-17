# Security 2 Portfolio-opdracht 2

Dit is de code die je gebruikt bij de tweede portfolio-opdracht van Security 2.

Deze code is alleen de backend en waar je aandacht voor moet hebben zijn de securityaspecten, niet op het domein. 

De backend is geschreven in [NestJS](https://nestjs.com/). Dit is een framework om backends met dependency injection die lijkt op Angular in te bouwen. Het is niet nodig om dit framework helemaal te begrijpen om de backend te begrijpen.

Hint: begin bij de AuthService om de code te begrijpen.

### Om te runnen

Je kan de app starten met `npm run start:main` of in watch mode (dus dan wordt hij herstart als je de code update) met `npm run start:dev`.

Psst.. Vergeet niet eerst even `npm install` te runnen.

### Mocking

De database is gemockt voor deze opdracht, dus de API geeft altijd een lege array als resultaat. Als je de applicatie echt wil laten draaien moet je de Neo4jService aanpassen en een neo4j instantie laten draaien. Ook is er wat initiële data nodig. Ga langs bij Dion als je hier meer over wil weten, maar dit is helemaal niet nodig om de security te testen.