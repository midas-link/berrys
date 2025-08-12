<script>
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { page } from "$app/stores";
  let users = [];
  let filtered = false;
  let filteredUsers = [];
  let selectedUserIds = [];
  let error = null;
  let isLoading = true;
  let verificationMessage = "";
  let verificationError = false;
  let editingUserId = null;
  let buOptions = [];
  let actionConfirmed = false;
  let showConfirmDialog = false;
  let confirmMessage = "";
  let confirmCallback = null;
  let userToDelete = null;

  function formatEpochToDisplay(timestamp) {
    const date = new Date(timestamp);
    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-");
  }
  function editBusinessUnit(userId) {
    editingUserId = userId;
  }
  
  function confirmAction(message, callback) {
    confirmMessage = message;
    confirmCallback = callback;
    showConfirmDialog = true;
  }
  
  function handleConfirm() {
    if (confirmCallback) {
      confirmCallback();
    }
    showConfirmDialog = false;
    confirmCallback = null;
    userToDelete = null;
  }
  
  function handleCancel() {
    showConfirmDialog = false;
    confirmCallback = null;
    userToDelete = null;
  }
  
  function cancelEdit() {
    editingUserId = null;
  }
  
  function deleteUser(userId) {
    userToDelete = userId;
    const user = users.find(u => u.user_id === userId);
    const userName = user ? `${user.first_name} ${user.last_name}` : userId;
    confirmAction(
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      async() => {
        try  {
        const response = await fetch('/api/deleteUser', {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId : userId
          }),
          credentials: "include"
        })
        if(!response.ok) {
          if(response.status === 400) {
            console.log("No user was selected");
          } else if (response.status === 403) {
            console.log("You cannot delete an admin user.");
          } else if( response.status === 404) {
            console.log("User was not found in the database.")
          }
        }
        const data = await response.json();
        verificationError = false;
        verificationMessage = data.message ; 
        console.log(`user id ${userId} deleted.`);

      } catch (err) {
        console.error("Error deleting user:", err);
      }
      }
    );
  }
  async function saveBusinessUnit(userId, newBusinessUnit) {
    try {
      const response = await fetch("/api/admin/setBusinessUnit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          selectedUserIds: [userId],
          buName: newBusinessUnit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        users = users.map((user) => {
          if (user.user_id === userId) {
            return { ...user, business_unit: newBusinessUnit };
          }
          return user;
        });

        verificationError = false;
        verificationMessage =
          data.message ||
          `Business unit for user ${userId} updated successfully.`;
      } else {
        verificationError = true;
        verificationMessage =
          data.error || `Failed to update business unit for user ${userId}.`;
        console.error("API Error:", data.error);
      }
    } catch (err) {
      verificationError = true;
      verificationMessage = `An error occurred: ${err.message}`;
      console.error("Client-side Error:", err);
    } finally {
      editingUserId = null;
    }
  }
  function searchUser(searchedUser) {
    filteredUsers = [];
    if (searchedUser.length === 0) filtered = false;
    users.forEach((element) => {
      if (
        element.email?.includes(searchedUser) ||
        element.first_name?.includes(searchedUser) ||
        element.last_name?.includes(searchedUser)
      ) {
        filteredUsers.push(element);
        filtered = true;
      }
    });
    console.log(filteredUsers);
  }
  async function handleVerifyUsers() {
    if (selectedUserIds.length === 0) {
      alert("Please select at least on user to verify.");
      return;
    }
    try {
      const response = await fetch("/api/admin/verifyUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          selectedUserIds: selectedUserIds,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        selectedUserIds = [];
        verificationError = false;
        verificationMessage = data.message || "Users verified successfully!";
        filteredUsers = [];
        await fetchUsers();
      } else {
        verificationError = true;
        verificationMessage = data.error || "Verification failed.";
      }
    } catch (err) {
      verificationError = true;
      verificationMessage = err.message || "Client-side error occurred.";
    }
  }
  async function handleLogout() {
    await goto(
      `${base}/login?authMessage=${encodeURIComponent("You have been logged out.")}`
    );
  }
  async function fetchUsers() {
    isLoading = true;
    error = null;

    try {
      const response = await fetch(`/api/admin/users`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          await goto(
            `${base}/login?authMessage=${encodeURIComponent("Your session has expired. Please log in again.")}`
          );
          return;
        } else if (response.status === 403) {
          await goto(
            `${base}/login?authMessage=${encodeURIComponent("Access Denied. You do not have administrator privileges.")}`
          );
          return;
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error occurred." }));
          throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }
      }

      users = await response.json();
      const allbuOptions = users.map((BU) => BU.business_unit);
      buOptions = [...new Set(allbuOptions)];
      console.log("Admin users loaded:", users);
    } catch (err) {
      console.error("Error fetching admin users:", err);
      error = err.message || "Failed to load users. Please try again.";
    } finally {
      isLoading = false;
    }
  }
  onMount(async () => {
    await fetchUsers();
  });
