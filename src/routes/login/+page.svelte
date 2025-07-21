<script>
  import { onMount } from "svelte";
  import { base } from "$app/paths";
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  let email = "";
  let password = "";
  let loginMessage = "";
  let rememberMe = false;
  let isLoginError = false;
  let showPopup = false;
  $: loginErrorMessage = $page.url.searchParams.get('authMessage') || '';
  async function handleLogin() {
    loginMessage = "";
    isLoginError = false;
    showPopup = false;

    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:'include',
        body: JSON.stringify({
          email: email,
          password: password,
          rememberMe: rememberMe
        }),
      });

      const data = await response.json();

      if (response.ok) {
        loginMessage = data.message || "Logged in successfully.";
        isLoginError = false;
        showPopup = true;
        localStorage.setItem('is_admin',  data.isAdmin ? 'true' : 'false');
        const redirectPath = data.isAdmin ? `${base}/admin` : `${base}/home`;

        setTimeout(() => {
          goto(redirectPath);
        }, 2000);
      } else {
        if(response.status === 429) {
          loginMessage = data.error ;
        } else if( response.status === 400) {
          loginMessage = data.error.map(err => err.msg).join('\n & ');
        } else if(response.status === 401)  {
          loginMessage = data.error;
        } else {
          loginMessage =  `An unexpected login error occured. Status: ${response.status}.`;
        }

        isLoginError = true;
      }
    } catch (error) {
      console.error("Client-side login error:", error);
      loginMessage =
        "Network error or server unreachable. Please check your connection.";
      isLoginError = true;
    }
  }

  onMount(() => {
    setTimeout(()=> {
      loginErrorMessage = '';
    },1000*10)
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
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
      <div class="sign-in-container">
        <form on:submit|preventDefault={handleLogin} class="sign-in-form">
          {#if loginMessage}
          <p style="color: {isLoginError ? 'red' : 'green'};">{loginMessage}</p>
        {/if}
         {#if loginErrorMessage}
         <p style="color: red;"> {loginErrorMessage}</p> 
         {/if}
          <p class="sign-in-title">Sign in to your account</p>
          <div class="form-group">
            <label for="email"> Your email</label>
            <input
              type="email"
              id="email"
              name="email"
              bind:value={email}
              placeholder="email@domain.com"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              bind:value={password}
              placeholder="•••••••••"
              required
            />
          </div>
          <div class="form-group below-password-container">
            <label class="checkbox-container">
              <input type="checkbox" name="rememberMe" id="rememberMe" bind:checked={rememberMe} />
              <span class="checkmark"></span>
              Remember me
            </label>
            <a href=" " class="forgot-password">Forgot Password?</a>
          </div>
          <button type="submit" class="sign-in-button">Sign In</button>
          <div class="no-account">
            Don't have an account? <a
              class="sign-up-link"
              href="{base}/register">Sign up</a
            >
          </div>
        </form>


        <div
          id="popup"
          class="popup"
          style="display: {showPopup ? 'flex' : 'none'};"
        >
          <div class="popup-content">
            <p id="popup-message">✅ {loginMessage}</p>
            <div id="loading-indicator" class="loading-indicator">
              <p>Loading...</p>
              <div class="spinner"></div>
            </div>
          </div>
        </div>
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

  /* Content Section */
  .content {
    padding: 2rem 0;
    padding-left: 10%;
  }

  /* Footer */
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
    .sign-in-container {
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

  .sign-in-container {
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

  .sign-in-form {
    background: white;
    padding: clamp(1.5rem, 4vw, 2rem);
    padding-bottom: 0.25rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  .sign-in-form p.sign-in-title {
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

  .form-group {
    margin-bottom: 1.5rem;
  }
  .form-group.below-password-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: RGB(115, 115, 115);
    font-size: 0.875rem;
    font-family: Inter;
  }

  .form-group input[type="email"],
  .form-group input[type="password"] {
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

  .form-group .checkbox-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #737373;
  }
  .sign-up-link {
    color: var(--gradient-start);
    text-decoration: none;
  }

  .forgot-password {
    float: right;
    color: #014b96;
    text-decoration: none;
    font-size: 0.875rem;
    font-family: "Inter";
  }

  .forgot-password:hover {
    text-decoration: underline;
  }

  .sign-in-button {
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

  .sign-in-button:hover {
    background-color: #012f5e;
  }
  .no-account {
    font-size: 0.875rem;
    font-family: "Inter";
    margin-bottom: 1vh;
    color: #737373;
  }
  .popup {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .popup-content {
    background-color: white;
    padding: 2vh 2vw;
    border-radius: 5px;
    text-align: center;
    font-family: "Mulish";
    white-space: nowrap;
  }
  :global(.wrong-credentials) {
    color: red;
    align-items: center;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  :global(.wrong-credentials.show) {
    opacity: 1;
  }
  /* Custom Checkbox Styles */
  .checkbox-container input[type="checkbox"] {
    display: none;
  }

  .checkmark {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #ddd;
    border-radius: 3px;
    position: relative;
    background-color: #eaf3fc;
    transition: all 0.3s ease;
  }

  .checkbox-container input:checked + .checkmark {
    background-color: #014b96;
    border-color: #014b96;
  }

  .checkbox-container input:checked + .checkmark::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }

  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #014b96;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
