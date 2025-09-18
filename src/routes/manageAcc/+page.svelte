<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  export let data ; 
  let userId = "";
  let currentPassword = "";
  let changePasswordMessage = "";
  let changePasswordError = false;
  let newPassword = "";
  let confirmPassword ="";
  let selectedOption;
  let webAlert = data.user.webAlert || false;
  let emailAlert = data.user.emailAlert || false;
  let changePreferenceError = false;
  let changePreferenceMessage = "";
  function handleActiveForm(activeForm) {
    if(activeForm === ".pass-div") {
      document.getElementById('pass-div').style.display = "block";
      document.getElementById('pref-div').style.display = "none";
    } else if(activeForm === ".pref-div") {
      document.getElementById('pref-div').style.display = "block";
      document.getElementById('pass-div').style.display = "none";
    }
  }
  async function handleChangePreference() {
    try {
      const response = await fetch(`/api/changeAlertPreference`, { 
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          webAlert: webAlert,
          emailAlert: emailAlert
        })
      });
      const data = await response.json();
      if(response.ok) {
        changePreferenceError = false;
        changePreferenceMessage = data.message || "Preference changed successfully";
      }
      else {
        if(response.status === 400 && Array.isArray(data.error)) changePreferenceMessage = data.error.map(err=>err.msg).join(' & ');
        else if( typeof data.error === 'string') {
          changePreferenceMessage = data.error;
        }
        else {
          changePreferenceMessage = `An unexpected error has occured. Status: ${response.status}`;
        }
        changePreferenceError = true;
      }
    } catch(err) {
      console.error('Client-side error:',err);
      changePreferenceError = true;
    }
  }
  async function handlePasswordChange() {
    changePasswordMessage = "";
    changePasswordError = false;
    try {
      const response = await fetch(`/api/changePassword`,{
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          currentPassword: currentPassword, 
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });
      const data = await response.json();
      if(response.ok) {
        changePasswordError = false;
        changePasswordMessage = data.message || "Password changed successfully!";
      }
      else { 
        if(response.status === 400  && Array.isArray(data.error)) changePasswordMessage = data.error.map(err=>err.msg).join(' & ');
        else if( typeof data.error ==='string') {
          changePasswordMessage = data.error;
        }
        else {
          changePasswordMessage = `An unexpected error has occured. Status: ${response.status}.`;
        }
        changePasswordError = true;
      }
    } catch(err) {
      console.error('Client-side error:', err);
      changePasswordError = true;
    }
    currentPassword = "";
    newPassword = "";
    confirmPassword ="";
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
  onMount(() => {
    userId = data.user.userId;
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
  <title>Manage Account</title>
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
    <h1>Manage Account</h1>
    <span>
      Change your password, your new password will be assigned to the email
      address you used to sign in.
    </span>
  </div>
  <div class="breadcrumb">
    <a href="{base}/home">Home</a> / <span>Manage Account</span>
  </div>
</div>
<main>
  <div class="main-container">
    <div class="profile-details">
      <div class="header-profile">
        <img src="images/NicePng_gray.png" alt="profile-logo" />
        <div class="header-profile-name">{data.user.firstName} {data.user.lastName}</div>
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
    <div class="active-btn-div" style="display:flex;flex-direction:row;">
      <button on:click={() => handleActiveForm(".pass-div")} type="button"> Password</button>
      <button on:click={() => handleActiveForm(".pref-div")} type="button"> Preference</button>
      </div>
    <div class="form-container">
      
      <div id="pass-div">
      <form on:submit|preventDefault={handlePasswordChange}>
        {#if changePasswordMessage}
          <p style="color: {changePasswordError ? 'red' : 'green'};">{changePasswordMessage}</p>
        {/if}
        <div class="form-row">

        <label for="current-password">Current Password:</label>
        <input
          type="password"
          bind:value={currentPassword}
          id="current-password"
          name="current-password"
        /> 
        </div>  
        <div class="form-row">
          <label for="change-password">Change Password:</label>
          <input type="password" bind:value={newPassword} id="change-password" name="change-password" required />
        </div>
        <div class="form-row">
          <label for="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            bind:value={confirmPassword}
            name="confirm-password" required
          />
        </div>
        <button type="submit">Reset</button>
      </form>
      </div>
      <div id="pref-div" style="display:none;">
        <form on:submit|preventDefault={handleChangePreference}>
          {#if changePreferenceMessage}
          <p style="color: {changePreferenceError ? 'red' : 'green'};">{changePreferenceMessage}</p>
          {/if}
          <div class="form-row">
            <label for="change-web">Receive alerts in Web:</label>
            <input type="checkbox" id="change-web" name="change-web" bind:checked={webAlert}   />
          </div>
          <div class="form-row">
            <label for="change-email">Receive alerts via Email:</label>
            <input type="checkbox" id="change-email" name="change-email" bind:checked={emailAlert}  />
          </div>
          <button type="submit">Submit</button>

        </form>
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

  @media (max-width: 1000px) {
    .header a:nth-child(2) {
      margin-left: 5%;
    }
    .header-background {
      top: 25% !important;
      height: 75% !important;
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
    .sub-header {
      padding-left: 1vh;
    }
    * {
      font-size: 0.75rem !important;
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
    padding-left: 10%;
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
    padding-left: 1vh;
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
  .form-container {
    border-radius: 25px;
    background-color: #fafafa;
    font-family: "Mulish", sans-serif;
    font-weight: 500;
    font-size: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4vh 4vw 4vh 4vw;
    width: fit-content;
    }
  .form-container input {
    padding: 0.5vh 0.5vh 0.5vh 0.5vh;
    border-radius: 2px;
    border: 0px;
    background-color: #eaf3fc;
  }
  .form-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start; 
    margin-bottom: 4vh; 
    gap:1rem;
    min-width: -moz-available;
  }
  .form-row label {
    flex: 0 0 10vw;
  }
  .form-container form {
    display: flex;
    flex-direction: column; 
    align-items: center; 
  }
  form button {
    background-color: #014b96;
    color: white;
    border-radius: 15px;
    text-align: center;
    padding: 0.5vh 7vh 0.5vh 7vh;
    font-family: "Mulish", sans-serif;
    font-weight: 600;
    font-size: 1rem;
    margin-top: 1vh;
  }
  .form-container button:hover {
    background-color: #012f5e;
  }
  .active-btn-div button {
    background-color: #014b96;
    color: white;
    text-align: center;
    border:none;
    padding: 0.25vh 2vw 0.25vh 2vw;
    font-family: "Mulish", sans-serif;
    font-weight: 600;
    font-size: 1rem;
    cursor:pointer;
    transition-duration: 0.4s;
  }
  .active-btn-div button:hover {
    background-color:#0e65bd
  }
  .active-btn-div button:first-child{
    border-radius: 10px 0 0 0;
  }
  .active-btn-div button:last-child{
    border-radius: 0 10px 0 0;
  }
</style>
