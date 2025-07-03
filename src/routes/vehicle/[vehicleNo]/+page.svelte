<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  export let data;
  $: trailer = data.trailerNumber || $page.state?.trailer;

  $: previousURL = $page.state?.from;
  const currentPath = get(page).url.pathname;

  let allTimelineEvents = [];
  let timelineLoading = true;
  let timelineError = null;
  let displayedTimelineEvents = [];
  let activeView = "monthly";
  let currentDisplayDate = new Date();
  let isSidebarActive = false;
  let searchBy = "day";
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - i);
  let selectedValue = "";

  $: if (searchBy) {
    selectedValue = "";
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
  function goToSelectedDate() {
    if (!selectedValue) return; // Do nothing if no value is selected

    const newDate = new Date(currentDisplayDate);

    if (searchBy === "day") {
      // Set the day while keeping current month and year
      newDate.setDate(parseInt(selectedValue));
      currentDisplayDate = newDate;

      // Switch to daily view when selecting a specific day
      changeView("daily");
    } else if (searchBy === "month") {
      // Set the month while keeping current year
      newDate.setMonth(parseInt(selectedValue) - 1); // Months are 0-indexed in JS
      newDate.setDate(1); // Set to first day of the month
      currentDisplayDate = newDate;

      // Switch to monthly view when selecting a specific month
      changeView("monthly");
    } else if (searchBy === "year") {
      // Set the year while keeping the current month
      newDate.setFullYear(parseInt(selectedValue));
      currentDisplayDate = newDate;

      // Could optionally switch to yearly view here if implemented
      changeView("monthly"); // Default to monthly view for now when selecting a year
    }

    // Update displayed events
    displayedTimelineEvents = filterEvents();
  }
  function openDetails(event) {
    goto(`${base}/deliveryDetail/${event.Zip}`, {
      state: {
        from: currentPath,
        address: event.Address,
        city: event.City,
        state: event.State,
        date: formatEventDate(event.event_timestamp),
        time: formatEpochToTime(event.event_timestamp),
        siteCode: event.Zip,
      },
    });
  }

  function gotoVehicle(vehicleNum) {
    goto(`${base}/vehicle/${vehicleNum}`, {
      state: {
        trailer: vehicleNum,
      },
    });
  }

  function handleBreadcrumbNavigation() {
    if (previousURL) {
      goto(`${base}${previousURL}`);
    } else {
      goto(`${base}/vehicle-logging`);
    }
  }

  function parseEpochToDate(epochSeconds) {
    if (typeof epochSeconds !== "number" || isNaN(epochSeconds)) return null;
    return new Date(epochSeconds * 1000);
  }

  function formatDisplayDate(date) {
    if (!date) return "";
    if (activeView === "daily") {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } else if (activeView === "weekly") {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday is 0

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startOptions = { month: "long", day: "numeric" };
      const endOptions = { month: "long", day: "numeric", year: "numeric" };

      if (
        startOfWeek.getMonth() === endOfWeek.getMonth() &&
        startOfWeek.getFullYear() === endOfWeek.getFullYear()
      ) {
        return `${startOfWeek.toLocaleDateString("en-US", { day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", endOptions)}`;
      }

      return `${startOfWeek.toLocaleDateString("en-US", startOptions)} - ${endOfWeek.toLocaleDateString("en-US", endOptions)}`;
    } else if (activeView === "monthly") {
      const options = { year: "numeric", month: "long" };
      return date.toLocaleDateString("en-US", options);
    } else {
      return date.getFullYear().toString();
    }
  }

  function formatEventDate(epochSeconds) {
    const date = parseEpochToDate(epochSeconds);
    if (isNaN(date?.getTime())) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  function sortEventsByDate(events) {
    return [...events].sort((a, b) => a.event_timestamp - b.event_timestamp);
  }

  function filterEvents() {
    const sortedEvents = sortEventsByDate(allTimelineEvents);

    if (activeView === "daily") {
      return sortedEvents.filter((event) => {
        const eventDate = parseEpochToDate(event.event_timestamp);
        return (
          eventDate &&
          eventDate.getDate() === currentDisplayDate.getDate() &&
          eventDate.getMonth() === currentDisplayDate.getMonth() &&
          eventDate.getFullYear() === currentDisplayDate.getFullYear()
        );
      });
    } else if (activeView === "weekly") {
      const startOfWeek = new Date(currentDisplayDate);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(
        currentDisplayDate.getDate() - currentDisplayDate.getDay()
      );

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return sortedEvents.filter((event) => {
        const eventDate = parseEpochToDate(event.event_timestamp);
        return eventDate && eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    } else {
      // Monthly view (default)
      return sortedEvents.filter((event) => {
        const eventDate = parseEpochToDate(event.event_timestamp);
        return (
          eventDate &&
          eventDate.getMonth() === currentDisplayDate.getMonth() &&
          eventDate.getFullYear() === currentDisplayDate.getFullYear()
        );
      });
    }
  }

  function navigateTimeline(direction) {
    const newDate = new Date(currentDisplayDate);
    if (activeView === "daily") {
      newDate.setDate(
        currentDisplayDate.getDate() + (direction === "left" ? -1 : 1)
      );
    } else if (activeView === "weekly") {
      newDate.setDate(
        currentDisplayDate.getDate() + (direction === "left" ? -7 : 7)
      );
    } else {
      // Monthly view
      newDate.setMonth(
        currentDisplayDate.getMonth() + (direction === "left" ? -1 : 1)
      );
    }
    currentDisplayDate = newDate; // Update reactive variable
    displayedTimelineEvents = filterEvents(); // Re-filter and update displayed events
  }

  function changeView(view) {
    activeView = view; // Update reactive variable
    displayedTimelineEvents = filterEvents(); // Re-filter and update displayed events
  }

  function getPosition(index, total) {
    const minPosition = 5; // 5% from the left edge
    const maxPosition = 95; // 5% from the right edge
    const availableSpace = maxPosition - minPosition;

    if (total === 1) return 50; // Center if only one event
    return minPosition + (availableSpace / (total - 1)) * index;
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
  async function fetchEventsData() {
    if (!trailer) {
      // Don't fetch if no trailer is set
      timelineError = "No trailer selected.";
      timelineLoading = false;
      allTimelineEvents = []; // Clear previous data
      displayedTimelineEvents = []; // Clear displayed data
      return;
    }

    try {
      timelineLoading = true;
      timelineError = null;
      console.log(`Fetching timeline data for trailer: ${trailer} from API...`);
      const response = await fetch(
        `${PUBLIC_API_BASE_URL}/api/Vehicle_Logs/${trailer}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${errorData.error || response.statusText}`
        );
      }
      const data = await response.json();
      console.log(`Timeline data for trailer ${trailer} loaded:`, data);

      allTimelineEvents = data; // Populated with new fetched data

      // Reset currentDisplayDate to today when a new trailer is loaded
      currentDisplayDate = new Date();
      // --- MODIFIED: Ensure changeView is called to filter the new data ---
      changeView(activeView); // Re-filter and update displayed events based on the new 'allTimelineEvents'
    } catch (error) {
      console.error(
        `Failed to load timeline data for trailer ${trailer}:`,
        error
      );
      timelineError = `Failed to load timeline data for ${trailer}: ${error.message || error}`;
      allTimelineEvents = [];
      displayedTimelineEvents = [];
    } finally {
      timelineLoading = false;
    }
  }
  $: if (trailer) {
    fetchEventsData();
  }
  onMount(async () => {
    setupMobileMenu();
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
  <title>Vehicle Detail</title>
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

<div class="mobile-sidebar" id="mobile-sidebar" class:active={isSidebarActive}>
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
    <img src="{base}/images/Truck_graphic.png" alt="truck_graphic" />
    <h1>Vehicle {trailer}</h1>
    <span>
      Using the time line, hover your mouse above each event to find the
      delivery detail. You can set the timeline to show delivery daily, weekly
      or monthly.
    </span>
  </div>
  <div class="breadcrumb">
    <a href="{base}/home">Home</a><a
      href="javascript:void(0)"
      on:click={handleBreadcrumbNavigation}>{previousURL}</a
    >/<span> Vehicle Details</span>
  </div>
</div>

<main>
  <div class="main-container">
    <span class="main-container-header"> Timeline </span>

    <div class="search-fields">
      <div class="field-pair">
        <label for="search-by">Search By:</label>
        <select id="search-by" name="dates" bind:value={searchBy}>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div class="field-pair">
        <label for="select">Select:</label>

        {#if searchBy === "day"}
          <select id="select" bind:value={selectedValue}>
            <option value="" disabled selected>Select a day</option>
            {#each dayOptions as day}
              <option value={day}>{day}</option>
            {/each}
          </select>
        {:else if searchBy === "month"}
          <select id="select" bind:value={selectedValue}>
            <option value="" disabled selected>Select a month</option>
            {#each monthOptions as month}
              <option value={month.value}>{month.label}</option>
            {/each}
          </select>
        {:else if searchBy === "year"}
          <select id="select" bind:value={selectedValue}>
            <option value="" disabled selected>Select a year</option>
            {#each yearOptions as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
        {/if}
      </div>

      <div class="field-pair">
        <button
          class="go-to-btn"
          on:click={goToSelectedDate}
          disabled={!selectedValue}
        >
          Go To
        </button>
      </div>
    </div>

    <div class="timeline-navigation desktop-timeline">
      <img
        src="{base}/svg/left-arrow.svg"
        alt="left-arrow"
        class="left-arrow"
        on:click={() => navigateTimeline("left")}
      />

      <div class="timeline-container">
        <div class="current-period">
          {#if timelineLoading}
            Loading...
          {:else if timelineError}
            Error
          {:else}
            {formatDisplayDate(currentDisplayDate)}
          {/if}
        </div>

        <div class="timeline">
          <div class="timeline-line"></div>

          {#if timelineLoading}
            <div
              class="loading-message"
              style="text-align: center; width: 100%;"
            >
              Loading events...
            </div>
          {:else if timelineError}
            <div class="error-message" style="text-align: center; width: 100%;">
              {timelineError}
            </div>
          {:else if displayedTimelineEvents.length > 0}
            {#each displayedTimelineEvents as event, i}
              <div
                class="timeline-event"
                style="left: {getPosition(i, displayedTimelineEvents.length)}%"
              >
                <div class="timeline-dot"></div>
                <div class="timeline-date">
                  {formatEventDate(event.event_timestamp)}
                </div>
                <div class="timeline-popup">
                  <h3>{event.Address}, {event.City}, {event.State}</h3>
                  <p>
                    <strong>Date:</strong>
                    {formatEventDate(event.event_timestamp)}
                  </p>
                  <p>
                    <strong>Time:</strong>
                    {formatEpochToTime(event.event_timestamp)}
                  </p>
                  <p><strong>Tank #:</strong> {event["Tank No. "]}</p>
                  <p><strong>Trailer #:</strong> {event["Trailer No."]}</p>
                  <p>
                    <strong>Product:</strong>
                    {event["Prevented Delivery "] || event.Delivered}
                  </p>
                  <button
                    on:click={() => openDetails(event)}
                    class="more-details"
                  >
                    See Delivery Details
                  </button>
                </div>
              </div>
            {/each}
          {:else}
            <div class="no-events">No events to display for this period</div>
          {/if}
        </div>

        <div class="timeline-controls">
          <button
            class="timeline-view-btn {activeView === 'daily' ? 'active' : ''}"
            on:click={() => changeView("daily")}
          >
            Daily
          </button>
          <button
            class="timeline-view-btn {activeView === 'weekly' ? 'active' : ''}"
            on:click={() => changeView("weekly")}
          >
            Weekly
          </button>
          <button
            class="timeline-view-btn {activeView === 'monthly' ? 'active' : ''}"
            on:click={() => changeView("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      <img
        src="{base}/svg/right-arrow.svg"
        alt="right-arrow"
        class="right-arrow"
        on:click={() => navigateTimeline("right")}
      />
    </div>

    <div class="mobile-timeline">
      <div class="current-period">
        {#if timelineLoading}
          Loading...
        {:else if timelineError}
          Error
        {:else}
          {formatDisplayDate(currentDisplayDate)}
        {/if}
      </div>

      <div class="vertical-timeline">
        {#if displayedTimelineEvents.length > 0}
          <div class="timeline-line"></div>
        {/if}

        {#if timelineLoading}
          <div class="loading-message" style="text-align: center;">
            Loading events...
          </div>
        {:else if timelineError}
          <div class="error-message" style="text-align: center;">
            {timelineError}
          </div>
        {:else if displayedTimelineEvents.length > 0}
          {#each displayedTimelineEvents as event, i}
            <div
              class="vertical-timeline-event {i % 2 === 0 ? 'left' : 'right'}"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-date">
                {formatEventDate(event.event_timestamp)}
              </div>
              <div class="timeline-popup">
                <h3>{event.Address}, {event.City}, {event.State}</h3>
                <p>
                  <strong>Date:</strong>
                  {formatEventDate(event.event_timestamp)}
                </p>
                <p>
                  <strong>Time:</strong>
                  {formatEpochToTime(event.event_timestamp)}
                </p>
                <p><strong>Tank #:</strong> {event["Tank No. "]}</p>
                <p><strong>Trailer #:</strong> {event["Trailer No."]}</p>
                <p>
                  <strong>Product:</strong>
                  {event["Prevented Delivery "] || event.Delivered}
                </p>
                <button
                  on:click={() => openDetails(event)}
                  class="more-details"
                >
                  See Delivery Details
                </button>
              </div>
            </div>
          {/each}
        {:else}
          <div class="no-events">No events to display for this period</div>
        {/if}
      </div>

      <div class="timeline-controls">
        <img
          src="{base}/svg/left-arrow.svg"
          alt="left-arrow"
          class="left-arrow"
          on:click={() => navigateTimeline("left")}
        />
        <button
          class="timeline-view-btn {activeView === 'daily' ? 'active' : ''}"
          on:click={() => changeView("daily")}
        >
          Daily
        </button>
        <button
          class="timeline-view-btn {activeView === 'weekly' ? 'active' : ''}"
          on:click={() => changeView("weekly")}
        >
          Weekly
        </button>
        <button
          class="timeline-view-btn {activeView === 'monthly' ? 'active' : ''}"
          on:click={() => changeView("monthly")}
        >
          Monthly
        </button>
        <img
          src="{base}/svg/right-arrow.svg"
          alt="right-arrow"
          class="right-arrow"
          on:click={() => navigateTimeline("right")}
        />
      </div>
    </div>

    <div class="other-vehicle">
      <label for="another-vehicle">
        Looking for another vehicle? Search:
      </label>
      <input
        id="another-vehicle"
        class="another-vehicle"
        on:keydown={(e) => {
          if (e.key === "Enter") {
            gotoVehicle(e.target.value);
            e.target.value = "";
          }
        }}
      />
      <button
        class="another-vehicle"
        style="color:white;background-color:#014B96"
        on:click={() => {
          const input = document.getElementById("another-vehicle");
          if (input) {
            gotoVehicle(input.value);
            input.value = "";
          }
        }}
      >
        Go to Vehicle
      </button>
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
  .more-details {
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
    max-height: fit-content;
    text-wrap: nowrap;
  }
  main {
    flex: 1;
    background-color: #f9bc39;
    flex-direction: column;
    margin-bottom: 5vh;
  }

  ::placeholder {
    color: #ffffff;
  }

  .no-events {
    justify-self: center;
  }

  @media (max-width: 1000px) {
    .header a:nth-child(2) {
      margin-left: 5%;
    }
    .main-container {
      padding-left: 0 !important;
    }
    .main-container-header {
      font-size: 2rem !important;
    }
    .header img {
      max-height: 8vh;
      max-width: 100%;
      height: auto;
      width: auto;
      scale: 1.1;
      margin-left: auto;
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
    .sub-header span {
      display: none;
    }
    .header input {
      display: none;
    }
    .sub-header h1 {
      font-size: 1.5rem !important;
    }

    .sub-header {
      margin: auto;
    }
    .sub-header img {
      width: 30% !important;
      height: 30% !important;
    }

    * {
      font-size: 0.75rem !important;
    }
    img.left-arrow {
      height: 30px !important;
      margin-right: 7vw;
      margin-left: 4vw !important;
    }
    img.right-arrow {
      height: 30px !important;
      margin-left: 3vw;
      margin-right: 4vw !important;
    }
    .another-vehicle {
      max-width: 20vw !important;
      width: 20vw;
    }
    .field-pair select,
    .field-pair label {
      margin: auto;
    }
    .field-pair select {
      margin-left: 0 !important;
      max-width: 25vw !important;
    }
    .field-pair button {
      margin: auto;
    }
    footer img {
      max-height: 10vh;
      max-width: 30%;
      height: auto;
      width: auto !important;
    }
    .main-container {
      overflow-x: hidden;
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

  .sub-header img {
    width: 10%;
    height: 10%;
  }

  .sub-header span {
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
    text-transform: capitalize;
  }

  .breadcrumb a:hover {
    text-decoration: underline;
  }

  .main-container {
    padding-top: 4vh;
    padding-left: 4vh;
    border-top-left-radius: 20px;
    background-color: white;
    height: 100%;
    display: flex;
    flex-direction: column;
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

  .main-container-header {
    font-family: "Mulish", sans-serif;
    font-size: 2rem;
    font-weight: 400;
    color: #014b96;
    margin-bottom: 2vh;
    justify-self: center;
    align-self: center;
  }

  .search-fields {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 15px;
  }

  .field-pair {
    display: flex;
    align-self: center;
    width: 100%;
    max-width: 400px;
  }

  .field-pair label {
    width: 100px;
    justify-self: center;
    text-align: right;
    margin-right: 10px;
    font-family: "Mulish", sans-serif;
    color: #014b96;
  }

  .field-pair select {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 4px;
    max-width: 10vw;
    background-color: #eaf3fc;
  }

  img.left-arrow {
    width: 10%;
    height: 10%;
    cursor: pointer;
  }

  img.right-arrow {
    width: 10%;
    height: 10%;
    margin-right: 2vw;
    cursor: pointer;
  }

  .timeline-navigation {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 20px;
  }

  .timeline-container {
    flex: 1;
    margin: 30px 0;
    padding: 0 10px;
  }

  .current-period {
    text-align: center;
    font-family: "Mulish", sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #014b96;
    margin-bottom: 15px;
  }

  .timeline {
    position: relative;
    height: 140px;
    margin: 20px 0;
    padding-bottom: 20px;
  }

  .timeline-line {
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #014b96;
    border-radius: 2px;
  }

  .timeline-event {
    position: absolute;
    top: 30px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  .timeline-dot {
    width: 20px;
    height: 20px;
    background-color: #f9bc39;
    border: 3px solid #014b96;
    border-radius: 50%;
    margin-top: 42px;
    z-index: 1;
    transition: transform 0.2s ease;
  }

  .timeline-date {
    margin-top: 10px;
    font-family: "Mulish", sans-serif;
    font-size: 0.875rem;
    color: #014b96;
    font-weight: 600;
    text-align: center;
    max-width: 120px;
    word-wrap: break-word;
  }

  .timeline-popup {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 200px;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0.3s;
    z-index: 10;
  }

  .timeline-popup h3 {
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    color: #014b96;
    margin-bottom: 10px;
  }

  .timeline-popup p {
    font-family: "Mulish", sans-serif;
    font-size: 0.875rem;
    margin-bottom: 5px;
  }
  .timeline-event:hover .timeline-dot {
    transform: scale(1.2);
  }

  .timeline-event:hover .timeline-popup {
    opacity: 1;
    visibility: visible;
  }

  .timeline-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 1.5vh;
    margin-bottom: 2vh;
  }

  .timeline-view-btn {
    background-color: #eaf3fc;
    border: 1px solid #014b96;
    border-radius: 20px;
    padding: 6px 15px;
    font-family: "Mulish", sans-serif;
    font-size: 0.875rem;
    color: #014b96;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .timeline-view-btn.active {
    background-color: #014b96;
    color: white;
  }

  .timeline-view-btn:hover:not(.active) {
    background-color: #d5e7f7;
  }
  .another-vehicle {
    padding: 0.5vh 0.5vw;
    border: 1px solid #ccc;
    border-radius: 4px;
    max-width: 10vw;
    background-color: #eaf3fc;
  }
  .other-vehicle label {
    width: 100px;
    justify-self: center;
    text-align: right;
    margin-right: 10px;
    font-family: "Mulish", sans-serif;
    color: #014b96;
    font-size: 1.5rem;
  }
  .go-to-btn {
    background-color: #014b96;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-family: "Mulish", sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .go-to-btn:hover {
    background-color: #0163c5;
  }

  .go-to-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  /* Update the search fields layout for better alignment */
  .search-fields {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
    flex-wrap: wrap;
  }
  .other-vehicle {
    margin: auto;
    justify-self: center;
  }
  .field-pair {
    display: flex;
    align-items: center;
    min-width: 200px;
    justify-content: center;
  }
  .main-container {
    width: 100%;
    max-width: 100%;
  }

  /* Mobile Timeline Styles */
  .mobile-timeline {
    display: none;
  }

  .vertical-timeline {
    position: relative;
    min-height: 400px;
    margin: 20px auto;
    padding: 20px 0;
    max-width: 600px;
  }

  .vertical-timeline .timeline-line {
    position: absolute;
    top: 0;
    left: 50%;
    width: 4px;
    height: 100%;
    background-color: #014b96;
    border-radius: 2px;
    transform: translateX(-50%);
  }

  .vertical-timeline-event {
    position: relative;
    margin: 40px 0;
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .vertical-timeline-event.left {
    margin-right: auto;
    padding-right: 20px;
  }

  .vertical-timeline-event.right {
    margin-left: auto;
    padding-left: 20px;
  }
  .vertical-timeline-event.left .timeline-dot {
    left: 100%;
  }
  .vertical-timeline-event.right .timeline-dot {
    left: 0%;
  }

  .vertical-timeline-event .timeline-dot {
    position: absolute;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background-color: #f9bc39;
    border: 3px solid #014b96;
    border-radius: 50%;
    z-index: 1;
    transition: transform 0.2s ease;
  }

  .vertical-timeline-event .timeline-date {
    font-family: "Mulish", sans-serif;
    font-size: 0.875rem;
    color: #014b96;
    font-weight: 600;
    text-align: center;
    margin: 10px 0;
  }

  .vertical-timeline-event .timeline-popup {
    position: absolute;
    top: 0;
    width: 200px;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0.3s;
    z-index: 10;
  }

  .vertical-timeline-event:nth-child(odd) .timeline-popup {
    left: 25vw;
  }

  .vertical-timeline-event:nth-child(even) .timeline-popup {
    left: 20vw;
  }

  .vertical-timeline-event:hover .timeline-dot {
    transform: translateX(-50%) scale(1.2);
  }

  .vertical-timeline-event:hover .timeline-popup {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 1000px) {
    .desktop-timeline {
      display: none;
    }
    .header-background {
      top: 25% !important;
      height: 75% !important;
    }

    .mobile-timeline {
      display: block;
    }

    .vertical-timeline {
      padding: 20px;
    }
    .current-period {
      margin-top: 2vh;
    }
    .vertical-timeline-event {
      margin: 30px 0;
    }

    .vertical-timeline-event .timeline-popup {
      width: 180px;
    }
    .timeline-controls {
      padding-left: 5vw;
      padding-right: 5vw;
    }
  }
</style>