</script>

<svelte:head>
  <script
    src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  ></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
  ></script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    href="https://fonts.googleapis.com/css?family=Mulish"
    rel="stylesheet"
  />
  <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  <link rel="stylesheet" href="{base}/css/styles.css" />
  <title>Manage Users</title>
</svelte:head>
<header>
  <div class="header-container">
    <div class="top-header">
      <a class="top-header-link" href="https://berrys.com">berrys.com</a>
    </div>
    <div class="header">
      <button class="header-btn" on:click={goto(`${base}/admin`)}>
        Dashboard
      </button>
      <button class="header-btn" on:click={handleLogout}> Logout</button>
    </div>
  </div>
</header>

<div class="main-container">
  <div class="dashboard-header">
    <h1>Manage users</h1>
    <div class="date-time">{new Date().toLocaleString()}</div>
    <input
      type="text"
      placeholder="Search Users"
      class="search-bar"
      on:keydown={(e) => {
        if (e.key === "Enter") {
          searchUser(e.target.value);
        }
      }}
    />
  </div>
  {#if verificationMessage}
    <span style="color: {verificationError ? 'red' : 'green'};">
      {verificationMessage}
    </span>
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
            <th>Business Unit</th>
            <th>Verification Status</th>
            <th>Verify user</th>
            <th></th>
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
            {#each filtered ? filteredUsers : users as row, index}
              <tr>
                <td data-label="User ID">{row.user_id}</td>
                <td data-label="Full Name">{row.first_name} {row.last_name}</td>
                <td data-label="Title">{row.title} </td>
                <td data-label="Company Name">{row.company_name}</td>
                <td data-label="Email">{row.email}</td>
                <td data-label="Phone Number">{row.phone_number}</td>
                <td data-label="Is Admin">{row.is_admin ? "Yes" : "No"}</td>
                <td data-label="Business Unit" class="business-unit-cell">
                  {#if editingUserId === row.user_id}
                    <div class="edit-mode-container">
                      <input
                        type="text"
                        bind:value={row.business_unit}
                        placeholder="Business Unit"
                        list="BuList"
                      />
                      <datalist id="BuList">
                        {#each buOptions as BusinessUnit}
                          <option value={BusinessUnit}></option>
                        {/each}
                      </datalist>
                      <button
                        on:click={() =>
                          saveBusinessUnit(row.user_id, row.business_unit)}
                        class="header-btn"
                        type="button">Save</button
                      >
                      <button
                        on:click={() => cancelEdit()}
                        type="button"
                        class="header-btn">Cancel</button
                      >
                    </div>
                  {:else}
                    <div class="view-mode-container">
                      {row.business_unit}
                      <button
                        on:click={() =>
                          editBusinessUnit(row.user_id, row.business_unit)}
                        class="header-btn"
                        type="button">Edit</button
                      >
                    </div>
                  {/if}
                </td>
                <td data-label="Verification Status"
                  >{row.verify_user ? "Verified" : "Not verified"}</td
                >
                <td data-label="Verify user"
                  ><input
                    type="checkbox"
                    bind:group={selectedUserIds}
                    value={row.user_id}
                    disabled={row.verify_user}
                  />
                </td>
                <td
                  ><button on:click={() => deleteUser(row.user_id)} class="delete-btn" type="button"
                    >Delete</button
                  ></td
                >
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
      <button type="submit" class="header-btn verify-button-desktop">
        Verify Selected Users
      </button>
      <button type="submit" class="header-btn verify-button-mobile">
        Verify Selected Users
      </button>
    </form>
  </div>
  
  {#if showConfirmDialog}
    <div class="confirm-overlay">
      <div class="confirm-dialog">
        <h3>Confirm Action</h3>
        <p>{confirmMessage}</p>
        <div class="confirm-buttons">
          <button class="header-btn confirm-btn" on:click={handleConfirm}>
            Confirm
          </button>
          <button class="header-btn cancel-btn" on:click={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
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
  .main-container {
    padding: 2rem;
    margin: 0 auto;
    height: 100%;
  }
  .dashboard-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    justify-content: space-between;
  }
  .dashboard-header h1 {
    font-family: "Mulish", sans-serif;
    color: #014b96;
    margin: 0;
  }
  table {
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
    table-layout: fixed;
  }
  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #004b96;
  }
  tbody {
    overflow-y: auto;
    width: 100%;
  }
  thead tr,
  tbody tr {
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
    white-space: nowrap;
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
  }
  .header-btn {
    background: #014b96;
    color: white;
    border: white 1px solid;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-family: "Mulish", sans-serif;
    transition: background-color 0.3s;
  }
  .delete-btn {
    background: rgba(252, 72, 72, 0.979);
    color: white;
    border: white 1px solid;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-family: "Mulish", sans-serif;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .header-btn:hover {
    background: #013b77;
  }

  .search-bar {
    background: #014b96;
    color: white;
    border: white 1px solid;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-family: "Mulish", sans-serif;
    transition: background-color 0.3s;
  }
  .search-bar::placeholder {
    color: white;
  }
  .data-container {
    overflow-x: auto;
  }

  .desktop-view {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .desktop-view thead {
    background-color: #004b96;
    color: white;
  }
  .desktop-view th,
  .desktop-view td {
    padding: 16px;
    text-align: center;
    font-family: "Mulish", sans-serif;
    border: 1px solid #ddd;
  }
  .desktop-view th {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .desktop-view tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  .verify-button-desktop {
    display: block;
  }
  .verify-button-mobile {
    display: none;
  }

  @media (max-width: 1000px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .desktop-view,
    .desktop-view thead,
    .desktop-view tbody,
    .desktop-view th,
    .desktop-view td,
    .desktop-view tr {
      display: block;
    }

    .desktop-view thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }

    .desktop-view tr {
      border: 1px solid #ccc;
      margin-bottom: 1rem;
    }

    .desktop-view td {
      border: none;
      border-bottom: 1px solid #eee;
      position: relative;
      padding-left: 60% !important;
      text-align: right;
      word-break: break-word;
      white-space: normal;
      font-size: 0.95rem;
    }

    .desktop-view td::before {
      content: attr(data-label);
      position: absolute;
      left: 0;
      width: 45%;
      max-width: 95%;
      padding-left: 15px;
      font-weight: bold;
      text-align: left;
      white-space: normal;
      word-break: break-word;
      font-size: 0.95rem;
    }

    .verify-button-desktop {
      display: none;
    }
    .verify-button-mobile {
      display: block;
      width: 100%;
      margin-top: 1rem;
    }

    .search-bar {
      width: 100%;
      box-sizing: border-box;
    }

    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
  }
  .edit-mode-container {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: center;
    flex-wrap: nowrap;
  }
  .edit-mode-container input[type="text"] {
    width: 100px;
  }
  .business-unit-cell {
    white-space: nowrap;
  }
  .business-unit-cell .view-mode-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    white-space: nowrap;
  }

  .edit-mode-container button,
  .view-mode-container button {
    padding: 5px 10px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
</style>
