## Инициализация:

git clone --branch back --single-branch https://gitlab.tn.kz/o.akhmetiv/tengrifinal.git

cd kazvision

npm install

npm run dev


## Запрос на генерацию текста

Метод: POST

URL:  /api/text-video/getText

Headers:  <br>
{ <br>
    Content-Type: application/json <br>
}

Параметры запроса:

title  - (string) заголовок новости <br>
description  - (string) Описание новости

Ответ: JSON
(объект)

{ <br>
    "description": (string) сгенерированный текст <br>
}

## Запрос на получение аудио

Метод: POST

URL:  /api/audio-video/getAudio

Headers: <br>
{ <br>
    Content-Type: application/json <br>
}

Параметры запроса:

mainText  - (string) текст для озвучки

Ответ: JSON
(объект)

{ <br>
    "audioLink": (string) ссылка на скачивание <br>
    "audioKey": (string) ключ на aws <br>
    "duration": (number) длина аудио <br>
}

## Запрос на получение финального видео без ведущего

Метод: POST

URL:  /api/create-simple/create-simple

Headers: <br>
{ <br>
    Content-Type: application/json <br>
}

Параметры запроса:

title  - (string) заголовок новости <br>
description  - (string) Описание новости

Ответ: JSON
(объект)

{ <br>
    "link": { <br>
        "url": (string) ссылка на скачивание <br>
        "key": (string) ключ файла с aws <br>
    }
}

## Запрос на получение финального видео с ведущим

Метод: POST

URL:  /api/create-simple/create-leader

Headers: <br>
{ <br>
    Content-Type: application/json <br>
}

Параметры запроса:

title  - (string) заголовок новости <br>
description  - (string) Описание новости

Ответ: JSON
(объект)

{ <br>
    "link": { <br>
        "url": (string) ссылка на скачивание <br>
        "key": (string) ключ файла с aws <br>
    }
}
