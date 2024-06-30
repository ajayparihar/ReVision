document.addEventListener('DOMContentLoaded', function() {
    // Display today's date
    const dateDisplay = document.getElementById('dateDisplay');
    const today = moment(); // Current date using moment.js
    dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');

    // Fetch and display data from CSV
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb7zCNZEfozeuEwtKafE3U_himTnip925rNWnM6F4dZi6ZdVJ3n9Rlwnx26ur2iGxRfeRR5gyr8cJ/pub?gid=0&single=true&output=csv')
        .then(response => response.text())
        .then(csv => {
            let rows = csv.split('\n').map(row => row.trim()).filter(row => row); // Remove empty rows
            const tableBody = document.querySelector('#dataTable tbody');
            tableBody.innerHTML = ''; // Clear existing data

            // Function to create table rows
            function createTableRows(rows) {
                rows.forEach(row => {
                    const cols = row.split(',');
                    const tr = document.createElement('tr');

                    // Program Name (first column)
                    const programName = document.createElement('td');
                    programName.textContent = cols[0];
                    programName.classList.add('program-name');
                    programName.style.color = '#F7FF00'; // Apply foreground color
                    programName.style.cursor = 'pointer'; // Show pointer cursor on hover
                    programName.addEventListener('click', function() {
                        window.open(cols[3], '_blank'); // Open link from the fourth column
                    });
                    tr.appendChild(programName);

                    // Date (second column)
                    const date = document.createElement('td');
                    date.textContent = cols[1];
                    date.style.color = '#F7FF00'; // Apply foreground color
                    tr.appendChild(date);

                    // Revisions (third column)
                    const revisions = document.createElement('td');
                    revisions.textContent = cols[2];
                    revisions.style.color = '#F7FF00'; // Apply foreground color
                    tr.appendChild(revisions);

                    tableBody.appendChild(tr);
                });
            }

            // Function to filter programs exactly matching the specified intervals
            function filterPrograms(rows) {
                rows.forEach(row => {
                    const cols = row.split(',');
                    const programDate = moment(cols[1], 'DD-MM-YYYY'); // Parse date using moment.js

                    // Compare dates with exact matches
                    if (programDate.isSame(today.clone().subtract(1, 'days'), 'day')) {
                        createTableRows([row]); // Display under 1 Day category
                    } else if (programDate.isSame(today.clone().subtract(1, 'weeks'), 'day')) {
                        createTableRows([row]); // Display under 1 Week category
                    } else if (programDate.isSame(today.clone().subtract(1, 'months'), 'day')) {
                        createTableRows([row]); // Display under 1 Month category
                    } else if (programDate.isSame(today.clone().subtract(1, 'years'), 'day')) {
                        createTableRows([row]); // Display under 1 Year category
                    }
                });
            }

            // Initial table creation with filtered programs
            filterPrograms(rows);

            // Search functionality
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function() {
                const searchText = this.value.trim().toLowerCase();

                rows.forEach((row, index) => {
                    const cols = row.split(',');
                    const tr = tableBody.children[index];

                    let rowMatch = false; // Flag to track if any cell in the row matches

                    // Check first three columns for a match
                    for (let i = 0; i < 3; i++) {
                        const col = cols[i].trim();
                        const td = tr.children[i];

                        if (col.toLowerCase().includes(searchText)) {
                            rowMatch = true; // Set flag to true if any cell matches
                            const pattern = new RegExp(searchText, 'gi'); // 'gi' for global and case-insensitive match
                            td.innerHTML = col.replace(pattern, match => `<span class="highlight">${match}</span>`);
                        } else {
                            td.innerHTML = col; // Reset original text if no match
                        }
                    }

                    if (rowMatch) {
                        tr.style.display = ''; // Show row if any cell matches
                    } else {
                        tr.style.display = 'none'; // Hide row if no match in any cell
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching CSV file:', error);
        });
});
