<script>
    import Test from "../lib/comp/Test.svelte";
    import {onMount} from "svelte";
    import {UserApi} from "../lib/api/UserApi.js";

    onMount(async () => {
        // Initialize the user API
        const userApi = new UserApi();

        const newSession = localStorage.getItem('newSession')
            ? JSON.parse(localStorage.getItem('newSession'))
            : null;

        if (!newSession || newSession.second.sessionEnd) {
            await userApi.startNewUserSession(1);
        }
    })
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<Test/>
