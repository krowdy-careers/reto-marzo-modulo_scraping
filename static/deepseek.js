
chrome.storage.local.get("deepseekQuery", (data) => {
  if (data.deepseekQuery) {
    const input = document.querySelector("textarea"); // deepseek tiene textarea
    if (input) {
      input.value = data.deepseekQuery;
      input.dispatchEvent(new Event("input", { bubbles: true }));

      setTimeout(() => {
        input.dispatchEvent(new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          bubbles: true
        }));
      }, 500);
    }
  }
});

