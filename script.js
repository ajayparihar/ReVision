/**
 * Author: Ajay Singh
 * Version: 1.3
 * Date: 01-07-2024
 * Description: JavaScript for handling date display, date picker, data fetching and filtering, search functionality, and date navigation buttons.
 */

// Wait for the DOM to fully load before executing the script
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
    let flatpickrInstance; // Variable to store flatpickr instance
    let allRows = []; // Store all rows fetched from CSV
    let displayedRows = []; // Store currently displayed rows for searching
    let isFetching = false; // Prevent overlapping fetch requests
    const DEBOUNCE_DELAY = 300; // Debounce delay for search input

    // Display the current date
    dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');

    // Initialize Flatpickr with explicit position settings
    flatpickrInstance = flatpickr(datePicker, {
        defaultDate: today.format('YYYY-MM-DD'),
        position: 'above', // Set position to 'above' to adjust manually
        onChange: (selectedDates) => {
            today = moment(selectedDates[0]); // Update today's date
            dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
            filterAndDisplayRows(); // Update the data display based on the new date
        }
    });

    // Show Flatpickr when dateDisplay is clicked
    dateDisplay.addEventListener('click', () => datePicker.click());

    // Reload Page on Header Click
    headerTitle.addEventListener('click', () => location.reload());

    // Function to handle link click events
    const handleLinkClick = (event, url) => {
        if (url && url.trim() && (event.button === 0 || event.button === 1)) {
            const trimmedUrl = url.trim();
            if (trimmedUrl) {
                window.open(trimmedUrl, '_blank');
            }
        }
    };

    // Fetch and filter data from CSV
    const fetchDataAndFilter = async () => {
        if (isFetching) return; // Prevent overlapping fetch requests
        isFetching = true;

        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb7zCNZEfozeuEwtKafE3U_himTnip925rNWnM6F4dZi6ZdVJ3n9Rlwnx26ur2iGxRfeRR5gyr8cJ/pub?gid=0&single=true&output=csv');
            if (!response.ok) throw new Error('Network response was not ok');
            const csv = await response.text();
            const rows = csv.split('\n').map(row => row.trim()).filter(row => {
                // Ensure the row has the expected number of columns
                const cols = row.split(',');
                return cols.length === 4 && cols[1]; // Ensure the date column (cols[1]) is not empty
            });
            allRows = rows;
            filterAndDisplayRows(); // Filter and display rows based on the current date
        } catch (error) {
            console.error('Error fetching CSV file:', error);
            tableBody.innerHTML = '<tr><td colspan="3">Nothing to revise today. Enjoy your day!</td></tr>';
        } finally {
            isFetching = false;
        }
    };

    // Filter rows based on the current date
    const filterAndDisplayRows = () => {
        displayedRows = allRows.filter(row => {
            const cols = row.split(',');
            const programDate = moment(cols[1], 'DD-MM-YYYY', true); // 'true' for strict parsing
            return programDate.isValid() &&
                   (programDate.isSame(today.clone().subtract(1, 'days'), 'day') ||
                    programDate.isSame(today.clone().subtract(15, 'days'), 'day') ||
                    programDate.isSame(today.clone().subtract(1, 'weeks'), 'day') ||
                    programDate.isSame(today.clone().subtract(1, 'months'), 'day') ||
                    programDate.isSame(today.clone().subtract(1, 'years'), 'day'));
        });
        displayRows(displayedRows); // Display the rows filtered by date
    };

    // Highlight search matches
    const highlightText = (text, searchText) => {
        const pattern = new RegExp(`(${searchText})`, 'gi'); // Match searchText globally and case-insensitive
        return text.replace(pattern, '<span class="highlight">$1</span>');
    };

    // Display rows in the table
    const displayRows = (rows) => {
        tableBody.innerHTML = ''; // Clear existing data
        if (rows.length > 0) {
            rows.forEach(row => {
                const cols = row.split(',');
                const tr = document.createElement('tr');

                const createTableCell = (content, className) => {
                    const cell = document.createElement('td');
                    cell.innerHTML = content; // Use innerHTML to handle highlighted content
                    if (className) {
                        cell.classList.add(className);
                    }
                    return cell;
                };

                const programNameCell = createTableCell(highlightText(cols[0], searchInput.value.trim().toLowerCase()), 'program-name');
                programNameCell.style.cursor = 'pointer';
                programNameCell.addEventListener('mousedown', (event) => handleLinkClick(event, cols[3]));
                tr.appendChild(programNameCell);

                tr.appendChild(createTableCell(highlightText(cols[1], searchInput.value.trim().toLowerCase())));
                tr.appendChild(createTableCell(highlightText(cols[2], searchInput.value.trim().toLowerCase())));

                tableBody.appendChild(tr);
            });
        } else {
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
            if (searchText.length === 0) {
                // When the search input is cleared, display rows based on the current date filter
                filterAndDisplayRows();
                return;
            }

            const rows = displayedRows.filter(row => {
                const cols = row.split(',');
                return cols.some(col => col.toLowerCase().includes(searchText));
            });

            if (rows.length > 0) {
                displayRows(rows);
            } else {
                tableBody.innerHTML = '<tr><td colspan="3">No matching records found.</td></tr>';
            }
        }, DEBOUNCE_DELAY); // Debounce delay
    });

    // Date navigation buttons functionality
    const updateDateAndFetchData = (daysToAdd) => {
        today = today.add(daysToAdd, 'days');
        dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
        flatpickrInstance.setDate(today.format('YYYY-MM-DD'), true); // Update Flatpickr date
        filterAndDisplayRows(); // Filter and display rows based on the updated date
    };

    prevDayButton.addEventListener('click', () => updateDateAndFetchData(-1));
    nextDayButton.addEventListener('click', () => updateDateAndFetchData(1));
});
