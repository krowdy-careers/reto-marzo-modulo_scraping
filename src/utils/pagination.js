// pagination.js
async function hasNextPage(page) {
  // Verifica si el botón de "Siguiente" está habilitado
  return await page.evaluate(() => {
    const nextButton = document.querySelector(".pagination-next");
    return nextButton && !nextButton.hasAttribute("disabled");
  });
}

async function goToNextPage(page) {
  // Haz clic en el botón de "Siguiente" y espera a que la página cargue
  try {
    await page.click(".pagination-next");
    await page.waitForTimeout(2000); // Espera 2 segundos para evitar problemas de carga
  } catch (error) {
    console.error("Error al avanzar a la siguiente página:", error);
    throw error; // Lanza el error si no se puede avanzar
  }
}

module.exports = {
  hasNextPage,
  goToNextPage,
};
