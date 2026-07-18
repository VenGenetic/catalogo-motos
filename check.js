fetch('https://lvparts.ec/catalogo')
  .then(r => r.text())
  .then(async html => {
    const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (scriptMatch) {
      const jsUrl = 'https://lvparts.ec' + scriptMatch[1];
      const js = await fetch(jsUrl).then(r => r.text());
      console.log('Contains Supabase URL:', js.includes('xzsdsmskyosepemalage.supabase.co'));
      console.log('Contains v9:', js.includes('cached_products_v9'));
    } else {
      console.log('Script not found');
    }
  });
