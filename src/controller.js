const Records = require('./records.model');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const BATCH_SIZE = 1000; // Cantidad de registros por lote a insertar

const upload = async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const filePath = path.resolve(file.path);
  const batch = []; // Acumulador de registros
  let insertedCount = 0; // Contador de registros insertados
  const startTime = Date.now(); // Tiempo inicial de procesamiento. He incluido esta variable para control de performance

  const stream = fs.createReadStream(filePath); // Leemos el archivo en modo stream

  // Configuramos el parser CSV
  const csvStream = csv
    .parse({ headers: true, ignoreEmpty: true, trim: true })
    .on('data', async (row) => {
      const { id, firstname, lastname, email, email2, profession } = row;

      if (!id || !firstname || !lastname) return;

      // Agregamos el registro al batch
      batch.push({
        id: parseInt(id),
        firstname,
        lastname,
        email,
        email2,
        profession,
      });

      // Si el batch llegó al tamaño definido, lo insertamos
      if (batch.length === BATCH_SIZE) {
        csvStream.pause(); // pausamos mientras se inserta
        try {
          await Records.insertMany(batch);
          insertedCount += batch.length;
          batch.length = 0;
          console.log(`Insertados: ${insertedCount}`);
        } catch (err) {
          console.error('Error al insertar un batch:', err);
        } finally {
          csvStream.resume(); // Reanudamos la lectura
        }
      }
    })
    .on('end', async () => {
      // Si quedan registros sin insertar (último lote)
      if (batch.length > 0) {
        try {
          await Records.insertMany(batch);
          insertedCount += batch.length;
          console.log(`Insertados: ${insertedCount}`);
        } catch (err) {
          console.error('Error al insertar lote final:', err);
        }
      }

      fs.unlinkSync(filePath); // Eliminamos el archivo temporal
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log(`Proceso finalizado en ${duration}s`);
      return res.status(200).json({
        message: 'Archivo procesado correctamente con fast-csv',
        total: insertedCount,
        duration: `${duration}s`,
      });
    })
    .on('error', (err) => {
      console.error('Error durante el procesamiento:', err);
      return res.status(500).json({ error: 'Error al procesar el archivo' });
    });

  stream.pipe(csvStream);
};

const list = async (_, res) => {
  try {
    const data = await Records.find({}).limit(10).lean();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  upload,
  list,
};
