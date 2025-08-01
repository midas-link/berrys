<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  let dataLoading = true;
  let dataLoadingError = null;
  export let data ; 
  async function fetchData() {
    try {
      const res = await fetch(`/api/Inventory`, {
        method:'GET',
        credentials:'include'
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `HTTP error! Status: ${res.status}. Message: ${errorData.error || res.statusText}`
        );
      }
      rows = await res.json();
    } catch (error) {
      console.error("Failed to load inventory data", error);
      dataLoadingError = `Failed to load data : ${error.message || error}`;
    } finally {
      dataLoading = false;
    }
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

    // Close the sidebar when clicking on a link
    const sidebarLinks = sidebar.querySelectorAll("a");
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", function () {
        sidebar.classList.remove("active");
        overlay.style.display = "none";
      });
    });
  }
  let rows = [];
  onMount(async () => {
    await fetchData();
    setupMobileMenu();
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="{base}/css/styles.css" rel="stylesheet" />
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  <title>Inventory</title>
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
      <a href="{base}/site-data"> Site Data</a>
      <a href="{base}/analytics">Analytics</a>
      <input type="text" placeholder="Search..." />
      <img src="{base}/images/Midas_Link_logo.png" alt="Berrys Logo" />
    </div>
  </div>
</header>
<!-- Mobile sidebar navigation -->
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
    <h1>Inventory</h1>
    <span>
      View your inventory - each Elbow is assigned a trailer that can be
      identified from the UID on the Link box. This way, you can manage how many
      trailer's and Elbow's are being discovered, as well as which trailers your
      Midas Elbows are assigned too.
    </span>
  </div>
  <div class="breadcrumb">
    <a href="{base}/home">Home</a> / <span>Inventory</span>
  </div>
</div>
<main>
  <div class="main-container">
    <div class="profile-details">
      <div class="header-profile">
        <img src="{base}/images/NicePng_gray.png" alt="profile-logo" />
        <div class="header-profile-name">{data.user.firstName} {data.user.lastName} </div>
      </div>
      <div class="header-company">
        <img
          class="company-logo"
          src={data.user.companyImage ? data.user.companyImage : `${base}/images/circle-k-logo.png`}
                    alt="company-logo"
        />
        <div class="header-role">(Area Manager)</div>
      </div>
    </div>
    <div class="trailer-container">
      <div class="trailer-container-content">
        <img src="{base}/images/Link_device.png" alt="Link_device" />
        <span class="trailers-count"> Active Trailers </span>
        <span class="trailers-count-number"> 100</span>
      </div>
    </div>
    <div class="midas-container">
      <div class="midas-container-content">
        <img
          src="{base}/images/Midas_Elbow_close_up.png"
          alt="Midas_Elbow_close_up"
        />
        <span class="midas-count"> Active Midas </span>
        <span class="midas-count-number"> 52</span>
      </div>
    </div>

    <div class="inventory-table-container">
      <table class="inventory-table">
        <thead>
          <tr
            ><th>Midas #1</th>
            <th>Midas #2</th>
            <th>Trailer</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {#if dataLoading}
            <tr>
              <td colspan="4" class="loading-message" style="text-align: center;">Loading events...</td>
            </tr>
          {:else if dataLoadingError}
            <tr>
              <td colspan="4" class="error-message" style="text-align: center;">{dataLoadingError}</td>
            </tr>
          {:else if rows.length > 0}
            {#each rows as item}
              <tr>
                <td>{item["Midas #1"]}</td>
                <td>{item["Midas #2"]}</td>
                <td>{item["Trailer"]}</td>
                <td>{item["Location"]}</td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="4" class="no-events" style="text-align: center;">No data to display</td>
            </tr>
          {/if}
        </tbody>
      </table>
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
    flex: 1;
    background-color: #f9bc39;
  }
  ::placeholder {
    color: #ffffff;
  }
  @media (max-width: 1000px) {
    .header a:nth-child(2) {
      margin-left: 5%;
    }
    .header img {
      max-height: 8vh;
      max-width: 100%;
      height: auto;
      width: auto;
      scale: 1.2;
      margin-left: auto;
    }
    .sub-header {
      padding-left: 1vh;
    }
    .header a {
      display: none;
    }
    .header input {
      display: none;
    }
    * {
      font-size: 0.75rem !important;
    }
  }
  @media (max-width: 1000px) {
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
    .header-background {
      top: 25% !important;
      height: 75% !important;
    }
    .sub-header {
      display: grid !important;
      padding-left: 5vw !important;
      font-size: 0.75rem !important;
    }
    .sub-header h1 {
      justify-self: center;
      font-size: 1.4rem !important;
    }
    .sub-header span {
      padding-left: 0 !important;
      padding-bottom: 2vh;
    }
    .breadcrumb {
      display: none;
    }
    main {
      background-color: white;
    }

    .header a {
      white-space: nowrap;
      padding-left: 1.5vw;
    }
    .header input[type="text"] {
      display: none;
    }
    .sub-header {
      padding-left: 2vw !important;
      min-height: 10vh;
    }
    .sub-header span {
      display: none;
    }
    * {
      font-size: 0.75rem !important;
    }
    .midas-container-content {
      width: 100vw !important;
    }
    .trailer-container img {
      margin-left: -30vw !important;
      width: 90% !important;
    }

    .midas-container-content img {
      margin-left: 0 !important;
      width: 90% !important;
    }
    .trailers-count-number {
      margin-right: 4vw;
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
    align-items: center;
    padding-top: 4vh;
    border-top-left-radius: 20px;
    background-color: white;
    height: 100%;
  }
  .header-role,
  .header-profile-name {
    text-align: center;
    padding-top: 1vh;
    padding-left: 0.5vw;
    padding-bottom: 1vh;
    font-size: 1rem;
    font-family: Mulish;
    font-weight: 600;
  }
  .header-profile img {
    width: 6vh;
    height: 6vh;
    display: block;
    margin: 0 auto;
  }
  .header-company img {
    width: 54px;
    height: 6vh;
    display: block;
    margin: 0 auto;
  }
  .profile-details {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .trailer-container {
    border-radius: 10px;
    background-color: transparent;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 2vh;
  }
  .trailer-container-content {
    background-color: #eaf3fc;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2vh;
    width: 105vw;
    height: 140px;
    margin-left: calc(50% - 176px);
    padding-left: 2vw;
  }
  .trailer-container-content span {
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    font-weight: 700;
  }
  .trailer-container img {
    width: 352px;
    height: 166px;
    scale: 1.2;
    margin-left: -10vw;
  }
  .midas-container {
    border-radius: 10px;
    background-color: transparent;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: end;
    padding-right: 4vw;
  }
  .midas-container-content {
    margin-top: 0;
    background-color: #eaf3fc;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    align-items: end;
    justify-content: flex-end;
    gap: 2vh;
    width: 110vw;
    height: 140px;
    margin-right: calc(50% - 200px);
    padding-left: 1vw;
    padding-right: 2vw;
  }
  .midas-container img {
    width: 300px;
    height: 140px;
    scale: 1.2;
    margin-bottom: 1.5vh;
    padding-right: 2vw;
  }
  .midas-container-content span {
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    font-weight: 700;
    align-self: center;
  }
  .inventory-table-container {
    width: 80%;
    margin: 2vh auto;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-height: 500px;
    display: flex;
    flex-direction: column;
  }
  .inventory-table {
    width: 100%;
    border-collapse: collapse;
    font-family: "Mulish", sans-serif;
    table-layout: fixed;
  }
  .inventory-table thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #014b96;
  }
  .inventory-table th {
    background-color: #014b96;
    color: white;
    padding: 1vh 1vw;
    text-align: left;
    font-weight: 600;
  }
  .inventory-table tbody {
    display: block;
    overflow-y: auto;
    max-height: 450px;
  }
  .inventory-table thead tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .inventory-table tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .inventory-table th,
  .inventory-table td {
    padding: 1vh 1vw;
    border-bottom: 1px solid #eaf3fc;
  }
  .inventory-table tr:hover {
    background-color: #eaf3fc;
  }
  .inventory-table th:nth-child(1),
  .inventory-table td:nth-child(1) {
    width: 25%;
  }
  .inventory-table th:nth-child(2),
  .inventory-table td:nth-child(2) {
    width: 25%;
  }
  .inventory-table th:nth-child(3),
  .inventory-table td:nth-child(3) {
    width: 25%;
  }
  .inventory-table th:nth-child(4),
  .inventory-table td:nth-child(4) {
    width: 25%;
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
</style>
