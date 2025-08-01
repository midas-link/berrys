<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  const currentPath = get(page).url.pathname;
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  function saveStateToSession() {
    const state = {
      address: $page.state?.address,
      city: $page.state?.city,
      state: $page.state?.state,
      date: $page.state?.date,
      siteCode: $page.state?.siteCode,
      from: $page.state?.from,
    };
    localStorage.setItem("deliveryDetailState", JSON.stringify(state));
  }

  function loadStateFromSession() {
    const savedState = localStorage.getItem("deliveryDetailState");
    if (savedState) {
      const state = JSON.parse(savedState);
      $page.state = {
        ...$page.state,
        ...state,
      };
    }
  }

  function gotoVehicle() {
    saveStateToSession();
    goto(`${base}/vehicle/HDY674`, {
      state: {
        from: currentPath,
        trailer: "HDY674",
      },
    });
  }

  $: address = $page.state?.address;
  $: city = $page.state?.city;
  $: State = $page.state?.state;
  $: date = $page.state?.date;
  $: siteCode = $page.state?.siteCode;
  $: previousURL = $page.state?.from;

  function formatDate(dateString) {
    if (!dateString) return "";

    const [day, month, year] = dateString.split(".");

    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) return dateString; 

    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
  function setupMobileMenu() {
    const hamburger = document.getElementById("hamburger-menu");
    const sidebar = document.getElementById("mobile-sidebar");
    const overlay = document.getElementById("overlay");

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
  function toggleDropdown() {
    document.getElementById("exportDropdown").classList.toggle("show");
  }
  function exportTableToCSV() {
    const originalTable = document.querySelector("table");
    const tableClone = originalTable.cloneNode(true);

    const buttons = tableClone.querySelectorAll(".more-details");
    buttons.forEach((button) => {
      button.parentNode.textContent = ""; 
    });

    const rows = tableClone.querySelectorAll("tr");
    let csv = [];

    const headers = [];
    const headerCells = rows[0].querySelectorAll("th");
    headerCells.forEach((cell) => {
      headers.push(cell.textContent.trim());
    });
    const fullAddress = `Delivery to:${address} ${city} ${State}`;
    headers.push(fullAddress);
    csv.push(headers.join(","));

    for (let i = 1; i < rows.length; i++) {
      const row = [];
      const cells = rows[i].querySelectorAll("td");
      cells.forEach((cell) => {
        let content = cell.textContent.trim().replace(/"/g, '""');
        row.push(`"${content}"`);
      });
      if (row.length > 0) {
        csv.push(row.join(","));
      }
    }

    const csvContent = csv.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = date.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
    const pageType = document.location.pathname.includes("vehicle-logging")
      ? "vehicle_logging"
      : "delivery-details";
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
            fallbackSave();
          }
        }
      }
      saveToDisk();
    } else {
      fallbackSave();
    }

    function fallbackSave() {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async function exportTableToPDF() {
    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF) throw new Error("jsPDF library not found");

      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Delivery Details Data for:", 14, 15);

      const fullAddress = `${address}, ${city} ${State}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`\n${fullAddress}\n`, 14, 15);

      const timestamp = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${timestamp}`, 14, 25);

      const originalTable = document.querySelector("table"); 
      if (!originalTable) throw new Error("Table not found");

      const exportTable = originalTable.cloneNode(true);

      const buttons = exportTable.querySelectorAll(".more-details");
      buttons.forEach((button) => {
        const cell = button.closest("td, th");
        if (cell) cell.textContent = "";
      });

      doc.autoTable({
        html: exportTable,
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
      const fileName = `delivery_details_${formattedDate}_${formattedTime}.pdf`;

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
  function closeDropdown(event) {
    if (!event.target.matches(".export-button")) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.remove("show");
        }
      }
    }
  }
  onMount(() => {
    setupMobileMenu();
    loadStateFromSession();
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script
    src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
  ></script>
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  <link href="{base}/css/styles.css" rel="stylesheet" />
  <title>Delivery Detail</title>
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
        style="      background: url({base}/svg/Vector_1.svg) no-repeat left center; mask-image: url({base}/svg/Vector_1.svg'); -webkit-mask-image: url({base}/svg/Vector_1.svg);"
      ></div>
      <div class="hamburger-menu" id="hamburger-menu">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <a href="{base}/home">Home</a>
      <a href="{base}/cross-drops">Cross-Drop Prevention</a>
      <a href="{base}/vehicle-logging">Vehicle Logging</a>
      <a href="{base}/site-data">Site Data</a>
      <a href="{base}/inventory">Inventory</a>
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
    <img src="{base}/images/Gas_station_graphic.png" alt="gas_station" />
    <h1>
      Delivery Detail <span class="mobile-delivery-date"
        >-{formatDate(date)}
      </span>
    </h1>
    <span> View below delivery details from {formatDate(date)} </span>
  </div>
  <div class="breadcrumb">
    <a href="{base}/home">Home</a><a href="{base}{previousURL}">{previousURL}</a
    >/<span> Delivery Detail</span>
  </div>
</div>
<main>
  <div class="main-container">
    <span class="address-details">
      <span class="delivery-address"> {address}, {city} {State} </span>
      <span class="address-siteCode">Site Code:{siteCode} </span>
    </span>
    <div class="delivery-details">
      <span class="delivery-time"> Total Delivery Time: 36 mins </span>
      <span> Compartments Loaded : 5 </span>
    </div>
    <div class="trailer-report">
      <a class="trailer-id" on:click={() => gotoVehicle()}>Trailer: HDY674</a>
      <div class="export-dropdown">
        <button class="export-button" on:click={toggleDropdown}
          >Export As ▼</button
        >
        <div class="dropdown-content" id="exportDropdown">
          <button href=" " on:click|preventDefault={exportTableToCSV}
            >CSV</button
          >
          <button href=" " on:click|preventDefault={exportTableToPDF}
            >PDF</button
          >
        </div>
      </div>
    </div>
    <div class="data-container">
      <table class="desktop-view">
        <thead>
          <tr>
            <th></th>
            <th>Time(duration)</th>
            <th>Tank</th>
            <th>Tank Grade</th>
            <th>Delivery Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Session 1</td>
            <td>13:03-13:12(9 mins)</td>
            <td>2</td>
            <td>Diesel 2#</td>
            <td>Good Fuel</td>
          </tr>
          <tr>
            <td>Session 2</td>
            <td>13:03-13:12(9 mins)</td>
            <td>2</td>
            <td>Diesel 2#</td>
            <td>Good Fuel</td>
          </tr>
          <tr>
            <td>Session 3</td>
            <td>13:03-13:12(9 mins)</td>
            <td>2</td>
            <td>GAS 87 OCTANE 10.0%</td>
            <td>Good Fuel</td>
          </tr>
          <tr style="color:red">
            <td>Session 4</td>
            <td>13:36 No Drop</td>
            <td>1</td>
            <td>GAS 87 OCTANE 10.0%</td>
            <td>Cross-drop</td>
          </tr>
          <tr>
            <td>Session 5</td>
            <td>13:39-13:44(5 mins)</td>
            <td>1</td>
            <td>GAS 87 OCTANE 10.0%</td>
            <td>Good Fuel</td>
          </tr>
          <tr>
            <td>Session 6</td>
            <td>13:48-13:54(4 mins)</td>
            <td>3</td>
            <td>GAS 87 OCTANE 10.0%</td>
            <td>Good Fuel</td>
          </tr>
        </tbody>
      </table>
      <div class="mobile-view">
        <div class="trailer-id-container">
          <a class="mob-trailer-id" on:click={() => gotoVehicle()}
            >Trailer: HDY674</a
          >
        </div>
        <table>
          <tbody>
            <tr>
              <td>1</td>
              <td>13:03-13:12</td>
              <td>Tank #2</td>
              <td>Diesel 2#</td>
              <td>Good Fuel</td>
            </tr>
            <tr>
              <td>2</td>
              <td>13:03-13:12</td>
              <td>Tank #2</td>
              <td>Diesel 2#</td>
              <td>Good Fuel</td>
            </tr>
            <tr>
              <td>3</td>
              <td>13:03-13:12</td>
              <td>Tank #2</td>
              <td>GAS 87 OCTANE 10.0%</td>
              <td>Good Fuel</td>
            </tr>
            <tr style="color:red">
              <td>4</td>
              <td>13:36 No Drop</td>
              <td>Tank #1</td>
              <td>GAS 87 OCTANE 10.0%</td>
              <td>Cross-drop</td>
            </tr>
            <tr>
              <td>5</td>
              <td>13:39-13:44</td>
              <td>Tank #1</td>
              <td>GAS 87 OCTANE 10.0%</td>
              <td>Good Fuel</td>
            </tr>
            <tr>
              <td>6</td>
              <td>13:48-13:54</td>
              <td>Tank #3</td>
              <td>GAS 87 OCTANE 10.0%</td>
              <td>Good Fuel</td>
            </tr>
          </tbody>
        </table>
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
  main {
    flex: 1; /* Allow main to grow and fill the space */
    background-color: #f9bc39;
    flex-direction: column;
    margin-bottom: 5vh;
  }
  ::placeholder {
    color: #ffffff;
  }
  .mobile-view {
    display: none;
    width: 95%;
    margin: 0 auto;
  }
  @media (max-width: 1000px) {
    .desktop-view {
      display: none;
    }
    .mobile-view {
      display: grid;
      width: 100vw;
    }
    .header a:nth-child(2) {
      margin-left: 5%;
    }
    .header img {
      max-height: 8vh;
      max-width: 100%;
      height: auto;
      width: auto;
      scale: 1.1;
      margin-left: auto;
    }
    .export-button {
      display: none;
    }
    .breadcrumb {
      display: none;
    }
    .trailer-report {
      display: none !important;
    }
    main {
      background-color: white;
    }
    .address-siteCode,
    .delivery-address {
      font-weight: 500 !important;
      font-size: 1rem !important;
      align-self: center;
      margin: auto;
    }
    .address-details {
      display: grid;
    }
    .sub-header span {
      display: none;
    }
    .sub-header h1 {
      font-size: 1rem !important;
      font-weight: 400 !important;
    }
    .mobile-delivery-date {
      display: contents !important;
      font-size: 1rem !important;
    }
    .trailer-id-container {
      width: 100%;
      background-color: #004b96;
      height: 4vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mob-trailer-id {
      color: white;
      text-decoration: underline;
    }
    .header a {
      display: none;
    }
    .header input {
      display: none;
    }
    .delivery-details {
      background-color: #eaf3fc !important;
      color: #014b96;
      width: 100% !important;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500 !important;
      font-size: 1rem !important;
      height: 3vh;
    }
    .header-background {
      top: 25% !important;
      height: 75% !important;
    }
    .sub-header {
      margin: auto;
      padding-left: 0 !important;
    }
    .sub-header img {
      width: 30% !important;
      height: 30% !important;
    }
    * {
      font-size: 0.75rem !important;
    }
    table {
      width: 100% !important;
      margin-top: 0 !important;
    }
    table tr {
      max-height: 2vh !important;
    }
    table td {
      height: 8vh !important;
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
    padding: 1vh 1.5vw;
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
    padding-left: 5vw;
    padding-top: 2vh;
  }
  .sub-header img {
    width: 10%;
    height: 10%;
  }
  .sub-header span {
    align-self: center;
    margin: auto;
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
  .trailer-id {
    align-self: center;
    margin: auto;
    font-size: 1.25rem;
    text-decoration: underline;
  }
  .trailer-id:hover {
    color: #004b96;
    cursor: pointer;
  }
  .breadcrumb span,
  .breadcrumb a {
    font-family: "Mulish", sans-serif;
    text-decoration: none;
    color: #014b96;
    font-size: 0.875rem;
    font-weight: 700;
    font-style: bold;
    text-transform: capitalize;
  }
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  .address-details {
    font-family: "Mulish", sans-serif;
    font-size: 2rem;
    font-weight: 400;
    color: #014b96;
    margin-bottom: 2vh;
    align-self: center;
  }
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: 4vh;
    border-top-left-radius: 20px;
    background-color: white;
    height: 100%;
  }
  .delivery-time {
    margin-right: 4vw;
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
  .delivery-details {
    align-self: center;
    font-size: 1.25rem;
  }
  .trailer-report {
    display: grid;
    align-items: center;
    width: 90%;
    margin: 2vh auto 0 auto;
  }
  table {
    height: fit-content;
    width: fit-content;
    align-self: center;
    justify-content: space-between;
    border-collapse: collapse;
    max-height: 70vh;
    margin-top: 1vh;
    margin-left: auto;
    margin-right: auto;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 5vh;
    width: 95%;
  }
  thead {
    background-color: #f5f5f5;
    padding: 0;
    margin: 0;
  }
  tbody tr:nth-child(odd) {
    background-color: white;
  }
  tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }
  thead tr,
  tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  thead tr {
    width: calc(100% - 1px);
  }
  tbody tr {
    width: 100%;
  }
  th,
  td {
    font-family: "Mulish", sans-serif;
    text-align: center;
    padding: 16px !important;
    width: 25%;
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
  .export-button {
    background-color: #014b96;
    color: white;
    padding: 0.5vh 2vw;
    border-radius: 4px;
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    margin-left: auto;
    transition: background-color 0.3s ease;
  }
  .export-button:hover {
    background-color: #013b77;
  }
  .export-dropdown {
    position: relative;
    display: inline-block;
    margin-left: auto;
    z-index: 2;
  }
  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    background-color: #f9f9f9;
    min-width: 120px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    border-radius: 4px;
  }
  .dropdown-content button {
    color: #014b96;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    font-family: "Mulish", sans-serif;
    width: 100%;
    border: 0;
  }
  .dropdown-content button:hover {
    background-color: #eaf3fc;
  }
  :global(.show) {
    display: block !important;
  }
</style>
