# SOLUCION

Este readme intenta explicar la solución planteada a la consigna inicial: procesar un archivo CSV de gran tamaño (~80MB) y guardar sus registros en una base de datos MongoDB de manera eficiente.

## ⚙️ Tecnologías utilizadas

Solamente se ha incluido la libreria "fast-csv" de acuerdo a lo planteado en el enunciado. Esta librería se usa para el procesamiento eficiente de archivos CSV por streaming

## 🚀 Implementación

El código principal está en `src/controller.js`, en la función `upload`.

Se realizó el procesamiento de la siguiente forma:

1. El archivo CSV se procesa línea por línea usando `fast-csv` y `fs.createReadStream()`, lo que evita cargar todo el archivo en memoria.
2. Cada línea válida se convierte en un documento.
3. Se agrupan documentos en lotes de 1000 y se insertan mediante `Records.insertMany()` para mejorar la performance.
4. Al finalizar, se elimina el archivo temporal y se devuelve un resumen con la cantidad de documentos insertados y el tiempo de procesamiento.

## 🧪 Validaciones y decisiones técnicas

- Se incorporan scripts en el archivo: `package.json`.
- Se descartan líneas incompletas (sin `id`, `firstname` o `lastname`).
- Se eliminan los archivos subidos luego del procesamiento.
- Se eligió `fast-csv` como única librería adicional permitida, ya que permite un control robusto sobre el parsing, incluyendo encabezados, espacios y líneas vacías.

## ⏱ Resultado de ejecución

En pruebas locales:

- Se procesaron **999.991 líneas** válidas.
- Sin utilizar la libreria `fast-csv` el tiempo promedio de ejecucion fue de **8.5 segundos**
- Implementando la libreria `fast-csv` el tiempo total de procesamiento fue aproximadamente **7.5 segundos** (dependiendo del entorno).
- La colección `records` fue creada en la base de datos local definida en el archivo `.env`.

## ✅ Cómo correr el proyecto

1. Clonar este repositorio
2. Ejecutar `npm install`
3. Configurar el archivo `.env` (ya incluido en el starter)
4. Ejecutar el script `npm run dev` (ejecuta el proyecto con nodemo) o `npm run start` (ejecuta el proyecto con node)
5. Asegurarse de tener MongoDB corriendo localmente
6. Ejecutar con: `npm run dev` o `nodemon app.js`

## 📬 Autor

Andrés Medina  
[https://github.com/andresmedina](https://github.com/andresmedina)
