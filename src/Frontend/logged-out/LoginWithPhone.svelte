<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import ChevronLeft from "../components/icons/ChevronLeft.svelte";
  import PaperAirplane from "../components/icons/PaperAirplane.svelte";

  const dispatch = createEventDispatcher<{ back: {} }>();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    
    const formData = new FormData(event.target)

    const phoneNumber = formData.get("phone-number")

    await fetch("/api/login/phone", {
      method: "POST",
      body: {
        phoneNumber
      }
    })
  }

</script>

<div class="w-full p-2 px-4 flex justify-center items-center border-b">
  <ChevronLeft
    class="w-6 h-6"
    on:click={() => {
      dispatch('back');
    }} />
  <h1 class="text-center flex-1 text-lg font-medium">Login With Phone</h1>
  <div class="w-6 h-6" />
</div>

<form
  id="login"
  class="p-4"
  on:submit={handleSubmit}>
  <label for="phone-number" class="pb-2 text-base font-medium">Phone Number</label>
  <div>
    <input
      class="p-2 px-4 mb-4 border-2 text-lg w-full rounded-md focus:border-blue-500"
      id="phone-number"
      type="tel"
      name="phone-number" />
  </div>

  <button
    type="submit"
    class="bg-blue-600 text-white font-bold active:opacity-50 rounded p-2 px-4 text-lg block w-full flex items-center justify-center">
    <PaperAirplane class="w-5 h-5 mr-2" />
    <div>Send Code</div>
  </button>
</form>
