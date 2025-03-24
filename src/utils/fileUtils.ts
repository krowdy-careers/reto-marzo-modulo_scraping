import fs from "fs";

// generate JSON
export const generateJson = (data: any[], filePath: string) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};




// generate CSV
export const generateCsv = (data: any[], filePath: string) => {
    try {
        if (data.length === 0) {
            throw new Error("No hay datos para exportar");
        }

        const separator = ","; // Separador de columnas

        // 1️⃣ Extraer encabezados
        const headers = Object.keys(data[0]).join(separator);

        // 2️⃣ Convertir filas
        const rows = data.map(row => {
            return Object.values(row)
                .map(value => `"${String(value).replace(/"/g, '""')}"`) // Manejo de comillas
                .join(separator);
        });

        // 3️⃣ Crear contenido CSV
        const csvContent = [headers, ...rows].join("\n");

        // 4️⃣ Escribir archivo CSV
        fs.writeFileSync(filePath, csvContent);
        console.log("✅ CSV generado correctamente:", filePath);
    } catch (error) {
        console.error("❌ Error al generar CSV:", error);
        throw error;
    }
};


