<script>
    import { onMount } from "svelte";
    import {base} from '$app/paths';
    let Mac_Address = '';
    let Serial_Number = '';
    let Start_Time = '';
    let Tank_No = '';
    let Fuel_Name = '';
    let Fuel_Type = '';
    let Delivery_Status = '';
    let Charge_End = '';
    let End_Time = '';
    let responseMessage = '';
    let isError = false;
    let macAddressError = '';
    let isMacAddressValid = false;

    function validateMacAddress(mac) {
        mac = mac.trim();
        
   
        const macPatterns = [
            /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, // XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
            /^([0-9A-Fa-f]{2}\.){5}([0-9A-Fa-f]{2})$/, // XX.XX.XX.XX.XX.XX
            /^[0-9A-Fa-f]{12}$/ // XXXXXXXXXXXX (no separators)
        ];
        
        return macPatterns.some(pattern => pattern.test(mac));
    }

    function formatMacAddress(mac) {
        mac = mac.replace(/[^0-9A-Fa-f]/g, '');
        
        mac = mac.toUpperCase();
        
        if (mac.length === 12) {
            return mac.match(/.{2}/g).join(':');
        }
        
        return mac;
    }

    function handleMacAddressInput(event) {
        const value = event.target.value;
        Mac_Address = value;
        
        if (value === '') {
            macAddressError = '';
            isMacAddressValid = false;
            return;
        }
        
        isMacAddressValid = validateMacAddress(value);
        
        if (!isMacAddressValid) {
            macAddressError = 'Invalid MAC address format. Use XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX';
        } else {
            macAddressError = '';
            Mac_Address = formatMacAddress(value);
        }
    }

    async function sendDataToDatabase() {
        responseMessage = '';
        isError = false;
        
        if(!Mac_Address || !Serial_Number  || !Start_Time || !Tank_No || !Fuel_Name || !Fuel_Type || !Delivery_Status || !Charge_End || !End_Time){
            responseMessage = "Please fill all the fields."
            isError = true;
            return;
        }
        
        if (!validateMacAddress(Mac_Address)) {
            responseMessage = "Please enter a valid MAC address before submitting.";
            isError = true;
            return;
        }
        
        try {
            const response = await fetch("/api/Send_Logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Mac_Address: formatMacAddress(Mac_Address), // Send formatted MAC address
                    Serial_Number: Serial_Number,
                    Start_Time: Start_Time,
                    Tank_No : Tank_No ,
                    Fuel_Name : Fuel_Name,
                    Fuel_Type : Fuel_Type,
                    Delivery_Status : Delivery_Status,
                    Charge_End : Charge_End,
                    End_Time : End_Time ,
                })
            })
        const data = await response.json();
        if(response.ok) {
            responseMessage  = data.message || "Data has been successfully sent to the database." 
            isError = false;
        } else {
            isError = true;
            responseMessage = data.message;
        }   
        } catch(err) {
        responseMessage = `Client-side Error ${err}`;
        isError = true;
        }
    }
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
  
    <form on:submit|preventDefault={sendDataToDatabase}>
        {#if responseMessage}
        <p style="color: {isError ? "red" : "green"}">{responseMessage}</p>
        {/if}
        
    <div class="input-duo">
    <label for="Mac_Address">Mac Address:</label>
    <input 
        type="text" 
        id="Mac_Address" 
        name="Mac_Address" 
        bind:value={Mac_Address} 
        on:input={handleMacAddressInput}
        placeholder="XX:XX:XX:XX:XX:XX" 
        required 
        style="border-color: {macAddressError ? 'red' : isMacAddressValid && Mac_Address ? 'green' : 'initial'}"
    />
    {#if macAddressError}
        <small style="color: red; font-size: 12px; margin-top: 4px; display: block;">Bad Mac Address Format</small>
    {:else if isMacAddressValid && Mac_Address}
        <small style="color: green; font-size: 12px; margin-top: 4px; display: block;">✓ Valid MAC address</small>
    {/if}
    </div>
    
    <div class="input-duo">
    <label for="Serial_Number">Serial Number:</label>
    <input type="text" id="Serial_Number" name="Serial_Number" bind:value={Serial_Number} placeholder="Serial Number" required />
    </div>
    <div class="input-duo">
    <label for="Start_Time">Start Time:</label>
    <input type="text" id="Start_Time" name="Start_Time" bind:value={Start_Time} placeholder="Start Time" required />
    </div>
    <div class="input-duo">
    <label for="Tank No">Tank No:</label>
    <input type="text" id="Tank No" name="Tank No" bind:value={Tank_No} placeholder="Tank Number" required />
    </div>
    <div class="input-duo">
    <label for="Fuel Name">Fuel Name:</label>
    <input type="text" id="Fuel Name" name="Fuel Name" bind:value={Fuel_Name} placeholder="Fuel Name" list="fuel-options" required />
    <datalist id="fuel-options">
        <option value="GAS REG"></option>
        <option value="GAS PREM"></option>
        <option value="GAS MID"></option>
        <option value="DIESEL"></option>
        <option value="DIESEL FLUID"></option>
        <option value="E85"></option>
        <option value="High Ethanol"></option>
    </datalist>
    </div>
    <div class="input-duo">
    <label for="Fuel Type">Fuel Type:</label>
    <input type="text" id="Fuel Type" name="Fuel Type" bind:value={Fuel_Type} placeholder="Fuel Type" list="fuel-types" required />
    <datalist id="fuel-types">
        <option value="PETROL"></option>
        <option value="DIESEL"></option>
        <option value="Ethanol"></option>
    </datalist>
    </div>
    <div class="input-duo">
    <label for="Delivery Status">Delivery Status:</label>
    <input type="text" id="Delivery Status" name="Delivery Status" bind:value={Delivery_Status} placeholder="Delivery Status" list="delivery-status" required />
    <datalist id="delivery-status">
        <option value="GOOD FUEL"> </option>
        <option value="CROSSFLOW"></option>
    </datalist>
    </div>
    <div class="input-duo">
    <label for="Charge End">Charge End:</label>
    <input type="text" id="Charge End" name="Charge End" bind:value={Charge_End} placeholder="Charge End" required />
    </div>
    <div class="input-duo">
    <label for="End Time">End Time:</label>
    <input type="text" id="End Time" name="End Time" bind:value={End_Time} placeholder="End Time" required />
    </div>
    <button class="submit-button" type="submit"> Submit data </button>
    <a class="logs-button" style="text-decoration:none;" href="/midas/logs"> Show Logs </a>
</form>
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
main label {
    font-family: "Mulish", sans-serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: #014b96;
    margin-bottom: 2vh;
    align-self: center;
}
main input{
    background-color: #eaf3fc;
    border: none;
    margin-left: 1vw;
    margin-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 1vh;
    padding-left: 0.5vw;
    width: 15vw;
    border-radius: 10px;
}
.main-container {
    padding-top: 4vh;
    padding-left: 1vw;
    padding-right: 1vw;
    border-top-left-radius: 20px;
    background-color: white;
    min-height: 100vh;
}
.input-duo {
    display: grid;
    grid-template-columns: 150px 1fr; 
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}
.logs-button,
.submit-button {
    padding: 0.75rem 2rem;
    background: #014b96;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.25rem;
    cursor: pointer;
    transition: opacity 0.3s ease;
    text-transform: uppercase;
    font-weight: 700;
  }

  .submit-button:hover {
    background-color: #012f5e;
  }
</style>