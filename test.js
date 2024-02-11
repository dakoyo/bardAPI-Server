//awaitを使用するためasync即時関数
(async () => {
    const apikey = "NikkuY3-gm-G4wgx";
    const question = "質問したいこと"
    const res = await fetch("https://gemini-taro.onrender.com/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`
      },
      body: JSON.stringify({
        message: question
      })
    }).then(r => r.json());
    
    //json出力される
    console.log(res);
  })();