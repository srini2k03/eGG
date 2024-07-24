import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Firebase configuration for vehicles
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
const database = getDatabase(app);

// Show tab function
window.showTab = function (tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = tab.id === tabId ? 'block' : 'none';
    });

    const tabButtons = document.querySelectorAll('.tabs button');
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.id === `${tabId}Tab`);
    });
};

// Ensure JavaScript runs after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add Vehicle
    const addVehicleForm = document.getElementById('addVehicleForm');
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const vehicleName = document.getElementById('vehicleName').value;
            const licenseNumber = document.getElementById('licenseNumber').value;

            if (!vehicleName || !licenseNumber) {
                alert('All fields are required!');
                return;
            }

            set(ref(database, `transport/${licenseNumber}`), {
                vehicleName: vehicleName,
                licenseNumber: licenseNumber
            }).then(() => {
                alert('Vehicle added successfully!');
                addVehicleForm.reset();
            }).catch(error => {
                console.error('Error adding vehicle:', error);
            });
        });
    }

    // Fetch and display vehicles
    onValue(ref(database, 'transport'), (snapshot) => {
        displayVehicles(snapshot);
    });
});

function displayVehicles(snapshot) {
    const vehiclesList = document.getElementById('vehiclesList');
    vehiclesList.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const vehicle = childSnapshot.val();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vehicle.vehicleName}</td>
            <td>${vehicle.licenseNumber}</td>
            <td>
                <button onclick="editVehicle('${vehicle.licenseNumber}', '${vehicle.vehicleName}')">Edit</button>
                <button onclick="deleteVehicle('${vehicle.licenseNumber}')">Delete</button>
            </td>`;
        vehiclesList.appendChild(tr);
    });
}

// Edit Vehicle
window.editVehicle = function (licenseNumber, name) {
    document.getElementById('vehicleName').value = name;
    document.getElementById('licenseNumber').value = licenseNumber;

    document.getElementById('addVehicleForm').addEventListener('submit', (event) => {
        event.preventDefault();
        update(ref(database, `transport/${licenseNumber}`), {
            vehicleName: document.getElementById('vehicleName').value
        }).then(() => {
            alert('Vehicle updated successfully!');
            document.getElementById('addVehicleForm').reset();
        }).catch(error => {
            console.error('Error updating vehicle:', error);
        });
    }, { once: true });

    showTab('addVehicle');
}

// Delete Vehicle
window.deleteVehicle = function (licenseNumber) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        remove(ref(database, `transport/${licenseNumber}`)).then(() => {
            alert('Vehicle deleted successfully!');
        }).catch(error => {
            console.error('Error deleting vehicle:', error);
        });
    }
}

// Default to show the "Add Vehicle" tab
showTab('addVehicle');
