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

const fetchData = (sortDate = null, sortByName = null) => {
    const vehiclesRef = ref(database, 'vehicles');
    onValue(vehiclesRef, (snapshot) => {
        const data = snapshot.val();
        const vehicles = [];
        const vehicleNames = new Set();

        for (const driverId in data) {
            for (const vehicleId in data[driverId]) {
                vehicles.push({ id: vehicleId, driverId: driverId, ...data[driverId][vehicleId] });
                vehicleNames.add(data[driverId][vehicleId].vehicleName);
            }
        }

        if (sortDate) {
            vehicles.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortByName) {
            vehicles.sort((a, b) => a.vehicleName.localeCompare(b.vehicleName));
        }

        populateVehicleNames(Array.from(vehicleNames));
        displayVehicles(vehicles);
    });
};

const populateVehicleNames = (vehicleNames) => {
    const sortNameSelect = document.getElementById('sort-name');
    sortNameSelect.innerHTML = '<option value="">Select Vehicle Name</option>';
    vehicleNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        sortNameSelect.appendChild(option);
    });
};

const displayVehicles = (vehicles) => {
    const allList = document.getElementById('all-list');
    const verifiedList = document.getElementById('verified-list');
    const notVerifiedList = document.getElementById('not-verified-list');

    allList.innerHTML = '';
    verifiedList.innerHTML = '';
    notVerifiedList.innerHTML = '';

    vehicles.forEach(vehicle => {
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
                <button onclick="toggleVerification('${vehicle.driverId}', '${vehicle.id}', ${vehicle.verified})" ${vehicle.verified ? 'class="verified"' : ''}>${vehicle.verified ? 'Verified' : 'Not Verified'}</button>
            </td>
        `;
        
        allList.appendChild(row.cloneNode(true));
        
        if (vehicle.verified) {
            verifiedList.appendChild(row.cloneNode(true));
        } else {
            notVerifiedList.appendChild(row.cloneNode(true));
        }
    });
};

window.toggleVerification = (driverId, vehicleId, isVerified) => {
    const vehicleRef = ref(database, `vehicles/${driverId}/${vehicleId}`);
    update(vehicleRef, { verified: !isVerified }).then(() => {
        fetchData();
    });
};

const sortDateInput = document.getElementById('sort-date');
const sortNameSelect = document.getElementById('sort-name');

const sortVehicles = () => {
    const sortDate = sortDateInput.value;
    const sortByName = sortNameSelect.value;
    fetchData(sortDate, sortByName);
};

window.refreshData = () => {
    sortDateInput.value = '';
    sortNameSelect.value = '';
    fetchData();
};

sortDateInput.addEventListener('change', sortVehicles);
sortNameSelect.addEventListener('change', sortVehicles);

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});
