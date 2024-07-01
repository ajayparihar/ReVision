/* Author: Ajay Singh */
/* Version: 1.1 */
/* Date: 2024-07-01 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dateDisplay = document.getElementById('dateDisplay');
    const datePicker = document.getElementById('datePicker');
    const tableBody = document.querySelector('#dataTable tbody');
    const searchInput = document.getElementById('searchInput');
    const headerTitle = document.getElementById('headerTitle');

    // Variables
    let today = moment(); // Current date using moment.js

    // Display current date
    dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');

    // Initialize Flatpickr
    flatpickr(datePicker, {
        defaultDate: today.format('YYYY-MM-DD'),
        onChange: function(selectedDates) {
            today = moment(selectedDates[0]); // Update today's date
            dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
            fetchDataAndFilter(); // Update the data display
        }
    });

    // Show Flatpickr when dateDisplay is clicked
    dateDisplay.addEventListener('click', function() {
        datePicker.click();
    });

    // Reload Page on Header Click
    headerTitle.style.cursor = 'pointer'; // Show pointer cursor on hover
    headerTitle.addEventListener('click', function() {
        location.reload(); // Reload the page
    });

    // Fetch and display data from CSV
    function fetchDataAndFilter() {
        fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb7zCNZEfozeuEwtKafE3U_himTnip925rNWnM6F4dZi6ZdVJ3n9Rlwnx26ur2iGxRfeRR5gyr8cJ/pub?gid=0&single=true&output=csv')
            .then(response => response.text())
            .then(csv => {
                let rows = csv.split('\n').map(row => row.trim()).filter(row => row); // Remove empty rows
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
                        programName.style.cursor = 'pointer'; // Show pointer cursor on hover
                        programName.addEventListener('click', function() {
                            const programLink = cols[3].trim(); // URL from the fourth column
                            if (programLink) {
                                window.open(programLink, '_blank'); // Open link in new tab
                            }
                        });
                        tr.appendChild(programName);

                        // Date (second column)
                        const date = document.createElement('td');
                        date.textContent = cols[1];
                        tr.appendChild(date);

                        // Revisions (third column)
                        const revisions = document.createElement('td');
                        revisions.textContent = cols[2];
                        tr.appendChild(revisions);

                        tableBody.appendChild(tr);
                    });
                }

                // Function to filter programs matching the specified intervals
                function filterPrograms(rows) {
                    let filteredRows = [];

                    rows.forEach(row => {
                        const cols = row.split(',');
                        const programDate = moment(cols[1], 'DD-MM-YYYY'); // Parse date using moment.js

                        // Compare dates with exact matches
                        if (programDate.isSame(today.clone().subtract(1, 'days'), 'day')) {
                            filteredRows.push(row); // Display under 1 Day category
                        } else if (programDate.isSame(today.clone().subtract(1, 'weeks'), 'day')) {
                            filteredRows.push(row); // Display under 1 Week category
                        } else if (programDate.isSame(today.clone().subtract(1, 'months'), 'day')) {
                            filteredRows.push(row); // Display under 1 Month category
                        } else if (programDate.isSame(today.clone().subtract(1, 'years'), 'day')) {
                            filteredRows.push(row); // Display under 1 Year category
                        }
                    });

                    return filteredRows;
                }

                // Filter and create table rows
                let filteredRows = filterPrograms(rows);

                if (filteredRows.length > 0) {
                    createTableRows(filteredRows);
                } else {
                    tableBody.innerHTML = '<tr><td colspan="3">Nothing to revise today. Enjoy your day!</td></tr>';
                }

                // Search functionality
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
                tableBody.innerHTML = '<tr><td colspan="3">Nothing to revise today. Enjoy your day!</td></tr>';
            });
    }

    // Initial data fetch and filter
    fetchDataAndFilter();
});
