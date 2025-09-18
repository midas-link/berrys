<script>
  import { base } from "$app/paths";
  /** @type {import('./$types').PageData} */
  export let data;
  let enteredTerm = data.searchTerm ?? '';
  $: resultsCount = Array.isArray(data.searchResults) ? data.searchResults.length : 0;
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Search</title>
  <link href="{base}/css/styles.css" rel="stylesheet" />
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
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
        <img src="{base}/images/Midas_Link_logo.png" alt="Berrys Logo" />
      </div>
    </div>
  </header>
<main>
  <div>
    <div class="search-bar">
      <div class="search-div">
        <div> Search Results </div>
        {#if data.searchTerm}
          <div>{resultsCount} results found for "{data.searchTerm}"</div>
        {/if}
        {#if data.searchError}
          <div style="color: red;">{data.searchError?.message ?? data.searchError}</div>
        {/if}
        <form method="GET">
          <input type="text" name="q" bind:value={enteredTerm} placeholder="Search..." />
        </form>
      </div>
    </div>
    <div class="results-div">
      <ul class="data-div">
      {#if data.searchTerm && data.searchResults && data.searchResults.length > 0}
          {#each data.searchResults as result}
            <li>
              <div>
              <a href={result.type === 'trailer' ? `${base}/vehicle/${result.address}` : `${base}/deliveryDetail/${result.code}`}> {result.address } {result.state ? `, ${result.state}` : ""} {result.city ? `, ${result.city}` : ""} {result.code ? `, ${result.code}` : ""} </a>
              <div> Page for {result.type} {result.address} </div>
              <div> Some details here </div>
              </div>
            </li>
          {/each}
      {:else if data.searchTerm}
        <p>No results found.</p>
      {:else}
        <p>Enter a search term above.</p>
      {/if}
      </ul>
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
    touch-action: pan-y;
  }
.search-bar {
  display:flex;
  flex-direction: column;
  justify-content: center;
  height:15vh;
}
.search-div {
  display:flex;
  flex-direction: column;
  row-gap:2vh;
  max-width:50vw;
  align-self:center;
}
.search-div div:first-child {
  font-size:1.5rem;
  font-weight: 600;
}
.search-bar input {
  width:45vw;
  height:5vh;
  padding: 1vh 1.5vw 1vh 1.5vw;
  border-radius: 4px;
  border:  1px solid #014b96;
  color: black;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000000" viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>');
  background-repeat: no-repeat;
  background-size: 16px;
  background-position: 0.5vh center;
  background-color:white;
  align-self:center;
}
.results-div {
  margin-top:1vh;
  display:flex;
  justify-content: center;
}
.data-div {
  width:45vw;

}
.data-div {
  padding: 0;
}
.data-div li {
  display:flex;
  margin-top: 1vh;
  height:7.5vh;
  border: 1px solid grey;
  border-radius: 4px;
  align-items: center;
  padding-left: 1vw;
  list-style-type: none;
}
</style>