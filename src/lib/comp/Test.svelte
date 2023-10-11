<script>
    import {onDestroy} from "svelte";

    onDestroy
</script>

<button id="test-button">click</button>
<button id="test-button2" on:click={()=>alert("rest")}>click</button>
