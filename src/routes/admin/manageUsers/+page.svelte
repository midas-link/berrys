<script>
    import {base} from '$app/paths';
    import {goto} from '$app/navigation';
    import { onMount } from 'svelte';
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { page } from '$app/stores';
    let users = [];
    let filtered = false;
    let filteredUsers =[];
    let selectedUserIds = [];
    let error = null;
    let isLoading = true;
    let verificationMessage = '';
    let verificationError = false;
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
  function searchUser(searchedUser) {
    filteredUsers = [];
    if(searchedUser.length===0) 
      filtered= false;
    users.forEach(element => {
      if(element.email.includes(searchedUser))
        {
        filteredUsers.push(element);
        filtered= true;
        }
    });
    console.log(filteredUsers);
  }
  async function handleVerifyUsers() {
    if(selectedUserIds.length ===0) {
      alert('Please select at least on user to verify.');
      return;
    }
    try{
      const response = await fetch('/api/admin/verifyUsers', {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
        },
        credentials:'include',
        body:JSON.stringify({
          selectedUserIds: selectedUserIds
        }),
      });
      const data = await response.json();
      if(response.ok) {
        selectedUserIds = [];
        verificationError = false;
        verificationMessage = data.message || "Users verified successfully!";
        filteredUsers = [];
        await fetchUsers(); 
      }
      else {
        verificationError = true;
        verificationMessage = data.error || "Verification failed.";
      }
    } catch(err){
      verificationError = true;
      verificationMessage = err.message || "Client-side error occurred.";
    }
  }
  async function handleLogout(){
        await goto(`${base}/login?authMessage=${encodeURIComponent('You have been logged out.')}`);
    }
    async function fetchUsers() {
        isLoading = true;
        error = null; 


        try {
            const response = await fetch(`/api/admin/users`, {
               credentials:'include'
            });

            if (!response.ok) {
                if (response.status === 401) { 
                    await goto(`${base}/login?authMessage=${encodeURIComponent('Your session has expired. Please log in again.')}`);
                    return;
                } else if (response.status === 403) { 
                    await goto(`${base}/login?authMessage=${encodeURIComponent('Access Denied. You do not have administrator privileges.')}`);
                    return;
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred.' }));
                    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
                }
            }

            users = await response.json(); 
            console.log('Admin users loaded:', users); 

        } catch (err) {
            console.error('Error fetching admin users:', err);
            error = err.message || 'Failed to load users. Please try again.';
        } finally {
            isLoading = false; 
        }
    }
    onMount(async () => {
        await fetchUsers();
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
    <title>Manage Users</title>
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
            <h1>Manage users</h1>
            <div class="date-time">{new Date().toLocaleString()}</div>
            <input type="text" placeholder="Search Users" class="search-bar" on:keydown={(e) => {if(e.key==='Enter'){ searchUser(e.target.value)} }}> 
        </div>
        {#if verificationMessage}
          <span style="color: {verificationError ? 'red' : 'green'};"> {verificationMessage} </span>
        {/if}
        <div class="data-container">
          <form on:submit|preventDefault={handleVerifyUsers}>    
            <table class="desktop-view">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Title </th>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Is Admin</th>
                  <th>Last Login</th>
                  <th>Verification Status</th>
                  <th>Verify user</th>
                </tr>
              </thead>
              <tbody>
    {#if isLoading}
    <tr>
        <td> Loading users</td>
    </tr>
    {:else if error}
    <tr>
        <td>{error}</td>
    </tr>
    {:else if (filtered ? filteredUsers : users).length > 0}
    {#each (filtered ? filteredUsers : users) as row, index}
        <tr>
           <td>{row.user_id}</td> 
           <td>{row.first_name} {row.last_name}</td>
           <td>{row.title} </td>
           <td>{row.company_name}</td>
           <td>{row.email}</td>
           <td>{row.phone_number}</td>
           <td>{row.is_admin ? "Yes" : "No"}</td>
           <td>{formatEpochToDisplay(row.last_login)}</td>
           <td>{row.verify_user ? "Verified" : "Not verified"}</td>
           <td><input type="checkbox" bind:group={selectedUserIds} value={row.user_id} disabled={row.verify_user}> </td>
        </tr>
        {/each}
    {/if}
    </tbody>
    </table>
    <button type="submit" class="header-btn" style="position:absolute;margin-right:2%;right:0;"> Verify Selected Users </button>
    </form>
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