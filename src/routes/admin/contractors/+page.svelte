<script>
    import {base} from '$app/paths';
    import {goto} from '$app/navigation';
    import { onMount } from 'svelte';
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { page } from '$app/stores';
    let trailers = [];
    let filtered = false;
    let filteredTrailers =[];
    let error = null;
    let isLoading = true;
    function formatEpochToDisplay(timestamp) {
    const date = new Date(timestamp);
     return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
     }).replace(/\//g,"-");
    }
    function searchTrailer(searchedTrailer) {
    filteredTrailers = [];
    if(searchedTrailer.length===0) 
      filtered= false;
    trailers.forEach(element => {
      if(element.trailer_number.includes(searchedTrailer))
        {
        filteredTrailers.push(element);
        filtered= true;
        }
    });
    console.log(filteredTrailers);
    }
    async function handleLogout(){
        await goto(`${base}/login?authMessage=${encodeURIComponent('You have been logged out.')}`);
    }

    onMount(async () => {
    });
</script>
<svelte:head>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
    <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
  ></script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href='https://fonts.googleapis.com/css?family=Mulish' rel='stylesheet'>
    <link href='https://fonts.googleapis.com/css?family=Inter' rel='stylesheet'>
    <link rel="stylesheet" href="{base}/css/styles.css">
    <title>Contractors</title>
</svelte:head>
    <header>
        <div class="header-container">
            <div class="top-header">
                <a class="top-header-link" href="https://berrys.com">berrys.com</a>
            </div>
            <div class="header">
                <button class="header-btn" on:click={goto(`${base}/admin`)}> Dashboard </button>
                <button class="header-btn" on:click={handleLogout} > Logout</button>
            </div>
        </div>
    </header>

    <div class="main-container">
        <div class="dashboard-header">
            <h1>Contractors</h1>
            <div class="date-time">{new Date().toLocaleString()}</div>
            <input type="text" placeholder="Search Trailers" class="search-bar" on:keydown={(e) => {if(e.key==='Enter'){ searchTrailer(e.target.value)} }}> 
        </div>
        <div class="data-container">
            <table class="desktop-view">
              <thead>
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th></th>
                </tr>
              </thead>
              <tbody>
    {#if isLoading}
    <tr>
        <td> Loading Trailers</td>
    </tr>
    {:else if error}
    <tr>
        <td>{error}</td>
    </tr>
    {:else if (filtered ? filteredTrailers : trailers).length > 0}
    {#each (filtered ? filteredTrailers : trailers) as row, index}
        <tr>
            <td>{row.trailer_id}</td>
            <td>{row.trailer_number}</td>
            <td>{formatEpochToDisplay(row.date_added)}</td>
        </tr>
        {/each}
    {/if}
    </tbody>
    </table>
    </div>
    </div> 
    <footer>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
            <span style="font-size: 1rem; font-family: Mulish;">@copyrights Berrys Global Innovations</span>
            <img src="{base}/images/logo.png" alt="Berrys Logo" >
        </div>
    </footer>

<style>
.main-container{
    padding: 2rem;
    margin: 0 auto;
    height:100%;
}
.dashboard-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    justify-content: space-between;
}
.dashboard-header h1 {
    font-family: 'Mulish', sans-serif;
    color: #014B96;
    margin: 0;
}
  table {
    display: block;
    margin-top: 1vh;
    margin-left: auto;
    margin-right: auto;
    max-height: 70vh;
    overflow-y: auto;
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
  tbody {
    display: block;
    overflow-y: auto;
    width: 100%;
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
  .header-btn {
    background: #014B96;
    color: white;
    border: white 1px solid;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-family: 'Mulish', sans-serif;
    cursor: pointer;
    transition: background-color 0.3s;
}
.header-btn:hover {
    background: #013b77;
}
.header-btn:last-child{
  margin-left: 2vw;
}
.search-bar{
  background: #014B96;
  color: white;
  border: white 1px solid;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-family: 'Mulish', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s;
}
.search-bar::placeholder{
  color:white;
}
</style>