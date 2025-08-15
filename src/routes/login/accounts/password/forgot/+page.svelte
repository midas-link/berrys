<script>
    import { onMount } from "svelte";
    import { base } from "$app/paths";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    let email = "";
    let responseMessage = "";
    let isForgotError = false;
    $: errorMessage = $page.url.searchParams.get('authMessage') || '';
    async function handleForgotPassword() {
      if(!email) {
        responseMessage = "An email is required"
      }
      try {
      const response = await fetch('/api/forgot_password', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email
        })
      });
      const data = await response.json();
      if(response.ok) {
        responseMessage = data.message || "A password reset link has been sent to the entered email"
        isForgotError = false;
      } else if(response.status === 400) {
        responseMessage = response.error ;
      } else {
        console.log("Something went wrong");
      }
    } catch(err) {
      console.log("Client-side error:",err);
      isForgotError = true;
    }
    }
  
    onMount(() => {
      
    });
  </script>
  
  <svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Forgot Password</title>
    <link
      href="https://fonts.googleapis.com/css?family=Mulish"
      rel="stylesheet"
    />
    <link href="https://fonts.googleapis.com/css?family=Inter" rel="stylesheet" />
  </svelte:head>
  
  <div
    class="body-container"
    style="background-image: url({base}/images/Sign-in-page.jpg)"
  >
    <img
      src="{base}/images/Midas_Link_logo.png"
      class="midas-link-logo"
      alt="logo"
    />
    <main>
      <div class="content">
        <div class="forgot-password-container">
          <form on:submit|preventDefault={handleForgotPassword} class="forgot-password-form">
            {#if responseMessage}
            <p style="color: {isForgotError ? 'red' : 'green'};">{responseMessage}</p>
          {/if}
           {#if errorMessage}
           <p style="color: red;"> {errorMessage}</p> 
           {/if}
            <div style="display: flex; flex-direction: column; align-items: center;">
                <svg xmlns="http://www.w3.org/2000/svg" height="64px" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>              
                <div>Trouble logging in?</div>
                <div>Enter your email and we will send you a link to reset your password.</div>
            </div>
            <div class="form-group">
              <input
                type="email"
                id="email"
                name="email"
                bind:value={email}
                placeholder="email@domain.com"
                required
              />
            </div>
         
            <button type="submit" class="reset-password-button">Reset Password</button>
            <div class="no-account">
              Don't have an account? <a
                class="sign-up-link"
                href="{base}/register">Sign up</a 
              > 
              <span class="back-to-login"> Back to <a class="login-link" href="{base}/login">Login</a> </span>
            </div>
          </form>
          
  
       
        </div>
      </div>
    </main>
  </div>
  <footer>
    <img src="{base}/images/logo.png" alt="logo" />
  </footer>
  
  <style>
    :root {
      --primary-color: #007bff;
      --secondary-color: #6c757d;
      --background-color: #ffffff;
      --text-color: #000000;
      --font-family: "Mulish";
      --font-size: 1rem;
      --gradient-start: #014b96;
      --gradient-end: #001338;
      --text-weight: 400;
      -webkit-text-size-adjust: 100%;
      font-feature-settings: normal;
      font-variation-settings: normal;
    }
    ::placeholder {
      font-size: 0.875rem;
      color: #848484;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .midas-link-logo {
      display: none;
    }
    .body-container {
      font-family: var(--font-family);
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--background-color);
      background-size: cover;
      background-repeat: no-repeat;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
    }
  
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 2rem 0;
    }
  
    .content {
      padding: 2rem 0;
      padding-left: 10%;
    }
  

    footer {
      padding: 1.5rem 0;
      background: linear-gradient(to right, #001338, #014b96);
      color: white;
    }
    footer img {
      width: 300px;
      height: 78px;
      margin-left: 2%;
    }
  
    @media (max-width: 1000px) {
      .midas-link-logo {
        display: block !important;
        height: auto;
        width: 80%;
        margin-left: 20%;
      }
      .forgot-password-container {
        padding: 1rem !important;
        justify-content: center !important;
      }
  
      .content {
        padding: 1rem 0;
      }
      .body-container {
        background-image: none !important;
        background: linear-gradient(to top right, #001338, #014b96) !important  ;
      }
    }
  
    .forgot-password-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding-right: 5%;
      flex: 1;
    }
  
    .forgot-password-form {
      background: white;
      padding: clamp(1.25rem, 4vw, 1.25rem);
      padding-bottom: 0.25rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
 
  
    .form-group {
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }
 

  
    .form-group input[type="email"]
    {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      color: #848484;
      background-color: #eaf3fc;
      transition: border-color 0.3s ease;
    }
  
    .form-group input:focus {
      outline: none;
      border-color: var(--gradient-end);
    }
    .sign-up-link {
      margin-right:1.5rem;
      color: var(--gradient-start);
      text-decoration: none;
    }
    .login-link {
      color: var(--gradient-start);
      text-decoration: none;
    }
    .reset-password-button {
      width: 100%;
      padding: 0.75rem;
      background: #014b96;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: opacity 0.3s ease;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      font-weight: 700;
    }
  
    .reset-password-button:hover {
      background-color: #012f5e;
    }
    .no-account {
      font-size: 0.875rem;
      font-family: "Inter";
      margin-bottom: 1vh;
      color: #737373;
    }

  </style>
  