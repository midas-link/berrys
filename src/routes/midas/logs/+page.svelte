<script>
    import { onMount } from "svelte";
    import {base} from '$app/paths';
  import Error from "../../+error.svelte";
    let logs_data = '';
    async function fetchLogs() {
        try {
            const response = await fetch('/api/View_Logs', {
                method: 'GET',
                credentials: 'include'
            });
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            logs_data = data;
        } catch (err) {
            console.error("Error fetching logs: ",err);
        }
    }
    onMount(async() => {
        fetchLogs();
    });
</script>
<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Send data </title>
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  <link rel="stylesheet" href="{base}/css/styles.css">

</svelte:head>
<header>
    <div class="header-container">
        <div class="top-header">
            <a class="top-header-link" href="https://berrys.com">berrys.com</a>
        </div>
        <div class="header">
        </div>
    </div>
</header>
<main>
    <div class="main-container">
        <table>
            <thead>
                <tr>
                    <th>Mac Address</th>
                    <th>Serial No</th>
                    <th>Start Time</th>
                    <th>Tank No</th>
                    <th>Fuel Name</th>
                    <th>Fuel Type</th>
                    <th>Delivery Status</th>
                    <th>Charge End</th>
                    <th>End Time</th>
                </tr>
            </thead>
            <tbody>
                {#if logs_data}
                    {#each logs_data as row}
                <tr>
                    <td>{row.mac_address}</td>
                    <td>{row.serial_number}</td>
                    <td>{row.start_time}</td>
                    <td>{row.tank_number}</td>
                    <td>{row.fuel_name}</td>
                    <td>{row.fuel_type}</td>
                    <td>{row.delivery_status}</td>
                    <td>{row.charge_end}</td>
                    <td>{row.end_time}</td>
                </tr>
                    {/each}
                {:else}
                    <tr>
                        <td colspan="9"> No logs are available</td>
                    </tr>
                {/if}
            </tbody>


        </table>
        <a href="/midas/post" class="back-to-post-button"> Go Back to Post Logs</a>
    </div>
</main> 


<footer>
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
        <span style="font-size: 1rem; font-family: Mulish;">@copyrights Berrys Global Innovations</span>
        <img src="{base}/images/logo.png" alt="Berrys Logo" >
    </div>
</footer>


<style>
main { 
    padding: 2rem;
    margin: 0 auto;
    height:100%;
}
.main-container {
    padding-top: 4vh;
    padding-left: 1vw;
    padding-right: 1vw;
    border-top-left-radius: 20px;
    background-color: white;
    min-height: 100vh;
}
table {
    display: block;
    margin-top: 1vh;
    margin-left: auto;
    margin-right: auto;
    max-height: 70vh;
    overflow-y: auto;
    border-collapse: collapse;
    width: 95%;
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
  .back-to-post-button {
    padding: 0.75rem 2rem;
    background: #014b96;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: opacity 0.3s ease;
    text-transform: uppercase;
    font-weight: 700;
  }
  
</style>