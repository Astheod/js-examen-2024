//Dans /tests/site.spec.mjs, validez la méthode Site.pushRooms() dans les 3 situations suivantes : aucun
// local spécifié, ajout de plusieurs locaux sans doublon, ajout de plusieurs locaux avec plusieurs doublons.
// Montrez bien que la valeur de retour et le contenu de la propriété rooms sont correctes.

import { Site } from '../libs/rooms.mjs';
import { assert } from 'chai';

describe('Tests sur la classe Site', function () {
let site;
    beforeEach(function(){
        site = new Site({siteCode : "E200532", siteName : "Espace 200532", rooms : []});
    });
    describe('Tests sur la méthode pushRooms', function () {
        it('Tests sans local spécifié', function () {
            let count = site.pushRooms();
            assert.equal(count, 0);
            assert.deepEqual(site.rooms, []);
        });

        it('Tests ajout de plusieurs locaux sans doublon', function () {
            let count = site.pushRooms({room: "A101"}, {room: "A102"}, {room: "A103"});
            assert.equal(count, 3);
            assert.deepEqual(site.rooms, [{room: "A101"}, {room: "A102"}, {room: "A103"}]);
        });

        it('Tests ajout de plusieurs locaux avec plusieurs doublons', function () {
            let count = site.pushRooms({room: "A101"}, {room: "A102"}, {room: "A103"}, {room: "A101"}, {room: "A102"}, {room: "A103"});
            assert.equal(count, 3);
            assert.deepEqual(site.rooms, [{room: "A101"}, {room: "A102"}, {room: "A103"}]);
        });
    });
});