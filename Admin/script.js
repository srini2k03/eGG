// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";

// Your web app's Firebase configuration
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
const analytics = getAnalytics(app);

// References
const driversRef = ref(database, 'drivers/');

// Function to display drivers
function displayDrivers(snapshot) {
    const driverList = document.getElementById('driverList');
    driverList.innerHTML = '';

    snapshot.forEach(driverSnapshot => {
        const driver = driverSnapshot.val();
        const dl = driverSnapshot.key;

        driverList.innerHTML += `
            <div class="driver-item">
                <p><strong>DL No:</strong> ${dl}</p>
                <p><strong>Name:</strong> ${driver.name}</p>
                <p><strong>Phone No:</strong> ${driver.phone}</p>
                <p><strong>Debit Card No:</strong> ${driver.debitCardNo}</p>
                <button onclick="editDriver('${dl}', '${driver.name}', '${driver.phone}', '${driver.debitCardNo}')">Edit</button>
                <button onclick="deleteDriver('${dl}')">Delete</button>
            </div>
        `;
    });
}

// Display all drivers in real-time
onValue(driversRef, (snapshot) => {
    displayDrivers(snapshot);
});

// Add Driver
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addDriverForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const dl = document.getElementById('dl').value;
        const debitCardNo = document.getElementById('debitCardNo').value;

        if (!name || !phone || !dl || !debitCardNo) {
            alert('All fields are required!');
            return;
        }

        set(ref(database, 'drivers/' + dl), {
            name: name,
            phone: phone,
            dl: dl,
            debitCardNo: debitCardNo
        }).then(() => {
            alert('Driver added successfully!');
            document.getElementById('addDriverForm').reset();
            logEvent(analytics, 'driver_added', { dl });
        }).catch(error => {
            console.error('Error adding driver:', error);
        });
    });
});

// Edit Driver
window.editDriver = function(dl, name, phone, debitCardNo) {
    document.getElementById('editDl').value = dl;
    document.getElementById('newName').value = name;
    document.getElementById('newPhone').value = phone;
    document.getElementById('newDebitCardNo').value = debitCardNo;
    document.getElementById('editDriverForm').style.display = 'block';
};

document.getElementById('editForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const dl = document.getElementById('editDl').value;
    const newName = document.getElementById('newName').value;
    const newPhone = document.getElementById('newPhone').value;
    const newDebitCardNo = document.getElementById('newDebitCardNo').value;

    if (!dl) {
        alert('DL number is required!');
        return;
    }

    const updates = {};
    if (newName) updates['/drivers/' + dl + '/name'] = newName;
    if (newPhone) updates['/drivers/' + dl + '/phone'] = newPhone;
    if (newDebitCardNo) updates['/drivers/' + dl + '/debitCardNo'] = newDebitCardNo;

    if (Object.keys(updates).length === 0) {
        alert('No updates provided!');
        return;
    }

    update(ref(database), updates).then(() => {
        alert('Driver details updated successfully!');
        document.getElementById('editDriverForm').reset();
        document.getElementById('editDriverForm').style.display = 'none';
        logEvent(analytics, 'driver_edited', { dl });
    }).catch(error => {
        console.error('Error updating driver:', error);
    });
});

// Delete Driver
window.deleteDriver = function(dl) {
    if (confirm('Are you sure you want to delete this driver?')) {
        remove(ref(database, 'drivers/' + dl)).then(() => {
            alert('Driver deleted successfully!');
        }).catch(error => {
            console.error('Error deleting driver:', error);
        });
    }
};

// Show Tab
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = tab.id === tabId ? 'block' : 'none';
    });
}
