/* Author: Ajay Singh */
/* Version: 1.2 */
/* Date: 2024-07-01 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const dateDisplay = document.getElementById('dateDisplay');
    const datePicker = document.getElementById('datePicker');
    const tableBody = document.querySelector('#dataTable tbody');
    const searchInput = document.getElementById('searchInput');
    const headerTitle = document.getElementById('headerTitle');

    // Initialize the current date
    let today = moment();

    // Display the current date
    dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');

    // Initialize Flatpickr
    flatpickr(datePicker, {
        defaultDate: today.format('YYYY-MM-DD'),
        onChange: (selectedDates) => {
            today = moment(selectedDates[0]);
            dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
            fetchDataAndFilter();
        }
    });

    // Show Flatpickr when dateDisplay is clicked
    dateDisplay.addEventListener('click', () => datePicker.click());

    // Reload page on header click
    headerTitle.style.cursor = 'pointer';
    headerTitle.addEventListener('click', () => location.reload());

    /**
     * Fetch CSV data from the given URL.
     * @returns {Promise<string>} CSV data as a string.
     */
    const fetchCSVData = async () => {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb7zCNZEfozeuEwtKafE3U_himTnip925rNWnM6F4dZi6ZdVJ3n9Rlwnx26ur2iGxRfeRR5gyr8cJ/pub?gid=0&single=true&output=csv');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.text();
        } catch (error) {
            console.error('Error fetching CSV file:', error);
            throw error;
        }
    };

    /**
     * Parse CSV data into rows.
     * @param {string} csv - CSV data as a string.
     * @returns {Array<string>} Array of rows.
     */
    const parseCSV = (csv) => csv
        .split('\n')
        .map(row => row.trim())
        .filter(row => row);

    /**
     * Create and append table rows.
     * @param {Array<string>} rows - Array of rows.
     */
    const createTableRows = (rows) => {
        rows.forEach(row => {
            const cols = row.split(',');
            const tr = document.createElement('tr');

            // Create and append Program Name cell
            const programName = document.createElement('td');
            programName.textContent = cols[0];
            programName.classList.add('program-name');
            programName.style.cursor = 'pointer';
            programName.addEventListener('click', () => {
                const programLink = cols[3]?.trim();
                if (programLink) {
                    window.open(programLink, '_blank');
                }
            });
            tr.appendChild(programName);

            // Create and append Date cell
            const date = document.createElement('td');
            date.textContent = cols[1];
            tr.appendChild(date);

            // Create and append Revisions cell
            const revisions = document.createElement('td');
            revisions.textContent = cols[2];
            tr.appendChild(revisions);

            tableBody.appendChild(tr);
        });
    };

    /**
     * Filter rows based on the current date.
     * @param {Array<string>} rows - Array of rows.
     * @returns {Array<string>} Filtered rows.
     */
    const filterPrograms = (rows) => {
        return rows.filter(row => {
            const cols = row.split(',');
            const programDate = moment(cols[1], 'DD-MM-YYYY');

            return programDate.isSame(today.clone().subtract(1, 'days'), 'day') ||
                   programDate.isSame(today.clone().subtract(1, 'weeks'), 'day') ||
                   programDate.isSame(today.clone().subtract(1, 'months'), 'day') ||
                   programDate.isSame(today.clone().subtract(1, 'years'), 'day');
        });
    };

    /**
     * Fetch, parse, filter data, and update the table.
     */
    const fetchDataAndFilter = async () => {
        try {
            const csv = await fetchCSVData();
            const rows = parseCSV(csv);
            tableBody.innerHTML = '';

            const filteredRows = filterPrograms(rows);

            if (filteredRows.length > 0) {
                createTableRows(filteredRows);
            } else {
                tableBody.innerHTML = '<tr><td colspan="3">Nothing to revise today. Enjoy your day!</td></tr>';
            }
        } catch {
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
            Array.from(tableBody.children).forEach(tr => {
                const cells = Array.from(tr.children);
                const rowMatch = cells.some(td => {
                    const cellText = td.textContent.trim().toLowerCase();
                    const isMatch = cellText.includes(searchText);
                    td.innerHTML = isMatch
                        ? cellText.replace(new RegExp(searchText, 'gi'), match => `<span class="highlight">${match}</span>`)
                        : cellText;
                    return isMatch;
                });

                tr.style.display = rowMatch ? '' : 'none';
            });
        }, 300); // Debounce delay
    });
});
