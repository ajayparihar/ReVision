document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const dateDisplay = document.getElementById('dateDisplay');
    const datePicker = document.getElementById('datePicker');
    const tableBody = document.querySelector('#dataTable tbody');
    const searchInput = document.getElementById('searchInput');
    const headerTitle = document.getElementById('headerTitle');

    // Initialize the current date
    let today = moment();

    /**
     * Update the date display element with the formatted current date.
     */
    const updateDateDisplay = () => {
        dateDisplay.textContent = today.format('dddd, DD MMMM YYYY');
    };

    /**
     * Initialize the Flatpickr date picker.
     */
    const initializeFlatpickr = () => {
        flatpickr(datePicker, {
            defaultDate: today.format('YYYY-MM-DD'),
            onChange: (selectedDates) => {
                today = moment(selectedDates[0]);
                updateDateDisplay();
                fetchDataAndFilter();
            }
        });
    };

    /**
     * Handle the header click event to reload the page.
     */
    const setupHeaderClick = () => {
        headerTitle.style.cursor = 'pointer';
        headerTitle.addEventListener('click', () => location.reload());
    };

    /**
     * Fetch CSV data from the specified URL.
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
     * Parse CSV data into an array of rows.
     * @param {string} csv - CSV data as a string.
     * @returns {Array<string>} Array of rows.
     */
    const parseCSV = (csv) => {
        return csv
            .split('\n')
            .map(row => row.trim())
            .filter(row => row);
    };

    /**
     * Create and append table rows based on the provided data.
     * @param {Array<string>} rows - Array of rows.
     */
    const createTableRows = (rows) => {
        rows.forEach(row => {
            const cols = row.split(',');
            const tr = document.createElement('tr');

            // Create and append Program Name cell
            const programNameCell = createTableCell(cols[0], 'program-name');
            programNameCell.addEventListener('click', () => {
                const programLink = cols[3]?.trim();
                if (programLink) {
                    window.open(programLink, '_blank');
                }
            });
            tr.appendChild(programNameCell);

            // Create and append Date cell
            const dateCell = createTableCell(cols[1]);
            tr.appendChild(dateCell);

            // Create and append Revisions cell
            const revisionsCell = createTableCell(cols[2]);
            tr.appendChild(revisionsCell);

            tableBody.appendChild(tr);
        });
    };

    /**
     * Create a table cell with the given content and optional class.
     * @param {string} content - Cell content.
     * @param {string} [className] - Optional class name for the cell.
     * @returns {HTMLTableCellElement} The created table cell.
     */
    const createTableCell = (content, className) => {
        const cell = document.createElement('td');
        cell.textContent = content;
        if (className) {
            cell.classList.add(className);
        }
        return cell;
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

    /**
     * Highlight search terms in the table.
     */
    const highlightSearchTerms = () => {
        const searchText = searchInput.value.trim().toLowerCase();
        const rows = Array.from(tableBody.children);

        rows.forEach(tr => {
            const cells = Array.from(tr.children);
            let rowMatch = false;

            cells.forEach(td => {
                const cellText = td.textContent.trim();
                const lowerCellText = cellText.toLowerCase();
                const highlightedText = searchText
                    ? cellText.replace(new RegExp(`(${searchText})`, 'gi'), '<span class="highlight">$1</span>')
                    : cellText;

                td.innerHTML = highlightedText;

                if (lowerCellText.includes(searchText)) {
                    rowMatch = true;
                }
            });

            tr.style.display = rowMatch ? '' : 'none';
        });
    };

    /**
     * Set up search functionality with debouncing.
     */
    const setupSearch = () => {
        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(highlightSearchTerms, 300);
        });
    };

    // Initialize functionalities
    updateDateDisplay();
    initializeFlatpickr();
    setupHeaderClick();
    setupSearch();

    // Initial data fetch and filter
    fetchDataAndFilter();
});
