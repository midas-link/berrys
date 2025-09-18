<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { goto } from '$app/navigation';
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { PUBLIC_G_MAP_KEY } from '$env/static/public';
  import { register } from 'swiper/element/bundle';
  import Chart from "chart.js/auto";
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import { formatDate } from "$lib/scripts/vehicle-logging";
  export let data ; 
  let lineCanvas,lineInstance,pieCanvas,pieInstance;
  let scrolledPosition;
  let graphDrops = 40;
  let trailerIDinput;
  let siteIDinput;
  let leftContainer;
  let middleContainer;
  let rightContainer;
  let leftArrow;
  let rightArrow;
  let dropdownMenu;
  let subHeaderProfile;
  let subHeaderCompany;
  let mainSwipeContainer;
  let input = "" ;
  let showSuggestions = false; 
  let searchResults = [];
  let searchError = "";
  let touchStartX = 0;
  let touchEndX = 0;
  let map;
  let allEvents ;
  let eventsLoading = true;
  let eventsError = null;
  let detailsVisible = [];
  const swipeThreshold = 50;
  async function initMap() {
  const position = { lat: 31.968599, lng: -99.901810 };
  const markerPos = [
  { lat: 52.482899, lng: -1.893460 },
  { lat: 51.484000, lng: -1.894500 },
  ]
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { DirectionsService, DirectionsRenderer }  = await google.maps.importLibrary("routes");

  const directionsService = new DirectionsService();
  const directionsRenderer = new DirectionsRenderer();
  map = new Map(document.getElementById("map"), {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
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
  function getRowClass(index) {
    return index % 2 === 0 ? "row-even" : "row-odd";
  }
  function toggleDetails(index) {
    let newDetailsVisible = [...detailsVisible];
    newDetailsVisible[index] = !newDetailsVisible[index];
    detailsVisible = newDetailsVisible;
  }
  function formatEpochToTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
async function fetchEventsData() {
    try {
      eventsLoading = true;
      eventsError = null;
      console.log("Fetching prevented delivery events from API...");
      const response = await fetch(`/api/Site_Data`, {
        method: 'GET',
        credentials:'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Prevented Delivery Events Data Loaded:", data);
      allEvents = data;
    } catch (error) {
      console.error("Error fetching prevented delivery events:", error);
      eventsError = "Failed to load delivery events data. Please try again later."
    } finally {
      eventsLoading= false;
    }
  }
  async function handleLogout(){
        try {
        const response = await fetch(`/api/logout` , {
            method: 'POST',
            credentials:'include'
        });
        if(!response.ok) {
            console.warn(`Logout failed, Error status: ${response.status}`);
        }
    } catch (err) {
        console.log("Error logging out",err );
    } finally{
        localStorage.removeItem('is_admin');
        await goto(`${base}/login?authMessage=${encodeURIComponent('You have been logged out.')}`);
    }
    }
  function swapContent(container1, container2) {
    if (!container1 || !container2) return;
    container1.classList.add("transitioning");
    container2.classList.add("transitioning");

    const img1 = container1.querySelector("img");
    const span1 = container1.querySelector("span");
    const img2 = container2.querySelector("img");
    const span2 = container2.querySelector("span");

    setTimeout(() => {
      if (img1 && img2) {
        const tempImgSrc = img1.src;
        img1.src = img2.src;
        img2.src = tempImgSrc;
      }

      if (span1 && span2) {
        const tempText = span1.textContent;
        span1.textContent = span2.textContent;
        span2.textContent = tempText;
      }
      setTimeout(() => {
        container1.classList.remove("transitioning");
        container2.classList.remove("transitioning");
      }, 200);
    }, 150);
  }
  function moveContainers(direction) {
    if (leftArrow) leftArrow.style.pointerEvents = "none";
    if (rightArrow) rightArrow.style.pointerEvents = "none";
    if (direction === "left") {
      swapContent(leftContainer, middleContainer);
      swapContent(leftContainer, rightContainer);
    } else if (direction === "right") {
      swapContent(rightContainer, middleContainer);
      swapContent(rightContainer, leftContainer);
    }
    setTimeout(() => {
      if (leftArrow) leftArrow.style.pointerEvents = "auto";
      if (rightArrow) rightArrow.style.pointerEvents = "auto";
    }, 400);
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    if (dropdownMenu) {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    }
  }

  function navigateBasedOnImage(imageSrc) {
    if (!imageSrc) return;
    if (imageSrc.includes("Truck_graphic")) {
    goto(`${base}/vehicle-logging`);
    } else if (imageSrc.includes("Cross-drop")) {
      goto(`${base}/cross-drops`);
    } else if (imageSrc.includes("Gas_station_graphic")) {
      goto(`${base}/site-data`);
    }
  }

  function handleMiddleClick() {
    if (middleContainer) {
      const middleImage = middleContainer.querySelector("img");
      if (middleImage) navigateBasedOnImage(middleImage.getAttribute("src"));
    }
  }

  function handleLeftClick() {
    if (leftContainer) {
      const leftImage = leftContainer.querySelector("img");
      if (leftImage) navigateBasedOnImage(leftImage.getAttribute("src"));
    }
  }

  function handleRightClick() {
    if (rightContainer) {
      const rightImage = rightContainer.querySelector("img");
      if (rightImage) navigateBasedOnImage(rightImage.getAttribute("src"));
    }
  }

  function handleClickOutside(event) {
    if (
      dropdownMenu &&
      !dropdownMenu.contains(event.target) &&
      subHeaderProfile &&
      !subHeaderProfile.contains(event.target) &&
      subHeaderCompany &&
      !subHeaderCompany.contains(event.target)
    ) {
      dropdownMenu.style.display = "none";
    }
  }

  function setupMobileMenu() {
    const hamburger = document.getElementById("hamburger-menu");
    const sidebar = document.getElementById("mobile-sidebar");
    const overlay = document.getElementById("overlay");

    if (hamburger && sidebar && overlay) {
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
  async function handleSearch() {
    goto(`${base}/search?q=${input}`);
  }
  function handleTouchStart(event) {
    if (window.innerWidth > 1000) return;
    touchStartX = event.touches[0].clientX;
    if (mainSwipeContainer) mainSwipeContainer.classList.add("touching");
  }

  function handleTouchMove(event) {
    if (window.innerWidth > 1000) return;
    touchEndX = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (window.innerWidth > 1000) return;
    if (mainSwipeContainer) mainSwipeContainer.classList.remove("touching");
    if (touchStartX === 0 || touchEndX === 0) return; // No significant move

    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        moveContainers("right");
      } else {
        moveContainers("left");
      }
    }
    touchStartX = 0;
    touchEndX = 0;
  }
  function getDayWithOrdinal(day) {
  if (day > 3 && day < 21) {
    return day + "th";
  }
  switch (day % 10) {
    case 1:
      return day + "st";
    case 2:
      return day + "nd";
    case 3:
      return day + "rd";
    default:
      return day + "th";
  }
}
function goToZipCode(address) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': address }, (results, status) => {
    if (status === 'OK') {
      const location = results[0].geometry.location;
      map.setCenter(location);
      map.setZoom(18); 
      new google.maps.Marker({
        map:map,
        position: location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
async function handleMapCoords() {
  const response = await fetch(`/api/siteAddress/${siteIDinput}`, {
    method: 'GET',
    credentials: 'include',
  });
  if(response.ok) {
   const data = await response.json();
   console.log(data.zip_code);
   goToZipCode(data.address);
  }
}
function manageScroll() {
  scrolledPosition = document.body.scrollTop;
  if(scrolledPosition >= document.querySelector(".menu-container").offsetHeight) {
    document.querySelector(".dashboard-header").innerHTML = "Menu";
    document.querySelector(".dashboard-logo").src = `${base}/images/Menu_icon.png`
    document.querySelector(".dashboard-logo").style.width = "3.5vw";
  } else if(scrolledPosition < document.querySelector(".menu-container").offsetHeight) {
    document.querySelector(".dashboard-header").innerHTML = "Dashboard";
    // document.querySelector(".dashboard-logo").style.display = "block";
    document.querySelector(".dashboard-logo").src = `${base}/images/Dashboard-icon.png`
    document.querySelector(".dashboard-logo").style.width = "8vw";

  }
}
function updateDateTime() {
  const datetimeElement = document.getElementById("current-date");

  if (datetimeElement) {
    const now = new Date();
    const day = now.getDate();
    const weekdayOptions = { weekday: "long" };
    const monthOptions = { month: "long" };
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12:true,
    };

    const formattedWeekday = now.toLocaleDateString("en-GB", weekdayOptions);
    const formattedMonth = now.toLocaleDateString("en-GB", monthOptions);
    const formattedDay = getDayWithOrdinal(day);

    datetimeElement.textContent = `${formattedWeekday} ${formattedDay} ${formattedMonth} ${now.toLocaleTimeString("en-US", options)}`;
  }
}
function randomData(length, max = 100) {
    return Array.from({ length }, () => Math.floor(Math.random() * max));
  }
  onMount(async() => {
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      //  key: PUBLIC_G_MAP_KEY,
      v: "weekly",
    });
    register();
    const swiperEl = document.querySelector('swiper-container')
    fetchEventsData();
    const params = {
      injectStyles: [`
      .swiper-pagination-bullet {
        width: 10px;
        height: 10px;
        text-align: center;
        line-height: 20px;
        font-family: "Mulish", sans-serif;
        font-size: 0px;
        color: #000;
        opacity: 1;
        background: rgba(0, 0, 0, 0.2);
      }

      .swiper-pagination-bullet-active {
        color: #fff;
        background: #007aff;
      }
      `],
      pagination: {
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
      },
    }

    Object.assign(swiperEl, params)

    swiperEl.initialize();
    leftContainer = document.querySelector(".main-container-left");
    middleContainer = document.querySelector(".main-container-middle");
    rightContainer = document.querySelector(".main-container-right");
    leftArrow = document.querySelector(".left-arrow");
    rightArrow = document.querySelector(".right-arrow");
    dropdownMenu = document.getElementById("dropdownMenu");
    subHeaderProfile = document.querySelector(".sub-header-profile");
    mainSwipeContainer = document.querySelector(".menu-container");
    const clickMoveLeft = () => moveContainers("left");
    const clickMoveRight = () => moveContainers("right");
    updateDateTime();
    document.body.addEventListener('scroll',manageScroll);
    const interval = setInterval(updateDateTime, 1000);
    if (leftArrow) leftArrow.addEventListener("click", clickMoveLeft);
    if (rightArrow) rightArrow.addEventListener("click", clickMoveRight);
    if (subHeaderProfile)
      subHeaderProfile.addEventListener("click", toggleDropdown);
    if (subHeaderCompany)
      subHeaderCompany.addEventListener("click", toggleDropdown);
    document.addEventListener("click", handleClickOutside);

    if (mainSwipeContainer) {
      mainSwipeContainer.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      mainSwipeContainer.addEventListener("touchmove", handleTouchMove, {
        passive: true,
      });
      mainSwipeContainer.addEventListener("touchend", handleTouchEnd);
    }
    pieInstance = new Chart(pieCanvas, {
      plugins: [ChartDataLabels],
      type: "pie",
      data: {
        labels: ["Diesel #2", "Gas 91 No Eth", "Gas 87 No Eth", "Gas 93 OCTANE"],
        datasets: [
          {
            label: "",
            datalabels: {
        color: '#000000'
      },
            data: randomData(4),
            backgroundColor: [
              "rgba(0, 114, 188, 1)",
              "rgba(153, 153, 153, 1)",
              "rgba(255, 161, 64, 1)",
              "rgba(50, 193, 137, 1)"
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            font: {
              size:15,
              weight: 700,
            }
          },
          legend: { display: true },
          title: { display: true, text: "Delivery Breakdown",font: {
            size:25
          } }
        }
      }
    });
    lineInstance = new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        datasets: [
          {
            data: randomData(7),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `${graphDrops} Drops This week ` }
        }
      }
    });

    initMap();
    setupMobileMenu();

    return () => {
      if (leftArrow) leftArrow.removeEventListener("click", clickMoveLeft);
      if (rightArrow) rightArrow.removeEventListener("click", clickMoveRight);
      if (subHeaderProfile)
        subHeaderProfile.removeEventListener("click", toggleDropdown);
      if (subHeaderCompany)
        subHeaderCompany.removeEventListener("click", toggleDropdown);
      document.removeEventListener("click", handleClickOutside);
      document.body.removeEventListener('scroll',manageScroll);
      if (mainSwipeContainer) {
        mainSwipeContainer.removeEventListener("touchstart", handleTouchStart);
        mainSwipeContainer.removeEventListener("touchmove", handleTouchMove);
        mainSwipeContainer.removeEventListener("touchend", handleTouchEnd);
      }
      clearInterval(interval);
    };
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" 
      href=
"https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  <link href="{base}/css/styles.css" rel="stylesheet" />
  <title>Home</title>
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
      <a href="{base}/vehicle-logging">Vehicle Logging</a>
      <a href="{base}/cross-drops">Cross-Drop Prevention</a>
      <a href="{base}/site-data">Site Data</a>
      <a href="{base}/inventory">Inventory</a>
      <a href="{base}/analytics">Analytics</a>
      <div class="search-box">
        <form on:submit|preventDefault={() => {handleSearch()}}>
        <input type="text" bind:value={input} placeholder="Search..." /> 
        </form>
        <!-- <div class="sug-box" class:active={showSuggestions}>
          {#if searchResults}
          {#each searchResults as row}
          <li>{row.address}  {row.code ? `, ${row.code}` : "" } </li>  
          {/each}
          {/if}
        </div> -->
      </div>
      <img src="{base}/images/Midas_Link_logo.png" alt="Berrys Logo" />
    </div>
  </div>
</header>

<div class="mobile-sidebar" id="mobile-sidebar">
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



<main>
  <div class="sub-header-container">
    <div class="sub-header">
      <div class="sub-header-profile">
        <div class="profile-column">
          <img
            class="profile-pic"
            src="{base}/images/NicePng_gray.png"
            alt="profile-logo"
          />
          <div class="sub-header-profile-name"> {data.user.firstName} {data.user.lastName} </div>
        </div>
        <div class="company-column">
          <img
            class="company-logo"
            src={data.user.companyImage ? data.user.companyImage : `${base}/images/circle-k-logo.png`}
                      alt="company-logo"
          />
          <div class="sub-header-role">( Area Manager )</div>
        </div>
      </div>
      <div class="sub-header-middle">
        <img class="dashboard-logo" src={`${base}/images/Dashboard-icon.png`} alt="dashboard-logo"  />
        <h1 class="dashboard-header" style="margin:0"> Dashboard</h1>
      </div>
      <div class="sub-header-right">
        <span class="current-time" id="current-date"></span>
      </div>
    </div>
    <div class="dropdown-menu" id="dropdownMenu">
      <button on:click={handleLogout} id="logout">Logout</button>
      <a href="{base}/manageAcc">Manage Account</a>
    </div>
  </div>
  <div>
    <section class="dashboard-container">
      <div class="live-table">
        <div class="live-indicator-div">
        <span for="live-table">LIVE</span>
        <span class="live-indicator"></span>
        </div>
        <div class="table-clip">
          <div class='table-container' id="scrollable-table-container">
            <table>
              <tbody>
                {#if eventsLoading}
                <tr>
                  <td colspan="5" style="text-align: center; padding: 20px;"
                  >Loading events...</td>
                </tr>
                {:else if eventsError}
                <tr>
                  <td colspan="5"style="text-align: center; padding: 20px; color: red;">{eventsError}</td>
                </tr>
                {:else if allEvents.length > 0}
                 {#each allEvents as row, index}
                <tr class="main-row {getRowClass(index)} {detailsVisible[index] ? 'hover-row' : ''}" on:click={() => toggleDetails(index)}>
                  <td>{formatEpochToTime(row["Delivery End"])}</td>
                  <td>{row.SiteCode}</td>
                  <td>T{row.tank_number}</td>
                  <td style="text-align:center">{row.Delivered}</td>
                </tr>
                {#if detailsVisible[index]}
                <tr class="details-row {getRowClass(index)} on:click={() => toggleDetails(index)}">
                  <td colspan="4">
                <div class="details-content">
                  <div class="detail-row">
                    {formatDate(formatEpochToDisplay(row.event_timestamp))} | {formatEpochToTime(
                      row["Delivery Start"]
                    ) || ""} to {formatEpochToTime(row["Delivery End"]) || ""}
                  </div>
                  <div class="detail-row">
                    <span class="label">Site Code:</span>
                    {row.SiteCode} | <span class="label">Business Unit:</span>
                    {row.BusinessUnitName || ""}
                  </div>
                  <div class="detail-row">
                    <span class="label">Full Address:</span>
                    {row.Address || ""}, {row.City || ""}
                    {row.State || ""} | {row.Zip || ""}
                  </div>
                  <div class="detail-row">
                    <span class="label">Fuel Dropped:</span>
                    {row.Delivered} | <span class="label">Tank:</span>
                    T{row.tank_number}
                  </div>
                </div>
              </td>
              </tr>
                {/if}
                {/each}
                {:else}
                <tr>
                  <td colspan="4" style="text-align: center; padding: 20px;"
                    >No results found</td>
                </tr>
                {/if}
              </tbody>
            </table>
          </div>
        </div>
        <div style="margin-top:2vh;display:flex;">
          <div class="delivery-breakdown">
            <div style="background:white;border: 1px solid #014B96;padding: 1rem;border-radius: 10px;">
              <canvas bind:this={pieCanvas} style="height:15vh;"></canvas>
            </div>
          </div>
        </div>
      </div>
      <div class="middle-dashboard">
        <div class="middle-header">
          <!-- <div style="display:flex;flex-direction:row;margin-left:auto">
            <div> 
              <img
              src="{base}/svg/arrow-left-3-svgrepo-com.svg"
              alt="scroll-arrow"
              class="graph-scroll-btn-left"
              id="graph-scroll-btn-left"/>
            </div>
            <div>
               <img
              src="{base}/svg/arrow-right-3-svgrepo-com.svg"
              alt="scroll-arrow"
              class="graph-scroll-btn-right"
              id="graph-scroll-btn-right"  />
          </div>
          </div> -->
        </div>
        <div class="prevented-cross-drops">
          <a href={base}/cross-drops>cross-drops prevented</a>
          <span>6 <span style="color:gold;padding-bottom:2vh;font-size:3.5rem">&#8593;</span></span>
        </div>
        <div class="active-trailers">
          <a href={base}/site-data>active trailers</a>
          <span>672<span style="color:gold;padding-bottom:2vh;font-size:3.5rem">&#8593;</span> </span>
        </div>
        <div class="google-maps-usage">
          <div class="map-input-div">
            <input class="trailer-input" placeholder="Enter Trailer ID" bind:value={trailerIDinput}/>
            <input class="site-input" placeholder="Enter Site ID" bind:value="{siteIDinput}"/>
          </div>
          <div class="explore-div">
            <button class="explore-btn" type="button" on:click={handleMapCoords}>EXPLORE </button>
          </div>
          <div class="map" id="map">
          </div>
        </div>
      </div>
      <div class="overview-table">
        <div style="display:flex;flex-direction:row;position:relative;">
          <div class="right-header">
            <label for="overview-table">Overview</label>
            <!-- <div style="display:flex;flex-direction:row;margin-left:auto">
              <div> 
                <img
                src="{base}/svg/arrow-left-3-svgrepo-com.svg"
                alt="scroll-arrow"
                class="graph-scroll-btn-left"
                id="graph-scroll-btn-left"/>
              </div>
              <div>
                <img
                src="{base}/svg/arrow-right-3-svgrepo-com.svg"
                alt="scroll-arrow"
                class="graph-scroll-btn-right"
                id="graph-scroll-btn-right"  />
            </div>
            </div> -->
          </div>
        </div>
        <div class="overview-graph">
          <swiper-container class="my-swiper" init="false" autoplay-delay="8000" loop="true">
            <!-- <swiper-container class="my-swiper" pagination="true"> -->
            <swiper-slide>
              <div style="height:100%;">
                <div style="background-color:#dfefe9;height:50%;align-items:center;display:flex;justify-content:center;border-radius:10px" >
                  <span style="font-size:4rem;font-weight: 400;color: #014b96;">92% </span> <span style="height:4vh;background-color:green;border-radius:50%;margin-left: 2vw;font-size:2rem;font-weight: 400;color: white;line-height: 4.25vh;width:2.75vw"> &#10003;</span>
                </div>
                <div style="display:flex;flex-direction:column">
                  <span style="font-size:1.5rem;font-weight: 400;color: #014b96;">System Health</span>
                   Score based on midas battery, fuel verification, RFID mismatch, and black box sync rate.
                </div>
              </div>
            </swiper-slide>
            <swiper-slide>
              <div style="background:white;height:90%; max-width: 25vw;padding: 1rem;justify-content:center;display:flex;border-radius:10px">
                <canvas bind:this={lineCanvas} ></canvas>
              </div> 
            </swiper-slide>
            <swiper-slide>
          <div class="midas-alerts">
            <div> <b style="color:orange;font-size:1.65rem;margin-right:0.5vw;"> &#9888; </b>   Valve sync failures  <span> 1 </span> </div> 
            <div> <b style="color:red;font-size:1.65rem;margin-right:0.5vw"> &#9747; </b> RFID not read <span> 6 </span> </div>
            <div> <b style="color:red;font-size:1.65rem;margin-right:0.5vw"> &#9747; </b> Fuel mismatch attempted <span> 1 </span> </div>
            <div> <b style="color:orange;font-size:1.65rem;margin-right:0.5vw"> &#9888; </b> Long dwell time detected <span> 2 </span> </div>
          </div>
            </swiper-slide> 
          </swiper-container>
       
        </div>
        <div class="this-week-container">
          <span class="this-week-header">This Week's Wins</span>
          <div class="this-week-div">
            <div> Verified Deliveries  <span> 89 </span> </div> 
            <div> Cross-Drops Prevented <span> 6 </span> </div>
            <div> High-Risk Mismatch Blocked <span> 1 </span> </div>
            <div> Units flagged for Maintenance <span> 2 </span> </div>
          </div>
        </div>
        
      </div>
    </section>
    <section class="menu-container">
      <img src="{base}/svg/left-arrow.svg" alt="left-arrow" class="left-arrow" />
  
      <div class="main-container-left">
        <button style="border:0 ; background:none;cursor:pointer;width:60%;" type="button" on:click={handleLeftClick}>
          <img src="{base}/images/Truck_graphic.png" alt="Truck Graphic" />
        </button>
        <span class="main-container-left-sub-title">Vehicle Logging</span>
      </div>
  
      <div class="main-container-middle">
        <button style="border:0 ; background:none; cursor:pointer;width:85%" type="button"  on:click={handleMiddleClick}>
          <img
            src="{base}/images/Cross-drop graphic.png"
            alt="Cross-drop"
          /></button
        >
        <span class="main-container-middle-sub-title">Cross-Drop Prevention</span>
      </div>
  
      <div class="main-container-right">
        <button style="border:0 ; background:none;cursor:pointer;width:60%" type="button" on:click={handleRightClick}>
          <img
            src="{base}/images/Gas_station_graphic.png"
            alt="Gas Station Graphic" 
          />
        </button>
        <span class="main-container-right-sub-title">Site Data</span>
      </div>
  
      <img
        src="{base}/svg/right-arrow.svg"
        alt="right-arrow"
        class="right-arrow"
      />
      </section>
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
    display: flex;
    flex-direction: column;
    touch-action: pan-y;
  }
  ::placeholder {
    color: #ffffff;
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
  .dashboard-container {
    display:grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap:5vw;
    height:100vh;
    padding: 5vh 5vw 5vh 5vw;
    width:100vw;
    background: radial-gradient(#001338 10%, #014B96 75%);
  }
  .table-clip {
    border-radius:10px;
    overflow:hidden;
    width:25vw;
  }
  .table-container {
    height:40vh;
    overflow-y: scroll;
    overflow-x:hidden;
    width:100%;
    scrollbar-width: none;           
  }
  .table-container table {
    width:100%;
    border-collapse: separate; 
    border-spacing: 0;         
    border-radius:10px;       
    overflow:hidden;            
  }
  .live-indicator {
    width: 12px;
    height: 12px;
    background-color: #ff0000;
    border-radius: 2px;
    display: inline-block;
    margin-left:0.5vw;
    align-self:center;
  }
  .live-indicator-div span {
    font-family: "Mulish", sans-serif;
    font-size: 1.1rem;
    font-weight: 400;
    line-height: 1rem;
    color:white;
  }
  .details-row span {
    font-family: "Mulish", sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1rem;
    color:black;
  }
  .live-table {
    position: relative;
  }
  .live-indicator-div {
    position: absolute;
    top:0%;
    width: 100%;
  }
  .table-clip {
    margin-top:2vh;
  }
  .live-table table {
    border-spacing: 0; 
  }
  .live-table td {
    padding: 1rem;
  }
  /* .live-table tr:nth-child(even) {
    background-color:#f4f5f7;
  }
  .live-table tr:nth-child(odd) {
    background-color:white;
  } */
  .current-time {
    font-family: "Mulish", sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #014b96;
    padding-left: 1vw;
  }
  .middle-dashboard {
    display:flex;
    flex-direction: column;
    gap: 5vh;
    flex-grow: 0.3;
    margin-top:2vh;
    position:relative;
  }
  .search-box {
    position:relative;
  }
  .active-trailers,
  .prevented-cross-drops {
    display:flex;
    flex-direction: row;
    justify-content: space-between;
    height:12.5%;
    border-radius:10px;
    font-family: "Mulish", sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: #014b96;
    text-transform: uppercase;
    align-items: end;
    padding-bottom:1vh;
    padding-left:1vw;
    padding-right:1vw;
  }
  .active-trailers a,
  .prevented-cross-drops a {
    text-decoration: none;
  }
  .active-trailers span,
  .prevented-cross-drops span {
    text-decoration: none;
    font-size:3rem;
    padding-bottom:1vh
  }
  .prevented-cross-drops {
    background-color: #eaf3fc;
  }
  .active-trailers {
    background-color: #f4f5f7;
  }
  .google-maps-usage {
    display:grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 50vh;
  }
  .map {
    grid-row: 3 ;
    border:solid 4px white;
    border-radius: 8px;
  }
  .explore-div {
    margin-top:1vh;
    margin-bottom:0.4vh;
    display:grid;
    justify-content: center;
  }
  .map-input-div {
    display:flex;
    justify-content: space-between;
  }
  /* .sug-box {
    position:absolute;
    top: calc(100% + 6px);
    left:0;
    width:15vw;
    max-height:10vh;
    z-index: 1000;
    margin-left:1.5vw;
    overflow-y:auto;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    background-color: white;
    border-radius:8px;
  }
  .sug-box li {
    display:none;
    list-style-type: none;
    font-size:0.85rem;
    margin-bottom:1vh;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%2300000" viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>');
    background-repeat: no-repeat;
    background-size:6.5%;
    background-position: left 5px bottom ;
    padding-left: calc( 16px + 0.75vw);
    overflow-wrap:break-word;
  }
  .sug-box.active li{
    display:block;
  } */
  .trailer-input,
  .site-input {
    background-color: #eaf3fc;
    color:#014b96;
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    border:none;
    border-radius: 4px;
    text-align:center;
  }
  .trailer-input::placeholder,
  .site-input::placeholder{
    color:#014b96;
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    font-weight: 400;
  }
  .explore-btn {
    background: transparent;
    border: none;
    text-decoration: underline;
    color:white;
    font-family: "Mulish", sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
  }
  .sub-header-right {
    margin-right:2vw;
  }
  .overview-table {
    margin-top:2vh;
  }
  .overview-table label{
    color:white;
    font-family: "Mulish", sans-serif;
    font-size: 1.25rem;
    font-weight: 400;
  }
  .middle-dashboard a:visited {
    color:#014b96;
  }
  @media (max-width: 1000px) {
    .header a:nth-child(2) {
      margin-left: 5%;
    }
    .header-background {
      top: 25% !important;
      height: 75% !important;
    }
    .company-logo {
      width: 5vh !important;
    }
    .header img {
      max-height: 8vh;
      max-width: 100%;
      height: auto;
      width: auto;
      scale: 1.1;
      margin-left: auto;
    }
    .header a {
      display: none;
    }
    .header input {
      display: none;
    }
    .header img[alt="Berrys Logo"] {
      display: block !important;
    }
    .sub-header {
      justify-content: center;
    }
    .dropdown-menu {
      left: 30vw !important;
    }

    .sub-header-profile-name {
      font-size: 0.8rem;
    }
    .sub-header-role {
      font-size: 0.8rem;
    }

    * {
      font-size: 0.75rem !important;
    }
    .menu-container {
      padding: 0 !important;
      margin-top: 20vh !important;
    }
    .main-container-middle {
      scale: 1.3;
    }
    .main-container-left {
      margin-right: 10vw;
    }
    .main-container-right {
      margin-left: 10vw;
    }
    .menu-container span {
      font-size: 0.5rem !important;
    }
    img.left-arrow {
      display: none;
    }
    img.right-arrow {
      display: none;
    }
    .menu-container img {
      width: 20.5vw !important;
    }
    .main-container-middle img {
      width: 26vw !important;
    }
  }
  .header a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  .header input {
    width: 15vw;
  }
  .header input[type="text"] {
    padding: 1vh 1.5vw 1vh 1.5vw;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    outline: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23FFFFFF" viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>');
    background-repeat: no-repeat;
    background-size: 16px;
    background-position: 0.5vh center;
    margin-left: 1.5vw;
  }
  .header input[type="text"]::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  .sub-header-container{
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .sub-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background-color: #f5f5f5;
    padding-top: 2vh;
    align-items: center;
  }
  .sub-header div {
    text-align: center;
    padding-bottom: 1vh;
    font-family: "Mulish", sans-serif;
    font-weight: 600;
  }
  .sub-header-profile img {
    width: 5vh;
    height: 5vh;
    display: block;
    margin: 0 auto;
  }
  .company-logo {
    height: 6vh !important;
  }
  .sub-header-profile-name {
    margin: 1vh auto 0vh auto;
  }
  .menu-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2vw;
    height:100vh;
  }
  .menu-container div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .main-container-left,
  .main-container-middle,
  .main-container-right {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .main-container-middle {
    position: relative;
    z-index: 2;
    transform: scale(1.05);
    transition: all 0.2s ease;
  }
  :global(.main-container-middle.transitioning) {
    transform: scale(1);
  }
  .menu-container button {
    transition: all 0.2s ease;
  }
  .menu-container span {
    transition: opacity 0.2s ease;
  }
  :global(.transitioning span) {
    opacity: 0;
  }
  :global(.transitioning) {
    opacity: 0.9;
    transform: scale(0.95);
  }
  :global(.transitioning.visible) {
    opacity: 1;
    transform: scale(1);
  }
  .main-container-left {
    margin-left: 2.5vw;
  }
  .main-container-right {
    margin-right: 2.5vw;
  }
  .menu-container img {
    width: inherit;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .main-container-middle img {
    width: inherit;
  }

  .menu-container img:hover {
    transform: scale(1.05);
  }
  .menu-container span {
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    color: #747474;
    text-decoration: underline;
    text-transform: uppercase;
    text-align: center;
  }
  img.left-arrow {
    width: 35px;
    height: 10%;
    align-self: center;
    margin-left: 2vw;
    cursor: pointer;
  }
  img.right-arrow {
    width: 35px;
    height: 10%;
    align-self: center;
    margin-right: 2vw;
    cursor: pointer;
  }
 
  .dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 5vw;
    background-color: #014b96;
    border: 1px solid #ccc;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
  .dropdown-menu button {
    background-color: #014b96;
    display: block;
    padding: 2vh 3vw 2vh 3vw;
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    color: #ffffff;
    width:100%;
    text-decoration: underline;
  }
  .dropdown-menu a {
    display: block;
    padding: 2vh 3vw 2vh 3vw;
    font-family: "Mulish", sans-serif;
    font-size: 1rem;
    color: #ffffff;
    text-decoration: underline;
  }
  .dropdown-menu button:hover,
  .dropdown-menu a:hover {
    background-color: #0961b9;
    cursor: pointer;
  }
  .sub-header-profile {
    cursor: pointer;
    display: flex;
    gap: 1vw;
    margin-left:5vw;
  }
  .profile-column,
  .company-column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .profile-pic {
    width: 5vh;
    height: 5vh;
    margin-bottom: 0.5vh;
  }
  .company-logo {
    width: 5vh;
    height: 6vh;
    margin-bottom: 0.5vh;
  }
  .sub-header-profile-name,
  .sub-header-role {
    font-size: 0.9rem;
    text-align: center;
  }
  .dashboard-logo {
    width:8vw ;
    height:5vh ;
    object-fit: cover;
  }
  .graph-scroll-btn-right,
  .graph-scroll-btn-left {
    height:4vh;
  }
  .middle-header {
    position:absolute;
    bottom:100%;
    right:0;
  }
  .right-header {
    position:absolute;
    bottom:100%;
    display:flex;
    flex-direction: row;
    width:100%;
  }
  .this-week-container {
    margin-top: 2vh;
  }
  .midas-alerts {
    background:white; 
    padding: 1rem;
    display:flex;
    flex-direction: column;
    gap: 2vh;
    border-radius:10px;
  }
  .this-week-div {
    background:white; 
    max-width: 25vw;
    border: 1px solid #014B96;
    padding: 1rem;
    border-radius: 10px;
    display:flex;
    flex-direction: column;
    gap: 1.5vh;
  }
  .midas-alerts div ,
  .this-week-div div {
    display:flex ;
    flex-direction: row;
    align-items: center;
  }
  .midas-alerts div > span ,
  .this-week-div div > span {
    margin-left: auto;
    color:#014b96;
    font-family: "Mulish", sans-serif;
  font-size: 1.25rem;
  font-weight: 400;
  }
  .this-week-header {
  color: white;
  font-family: "Mulish", sans-serif;
  font-size: 1.25rem;
  font-weight: 400;
  }
  swiper-container {
      max-width: 25vw;
      height: 25vh;
      border-radius: 10px;
      overflow: hidden;
      margin-left:0;
    }

    swiper-slide {
      text-align: center;
      font-size: 18px;
      background: white;
      border-radius:10px;
      overflow:hidden;
    }
    .delivery-breakdown {
      width:25vw;
    }
    .details-content {
      display:grid;
      grid-template-rows: 1fr 1fr 1fr 1fr;
      gap:1vh;
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
</style>
