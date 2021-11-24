<script lang="ts">
  import generate, {
    ScheduleEntryBatch,
  } from "../types/ScheduleEntry.protobuf";
  import { getContext, onMount } from "svelte";
  import type ScheduleEntry from "../types/ScheduleEntry";
  import Clock from "../components/Clock";

  const isDebug = !!getContext('debug')

  let doUpdate: () => void;

  let result: ScheduleEntryBatch;

  onMount(() => {
    const { ScheduleEntryBatchProtobuf } = generate(window.protobuf.Root);

    let timeout: any;

    doUpdate = async function () {
      clearTimeout(timeout);
      try {
        const payload = await fetch(
          "/directory?date=" + dateSelect.format("YYYY-MM-DD")
        ).then((r) => {
          if (r.status == 401) {
            location.href = "signup";
          } else {
            return r.arrayBuffer();
          }
        });
        result = ScheduleEntryBatchProtobuf.decode(
          new Uint8Array(payload)
        ) as unknown as ScheduleEntryBatch;
        isDebug && console.debug("Received", result)
      } finally {
        timeout = setTimeout(doUpdate, 15 * 1000);
      }
    };

    dateSelect = dayjs();
  });

  let byFloor: { [floor: string]: ScheduleEntry[] } = {};

  $: {
    // Every time new results are received, reorganise
    byFloor = {};
    result?.items.forEach(({ email, name, location, floor }) => {
      if (!floor || !location) return;
      byFloor[floor] = [
        ...(byFloor[floor] || []),
        {
          email,
          name,
          location: location.split(".")[1],
          floor,
        },
      ];
    });
  }

  import dayjs from "dayjs";
  import dayjs_relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(dayjs_relativeTime);

  let sortType: SortType = "name";

  type SortType = "name" | "desk";

  function sorted(order: SortType, items: ScheduleEntry[]) {
    switch (order) {
      case "name":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case "desk":
        return items.sort((a, b) => Number(a.location) - Number(b.location));
    }
  }

  let dateSelect = dayjs();
  $: if (dateSelect) {
    result = null;
    doUpdate?.();
  }

  import { fade } from "svelte/transition";
</script>

<svelte:head>
  <title>Lonely Devs @ Atlassian</title>
</svelte:head>

<h1>Lonely Devs @ Atlassian Sydney</h1>

<nav class="level">
  <div class="level-left">
    <div class="field has-addons">
      <div class="control">
        <button
          class="button"
          class:is-info={sortType === "name"}
          on:click={() => (sortType = "name")}
        >
          <span class="icon is-small">
            <i class="fas fa-sort-alpha-down" />
          </span>
          <span>Sort by name</span>
        </button>
      </div>
      <div class="control">
        <button
          class="button"
          class:is-info={sortType === "desk"}
          on:click={() => (sortType = "desk")}
        >
          <span class="icon is-small">
            <i class="fas fa-sort-numeric-up" />
          </span>
          <span>Sort by desk</span>
        </button>
      </div>
    </div>
  </div>

  <div class="level-right">
    <div class="field has-addons">
      <div class="control">
        <button
          class="button"
          on:click={() => (dateSelect = dateSelect.subtract(1, "day"))}
        >
          <span class="icon is-small">
            <i class="fas fa-arrow-left" />
          </span>
        </button>
      </div>
      <div class="control">
        <button class="button" on:click={() => (dateSelect = dayjs())}>
          <span class="icon is-small" />
          <span> {dateSelect?.format("DD/MM/YYYY")}</span>
        </button>
      </div>

      <div class="control">
        <button
          class="button"
          on:click={() => (dateSelect = dateSelect.add(1, "day"))}
        >
          <span class="icon is-small">
            <i class="fas fa-arrow-right" />
          </span>
        </button>
      </div>
    </div>
  </div>
</nav>

{#if result}
  {#if result.asOf}
    <div class="notification mb-1">
      Data somewhat accurate as of {dayjs(result.asOf)
        .subtract(2, "seconds")
        .from($Clock)}
    </div>
  {/if}

  <div class="ld-floor-container">
    {#each Object.entries(byFloor) as [floor, entries]}
      <div class="ld-floor" transition:fade>
        <section class="hero is-small is-info">
          <p><b>{floor}</b></p>
        </section>
        {#each sorted(sortType, entries) as entry (entry.email)}
          <div>
            {entry.name} - Desk {entry.location}
          </div>
        {/each}
      </div>
    {/each}
  </div>
{:else}
  <progress class="progress is-small is-info" max="100" />
{/if}

<style lang="scss">
  h1,
  p {
    text-align: center;
    margin: 0 auto;
  }

  h1 {
    font-size: 2em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  h2 {
    font-size: 1.4em;
  }

  p {
    margin: 1em auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }

  @media (orientation: portrait) {
    .ld-floor-container {
      flex-direction: column !important;
      .ld-floor {
        margin-top: 1em;
      }
    }
  }

  @media (orientation: landscappe) {
    .ld-floor-container {
      flex-direction: row-reverse !important;
      .ld-floor {
        flex-basis: 280px;
      }
    }
  }

  .ld-floor-container {
    display: flex;
    flex-wrap: wrap;

    .ld-floor {
      flex: 1;
    }
  }
</style>
