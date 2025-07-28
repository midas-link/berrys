<script>
  import { onMount, onDestroy } from "svelte";
  import { base } from "$app/paths";
  import Chart from "chart.js/auto";

  let barCanvas, lineCanvas, pieCanvas, doughnutCanvas, radarCanvas;
  let barInstance, lineInstance, pieInstance, doughnutInstance, radarInstance;

  function randomData(length, max = 100) {
    return Array.from({ length }, () => Math.floor(Math.random() * max));
  }

  onMount(() => {
    // Bar Chartz
    barInstance = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: ["Diesel", "High Ethanol", "Gas 91 No Eth", "Gas 87 No Eth", "Gas 93 OCTANE", "Gas 87 Octane"],
        datasets: [
          {
            label: "Product Dataset",
            data: randomData(6),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)"
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Random Bar Chart" }
        }
      }
    });

    // Line Chart
    lineInstance = new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: Array.from({ length: 7 }, (_, i) => `Month ${i + 1}`),
        datasets: [
          {
            label: "Cross Drop Dataset",
            data: randomData(7),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Number of Cross Drops " }
        }
      }
    });

    pieInstance = new Chart(pieCanvas, {
      type: "pie",
      data: {
        labels: ["Arizona", "Texas", "Kansas", "Alabama"],
        datasets: [
          {
            label: "Pie Dataset",
            data: randomData(4),
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 205, 86, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(75, 192, 192, 0.7)"
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Busiest States" }
        }
      }
    });

    doughnutInstance = new Chart(doughnutCanvas, {
      type: "doughnut",
      data: {
        labels: ["On Time", "Late", "Early", "Missed"],
        datasets: [
          {
            label: "Delivery Status",
            data: randomData(4),
            backgroundColor: [
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)"
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Delivery Status Distribution" }
        }
      }
    });

    radarInstance = new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: ["Safety", "Speed", "Accuracy", "Coverage", "Satisfaction"],
        datasets: [
          {
            label: "Performance Metrics",
            data: randomData(5, 10),
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgb(54, 162, 235)",
            pointBackgroundColor: "rgb(54, 162, 235)"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Performance Metrics" }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  });

  onDestroy(() => {
    barInstance?.destroy();
    lineInstance?.destroy();
    pieInstance?.destroy();
    doughnutInstance?.destroy();
    radarInstance?.destroy();
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
  <title>Analytics</title>
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
        <a href="{base}/site-data"> Site Data</a>
        <a href="{base}/inventory">Inventory</a>
        <input type="text" placeholder="Search..." />
        <img src="{base}/images/Midas_Link_logo.png" alt="Berrys Logo" />
      </div>
    </div>
  </header>
  <!-- Mobile sidebar navigation -->
  <div class="mobile-sidebar" id="mobile-sidebar">
    <a href="{base}/home">Home</a>
    <a href="{base}/vehicle-logging">Vehicle Logging</a>
    <a href="{base}/cross-drops">Cross-Drop Prevention</a>
    <a href="{base}/site-data">Site Data</a>
    <a href="{base}/inventory">Inventory</a>
    <span class="footer-text"
      >Contact Us <br />
      Berrys Technologies Ltd 141 Lichfield Road, Birmingham , B6 5SP , United Kingdom
      <br />
      0121 558 4411 <br />
      enquiries@berrys.com</span
    >
  </div>
  
  <div class="overlay" id="overlay"></div>

<main>
  <div class="main-container">
    <h1>Analytics Dashboard</h1>
    <div style="display: flex; flex-wrap: wrap; gap: 2rem;justify-content:center">
      <div style="flex: 1 1 300px; max-width: 400px;">
        <canvas bind:this={barCanvas} width="400" height="300"></canvas>
      </div>
      <div style="flex: 1 1 300px; max-width: 400px;">
        <canvas bind:this={lineCanvas} width="400" height="300"></canvas>
      </div>
      <div style="flex: 1 1 300px; max-width: 400px;">
        <canvas bind:this={pieCanvas} width="400" height="300"></canvas>
      </div>
      <div style="flex: 1 1 300px; max-width: 400px;">
        <canvas bind:this={doughnutCanvas} width="400" height="300"></canvas>
      </div>
      <div style="flex: 1 1 300px; max-width: 400px;">
        <canvas bind:this={radarCanvas} width="400" height="300"></canvas>
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
    flex: 1;
  }
  ::placeholder {
    color: #ffffff;
  }
  .header a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  .header input {
    width: 8vw;
  }
  .header input[type="text"] {
    padding: 1vh 1.5vw;
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
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4vh;
    border-top-left-radius: 20px;
    background-color: white;
    height: 100%;
  }
</style>