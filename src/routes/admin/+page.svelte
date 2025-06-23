<script>
    import {base} from '$app/paths';
    import { onMount } from 'svelte';

    // Sample data - replace with actual data from your backend
    let stats = {
        totalCustomers: 50,
        activeTrailers: 100,
        activeMidas: 52,
        totalDeliveries: 150,
        preventedCrossDrops: 25
    };

    let recentActivity = [];
    let isLoading = true;

    onMount(async () => {
        // Add your data fetching logic here
        isLoading = false;
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
    <title>Admin Panel</title>
</svelte:head>
    <header>
        <div class="header-container">
            <div class="top-header">
                <a class="top-header-link" href="https://berrys.com">berrys.com</a>
            </div>
            <div class="header">
                <a href="{base}/login"> Logout</a>
            </div>
        </div>
    </header>
    <div class="main-container">
        <div class="dashboard-header">
            <h1>Admin Dashboard</h1>
            <div class="date-time">{new Date().toLocaleString()}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>Total Customers</h3>
                    <p>{stats.totalCustomers}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="{base}/images/Truck_graphic.png" alt="Trailer" style="width:90%; height:90%;"></div>
                <div class="stat-content">
                    <h3>Active Trailers</h3>
                    <p>{stats.activeTrailers}</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon"><img src="{base}/images/Moving_truck.png" alt="Trailer" style="width:90%; height:90%;"></div>
                <div class="stat-content">
                    <h3>Total Deliveries</h3>
                    <p>{stats.totalDeliveries}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><img src="{base}/images/Cross-drop graphic.png" alt="Trailer" style="width:90%; height:90%;"></div>
                <div class="stat-content">
                    <h3>Prevented Cross-Drops</h3>
                    <p>{stats.preventedCrossDrops}</p>
                </div>
            </div>
        </div>

        <div class="admin-actions">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
                <button class="action-btn">Manage Users</button>
                <button class="action-btn">View Reports</button>
                <button class="action-btn">System Settings</button>
                <button class="action-btn">Export Data</button>
            </div>
        </div>

        <div class="recent-activity">
            <h2>Recent Activity</h2>
            <div class="activity-list">
                {#if isLoading}
                    <p>Loading...</p>
                {:else if recentActivity.length === 0}
                    <p>No recent activity</p>
                {:else}
                    {#each recentActivity as activity}
                        <div class="activity-item">
                            <span class="activity-time">{activity.time}</span>
                            <span class="activity-description">{activity.description}</span>
                        </div>
                    {/each}
                {/if}
            </div>
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
    max-width: 1200px;
    margin: 0 auto;
    height:100%;
}
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}
.dashboard-header h1 {
    font-family: 'Mulish', sans-serif;
    color: #014B96;
    margin: 0;
}
.date-time {
    font-family: 'Mulish', sans-serif;
    color: #666;
}
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}
.stat-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}
.stat-icon {
    font-size: 2rem;
}
.stat-content h3 {
    font-family: 'Mulish', sans-serif;
    font-size: 0.9rem;
    color: #666;
    margin: 0 0 0.5rem 0;
}
.stat-content p {
    font-family: 'Mulish', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: #014B96;
    margin: 0;
}
.admin-actions {
    margin-bottom: 2rem;
}
.admin-actions h2 {
    font-family: 'Mulish', sans-serif;
    color: #014B96;
    margin-bottom: 1rem;
}
.action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}
.action-btn {
    background: #014B96;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    font-family: 'Mulish', sans-serif;
    cursor: pointer;
    transition: background-color 0.3s;
}
.action-btn:hover {
    background: #013b77;
}
.recent-activity {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.recent-activity h2 {
    font-family: 'Mulish', sans-serif;
    color: #014B96;
    margin-bottom: 1rem;
}
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.activity-item {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
}
.activity-time {
    color: #666;
    font-size: 0.9rem;
}
.activity-description {
    color: #333;
}
.header a{
    padding-bottom:2vh;
}
@media (max-width: 1000px) {
    .main-container {
        padding: 1rem;
    }
    .stats-grid {
        grid-template-columns: 1fr;
    }
    .action-buttons {
        grid-template-columns: 1fr;
    }
}
</style>