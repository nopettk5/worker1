const express = require('express');
const fetch = require('node-fetch');
const { URL } = require('url');

const app = express();

app.get('/', async (req, res) => {
  const itemId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('itemId');

  if (!itemId) {
    return res.status(400).send('Если вы владелец сайта и хотите получить доступ к базе, напишите письмо на и укажите в нем ваш сайт');
  }

  const url = `https://www.linkbox.to/api/file/detail?itemId=${itemId}&needUser=1&needTpInfo=1&token=975840647_9e311b5b529b4e28ba3b&platform=web&pf=web&lan=en`;

  try {
    const response = await fetch(url, {
      headers: {
        "Connection": "keep-alive",
        "Keep-Alive": "300",
        "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.7",
        "Accept-Language": "pt-BR,pt;q=0.9", // Prioritize pt-BR and pt languages
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" // Use a more recent and generic user agent
      }
    });

    const videoInfo = await response.json();
    const videoUrl = videoInfo.data.itemInfo.url;

    const videoResponse = await fetch(videoUrl, {
      headers: {
        "Range": req.headers.range || '',
      }
    });

    const videoHeaders = videoResponse.headers.raw();

    // Se o servidor de vídeo não suportar o cabeçalho Range, remova-o das cabeçalhos da resposta.
    if (!videoHeaders['accept-ranges']) {
      delete videoHeaders['range'];
    }

    res.writeHead(videoResponse.status, videoHeaders);
    videoResponse.body.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching or streaming video');
  }
});
