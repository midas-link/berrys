<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { goto } from '$app/navigation';
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  export let data ; 
  let leftContainer;
  let middleContainer;
  let rightContainer;
  let leftArrow;
  let rightArrow;
  let dropdownMenu;
  let subHeaderProfile;
  let subHeaderCompany;
  let mainSwipeContainer;

  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;
  async function handleLogout(){
        try {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/api/logout` , {
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

  onMount(() => {
    leftContainer = document.querySelector(".main-container-left");
    middleContainer = document.querySelector(".main-container-middle");
    rightContainer = document.querySelector(".main-container-right");
    leftArrow = document.querySelector(".left-arrow");
    rightArrow = document.querySelector(".right-arrow");
    dropdownMenu = document.getElementById("dropdownMenu");
    subHeaderProfile = document.querySelector(".sub-header-profile");
    mainSwipeContainer = document.querySelector(".main-container");
    const clickMoveLeft = () => moveContainers("left");
    const clickMoveRight = () => moveContainers("right");

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

    setupMobileMenu();

    return () => {
      if (leftArrow) leftArrow.removeEventListener("click", clickMoveLeft);
      if (rightArrow) rightArrow.removeEventListener("click", clickMoveRight);
      if (subHeaderProfile)
        subHeaderProfile.removeEventListener("click", toggleDropdown);
      if (subHeaderCompany)
        subHeaderCompany.removeEventListener("click", toggleDropdown);
      document.removeEventListener("click", handleClickOutside);

      if (mainSwipeContainer) {
        mainSwipeContainer.removeEventListener("touchstart", handleTouchStart);
        mainSwipeContainer.removeEventListener("touchmove", handleTouchMove);
        mainSwipeContainer.removeEventListener("touchend", handleTouchEnd);
      }
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
      <a href="{base}/home">Home</a>
      <a href="{base}/vehicle-logging">Vehicle Logging</a>
      <a href="{base}/cross-drops">Cross-Drop Prevention</a>
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
  </div>
  <div class="dropdown-menu" id="dropdownMenu">
    <button on:click={handleLogout} id="logout">Logout</button>
    <a href="{base}/manageAcc">Manage Account</a>
  </div>
</div>

<main>
  <div class="main-container">
    <img src="{base}/svg/left-arrow.svg" alt="left-arrow" class="left-arrow" />

    <div class="main-container-left">
      <button style="border:0 ; background:none" on:click={handleLeftClick}>
        <img src="{base}/images/Truck_graphic.png" alt="Truck Graphic" />
      </button>
      <span class="main-container-left-sub-title">Vehicle Logging</span>
    </div>

    <div class="main-container-middle">
      <button style="border:0 ; background:none" on:click={handleMiddleClick}>
        <img
          src="{base}/images/Cross-drop graphic.png"
          alt="Cross-drop"
        /></button
      >
      <span class="main-container-middle-sub-title">Cross-Drop Prevention</span>
    </div>

    <div class="main-container-right">
      <button style="border:0 ; background:none" on:click={handleRightClick}>
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
    margin-bottom: 5vh;
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
    .main-container {
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
    .main-container span {
      font-size: 0.5rem !important;
    }
    img.left-arrow {
      display: none;
    }
    img.right-arrow {
      display: none;
    }
    .main-container img {
      width: 25.5vw !important;
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
    width: 8vw;
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
  .sub-header {
    display: flex;
    background-color: #f5f5f5;
    gap: 1vw;
    padding-left: 2.5vw;
    padding-top: 2vh;
  }
  .sub-header div {
    text-align: center;
    padding-bottom: 1vh;
    font-family: "Mulish", sans-serif;
    font-weight: 600;
  }
  .sub-header img {
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
  .main-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 2vw;
    margin-top: 9vh;
  }
  .main-container div {
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
  .main-container button {
    transition: all 0.2s ease;
  }
  .main-container span {
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
  .main-container img {
    width: 50%;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .main-container-middle img {
    width: 75%;
  }

  .main-container img:hover {
    transform: scale(1.05);
  }
  .main-container span {
    font-family: "Mulish", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    color: #747474;
    text-decoration: underline;
    text-transform: uppercase;
    text-align: center;
  }
  img.left-arrow {
    width: 10%;
    height: 10%;
    align-self: center;
    margin-left: 2vw;
    cursor: pointer;
  }
  img.right-arrow {
    width: 10%;
    height: 10%;
    align-self: center;
    margin-right: 2vw;
    cursor: pointer;
  }
  .sub-header-container {
    position: relative;
  }
  .dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 2vw;
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
</style>
