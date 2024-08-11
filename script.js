/**
 * Author: Ajay Singh
 * Version: 1.4
 * Date: 01-07-2024
 * Description: JavaScript for handling date display, date picker, data fetching and filtering, search functionality, and date navigation buttons.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dateDisplay = document.getElementById('dateDisplay');
    const datePicker = document.getElementById('datePicker');
    const tableBody = document.querySelector('#dataTable tbody');
    const searchInput = document.getElementById('searchInput');
    const headerTitle = document.getElementById('headerTitle');
    const prevDayButton = document.getElementById('prevDay');
    const nextDayButton = document.getElementById('nextDay');
    const loadingElement = document.getElementById('loading');
    const dateAnnouncement = document.getElementById('dateAnnouncement'); // ARIA live region

    // Variables
    let today = moment();
    let flatpickrInstance;
    let allRows = [];
    let displayedRows = [];
    let isFetching = false;
    const DEBOUNCE_DELAY = 300;

    // Display the current date
    dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');

    // Initialize Flatpickr
    flatpickrInstance = flatpickr(datePicker, {
        defaultDate: today.format('YYYY-MM-DD'),
        position: 'above',
        onChange: (selectedDates) => {
            today = moment(selectedDates[0]);
            dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
            filterAndDisplayRows();
        }
    });

    // Show Flatpickr when dateDisplay is clicked
    dateDisplay.addEventListener('click', () => datePicker.click());

    // Reload Page on Header Click
    headerTitle.addEventListener('click', () => location.reload());

    // Function to handle link click events
    const handleLinkClick = (event, url) => {
        if (url && url.trim() && (event.button === 0)) {
            event.preventDefault(); // Prevent default action
            window.open(url.trim(), '_blank');
        }
    };

    // Parse CSV data
    const parseCSV = (csv) => {
        return csv.split('\n').map(row => row.trim()).filter(row => {
            const cols = row.split(',');
            return cols.length === 4 && cols[1];
        });
    };

    // Fetch data
    const fetchData = async () => {
        try {
            const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb7zCNZEfozeuEwtKafE3U_himTnip925rNWnM6F4dZi6ZdVJ3n9Rlwnx26ur2iGxRfeRR5gyr8cJ/pub?gid=0&single=true&output=csv');
            if (!response.ok) throw new Error('Network response was not ok');
            const csv = await response.text();
            const parsedData = parseCSV(csv);
            if (parsedData.length === 0) {
                console.warn('No data available in the CSV file.');
            }
            return parsedData;
        } catch (error) {
            console.error('Error fetching CSV file:', error);
            return [];
        }
    };

    // Fetch and filter data
    const fetchDataAndFilter = async () => {
        if (isFetching) return;
        isFetching = true;

        try {
            loadingElement.style.display = 'flex';
            allRows = await fetchData();
            filterAndDisplayRows();
        } finally {
            loadingElement.style.display = 'none';
            isFetching = false;
        }
    };

    // Filter rows based on the current date
    const filterAndDisplayRows = () => {
        console.log('Filtering rows for date:', today.format('DD-MM-YYYY'));
        displayedRows = allRows.filter(row => {
            const cols = row.split(',');
            const programDate = moment(cols[1], 'DD-MM-YYYY', true);
            console.log('Checking row date:', programDate.format('DD-MM-YYYY'), 'against', today.format('DD-MM-YYYY'));

            return programDate.isValid() &&
                   (programDate.isSame(today.clone().subtract(1, 'days'), 'day') ||
                    programDate.isSame(today.clone().subtract(15, 'days'), 'day') ||
                    programDate.isSame(today.clone().subtract(1, 'weeks'), 'day') ||
                    programDate.isSame(today.clone().subtract(1, 'months'), 'day') ||
                    programDate.isSame(today.clone().subtract(1, 'years'), 'day'));
        });

        if (displayedRows.length === 0) {
            console.log('No matching rows found.');
        }

        displayRows(displayedRows);
    };

    // Highlight search matches
    const highlightText = (text, searchText) => {
        const pattern = new RegExp(`(${searchText})`, 'gi');
        return text.replace(pattern, '<span class="highlight">$1</span>');
    };

    // Display rows in the table
    const displayRows = (rows) => {
        tableBody.innerHTML = '';
        if (rows.length > 0) {
            rows.forEach(row => {
                const cols = row.split(',');
                const tr = document.createElement('tr');

                const createTableCell = (content, className) => {
                    const cell = document.createElement('td');
                    cell.innerHTML = content;
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
        }, DEBOUNCE_DELAY);
    });

    // Update date and fetch data
    const updateDateAndFetchData = (daysToAdd) => {
        today = today.add(daysToAdd, 'days');
        dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
        flatpickrInstance.setDate(today.format('YYYY-MM-DD'), true);
        filterAndDisplayRows();
        // Removed date announcement update
    };

    prevDayButton.addEventListener('click', () => updateDateAndFetchData(-1));
    nextDayButton.addEventListener('click', () => updateDateAndFetchData(1));
});
