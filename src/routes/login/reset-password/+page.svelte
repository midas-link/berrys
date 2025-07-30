<script>
    import { onMount } from "svelte";
    import { base } from "$app/paths";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    let token = "";
    let newPassword = "";
    let confirmPassword = "";
    let message = "";
    let isError = false;
    let isLoading = false;
    $: {
        const urlParams = new URLSearchParams($page.url.search);
        token = urlParams.get('token') || '';
        const errorParam = urlParams.get('error');
        if(errorParam) {
            isError = true;
            if(errorParam === 'invalid_reset_link') {
                message = 'The reset link is invalid. Please request a new one.';
            } else if(errorParam === 'invalid_or_expired_reset_link') {
                message = 'The reset link is either invalid or has expired. Please request a new one';
            } else if(errorParam === 'server_error_reset_link') {
                message = 'A server error occured while verifying the reset link. Please try again.';
            }
        }
        if(!token && !errorParam) {
            goto(`${base}/login/forgot-password`);
        }
    }
    async function handleResetPassword() {
        message = '';
        isError = false;
        isLoading = true;
        if(newPassword !== confirmPassword) {
            isError = true;
            message = 'Passwords do not match!';
            isLoading = false;
            return;
        }
        try {
            const response = await fetch(`/api/reset_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                }),
            });
            const data = await response.json();
            if(response.ok) {
                message = data.message;
                newPassword = '';
                confirmPassword = '';
                setTimeout(() => {
                    goto(`${base}/login?resetSuccess=true`);
                },3000)
            } else {
                isError = true;
                if(response.status === 400 && Array.isArray(data.errors)) {
                    message = data.errors.map(err => err.msg).join(' & ');
                } else {
                    message = data.error || 'An unexpected error has occured.';
                }
            }
        } catch(err) {
            console.error('Client-side error in reset password:', err);
            isError = true;
            message = 'A network error occurred. Please try again.';
        }
    }
    
  
    onMount(() => {
      
    });
  </script>
  
  <svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
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
        <div class="reset-password-container">
          <form on:submit|preventDefault={handleResetPassword} class="reset-password-form">
            {#if message}
            <p style="color: {isError ? 'red' : 'green'};">{message}</p>
          {/if}
            <div style="display: flex; flex-direction: column; align-items: center;">           
                <p class="reset-title">Reset your password</p>
                <p> Type and confirm a new password for your account</p>
            </div>
            <div class="form-group">
                <label for="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                bind:value={newPassword}
                placeholder="•••••••••"
                required
              />
              <label for="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                bind:value={confirmPassword}
                placeholder="•••••••••"
                required
              />
            </div>
            
            <button type="submit" class="reset-password-button">
                {#if isLoading}
                Resetting... 
                {:else}
                Reset Password
                {/if}
            </button>
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
    .reset-password-container p.reset-title {
    background: linear-gradient(
      to right,
      var(--gradient-start),
      var(--gradient-end)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-size: 1.25rem;
    white-space: nowrap;
    margin-bottom: 1.5rem;
    font-weight: 800;
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
      .reset-password-container {
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
  
    .reset-password-container {
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
  
    .reset-password-form {
      background: white;
      padding: clamp(1.5rem, 4vw, 2rem);
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
 

  
    .form-group input[type="password"]
    {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      color: #848484;
      background-color: #eaf3fc;
      transition: border-color 0.3s ease;
      margin-bottom: 1rem;
    }
  
    .form-group input:focus {
      outline: none;
      border-color: var(--gradient-end);
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

  </style>
  