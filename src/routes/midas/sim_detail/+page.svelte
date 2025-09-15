<script>
    import {base} from '$app/paths';
    let Mac_Address = '';
    let trailer_number,operator,sim_provider,sim_number,payment_type,payment_amount,is_active = "Yes" ,tanks,tank_size;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    let installed_date = todayFormatted;
    let responseMessage = '';
    let isError = false;
    let macAddressError = '';
    let isMacAddressValid = false;
    export let data ;
    let installer_name = data.user.firstName + " " +  data.user.lastName;
    let installer_contact = data.user.phoneNumber;
    console.log("users company name: ",data.user.companyName);
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
        
        if(!Mac_Address || !trailer_number || !operator || !installed_date || !sim_provider || !sim_number || !payment_type || !payment_amount || !is_active || !installer_name || !installer_contact || !tanks || !tank_size){
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
            const response = await fetch("/api/Sim_Logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Mac_Address: formatMacAddress(Mac_Address), 
                    Trailer_Number: trailer_number,
                    Operator: operator,
                    Installed_Date : installed_date ,
                    Sim_Provider : sim_provider,
                    Sim_Number : sim_number,
                    Payment_Type : payment_type,
                    Payment_Amount : payment_amount,
                    Is_Active : is_active,
                    Installer_Name : installer_name ,
                    Installer_Contact : installer_contact,
                    Tanks: tanks,
                    Tank_Size : tank_size,
                })
            })
        const data = await response.json();
        if(response.ok) {
            responseMessage  = data.message || "Data has been successfully sent to the database." 
            isError = false;
            Mac_Address = '';
            trailer_number = '';
            operator = '';
            installed_date = '';
            sim_provider = '';
            sim_number = '';
            payment_type = '';
            payment_amount = '';
            is_active = 'Yes';
            let installer_name = data.user.firstName + " " +  data.user.lastName;
            installer_contact = data.user.phoneNumber;
            tanks = '';
            tank_size = '';
            macAddressError = '';
            isMacAddressValid = '';
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
        <label for="trailer_number">Trailer Number:</label>
        <input type="text" id="trailer_number" name="trailer_number" bind:value={trailer_number} placeholder="Trailer Number" required />
    </div>
    <div class="input-duo">
        <label for="operator">Operator:</label>
        <input type="text" id="operator" name="operator" bind:value={operator} placeholder="Operator Name" required />
    </div>
    <div class="input-duo">
        <label for="installed_date">Installed Date:</label>
        <input type="date" id="installed_date" name="installed_date" bind:value={installed_date} placeholder="Installed Date" required />
    </div>
    <div class="input-duo">
        <label for="sim_provider">SIM Provider:</label>
        <input type="text" id="sim_provider" name="sim_provider" bind:value={sim_provider} placeholder="Select or type a SIM Provider" list="sim-providers" required />
        <datalist id="sim-providers">
            <option value="Verizon"></option>
            <option value="AT&T"></option>
            <option value="T-Mobile"></option>
            <option value="Airalo"></option>
            <option value="Lycamobile"></option>
            <option value="Mint Mobile"></option>
            <option value="Holafly"></option>
            <option value="Ultra Mobile"></option>
            <option value="Saily"></option>
        </datalist>
    </div>
    <div class="input-duo">
        <label for="sim_number">SIM Number:</label>
        <input type="text" id="sim_number" name="sim_number" bind:value={sim_number} placeholder="SIM Number" required />
    </div>
    <div class="input-duo">
        <label for="payment_type">Payment Type:</label>
        <input type="text" id="payment_type" name="payment_type" bind:value={payment_type} placeholder="Payment Type" list="payment-options" required />
    <datalist id="payment-options">
        <option value="Monthly"></option>
        <option value="Prepaid"></option>
    </datalist>
    </div>
    <div class="input-duo">
        <label for="payment_amount">Payment Amount:</label>
        <input type="text" id="payment_amount" name="payment_amount" bind:value={payment_amount} placeholder="Amount" required />
    </div>
    <div class="input-duo">
        <label for="is_active">Is Active:</label>
        <input type="text" id="is_active" name="is_active" bind:value={is_active} placeholder="Delivery Status"required />
    </div>
    <div class="input-duo">
        <label for="installer_name">Installer Name:</label>
        <input type="text" id="installer_name" name="installer_name" bind:value={installer_name} placeholder="Installer Name" required />
    </div>
    <div class="input-duo">
        <label for="installer_contact">Installer Phone Number:</label>
        <input type="text" id="installer_contact" name="installer_contact" bind:value={installer_contact} placeholder="Phone Number" required />
    </div>
    <div class="input-duo">
        <label for="tanks">Tanks:</label>
        <input type="text" id="tanks" name="tanks" bind:value={tanks} placeholder="Tanks" required />
    </div>
    <div class="input-duo">
        <label for="tank_size">Tank size:</label>
        <input type="text" id="tank_size" name="tank_size" bind:value={tank_size} placeholder="Tank Size" required />
    </div>
    <button class="submit-button" type="submit"> Submit data </button>
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
}
main label {
    font-family: "Mulish", sans-serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: #014b96;
    margin-bottom: 2vh;
    align-self: center;
    white-space: nowrap;
}
main input{
    background-color: #eaf3fc;
    border: none;
    margin-left: 5vw;
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
    transition: background-color 0.3s ease;
    text-transform: uppercase;
    font-weight: 700;
  }
  .submit-button:hover {
    background-color: #012f5e;
  }
</style>