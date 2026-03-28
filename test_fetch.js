import fs from 'fs';
fetch('https://clientes.todomoto.com.ec/shop')
  .then(res => res.text())
  .then(html => {
    fs.writeFileSync('shop.html', html);
    console.log('Saved shop.html, length:', html.length);
  })
  .catch(console.error);
