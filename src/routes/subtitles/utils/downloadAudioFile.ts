import axios from 'axios';
import fs from 'fs-extra';

export const downloadAudioFile = async (url, outputPath) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(outputPath, response.data);
};