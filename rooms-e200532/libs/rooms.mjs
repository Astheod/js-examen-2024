
const ROOMS_URL = 'https://dartagnan.cg.helmo.be/~p150107/js2/rooms/rooms.php';
export class Room {
    constructor({room, roomTypeCode, nbrPlaces}){
        this.room = room;
        this.roomTypeCode = roomTypeCode;
        this.nbrPlaces = nbrPlaces;
    }

    get typeRoom(){
        let toReturn;
        switch (this.roomTypeCode){
            case 'A':toReturn = "Auditoire"; break;
            case 'C':toReturn = "Classe"; break;
            case 'I':toReturn = "Laboratoire informatique"; break;
            case 'L':toReturn = "Laboratoire"; break;
            case 'P':toReturn = "Salle polyvalente"; break;
            default :toReturn =  "Non spécifié"; break;
        }
        return toReturn;
    }
}

export class Site {
    constructor({siteCode, siteName, rooms}){
        this.siteCode = siteCode;
        this.siteName = siteName;
        this.rooms = rooms;
        this.rooms = rooms.map((room) => new Room(room));
    }

    pushRooms(...rooms){
        let count = 0;
        rooms.forEach(room => {
            if(!this.rooms.find(r => r.room === room.room)){
                this.rooms.push(room);
                count++;
            }
        });
        return count;
    }

    //La méthode removeRoom(room) qui reçoit le nom d’un local à retirer des locaux du site. Cette méthode
    // retourne true si le local a pu être retiré, false sinon.
    removeRoom(room){
        let index = this.rooms.findIndex(r => r.room === room);
        if(index >= 0){
            this.rooms.splice(index, 1);
            return true;
        }
        return false;
    }
}

export function getSites(){
    return new Promise((resolve, reject) => {
        fetch(ROOMS_URL).then(response => {
            if (!response.ok) {
                reject(new Error('Erreur lors de la récupération des sites'));
            } else {
                response.json().then(data => {
                    let sites = data.map(site => new Site({siteCode: site.siteCode, siteName: site.siteName, rooms: []}));
                    resolve(sites);
                });
            }
        });
    });
}

export function getRooms(){
    return new Promise((resolve, reject) => {
        getSites().then(sites => {
            let promises = sites.map(site => {
                let data = JSON.stringify({siteCode: site.siteCode});
                return fetch(ROOMS_URL, {method: 'POST', body: data}).then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la récupération des locaux');
                    }
                    return response.json();
                }).then(rooms => {
                    site.pushRooms(...rooms.map(room => new Room(room)));
                    return site;
                });
            });
            Promise.all(promises).then(sites => resolve(sites)).catch(error => {
                console.error(error);
                resolve([]);
            });
        });
    });
    
}

export function renderSites(sites){
    let sitesSection = document.getElementById('sites');
    sitesSection.innerHTML = '';
    console.log(sites);
    sites.sort((a, b) => a.siteName.localeCompare(b.siteName)).forEach(site => {
        let details = document.createElement('details');
        let summary = document.createElement('SUMMARY');
        let ul = document.createElement('ul');
        sitesSection.appendChild(details);
        details.appendChild(summary);
        details.appendChild(ul);

        details.id = site.siteCode;
        summary.innerText = site.siteName;
        site.rooms.sort((a, b) => a.nbrPlaces - b.nbrPlaces || a.room.localeCompare(b.room)).forEach(room => {
            let li = document.createElement('li');
            li.innerText = `${room.room} (${room.nbrPlaces})`;
            li.addEventListener('mouseover', () => li.classList.add('active'));
            li.addEventListener('mouseout', () => li.classList.remove('active'));

            li.addEventListener('click', () => {
                let siteSaved = sessionStorage.getItem('selectedRoom') ?? new Site({siteCode: "", siteName: "", rooms: []});
                if(!siteSaved.rooms.find(r => r.room === room.room)) siteSaved.pushRooms(room);
                sessionStorage.setItem('selectedRoom', JSON.stringify(siteSaved));

                renderSelectedRooms(siteSaved);
            });

            ul.appendChild(li);
        });
    });
}

function renderSelectedRooms(site){
    let selectedRoomsList = document.getElementById('selectedRoomsList');
    selectedRoomsList.innerHTML = '';
    site.rooms.sort((a, b) => a.nbrPlaces - b.nbrPlaces || a.room.localeCompare(b.room)).forEach(room => {
        let li = document.createElement('li');
        li.innerText = `${room.room} (${room.nbrPlaces})`;
        selectedRoomsList.appendChild(li);
    });

}

export function loadSites(){
    return new Promise((resolve, reject) => {
        let sites = JSON.parse(localStorage.getItem('sites'));
        if(sites){
            resolve(sites);
        }else{
            getRooms().then(sites => {
                localStorage.setItem('sites', JSON.stringify(sites));
                resolve(sites);
            }).catch(error => {
                console.error(error);
                reject(error);
            });
        }
    });
}

export function clearCache(){
    localStorage.clear();
    sessionStorage.clear();
}



