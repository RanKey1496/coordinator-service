export async function verifyIdExists(pool: any, id: string) {
    const client = await pool.connect();

    try {
      const query = 'SELECT id FROM tts_videos WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar el ID:', error);
      return false;
    } finally {
      client.release();
    }
}

export async function updateAudioPath(pool: any, data: any) {
    const client = await pool.connect();

    try {
      const exists = verifyIdExists(pool, data.id);
      if (!exists) {
        console.log(`El ID ${data.id} no existe en la base de datos.`);
        return;
      }

      const query = 'UPDATE tts_videos SET audio_path = $2 WHERE id = $1';
      await client.query(query, [data.id, data.audio]);
      console.log(`Audio path actualizado para el ID ${data.id}.`);
    } catch (error) {
      console.error('Error al actualizar el audio path:', error);
    } finally {
      client.release();
    }
}

export async function updateMediaPath(pool: any, data: any) {
    const client = await pool.connect();

    try {
      const exists = verifyIdExists(pool, data.id);
      if (!exists) {
        console.log(`El ID ${data.id} no existe en la base de datos.`);
        return;
      }

      const query = 'UPDATE tts_videos SET media_path = $2 WHERE id = $1';
      await client.query(query, [data.id, data.media]);
      console.log(`Media path actualizado para el ID ${data.id}.`);
    } catch (error) {
      console.error('Error al actualizar el media path:', error);
    } finally {
      client.release();
    }
}

export async function areAudioAndMediaPathsUpdated(pool: any, id: string) {
    const client = await pool.connect();

    try {
      const exists = verifyIdExists(pool, id);
      if (!exists) {
        console.log(`El ID ${id} no existe en la base de datos.`);
        return false;
      }

      const query = 'SELECT audio_path, media_path FROM tts_videos WHERE id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length > 0) {
        const { audio_path, media_path } = result.rows[0];
        return audio_path !== null && media_path !== null;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar los paths:', error);
      return false;
    } finally {
      client.release();
    }
}

export async function getIdAndPaths(pool: any, id: string) {
    const client = await pool.connect();

    try {
      const query = 'SELECT id, audio_path, media_path FROM tts_videos WHERE id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length > 0) {
        const { id, audio_path, media_path } = result.rows[0];
        return { id, audio_path, media_path };
      }
      return undefined;
    } catch (error) {
      console.error('Error al obtener los paths:', error);
      return undefined;
    } finally {
      client.release();
    }
}