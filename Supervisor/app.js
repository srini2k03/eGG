import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyB0ucyXQ0zStFHULGkq-YUmILdBia2RSQo",
    authDomain: "eggbucket-b37d3.firebaseapp.com",
    databaseURL: "https://eggbucket-b37d3-default-rtdb.firebaseio.com",
    projectId: "eggbucket-b37d3",
    storageBucket: "eggbucket-b37d3.appspot.com",
    messagingSenderId: "854600141755",
    appId: "1:854600141755:web:a0b34bab9c5bf68ef7529e",
    measurementId: "G-NMYT3EFJWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
    const allList = document.getElementById('all-list');
    const verifiedList = document.getElementById('verified-list');
    const notVerifiedList = document.getElementById('not-verified-list');
    const sortDateInput = document.getElementById('sort-date');

    const fetchData = (sortDate = null) => {
        const vehiclesRef = ref(database, 'vehicles');
        onValue(vehiclesRef, (snapshot) => {
            const data = snapshot.val();
            const vehicles = [];
            for (const driverId in data) {
                for (const vehicleId in data[driverId]) {
                    vehicles.push({ id: vehicleId, driverId: driverId, ...data[driverId][vehicleId] });
                }
            }
            if (sortDate) {
                vehicles.sort((a, b) => new Date(a.date) - new Date(b.date));
            }
            displayVehicles(vehicles, sortDate);
        });
    };

    const displayVehicles = (vehicles, sortDate) => {
        allList.innerHTML = '';
        verifiedList.innerHTML = '';
        notVerifiedList.innerHTML = '';

        vehicles.forEach(vehicle => {
            if (!sortDate || vehicle.date === sortDate) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${vehicle.name}</td>
                    <td>${vehicle.vehicleName}</td>
                    <td>${vehicle.odometerReading}</td>
                    <td><img src="${vehicle.odometerImageUrl}" alt="Odometer Image" class="image-preview"></td>
                    <td><img src="${vehicle.petrolBunkImageUrl}" alt="Petrol Bunk Image" class="image-preview"></td>
                    <td>${vehicle.fuelType}</td>
                    <td>${vehicle.totalAmount}</td>
                    <td>${vehicle.litersOfPetrol}</td>
                    <td>${vehicle.date}</td>
                    <td>
                        <button onclick="toggleVerification('${vehicle.driverId}', '${vehicle.id}', ${vehicle.verified})" ${vehicle.verified ? 'class="verified" disabled' : ''}>${vehicle.verified ? 'Verified' : 'Verify'}</button>
                    </td>
                `;
                
                allList.appendChild(row.cloneNode(true));
                
                if (vehicle.verified) {
                    verifiedList.appendChild(row.cloneNode(true));
                } else {
                    notVerifiedList.appendChild(row.cloneNode(true));
                }
            }
        });
    };

    window.toggleVerification = (driverId, vehicleId, isVerified) => {
        if (!isVerified) {
            const vehicleRef = ref(database, `vehicles/${driverId}/${vehicleId}`);
            update(vehicleRef, { verified: true }).then(() => {
                fetchData();
            });
        }
    };

    sortDateInput.addEventListener('change', () => {
        const sortDate = sortDateInput.value;
        fetchData(sortDate);
    });

    fetchData();
});
