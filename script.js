document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dateDisplay = document.getElementById('dateDisplay');
    const datePicker = document.getElementById('datePicker');
    const tableBody = document.querySelector('#dataTable tbody');
    const searchInput = document.getElementById('searchInput');
    const headerTitle = document.getElementById('headerTitle');
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');

    // Variables
    let today = moment(); // Current date using moment.js

    // Display current date
    dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');

    // Initialize Flatpickr with explicit position settings
    flatpickr(datePicker, {
        defaultDate: today.format('YYYY-MM-DD'),
        position: 'above', // Set position to 'above' to adjust manually
        onChange: (selectedDates) => {
            today = moment(selectedDates[0]); // Update today's date
            dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
            fetchDataAndFilter(); // Update the data display
        }
    });

    // Show Flatpickr when dateDisplay is clicked
    dateDisplay.addEventListener('click', () => datePicker.click());

    // Reload Page on Header Click
    headerTitle.addEventListener('click', () => location.reload());

    // Function to handle link click events
    const handleLinkClick = (event, url) => {
        if (url && (event.button === 0 || event.button === 1)) {
            window.open(url.trim(), '_blank');
        }
    };

    // Fetch and display data from CSV
    const fetchDataAndFilter = async () => {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb7zCNZEfozeuEwtKafE3U_himTnip925rNWnM6F4dZi6ZdVJ3n9Rlwnx26ur2iGxRfeRR5gyr8cJ/pub?gid=0&single=true&output=csv');
            if (!response.ok) throw new Error('Network response was not ok');
            const csv = await response.text();
            const rows = csv.split('\n').map(row => row.trim()).filter(row => row); // Remove empty rows
            tableBody.innerHTML = ''; // Clear existing data

            // Filter programs scheduled for review after specified intervals
            const filteredRows = rows.filter(row => {
                const cols = row.split(',');
                const programDate = moment(cols[1], 'DD-MM-YYYY'); // Parse date using moment.js
                return programDate.isSame(today.clone().subtract(1, 'days'), 'day') ||
                       programDate.isSame(today.clone().subtract(15, 'days'), 'day') ||
                       programDate.isSame(today.clone().subtract(1, 'weeks'), 'day') ||
                       programDate.isSame(today.clone().subtract(1, 'months'), 'day') ||
                       programDate.isSame(today.clone().subtract(1, 'years'), 'day');
            });

            if (filteredRows.length > 0) {
                filteredRows.forEach(row => {
                    const cols = row.split(',');
                    const tr = document.createElement('tr');

                    const createTableCell = (content, className) => {
                        const cell = document.createElement('td');
                        cell.textContent = content;
                        if (className) {
                            cell.classList.add(className);
                        }
                        return cell;
                    };

                    const programNameCell = createTableCell(cols[0], 'program-name');
                    programNameCell.style.cursor = 'pointer';
                    programNameCell.addEventListener('mousedown', (event) => handleLinkClick(event, cols[3]));
                    tr.appendChild(programNameCell);

                    tr.appendChild(createTableCell(cols[1]));
                    tr.appendChild(createTableCell(cols[2]));

                    tableBody.appendChild(tr);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="3">Nothing to revise today. Enjoy your day!</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching CSV file:', error);
            tableBody.innerHTML = '<tr><td colspan="3">Nothing to revise today. Enjoy your day!</td></tr>';
        }
    };

    // Initial data fetch and filter
    fetchDataAndFilter();

    // Search functionality with debouncing
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const searchText = searchInput.value.trim().toLowerCase();
            const rows = Array.from(tableBody.children);
            rows.forEach(tr => {
                let rowMatch = false; // Flag to track if any cell in the row matches
                for (let i = 0; i < 3; i++) {
                    const td = tr.children[i];
                    const col = td.textContent.trim();
                    if (col.toLowerCase().includes(searchText)) {
                        rowMatch = true; // Set flag to true if any cell matches
                        const pattern = new RegExp(searchText, 'gi'); // 'gi' for global and case-insensitive match
                        td.innerHTML = col.replace(pattern, match => `<span class="highlight">${match}</span>`);
                    } else {
                        td.innerHTML = col; // Reset original text if no match
                    }
                }
                tr.style.display = rowMatch ? '' : 'none'; // Show or hide row based on match
            });
        }, 300); // Debounce delay
    });

    // Date navigation buttons functionality
    prevDayButton.addEventListener('click', () => {
        today = today.subtract(1, 'days');
        dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
        fetchDataAndFilter();
    });

    nextDayButton.addEventListener('click', () => {
        today = today.add(1, 'days');
        dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
        fetchDataAndFilter();
    });
});
