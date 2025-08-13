<script>
    import { base } from "$app/paths";
    import { onMount } from "svelte";
    
    let activeView = "monthly"; 
    let divRef;
    let leftRef; 
    let midRef; 
    let rightRef;
    let currentData= {};
    let deliveryTrend = true;
    let cDropsTrend = true;
    let totalMilesTrend = true;
    $: {
      deliveryTrend = calculateChange(currentData.deliveries || 0, currentData.prevDeliveries || 1) > 0;
      cDropsTrend = calculateChange(currentData.cDrops || 0, currentData.prevcDrops || 1) < 0;
      totalMilesTrend = calculateChange(currentData.totalMiles || 0, currentData.prevTotalMiles || 1) > 0;
    }
    const monthlyData = {
      deliveries: 341,
      prevDeliveries: 297,
      cDrops: 35,
      prevcDrops: 30,
      totalMiles: 1342,
      prevTotalMiles: 1213
    }
    const weeklyData = {
      deliveries: 70,
      prevDeliveries: 81,
      cDrops: 7,
      prevcDrops: 10,
      totalMiles: 341,
      prevTotalMiles: 338
    }
    const dailyData = {
      deliveries: 15,
      prevDeliveries: 14,
      cDrops: 0,
      prevcDrops: 1,
      totalMiles: 60,
      prevTotalMiles: 55
    }
    function changeView(view) {
      activeView = view;
      if(view === "monthly") {
        currentData = monthlyData ;
      } else if(view === "weekly") {
        currentData = weeklyData ;
      } else {
        currentData = dailyData ;
      }
    }
    function toggleFullScreen() {
      if(!document.fullscreenElement) {
        divRef.style.backgroundColor = "white";
        leftRef.style.height = "80vh";
        midRef.style.height = "80vh";
        rightRef.style.height = "80vh";
        leftRef.style.width = "30vw";
        midRef.style.width = "30vw";
        rightRef.style.width = "30vw";
        divRef.requestFullscreen().catch((err)=> {
          console.error(`Error enabling fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen?.();
      }
    }
    function calculateChange(x,y) {
      return ((((x/y)) - 1) * 100).toPrecision(4)
    }
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        leftRef.style.height = "50vh";
        midRef.style.height = "50vh";
        rightRef.style.height = "50vh";
        leftRef.style.width = "20vw";
        midRef.style.width = "20vw";
        rightRef.style.width = "20vw";
        divRef.style.backgroundColor = "";
      }
    }
    
    onMount(() => {
      currentData = monthlyData;
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    });
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
<main bind:this={divRef}>
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
            <div class="full-screen-div"> <button on:click={toggleFullScreen} class="full-screen-btn">&#x26F6;</button> </div>
    </div>
    <div class="content" >
        <div class="deliveries" bind:this={leftRef}>
            <div class="total-num" style="justify-self:center"> {currentData.deliveries} Deliveries </div>
                <div class="stats-comparison">
                    <div class="stats-left">
                    <b>Previous </b>
                    <span> {currentData.prevDeliveries} </span>
                    </div>
                    <div class="stats-right">
                    <b>Change</b>
                    <span> {calculateChange(currentData.deliveries,currentData.prevDeliveries) > 0 ? "+" : "" }{calculateChange(currentData.deliveries,currentData.prevDeliveries)}% </span>
                    </div>
                </div>
            <div class="trends">   
                <span>Trends 
                    <span style="color:{deliveryTrend ? "green" : "red"};font-size:2.5rem; transform:{ deliveryTrend ? 'rotate(0deg)' : 'rotate(180deg)' }; display:inline-block;">&#x25B2; </span> 
                </span>
            </div>
            <div class="delivery-content" >  Successful Deliveries </div>
        </div>
        <div class="cross-drops" bind:this={midRef}>
            <div class="total-num" style="justify-self:center"> {currentData.cDrops} Cross Drops </div>
                <div class="stats-comparison">
                    <div class="stats-left">
                    <b>Previous </b>
                    <span> {currentData.prevcDrops} </span>
                    </div>
                    <div class="stats-right">
                    <b>Change</b>
                    <span>{calculateChange(currentData.cDrops,currentData.prevcDrops) > 0 ? "+" : ""}{calculateChange(currentData.cDrops,currentData.prevcDrops)}%</span>
                    </div>
                </div>
            <div class="trends">   
                <span>Trends 
                  <span style="color:{ cDropsTrend ? 'green' : 'red' }; font-size:2.5rem; transform:{ cDropsTrend ? 'rotate(0deg)' : 'rotate(180deg)' }; display:inline-block;">&#x25B2;</span>
            </div>
            <div class="cdrop-content" > Cross Drops </div>

        </div>
        <div class="total-miles" bind:this={rightRef}>
            <div class="total-num" style="justify-self:center"> {currentData.totalMiles} Miles </div>
                <div class="stats-comparison">
                    <div class="stats-left">
                    <b>Previous </b>
                    <span> {currentData.prevTotalMiles} Miles </span>
                    </div>
                    <div class="stats-right">
                    <b>Change</b>
                    <span>{calculateChange(currentData.totalMiles,currentData.prevTotalMiles) > 0 ? "+" : ""}{calculateChange(currentData.totalMiles,currentData.prevTotalMiles)}%</span>
                    </div>
                </div>
            <div class="trends">   
                <span>Trends 
                    <span style="color:{totalMilesTrend ? "green" : "red"};font-size:2.5rem; transform:{ totalMilesTrend ? 'rotate(0deg)' : 'rotate(180deg)' }; display:inline-block;">&#x25B2; </span> 
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