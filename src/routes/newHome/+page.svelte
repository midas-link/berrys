<script>
    import { base } from "$app/paths";
    let activeView = "monthly"; 

</script>
<svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Home</title>
    <link
      href="https://fonts.googleapis.com/css?family=Mulish"
      rel="stylesheet"
    />
    <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
    <link href="{base}/css/styles.css" rel="stylesheet" />
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
          style="background: url({base}/svg/Vector_1.svg) no-repeat left center; mask-image: url({base}/svg/Vector_1.svg'); -webkit-mask-image: url({base}/svg/Vector_1.svg);"></div>
        <div class="hamburger-menu" id="hamburger-menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <a href="{base}/home">Home</a>
        <a href="{base}/inventory">Inventory</a>
        <a href="{base}/cross-drops">Cross-Drop Prevention</a>
        <a href="{base}/vehicle-logging">Vehicle Logging</a>
        <a href="{base}/analytics">Analytics</a>
        <input type="text" placeholder="Search..." />
        <img src="{base}/images/Midas_Link_logo.png" alt="Berrys Logo" />
      </div>
    </div>
</header>
<main>
    <div class="btn-div">
        <div class="timeline-controls">
        <button
            class="timeline-view-btn {activeView === 'daily' ? 'active' : ''}"
            on:click={() => changeView("daily")}
        >
            Today
        </button>
        <button
            class="timeline-view-btn {activeView === 'weekly' ? 'active' : ''}"
            on:click={() => changeView("weekly")}
        >
            Week
        </button>
        <button
            class="timeline-view-btn {activeView === 'monthly' ? 'active' : ''}"
            on:click={() => changeView("monthly")}
        >
            Month
        </button>
        </div>
            <div class="full-screen-div"> <button class="full-screen-btn">&#x26F6;</button> </div>
    </div>
    <div class="content">
        
        <div class="deliveries">
            <div class="total-num" style="justify-self:center"> 341 Deliveries </div>
                <div class="stats-comparison">
                    <div class="stats-left">
                    <b>Previous </b>
                    <span> 297 </span>
                    </div>
                    <div class="stats-right">
                    <b>Change</b>
                    <span>+14.81%</span>
                    </div>
                </div>
            <div class="trends">   
                <span>Trends 
                    <span style="color:green;font-size:2.5rem">&#x25B2; </span> 
                </span>
            </div>
            <div class="delivery-content" >  Successful Deliveries </div>
        </div>
        <div class="cross-drops">
            <div class="total-num" style="justify-self:center"> 35 Cross Drops </div>
                <div class="stats-comparison">
                    <div class="stats-left">
                    <b>Previous </b>
                    <span> 30 </span>
                    </div>
                    <div class="stats-right">
                    <b>Change</b>
                    <span>+16.66%</span>
                    </div>
                </div>
            <div class="trends">   
                <span>Trends 
                    <span style="color:red;font-size:2.5rem">&#x25B2; </span> 
                </span>
            </div>
            <div class="cdrop-content" > Cross Drops </div>

        </div>
        <div class="total-miles">
            <div class="total-num" style="justify-self:center"> 1342 Miles </div>
                <div class="stats-comparison">
                    <div class="stats-left">
                    <b>Previous </b>
                    <span> 1213 Miles </span>
                    </div>
                    <div class="stats-right">
                    <b>Change</b>
                    <span>+10.63%</span>
                    </div>
                </div>
            <div class="trends">   
                <span>Trends 
                    <span style="color:green;font-size:2.5rem">&#x25B2; </span> 
                </span>
            </div>
            <div class="mileage-content" >  Total Miles </div>
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
    display: flex;
    flex-direction: column;
    margin-bottom: 5vh;
    touch-action: pan-y;
    margin-top: 2vh;
    margin-left: 2vw;
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
  .cross-drops,
  .total-miles,
  .deliveries {
    display:grid;
    grid-template-rows: 1fr 1fr 0.6fr 0.4fr;
    border: solid 3px #014B96 ;
    height: 50vh;
    width: 20vw;
    border-radius: 20px;
  }
  .btn-div{
    display: grid; 
    grid-template-columns: 1fr auto; 
    align-items: center; 
    gap: 1rem;
  }
  .content {
    display:grid;
    grid-template-rows: auto auto;
    row-gap: 5vh;
    grid-template-columns: auto auto auto;
    justify-items: center;
  }
  .mileage-content,
  .cdrop-content,
  .delivery-content {
    font-family: "Mulish", sans-serif;
    font-weight: 800;
    font-size: 1rem;
    background-color:#014B96;
    width:100%;
    border-radius:12px;
    color: white;
    display:flex;
    text-align: center;
    justify-content:center;
    align-items: center;
  }
  .timeline-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 1.5vh;
    margin-bottom: 2vh;
  }
  .full-screen-btn ,
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
  .full-screen-btn {
    font-size: 1rem;
  }
  .timeline-view-btn.active {
    background-color: #014b96;
    color: white;
  }

  .timeline-view-btn:hover:not(.active) {
    background-color: #d5e7f7;
  }
  .full-screen-div {
    padding-right:2vw;
  }
  .stats-comparison{
    font-family: "Mulish", sans-serif;
    font-size: 1.25rem;
    display:grid;
    grid-template-columns: auto auto;
    column-gap: 5vw;
  }
  .trends {
    font-family: "Mulish", sans-serif;
    font-size: 1.25rem;
    justify-self: center;
  }
  .stats-left {
    display:grid;
    grid-template-rows: 0.3fr 0.3fr;
    padding-left: 1.5vw;
    justify-items: center;
  }
  .stats-right {
    display:grid;
    grid-template-rows: 0.3fr 0.3fr;
    justify-items: center;
  }
  .total-num {
    font-family: "Mulish", sans-serif;
    font-size: 2rem;
    justify-self: center;
    align-self:center;
  }
</style>