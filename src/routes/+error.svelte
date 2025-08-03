<script lang="ts">
	import { page } from '$app/stores';
</script>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
        text-align: center;
        font-family: 'Mulish', sans-serif;
        color: #333;
        background-color: #f9f9f9;
        padding: 20px;
    }
    .error-code {
        font-size: 6em;
        font-weight: bold;
        color: #014b96;
        margin-bottom: 10px;
    }
    .error-message {
        font-size: 1.8em;
        color: #f9bc39;
        margin-bottom: 20px;
    }
    .error-details {
        font-size: 1.1em;
        color: #666;
        max-width: 600px;
        line-height: 1.5;
    }
    .home-link {
        margin-top: 30px;
        padding: 10px 25px;
        background-color: #014b96;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        transition: background-color 0.3s ease;
    }
    .home-link:hover {
        background-color: #012f5e;
    }
</style>

<div class="error-container">
	<h1 class="error-code">{$page.status}</h1>
	<p class="error-message">{$page.error?.message}</p>

	{#if $page.status === 404}
		<p class="error-details">The page or vehicle you are looking for does not exist.</p>
	{:else if $page.status === 500}
		<p class="error-details">Something went wrong on our end. Please try again later.</p>
	{:else}
		<p class="error-details">An unexpected error occurred. Please try again.</p>
	{/if}

	<a href="/home" class="home-link">Go to Home</a>
</div>