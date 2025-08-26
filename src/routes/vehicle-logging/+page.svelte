<script>
  import { onMount } from "svelte";
  import * as vehicleFuncs from "$lib/scripts/vehicle-logging";
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import DropdownField from "./DropdownField.svelte";
  import { get } from "svelte/store";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  const currentPath = get(page).url.pathname;

  function openDetails(row) {
    goto(`${base}/vehicle/${row["Trailer No."]}`, {
      state: {
        from: currentPath,
        trailer: row["Trailer No."],
      },
    });
  }

  let allEvents = [];
  let filteredEvents = [];
  let uniqueCities = [];
  let uniqueStates = [];
  let eventsLoading = true;
  let eventsError = null;
  let detailsVisible = [];

  // Search parameters
  let searchParams = {
    address: "",
    state: "",
    city: "",
    trailer: "",
    date: "",
    fuel: "",
  };

  let addressInput;
  let stateInput;
  let cityInput;
  let trailerInput;
  let dateInput;
  let fuelInput;
  let mobileSearchVisible = false;
  
  // Dropdown management
  let dropdownRefs = {};
  
  function handleDropdownOpen(openDropdownId) {
    // Close all other dropdowns
    Object.keys(dropdownRefs).forEach(dropdownId => {
      if (dropdownId !== openDropdownId && dropdownRefs[dropdownId]) {
        dropdownRefs[dropdownId].closeDropdown();
      }
    });
  }

  async function fetchEventsData() {
    try {
      eventsLoading = true;
      eventsError = null;
      console.log("Fetching prevented delivery events from API...");
      const response = await fetch(`/api/Vehicle_Logging`,{
        method:'GET',
        credentials:'include'
      }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Prevented Delivery Events Data Loaded:", data);

      allEvents = data;
      filteredEvents = [...allEvents];

      uniqueStates = [
        ...new Set(
          allEvents.map((row) => row.State).filter((s) => s && s.trim() !== "")
        ),
      ];
      uniqueCities = [
        ...new Set(
          allEvents.map((row) => row.City).filter((c) => c && c.trim() !== "")
        ),
      ];

      detailsVisible = Array(filteredEvents.length).fill(false);
      toggleLiveStatus(true);
    } catch (error) {
      console.error("Error fetching prevented delivery events:", error);
      eventsError =
        "Failed to load prevented delivery events data. Please try again.";
    } finally {
      eventsLoading = false;
    }
  }
  function formatDate(dateString) {
    if (!dateString) return "";

    const [day, month, year] = dateString.split(".");

    // (month is 0-based in JavaScript)
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const timeDiff = now - date;
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff <= 30) {
      return "Just now";
    }

    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return "Today";
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);
    if (
      date.getDate() === twoDaysAgo.getDate() &&
      date.getMonth() === twoDaysAgo.getMonth() &&
      date.getFullYear() === twoDaysAgo.getFullYear()
    ) {
      return "Two days ago";
    }

    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
  function formatEpochToDisplay(timestamp) {
    if (typeof timestamp !== "number" || isNaN(timestamp)) return "";
    const date = new Date(timestamp * 1000);
    return date
      .toLocaleDateString("en-GB", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  }

  function formatEpochToTime(timestamp) {
    if (typeof timestamp !== "number" || isNaN(timestamp)) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function getRowClass(index) {
    return index % 2 === 0 ? "row-even" : "row-odd";
  }

  function toggleMobileSearch() {
    mobileSearchVisible = !mobileSearchVisible;
  }

  function filterRows() {
    filteredEvents = allEvents.filter((event) => {
      const addressMatch =
        !searchParams.address ||
        (event.Address &&
          event.Address.toLowerCase().includes(
            searchParams.address.toLowerCase()
          ));

      const stateMatch =
        !searchParams.state ||
        (event.State &&
          event.State.toLowerCase().includes(searchParams.state.toLowerCase()));

      const cityMatch =
        !searchParams.city ||
        (event.City &&
          event.City.toLowerCase().includes(searchParams.city.toLowerCase()));

      const trailerMatch =
        !searchParams.trailer ||
        (event["Trailer No."] &&
          event["Trailer No."]
            .toLowerCase()
            .includes(searchParams.trailer.toLowerCase()));

      const eventDateStr = event.event_timestamp
        ? new Date(event.event_timestamp * 1000).toISOString().split("T")[0]
        : "";
      const dateMatch =
        !searchParams.date ||
        (eventDateStr && eventDateStr.includes(searchParams.date));

      const fuelMatch =
        !searchParams.fuel ||
        (event["Prevented Delivery "] &&
          event["Prevented Delivery "]
            .toLowerCase()
            .includes(searchParams.fuel.toLowerCase()));

      return (
        addressMatch &&
        stateMatch &&
        cityMatch &&
        trailerMatch &&
        dateMatch &&
        fuelMatch
      );
    });

    detailsVisible = Array(filteredEvents.length).fill(false);
    toggleLiveStatus();
  }

  function clearSearch() {
    console.log("Clearing search parameters.");
    searchParams = {
      address: "",
      state: "",
      city: "",
      trailer: "",
      date: "",
      fuel: "",
    };
    filteredEvents = [...allEvents];
    detailsVisible = Array(filteredEvents.length).fill(false);
    toggleLiveStatus(true);
  }

  function toggleDetails(index) {
    detailsVisible[index] = !detailsVisible[index];
    detailsVisible = detailsVisible;
  }

  // --- Export Functions ---
  function toggleDropdown() {
    document.getElementById("exportDropdown").classList.toggle("show");
  }

  function hasSearchInput() {
    const searchInputs = document.querySelectorAll(".search-fields input");
    return Array.from(searchInputs).some((input) => input.value.trim() !== "");
  }

  function exportTableToCSV() {
    let csv = [];
    // Updated headers to reflect content (Prevented Delivery is the main "Product" here)
    const headers = [
      "Date",
      "Time",
      "City",
      "Vehicle ID",
      "Prevented Delivery",
      "Address",
      "State",
      "Tank No.",
    ];

    csv.push(headers.join(","));

    filteredEvents.forEach((row) => {
      const date = formatEpochToDisplay(row.event_timestamp);
      const time = formatEpochToTime(row.event_timestamp);
      const cells = [
        `"${date}"`,
        `"${time}"`,
        `"${row.City || ""}"`,
        `"${row["Trailer No."] || ""}"`,
        `"${row["Prevented Delivery "] || ""}"`, // Only show prevented delivery here
        `"${row.Address || ""}"`,
        `"${row.State || ""}"`,
        `"T${row.tank_number || ""}"`,
      ];
      csv.push(cells.join(","));
    });

    const csvContent = csv.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    const formattedTime = date.toTimeString().split(" ")[0].replace(/:/g, "-");
    const pageType = "vehicle_logging";
    const fileName = `${pageType}_${formattedDate}_${formattedTime}.csv`;

    if ("showSaveFilePicker" in window) {
      async function saveToDisk() {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "CSV File",
                accept: {
                  "text/csv": [".csv"],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          if (err.name !== "AbortError") {
            fallbackSave(blob, fileName);
          }
        }
      }
      saveToDisk();
    } else {
      fallbackSave(blob, fileName);
    }
  }

  function fallbackSave(blob, fileName) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function exportTableToPDF() {
    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF) throw new Error("jsPDF library not found");

      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Vehicle Logging Data", 14, 15);

      const timestamp = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${timestamp}`, 14, 25);

      const headers = [
        "Date",
        "Time",
        "City",
        "Vehicle ID",
        "Prevented Delivery",
        "Address",
        "State",
        "Tank No.",
      ];
      const body = filteredEvents.map((row) => [
        formatEpochToDisplay(row.event_timestamp),
        formatEpochToTime(row.event_timestamp),
        row.City || "",
        row["Trailer No."] || "",
        row["Prevented Delivery "] || "", // Only show prevented delivery here
        row.Address || "",
        row.State || "",
        `T${row.tank_number || ""}`,
      ]);

      doc.autoTable({
        head: [headers],
        body: body,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          halign: "center",
        },
        headStyles: {
          fillColor: [1, 75, 150],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [234, 243, 252],
        },
        margin: { top: 30 },
      });

      const date = new Date();
      const formattedDate = date.toISOString().split("T")[0];
      const formattedTime = date
        .toTimeString()
        .split(" ")[0]
        .replace(/:/g, "-");
      const fileName = `vehicle_logging_${formattedDate}_${formattedTime}.pdf`;

      if ("showSaveFilePicker" in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "PDF File",
                accept: { "application/pdf": [".pdf"] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(doc.output("blob"));
          await writable.close();
        } catch (err) {
          console.error("File save error:", err);
          fallbackSavePDF(doc, fileName);
        }
      } else {
        fallbackSavePDF(doc, fileName);
      }

      return true;
    } catch (error) {
      console.error("PDF generation failed:", error);
      return false;
    }
  }

  function fallbackSavePDF(doc, fileName) {
    doc.save(fileName);
  }

  function toggleLiveStatus(forceShow = false) {
    const liveStatus = document.querySelector(".toggle-live");
    if (!liveStatus) return;

    if (!forceShow && hasSearchInput()) {
      liveStatus.style.display = "none";
    } else {
      liveStatus.style.display = "block";
    }
  }

  function setupMobileMenu() {
    const hamburger = document.getElementById("hamburger-menu");
    const sidebar = document.getElementById("mobile-sidebar");
    const overlay = document.getElementById("overlay");

    if (hamburger && sidebar && overlay) {
      // Check if elements exist
      hamburger.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        overlay.style.display = sidebar.classList.contains("active")
          ? "block"
          : "none";
      });

      overlay.addEventListener("click", function () {
        sidebar.classList.remove("active");
        overlay.style.display = "none";
      });

      const sidebarLinks = sidebar.querySelectorAll("a");
      sidebarLinks.forEach((link) => {
        link.addEventListener("click", function () {
          sidebar.classList.remove("active");
          overlay.style.display = "none";
        });
      });
    }
  }
  export function updateDateTime() {
    const datetimeElement = document.getElementById('current-datetime');
    
    // Only update if the element exists
    if (datetimeElement) {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      datetimeElement.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  onMount(async () => {
    setupMobileMenu();
    updateDateTime();
    vehicleFuncs.disableBrowserAutocomplete();
    const eventSource = new EventSource(
      `${PUBLIC_API_BASE_URL}/api/events/subscribe`
    );
    eventSource.onopen = () => {
      console.log("Connected to SSE stream.");
    };
    eventSource.addEventListener("dataUpdate", (event) => {
      console.log("Received SSE update:", event.data);
      const update = JSON.parse(event.data);

      if (update.type === "vehicleLogging") {
        console.log("Vehicle Logging data changed via SSE, re-fetching...");
        fetchEventsData();
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };
    await fetchEventsData();

    const interval = setInterval(updateDateTime, 1000);

    return () => {
      eventSource.close();
      console.log("SSE connection closed.");
      clearInterval(interval);
    };
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  <link href="{base}/css/styles.css" rel="stylesheet" />
  <script
    src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
  ></script>
  <title>Vehicle Logging</title>
</svelte:head>
<header>
  <div class="header-container">
    <div class="top-header">
      <a class="top-header-link" href="https://berrys.com">berrys.com</a>
      <a class="top-header-link" href=" ">Contact Us</a>
    </div>
    <div class="header">
      <div
        class="header-background"
        style="background: url({base}/svg/Vector_1.svg) no-repeat left center; mask-image: url({base}/svg/Vector_1.svg'); -webkit-mask-image: url({base}/svg/Vector_1.svg);"
      ></div>
      <div class="hamburger-menu" id="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <a href="{base}/home">Home</a>
      <a href="{base}/inventory">Inventory</a>
      <a href="{base}/cross-drops">Cross-Drop Prevention</a>
      <a href="{base}/site-data">Site Data</a>
      <a href="{base}/analytics">Analytics</a>
      <input type="text" placeholder="Search..." />
      <img src="{base}/images/Midas_Link_logo.png" alt="Berrys Logo" />
    </div>
  </div>
</header>
<div class="mobile-sidebar" id="mobile-sidebar">
  <a href="{base}/home">Home</a>
  <a href="{base}/vehicle-logging">Vehicle Logging</a>
  <a href="{base}/cross-drops">Cross-Drop Prevention</a>
  <a href="{base}/site-data">Site Data</a>
  <a href="{base}/inventory">Inventory</a>
  <a href="{base}/analytics">Analytics</a>
  <span class="footer-text"
    >Contact Us <br />
    Berrys Technologies Ltd 141 Lichfield Road, Birmingham , B6 5SP , United Kingdom
    <br />
    0121 558 4411 <br />
    enquiries@berrys.com</span
  >
</div>

<div class="overlay" id="overlay"></div>
<div class="sub-header-container">
  <div class="sub-header">
    <img
      src="{base}/images/Truck_graphic.png"
      alt="Truck Graphic"
      class="subheader-image"
    />
    <h1>Vehicle Logging</h1>
    <span>
      Access key information on each trailer, with real-time access to
      deliveries, focusing on trailer ID. See where trailers are located, what
      they are delivering or a full log on delivery history.
    </span>
  </div>
  <div class="breadcrumb">
    <a href="{base}/home">Home</a> / <span>Vehicle Logging</span>
  </div>
</div>
<main class="vehicle-logging-page">
  <div class="main-container">
    <button on:click={toggleMobileSearch} class="toggle-search-btn"
      ><label for="search-fields" class="search-label">
        Search <span style="font-size:1rem"
          >{mobileSearchVisible ? "▲" : "▼"}
        </span>
      </label>
    </button>
    <div class="search-fields" class:visible={mobileSearchVisible}>
      <label for="ST-address"> Address</label>
      <input
        type="text"
        bind:value={searchParams.address}
        id="ST-address"
        name="ST-address"
        on:keydown={(e) => {
          if (e.key === "Enter") filterRows();
        }}
      />
      <DropdownField
        id="State"
        label="State"
        options={uniqueStates}
        bind:value={searchParams.state}
        onDropdownOpen={handleDropdownOpen}
        bind:this={dropdownRefs["State"]}
        on:keydown={(e) => {
          if (e.key === "Enter") filterRows();
        }}
      />
      <DropdownField
        id="City"
        label="City"
        options={uniqueCities}
        bind:value={searchParams.city}
        onDropdownOpen={handleDropdownOpen}
        bind:this={dropdownRefs["City"]}
        on:keydown={(e) => {
          if (e.key === "Enter") filterRows();
        }}
      />
      <label for="Trailer_No">Trailer No</label>
      <input
        type="text"
        bind:value={searchParams.trailer}
        id="Trailer_No"
        name="Trailer_No"
        on:keydown={(e) => {
          if (e.key === "Enter") filterRows();
        }}
      />
      <label for="Date">Date</label>
      <input
        type="date"
        bind:value={searchParams.date}
        id="Date"
        name="Date"
        placeholder="YYYY-MM-DD"
        on:keydown={(e) => {
          if (e.key === "Enter") filterRows();
        }}
      />
      <label for="Fuel">Fuel</label>
      <input
        type="text"
        bind:value={searchParams.fuel}
        id="Fuel"
        name="Fuel"
        on:keydown={(e) => {
          if (e.key === "Enter") filterRows();
        }}
      />
      <div class="button-container">
        <button class="search-button" on:click={filterRows}>Search</button>
        <button class="clear-button" on:click={clearSearch}>Clear</button>
      </div>
    </div>

    <div class="table-header">
      <div class="live-status">
        <div class="toggle-live">
          <label for="table-type" class="table-type">
            LIVE
            <span class="live-indicator"></span>
          </label>
        </div>
        <label for="table-type" class="table-type">
          <span id="current-datetime" class="current-time"></span>
        </label>
      </div>
      <div class="export-dropdown">
        <button class="export-button" on:click={toggleDropdown}
          >Export As ▼</button
        >
        <div class="dropdown-content" id="exportDropdown">
          <a href=" " on:click|preventDefault={exportTableToCSV}>CSV</a>
          <a href=" " on:click|preventDefault={exportTableToPDF}>PDF</a>
        </div>
      </div>
    </div>

    <div class="data-container">
      <table class="desktop-view">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>City</th>
            <th>Vehicle ID</th>
            <th>Prevented Delivery</th>
          </tr>
        </thead>
        <tbody>
          {#if eventsLoading}
            <tr
              ><td colspan="5" style="text-align: center; padding: 20px;"
                >Loading events...</td
              ></tr
            >
          {:else if eventsError}
            <tr
              ><td
                colspan="5"
                style="text-align: center; padding: 20px; color: red;"
                >{eventsError}</td
              ></tr
            >
          {:else if filteredEvents.length > 0}
            {#each filteredEvents as row, index}
              <tr
                class="main-row {getRowClass(index)} {detailsVisible[index]
                  ? 'hover-row'
                  : ''}"
                on:click={() => toggleDetails(index)}
              >
                <td>{formatDate(formatEpochToDisplay(row.event_timestamp))}</td>
                <td>{formatEpochToTime(row.event_timestamp)}</td>
                <td>{row.City}</td>
                <td>{row["Trailer No."]}</td>
                <td>{row["Prevented Delivery "] || row.Delivered}</td>
              </tr>
              {#if detailsVisible[index]}
                <tr
                  class="details-row {getRowClass(index)}"
                  on:click={() => toggleDetails(index)}
                >
                  <td colspan="4" class="details-cell">
                    <div class="details-header">Details:</div>
                    <div class="details-content">
                      <div class="detail-row">
                        {formatDate(formatEpochToDisplay(row.event_timestamp))} | {formatEpochToTime(row.event_timestamp)}
                      </div>
                      <div class="detail-row">
                        <span class="label">Trailer No.:</span>
                        {row["Trailer No."]}
                      </div>
                      <div class="detail-row">
                        <span class="label">Full Address:</span>
                        {row.Address || ""}, {row.City} {row.State} 
                      </div>
                      <div class="detail-row">
                        <span class="label">Product:</span>
                        {row["Prevented Delivery "] || row.Delivered || ""} |
                        <span class="label">Tank:</span>
                        T{row.tank_number || ""}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      on:click={() => openDetails(row)}
                      class="more-details"
                    >
                      View Vehicle Timeline
                    </button>
                  </td>
                </tr>
              {/if}
            {/each}
          {:else}
            <tr>
              <td colspan="5" style="text-align: center; padding: 20px;"
                >No results found</td
              >
            </tr>
          {/if}
        </tbody>
      </table>

      <div class="mobile-card-view">
        {#if eventsLoading}
          <div class="loading-message" style="text-align: center;">
            Loading events...
          </div>
        {:else if eventsError}
          <div class="error-message" style="text-align: center;">
            {eventsError}
          </div>
        {:else if filteredEvents.length > 0}
          {#each filteredEvents as row, index}
            <div
              class="card {getRowClass(index)}"
              on:click={() => toggleDetails(index)}
            >
              <div class="card-header">
                <div class="card-item">
                  <span class="card-label">
                    {formatDate(
                      formatEpochToDisplay(row.event_timestamp)
                    )}</span
                  >
                </div>
                <div class="card-item">
                  <span class="card-value" style="margin-left: 2vw;"
                    >Product: {row["Prevented Delivery "] ||
                      row.Delivered}</span
                  >
                  <span class="card-value" style="margin-left: 2vw;"
                    >Vehicle: {row["Trailer No."]}</span
                  >
                  <span
                    class="card-value"
                    style="position: relative;margin-left:auto"
                  >
                    {detailsVisible[index] ? "▲" : "▼"}</span
                  >
                </div>
              </div>

              {#if detailsVisible[index]}
                <div class="card-details">
                  <hr />
                  <div class="details-header">Details:</div>
                  <div class="details-content">
                    <div class="detail-row">
                      {formatDate(formatEpochToDisplay(row.event_timestamp))} | {formatEpochToTime(
                        row.event_timestamp
                      )}
                    </div>
                    <div class="detail-row">
                      <span class="label">Trailer No:</span>
                      {row["Trailer No."]}
                    </div>
                    <div class="detail-row">
                      <span class="label">Full Address:</span>
                      {row.Address || ""}, {row.City || ""}
                      {row.State || ""}
                    </div>
                    <div class="detail-row">
                      <span class="label">Product:</span>
                      {row["Prevented Delivery "] || row.Delivered || ""}
                      <span class="label">Tank:</span>
                      T{row.tank_number || ""}
                    </div>
                    <button
                      on:click={() => openDetails(row)}
                      class="more-details mobile-details-btn"
                    >
                      View Vehicle Timeline
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        {:else}
          <div class="no-results" style="text-align: center;">
            No results found
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<footer>
  <div
    style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;"
  >
    <span style="font-size: 1rem; font-family: Mulish;"
      >@copyrights Berrys Global Innovations</span
    >
    <img src="{base}/images/logo.png" alt="Berrys Logo" />
  </div>
</footer>

<style>
  * {
    box-sizing: border-box;
  }
  .subheader-image {
    display: none;
  }
  main {
    flex: 1;
    background-color: #f9bc39;
  }
  ::placeholder {
    color: #5e5e5e;
    font-size: 0.875rem;
  }
  .data-container {
    width: 100%;
    margin-top: 2vh;
  }

  .mobile-card-view {
    display: none;
    width: 95%;
    margin: 0 auto;
  }
  .toggle-search-btn {
    display: none;
  }
  .card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
    padding: 15px;
    transition: all 0.3s ease;
    min-height: 10vh;
  }

  .card.row-even {
    background-color: #f8f9fa;
  }

  .card.row-odd {
    background-color: #eaf3fc;
  }

  .card-header {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    gap: 10px;
  }

  .card-item {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
  }

  .card-label {
    font-weight: bold;
    color: #014b96;
    font-size: 0.8rem;
    font-family: "Mulish", sans-serif;
  }

  .card-details {
    margin-top: 10px;
    padding-top: 10px;
  }

  .card-details hr {
    border: 0;
    height: 1px;
    background-color: #ddd;
    margin: 5px 0 10px 0;
  }

  .detail-row {
    margin-bottom: 8px;
    font-family: "Mulish", sans-serif;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .mobile-details-btn {
    margin-top: 10px;
    width: 100%;
  }

  .no-results {
    text-align: center;
    padding: 20px;
    font-family: "Mulish", sans-serif;
  }
  @media (max-width: 1000px) {
    .desktop-view {
      display: none;
    }
    .toggle-search-btn {
      display: contents;
    }
    .mobile-card-view {
      display: block;
    }
    .header a:nth-child(2) {
      margin-left: 5%;
    }
    * {
      font-size: 0.75rem;
    }
    .header img {
      max-height: 8vh;
      max-width: 100%;
      height: auto;
      width: auto;
      scale: 1.1;
      margin-left: auto;
    }
    .sub-header {
      padding-left: 5vw !important;
      font-size: 0.75rem !important;
    }
    .sub-header h1 {
      justify-self: center;
      font-size: 1.5rem !important;
    }
    .sub-header span {
      display: none;
    }
    .subheader-image {
      display: unset;
      width: 40%;
      height: 100%;
      justify-self: center;
      align-items: center;
    }
    .breadcrumb {
      display: none;
    }
    main {
      background-color: white;
    }
    .header a {
      display: none;
    }
    .header input {
      display: none;
    }

    table th {
      font-size: 0.6rem !important;
    }
    table tr {
      font-size: 0.75rem !important;
    }
    .search-button {
      padding: 0.5vh 0.5vw !important;
      margin-top: 0 !important;
      font-size: 0.75rem !important;
    }
    .clear-button {
      padding: 0.5vh 0.5vw !important;
      margin-top: 0 !important;
      font-size: 0.75rem !important;
    }
    .more-details {
      font-size: 0.75rem !important;
      padding: 0.25vh 1vw !important;
    }
    .search-fields {
      display: none;
      flex-wrap: wrap;
      margin: auto !important;
    }
    .main-container {
      font-size: 0.75rem !important;
    }
    .current-time {
      font-size: 0.75rem !important;
    }
    .table-type {
      font-size: 0.75rem !important;
    }
    .export-button {
      font-size: 0.75rem !important;
    }
    .search-fields label {
      min-width: 90px;
      margin: 0;
      padding: 8px 2vw;
      font-size: 14px !important;
      white-space: nowrap;
      align-self: initial !important;
    }
    .search-fields input {
      flex: 1;
      width: 100% !important;
      margin: 0 0 0 10px !important;
      padding: 8px !important;
      font-size: 14px !important;
    }
    .table-type,
    .current-time,
    .export-button,
    .more-details {
      font-size: 1rem !important;
    }
    .button-container {
      margin-top: 1vh !important;
    }
    .export-button {
      display: none;
    }
  }
  .header a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  .header input {
    width: 8vw;
  }
  .header input[type="text"] {
    padding: 1vh 3vh 1vh 3vh;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    outline: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23FFFFFF" viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>');
    background-repeat: no-repeat;
    background-size: 16px;
    background-position: 0.5vh center;
  }
  .header input[type="text"]::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  .sub-header-container {
    height: fit-content;
    position: relative;
    background-color: #f5f5f5;
    z-index: 1;
  }
  .sub-header {
    display: flex;
    align-items: center;
    padding-left: 5vh;
    padding-top: 2vh;
  }
  .sub-header span {
    padding-top: 2vh;
    padding-left: 5vw;
    font-family: "Mulish", sans-serif;
  }
  .sub-header h1 {
    color: #014b96;
    font-family: "Mulish", sans-serif;
    white-space: nowrap;
    font-weight: 400;
  }
  .breadcrumb {
    margin-top: 2vh;
    padding: 0.5vh 1vw;
    color: #014b96;
    background-color: #f9bc39;
    width: fit-content;
    border-radius: 20px;
    border-bottom-left-radius: 0px;
    border-top-left-radius: 0px;
  }
  .breadcrumb span,
  .breadcrumb a {
    font-family: "Mulish", sans-serif;
    text-decoration: none;
    color: #014b96;
    font-size: 0.875rem;
    font-weight: 700;
    font-style: bold;
  }
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: 4vh;
    padding-left: 1vw;
    padding-right: 1vw;
    border-top-left-radius: 20px;
    background-color: white;
    height: 100%;
  }
  .search-label {
    font-family: "Mulish", sans-serif;
    font-size: 2rem;
    font-weight: 400;
    color: #014b96;
    margin-bottom: 2vh;
    align-self: center;
  }
  .search-fields {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 0 7vw;
  }
  .search-fields label {
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    align-self: center;
  }
  .search-fields input {
    background-color: #eaf3fc;
    border: none;
    margin-left: 1vw;
    margin-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 1vh;
    padding-left: 0.2vw;
    width: 7vw;
    border-radius: 10px;
  }
  .search-button {
    background-color: #014b96;
    color: white;
    border-radius: 4px;
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    margin-top: 2vh;
    text-transform: uppercase;
    display: inline-block;
    margin-right: 2vh;
    max-height: fit-content;
    padding: 0.25vh 1vw;
  }
  .search-button:hover {
    background-color: #012f5e;
  }
  .clear-button {
    background-color: #014b96;
    color: white;
    border-radius: 4px;
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    margin-top: 2vh;
    text-transform: uppercase;
    display: inline-block;
    max-height: fit-content;
    padding: 0.25vh 1vw;
  }
  .clear-button:hover {
    background-color: #012f5e;
  }
  .button-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 2vh;
  }
  .table-type {
    font-family: "Mulish", sans-serif;
    font-size: 1.75rem;
    font-weight: 400;
    color: #014b96;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .live-indicator {
    width: 12px;
    height: 12px;
    background-color: #ff0000;
    border-radius: 2px;
    display: inline-block;
  }
  .data-container {
    max-height: 70vh;
    overflow-y: auto;
    border-radius: 10px;
  }
  
  table {
    margin-top: 1vh;
    margin-left: auto;
    margin-right: auto;
    border-collapse: collapse;
    width: 100%;
    border-radius: 10px;
    position: relative;
    margin-bottom: 5vh;
  }
  
  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #004b96;
  }
  
  thead tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  
  tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  th,
  td {
    font-family: "Mulish", sans-serif;
    text-align: center;
    padding: 16px !important;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  table th {
    padding-left: 1vw;
    padding-right: 1vw;
    background-color: #004b96;
    color: white;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  tr {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .export-button {
    background-color: #014b96;
    color: white;
    padding: 0.5vh 2vh;
    border-radius: 4px;
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    margin-left: auto;
    transition: background-color 0.3s ease;
    width: 10vw;
  }
  .export-button:hover {
    background-color: #013b77;
  }
  .table-header {
    display: flex;
    align-items: center;
    width: 90%;
    margin: 0 5vw;
    z-index: 2;
  }
  .export-dropdown {
    position: relative;
    display: inline-block;
    margin-left: auto;
    z-index: 1000;
  }
  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    background-color: #f9f9f9;
    min-width: 120px;
    width: 10vw;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    border-radius: 4px;
  }
  .dropdown-content a {
    color: #014b96;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    font-family: "Mulish", sans-serif;
    justify-self: center;
  }
  .dropdown-content a:hover {
    background-color: #eaf3fc;
  }
  .show {
    display: block;
  }
  .current-time {
    font-family: "Mulish", sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #014b96;
    padding-left: 1vw;
  }
  .live-status {
    display: flex;
    align-items: center;
  }
  .toggle-live {
    margin-right: 15px;
  }
  .search-fields input::placeholder {
    font-size: 0.75rem;
  }
  .main-row {
    transition: background-color 0.3s ease;
    position: relative;
    padding-bottom: 3vh;
  }
  .row-even {
    background-color: #f8f9fa;
  }
  .row-odd {
    background-color: #eaf3fc;
  }

  .row-even.details-row {
    background-color: #f8f9fa;
  }
  .row-odd.details-row {
    background-color: #eaf3fc;
  }
  .hover-row td {
    text-align: center !important;
  }
  .details-row {
    background-color: inherit;
    transition: opacity 0.3s ease;
  }
  .details-cell {
    padding: 8px 15px !important;
    text-align: left;
    color: #000000;
    white-space: pre-line;
    line-height: 1;
    vertical-align: top;
  }
  .details-header {
    color: #014b96;
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 4px;
  }
  .details-content {
    color: #000000;
    line-height: 2;
  }
  .details-content .label {
    color: #000000;
    font-weight: bold;
  }
  .more-details {
    background-color: #014b96;
    color: white;
    padding: 0.5vh 2vh;
    border-radius: 4px;
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    margin-left: auto;
    transition: background-color 0.3s ease;
  }
  :global(.vehicle-logging-page .search-fields label) {
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    align-self: center;
  }
  .more-details:hover {
    background-color: #013b77;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
    display: none;
  }

  @media (max-width: 1000px) {
    .search-fields {
      display: none;
      flex-wrap: wrap;
      transition: all 0.3s ease;
      flex-direction: column;
      width: 100%;
      padding: 0 10px;
    }
    :global(.search-fields) {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0 10px;
    }

    /* Create rows for label + input pairs */
    :global(.search-fields > div),
    :global(.search-fields > label) + input {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin-bottom: 10px;
      align-items: center;
    }

    /* Style labels */
    :global(.search-fields label) {
      min-width: 90px;
      margin: 0;
      padding: 8px 2vw;
      font-size: 14px !important;
      white-space: nowrap;
      align-self: initial !important;
    }

    /* Style inputs */
    :global(.search-fields input) {
      flex: 1;
      width: 100% !important;
      margin: 0 0 0 10px !important;
      padding: 8px !important;
      font-size: 14px !important;
    }

    /* Fix dropdown components */
    :global(.custom-dropdown) {
      display: flex !important;
      width: 100% !important;
      margin-bottom: 10px;
    }

    :global(.custom-dropdown input) {
      flex: 1;
      width: 100% !important;
      padding: 8px !important;
      margin: 0 0 0 10px !important;
      height: 32px !important;
    }
    .header-background {
      top: 25% !important;
      height: 75% !important;
    }
    .search-fields.visible {
      display: flex;
      padding: 0 5vw;
    }
  }
</style>
