export const createSubtitleSegments = (wordsArray, maxCharsPerSegment = 50) => {
  let subtitles = '';
  let segmentCount = 1;
  let currentSegmentText = '';
  let startTime = null;

  const formatTime = (time) => {
    const date = new Date(time * 1000);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds},${milliseconds}`;
  };

  for (let i = 0; i < wordsArray.length; i++) {
    const wordObj = wordsArray[i];
    const word = wordObj.word;

    if (currentSegmentText.length === 0) {
      startTime = wordObj.start; // Начало сегмента
    }

    if ((currentSegmentText + ' ' + word).trim().length > maxCharsPerSegment) {
      // Завершение текущего сегмента
      const endTime = wordsArray[i - 1].end;
      subtitles += `${segmentCount}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${currentSegmentText.trim()}\n\n`;
      segmentCount++;

      // Начинаем новый сегмент
      currentSegmentText = word;
      startTime = wordObj.start;
    } else {
      // Добавляем слово в текущий сегмент
      currentSegmentText += (currentSegmentText ? ' ' : '') + word;
    }
  }

  // Добавляем последний сегмент
  if (currentSegmentText) {
    const endTime = wordsArray[wordsArray.length - 1].end;
    subtitles += `${segmentCount}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${currentSegmentText.trim()}\n\n`;
  }

  return subtitles;
};
