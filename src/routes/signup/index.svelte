<script lang="ts">
  let email: string = "";

  let isSubmitting = false;
  let isSuccess: boolean = false;
  let errorMessage: string = "";

  async function doRequest(evt: Event) {
    evt.preventDefault();

    try {
      errorMessage = "";
      isSubmitting = true;

      const resp = await fetch(location.href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }).then((r) => r.json());
      if (resp.status) {
        isSuccess = true;
        return;
      } else {
        errorMessage = resp.error;
        isSubmitting = false;
      }
    } catch {
      isSubmitting = false;
    }
  }
</script>

<p class="title is-1 is-spaced">Lonely Devs @ Atlassian</p>

<p class="mb-2">Enter your <code>@atlassian.com</code> email to sign in</p>

<form on:submit={doRequest}>
  <div class="field">
    <p class="control has-icons-left has-icons-right">
      <input
        class="input"
        type="email"
        placeholder="Email"
        bind:value={email}
      />
      <span class="icon is-small is-left">
        <i class="fas fa-envelope" />
      </span>
    </p>
  </div>

  <div class="field">
    <p class="control">
      <button
        disabled={isSuccess || !email?.toLowerCase().endsWith("@atlassian.com")}
        class="button is-success"
        on:click={doRequest}
        class:is-loading={isSubmitting}>Continue</button
      >
    </p>
  </div>
</form>

{#if errorMessage}
  <div class="notification is-danger mt-4">
    <button class="delete" on:click={() => (errorMessage = "")} />
    {errorMessage}
  </div>
{/if}

{#if errorMessage}
  <div class="notification is-danger mt-4">
    <button class="delete" on:click={() => (errorMessage = "")} />
    {errorMessage}
  </div>
{/if}

{#if isSuccess}
  <div class="notification is-info mt-4">
    <p>
      An email has been sent to <b>{email}</b> (yo check your spam mail it's probably
      there).
    </p>
    <p>Please click the link in the email to continue.</p>
    <p>Link expires in 5 minutes</p>
  </div>
{/if}

<style lang="scss">
</style>
