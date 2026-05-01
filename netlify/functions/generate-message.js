exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { answers } = JSON.parse(event.body);

    const questions = [
      "今、何が一番しんどいですか？",
      "5年後の自分に会えたら、何を聞いてみたいですか？",
      "昔、誰かに言われて嬉しかった言葉はありますか？",
      "気づいたら自然とやっていることはありますか？",
      "友人や家族によく頼まれることは何ですか？",
      "「これだけは譲れない」と感じることは何かありますか？",
      "疲れたとき、どんな自分が出てきますか？",
      "本当は、どんな一日を過ごしたいですか？",
      "実は嬉しいけど、なかなか言えていないことはありますか？",
      "今の自分に、一言かけるとしたら何と言いますか？"
    ];

    const qa = questions.map((q, i) => {
      const a = answers[i] ? answers[i].trim() : '';
      return a ? `Q${i+1}. ${q}\n→ ${a}` : null;
    }).filter(Boolean).join('\n\n');

    const prompt = `あなたは「Re:self Courage」のカウンセラーです。
以下は、仕事や家事に追われながらも、自分の本音や生き方を探している40代・50代の女性が「自分インタビューシート」に答えた内容です。

【回答内容】
${qa}

この方への、心に寄り添うパーソナルメッセージを日本語で書いてください。

【ルール】
・300〜400文字程度
・その人の言葉や感覚を受け止め、反映させた内容にする
・「あなたはすでに〜」「その〜という感覚は」など、回答内容に具体的に触れること
・説教・アドバイスは不要。ただ、その人の本質に光を当てる言葉を
・Courageへの誘導は最後の一文に自然に入れる程度にとどめる
・温かく、詩的に。しかし甘くなりすぎず
・「。」で終わる文体
・前置きや挨拶は不要。メッセージ本文のみ出力する`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const message = data.content?.[0]?.text || 'メッセージの生成に失敗しました。';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
